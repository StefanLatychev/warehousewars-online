/* Keycode constants */
var key_Q = 81;
var key_W = 87;
var key_E = 69;
var key_A = 65;
var key_D = 68;
var key_Z = 90;
var key_X = 88;
var key_C = 67;
var key_space = 32;



/* START Class Player */
/*
 * Player constructor. Has a default image set. If image_source if set, it will
 * be used as the base image for the actor.
 */
function Player(stage_ref, x, y, floor_num, image_source=null) {
	this._stage = stage_ref;

	// Set actor's image
	var default_image_source = "";
	if (image_source) {
		default_image_source = image_source;
	}
	this._actor = new Actor(stage_ref, x, y, floor_num, image_source, 0);

	this.key_shift_pressed = false; // Whether the shift key has been pressed
}

/*
 * Return actor's position on the stage as an array [x,y,floor_num].
 */
Player.prototype.getPosition = function() {
	return this._actor.getPosition();
}

/*
 * Set actor's position to the give stage co-ordinates,
 */
Player.prototype.setPosition = function(x, y, floor_num, subclass_actor=this) {
	return this._actor.setPosition(x, y, floor_num, subclass_actor);
}

/*
 * Return actor's image.
 */
Player.prototype.getImage = function() {
	return this._actor.getImage();
}

/*
 * Set actor's image.
 */
Player.prototype.setImage = function(image_source) {
	return this._actor.setImage(image_source);
}

/*
 * Called by objects that want to move Player. The player cannot be moved, and
 * so always returns false.
 */
Player.prototype.move = function(dx, dy, floor_num, subclass_actor=this) {
	return false;
}

/*
 * Move the player dx by dy units relative to the current position immediately.
 * Because this is the player, they skip the normal update loop when moving.
 */
Player.prototype.immediateMove = function(dx, dy, floor_num) {
	var hasMoved = false;

	if (!this._stage.game_paused) {
		var old_pos = this.getPosition();

		if (this._actor.move(dx, dy, floor_num, this)) {
			hasMoved = true;
			var new_pos = this.getPosition();


			// If shift key pressed and moved on the same floor, drag an object opposite the current move direction
			if (this.key_shift_pressed && old_pos[2] == new_pos[2]) {
				var actor_pos_x = old_pos[0] - dx;
				var actor_pos_y = old_pos[1] - dy;
				var actor_floor_num = (this.getPosition())[2];
				var actor = this._stage.getActor(actor_pos_x, actor_pos_y, actor_floor_num);

				if (actor && actor.isGrabbable()) {
					actor.setPosition(old_pos[0], old_pos[1], actor_floor_num);
					this._stage.immediateActorScreenUpdate(actor, actor_pos_x, actor_pos_y, actor_floor_num);
				}
			}
		}
	}

	return hasMoved;
}

/*
 * Called every stage tick. Player's action is not limited to stage ticks
 * (it reacts instantly), and so performs no operation on stage tick.
 */
Player.prototype.tick = function() {
	return false;
}

/*
 * Take the given keydown event and perform the appropriate action based on the
 * keycode.
 */
Player.prototype.handleKeydown = function(event) {
	/*
		Move
		q-NW 	w-N 	e-NE 
		a-E 	s- 		d-W 
		z-SW 	x-S 	c-SE
	 */
	var keyCode = event.keyCode;
	this.key_shift_pressed = event.shiftKey;
	var pos = this.getPosition();

	switch (keyCode) {
		case key_Q:
			this.immediateMove(-1, -1, pos[2]);
			break;

		case key_W:
			this.immediateMove(-1, 0, pos[2]);
			break;

		case key_E:
			this.immediateMove(-1, 1, pos[2]);
			break;

		case key_A:
			this.immediateMove(0, -1, pos[2]);
			break;

		case key_D:
			this.immediateMove(0, 1, pos[2]);
			break;

		case key_Z:
			this.immediateMove(1, -1, pos[2]);
			break;

		case key_X:
			this.immediateMove(1, 0, pos[2]);
			break;

		case key_C:
			this.immediateMove(1, 1, pos[2]);
			break;

		case key_space:
			// Switch floors (NOTE(sdsmith): assuming there is only two!!!!!)
			var other_floor = (pos[2] + 1) % 2;
			if (this.immediateMove(0, 0, other_floor)) {
				this._stage.drawFloor(other_floor);
			}
	}

	
}
/* END Class Player */
