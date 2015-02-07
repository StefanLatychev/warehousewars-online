/* Keycode constants */
var key_Q = 81;
var key_W = 87;
var key_E = 69;
var key_A = 65;
var key_D = 68;
var key_Z = 90;
var key_X = 88;
var key_C = 67;



/* START Class Player */
/*
 * Player constructor. Has a default image set. If image_source if set, it will
 * be used as the base image for the actor.
 */
function Player(stage_ref, x, y, image_source=null) {
	this._stage = stage_ref;

	// Set actor's image
	var default_image_source = "";
	if (image_source) {
		default_image_source = image_source;
	}
	this._actor = new Actor(stage_ref, x, y, image_source, 0);

	this.key_shift_pressed = false; // Whether the shift key has been pressed
}

/*
 * Return actor's position on the stage as an array [x,y].
 */
Player.prototype.getPosition = function() {
	return this._actor.getPosition();
}

/*
 * Set actor's position to the give stage co-ordinates,
 */
Player.prototype.setPosition = function(x, y, subclass_actor=this) {
	return this._actor.setPosition(x, y, subclass_actor);
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
Player.prototype.move = function(dx, dy, subclass_actor=this) {
	return false;
}

/*
 * Move the player dx by dy units relative to the current position immediately.
 * Because this is the player, they skip the normal update loop when moving.
 */
Player.prototype.immediateMove = function(dx, dy) {
	if (!this._stage.game_paused) {
		var old_pos = this.getPosition();

		if (this._actor.move(dx, dy, this)) {
			var new_pos = this.getPosition();
			this._stage.setImage(new_pos[0], new_pos[1], this.getImage());
			this._stage.setImage(old_pos[0], old_pos[1], this._stage.blankImageSrc);

			// If shift key pressed, drag an object opposite the current move direction
			if (this.key_shift_pressed) {
				var actor_pos_x = old_pos[0] - dx;
				var actor_pos_y = old_pos[1] - dy;
				actor = this._stage.getActor(actor_pos_x, actor_pos_y);

				if (actor && actor.isGrabbable()) {
					actor.setPosition(old_pos[0], old_pos[1]);
					this._stage.immediateMoveUpdate(actor, actor_pos_x, actor_pos_y);
				}
			}
		}
	}
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

	switch (keyCode) {
		case key_Q:
			this.immediateMove(-1, -1);
			break;

		case key_W:
			this.immediateMove(-1, 0);
			break;

		case key_E:
			this.immediateMove(-1, 1);
			break;

		case key_A:
			this.immediateMove(0, -1);
			break;

		case key_D:
			this.immediateMove(0, 1);
			break;

		case key_Z:
			this.immediateMove(1, -1);
			break;

		case key_X:
			this.immediateMove(1, 0);
			break;

		case key_C:
			this.immediateMove(1, 1);
			break;
	}

	
}
/* END Class Player */
