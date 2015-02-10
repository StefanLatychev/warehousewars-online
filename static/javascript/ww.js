// NOTE(sdsmith): To be more efficient, we could use a render (draw) queue that
// only renders items that have been changed. However this is unecessary for 
// the amount of objects we use.
// NOTE(sdsmith): Could add actors to a tick/update queue so that only items
// that need to be updated on a tick get called.

// BEGIN Class Stage
/*
 * Stage class.
 *
 * Stage has the following grid co-ordinates.
 * 		x,y ---- +ve x
 *		 |
 *		 |
 *		+ve y
 */
function Stage(width, height, stageElementID) {
	// the logical width and height of the stage, and tile dimensions
	this.width = width;
	this.height = height;
	this.square_dimension = 24;

	// TODO(sdsmith): may need to add an array per floor if game starts to get slow
	this.actors = []; // all actors on this stage (monsters, player, boxes, ...)
	this.player = null; // a special actor, the player

	// the element containing the visual representation of the stage
	this.stageElementID = stageElementID;
	
	/* Messages to print to screen */
	this.info_banner_floor_number_id = document.getElementById('screen_floor_number');
	this.info_banner_user_message_id = document.getElementById('user_info_message');

	// take a look at the value of these to understand why we capture them this way
	// an alternative would be to use 'new Image()'
	this.blankImageSrc = document.getElementById('blankImage').src;
	this.playerImageSrc = document.getElementById('playerImage').src;
	this.boxImageSrc = document.getElementById('boxImage').src;
	this.wallImageSrc = document.getElementById('wallImage').src;
	this.patrollerImageSrc = document.getElementById('patrollerImage').src;
	this.alienImageSrc = document.getElementById('alienImage').src;
	this.ghoulImageSrc = document.getElementById('ghoulImage').src;

	
	// Game state variables
	this.game_paused = false;

	// NPC spawn rates	
	this.box_frequency = 0.40;
	this.monster_frequency = 0.05;

	// Multi-floor support
	this.num_floors = 2;
	this.player_floor = 0;
	this.floor_on_screen = this.player_floor;

	// Map containing actor positions.
	this.actor_map = new Map(this.width, this.height, this.num_floors);
}

/*
 * Initialize an instance of the game.
 */
Stage.prototype.initialize = function() {
	// Create a table of blank images, give each image an ID so we can reference it later
	var board_html = '<table>\n';
	
	for (var x = 0; x < this.width; x++) {
		board_html += "<tr>\n";
		for (var y = 0; y < this.height; y++) {
			board_html += "<td><img id='stage_"+x+"_"+y+"' width='"+this.square_dimension.toString()+"' height='"+this.square_dimension.toString()+"' src='"+ this.blankImageSrc + "' /></td>\n";
		}
		board_html += "</tr>\n";
	}
	board_html += "</table>\n";
	
	// Put it in the stageElementID (innerHTML)
	document.getElementById(this.stageElementID).innerHTML = board_html;


	// Add Player to the stage
	this.player = new Player(this, Math.floor(this.width / 2), Math.floor(this.height / 2), this.player_floor, this.playerImageSrc, 100);
	this.addActor(this.player);

	var player_pos = this.player.getPosition(); //needed so we don't place actor on player square(s)

	// For each floor ...
	for (var floor_num = 0; floor_num < this.num_floors; floor_num++) {
		// Add walls around the outside of the stage, so actors can't leave the stage
		for(var x = 0; x < this.width; x++){
			for(var y = 0; y < this.height; y++){
				if (x == 0 || y == 0 || x == this.width - 1 || y == this.height - 1) {
					this.addActor(new Wall(this, x, y, floor_num, this.wallImageSrc));
				}
			}
		}

		// Add actors to the stage
		for (var x = 1; x < this.width-1; x++) {
			for (var y = 1; y < this.width-1; y++) {
				if (floor_num == player_pos[2] && x == player_pos[0] && y == player_pos[1]) {
					continue;
				}

				// Box
				if (Math.random() < this.box_frequency) {
					this.addActor(new Box(this, x, y, floor_num, this.boxImageSrc));
				} 
				// Monster
				else if (Math.random() < this.monster_frequency) {
					//this.addActor(new Patroller(this, x, y, floor_num, this.patrollerImageSrc));
					this.addActor(new Monster(this, x, y, floor_num, this.patrollerImageSrc));
				}
			}
		}

		// Add in some Monsters
	}

	// Force all objects to render in their start state
	this.drawFloor(0);
}

/*
 * Return the html ID of the provided co-ordinate.
 * Useful for linking stage co-ordinates to the co-responding html objects.
 */
Stage.prototype.getStageId = function(x,y) {
	return "stage_"+x+"_"+y;
}

/*
 * Add given actor to the stage. This updates both the stage actor list and the
 * actor map.
 */
Stage.prototype.addActor = function(actor) {
	// Add actor to list of stage actors
	this.actors.push(actor);

	// Add actor to direct access map
	var pos = actor.getPosition();
	this.actor_map.set(pos[0], pos[1], pos[2], actor);
}

/*
 * Removes the given actor from the stage and return the removed actor. This 
 * updates both the stage actor list and the actor map.
 */
Stage.prototype.removeActor = function(actor) {
	var pos = actor.getPosition();	
	
	// Remove from direct access map
	this.actor_map.reset(pos[0], pos[1], pos[2]);

	// Blank out its screen tile
	this.setImage(pos[0], pos[1], this.blankImageSrc);

	// Remove from list of actors
	var actor_index = this.actors.indexOf(actor);
	return this.actors.splice(actor_index, 1);
}

/*
 * Set the html src of the image at stage location (x,y) to the given src.
 */
Stage.prototype.setImage = function(x, y, src) {
	document.getElementById(this.getStageId(x,y)).src = src;
}

/* 
 * Take one step in the animation of the game. Only updates actor on screen when
 * they say they need an update by returning true on their tick function.
 * Can forcfully update the screen with actors on stage by supplying 
 * force_update=true as a parameter. Actors will be notified in their tick if 
 * they are forcefully being updated.
 */
Stage.prototype.tick = function(force_update=false) {
	if (!this.game_paused || force_update) {
		for(var i = 0; i < this.actors.length; i++){
			var actor_old_pos = this.actors[i].getPosition();
			var changed_visible_state = this.actors[i].tick(force_update); // inform actors if being forcefully updated
			var actor_new_pos = this.actors[i].getPosition();

			if (changed_visible_state || force_update) {
				// Set old position to blank
				if (actor_old_pos[2] == this.floor_on_screen) {
					this.setImage(actor_old_pos[0], actor_old_pos[1], this.blankImageSrc);
				}

				// Update new position with associated image			
				if (actor_new_pos[2] == this.floor_on_screen) {
					this.setImage(actor_new_pos[0], actor_new_pos[1], this.actors[i].getImage());
				}
			}
		}
	}
}

/*
 * Return actor at given co-ordinates, null otherwise. Uses the actor map for
 * direct access, ie. O(1) call.
 */
Stage.prototype.getActor = function(x, y, floor_num) {
	return this.actor_map.get(x, y, floor_num);
}

/* TODO(sdsmith): BE MORE DESCRIPTIVE ie. immediateScreenUpdate
 * Updates the given actor on call, regardless of interval callback.
 */
Stage.prototype.immediateActorScreenUpdate = function(actor, old_x, old_y, old_floor_num) {
	// Set old position to blank
	if (old_floor_num == this.floor_on_screen) {
		this.setImage(old_x, old_y, this.blankImageSrc);
	}

	// Update new position with associated image			
	var actor_new_pos = actor.getPosition();
	if (actor_new_pos[2] == this.floor_on_screen) {
		this.setImage(actor_new_pos[0], actor_new_pos[1], actor.getImage());
	}
}

/*
 * Updates the actor map with the new actor position.
 */
Stage.prototype.updateActorMapPosition = function(actor, old_x, old_y, old_floor_num) {
	this.actor_map.reset(old_x, old_y, old_floor_num);
	var pos = actor.getPosition();
	this.actor_map.set(pos[0], pos[1], pos[2], actor);
}

/*
 * Calls appropriate game action based on given keypdown event.
 * Reference: https://developer.mozilla.org/en-US/docs/Web/Events/keydown
 */
Stage.prototype.processKeydown = function(event) {
	var keyCode = event.keyCode; // Supported by all broswers, but depricated
	// http://www.javascripter.net/faq/keycodes.htm

	// Check if game control key
	if (27 == keyCode) {
		// Escape key
		this.game_paused = !this.game_paused;

		var message = "";
		if (this.game_paused) {
			message = "Paused";
		}

		this.displayUserMessage(message);
	}
	// Check if it is a player control key
	else if (65 <= keyCode && keyCode <= 90 || keyCode == 32) {
		this.player.handleKeydown(event);
	}
}

/*
 * Draws the full state of the given stage floor to the screen.
 * NOTE: floor_number should be 0-indexed.
 * Used for switching floors, or doing a full screen update.
 */
Stage.prototype.drawFloor = function(floor_num) {
	var stageid = null;
	
	this.floor_on_screen = floor_num;

	for (var x = 0; x < this.width; x++) {
		for (var y = 0; y < this.height; y++) {
			// Get screen tile id
			stageid = this.getStageId(x, y);
			
			// Get actor at tile (x,y)
			actor = this.getActor(x, y, floor_num);

			// Get image coresponding to tile
			var image = this.blankImageSrc; // default to blank
			if (actor) {
				image = actor.getImage();
			}
	
			// Set image on screen
			this.setImage(x, y, image);
		}
	}

	// Update the player's floor on draw
	// TODO(sdsmith): is this the best way to do this?
	this.player_floor = this.player.getPosition()[2];
	
	// Update the screen's floor number info
	this.displayScreenFloorNumber();
}

/*
 * Displays the current floor number being displayed on the screen.
 */
Stage.prototype.displayScreenFloorNumber = function() {
	this.info_banner_floor_number_id.innerHTML = "Floor " + this.floor_on_screen;
}

/*
 * Displays the current user message to the screen. Tracks the current message 
 * on screen.
 */
Stage.prototype.displayUserMessage = function(message) {
	this.info_banner_user_message_id.innerHTML = message;
}
// END Class Stage










