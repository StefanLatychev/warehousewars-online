/* Start Class Monster */
/* 
 * Monster Constructor. Take stage position (x, y). 
 */
function Monster(stage_ref, x, y, image_source=null) {
	// Check default image source	
	var default_image_source = "";
	if (image_source) {
		default_image_source = image_source;
	}	
	
	//Test movement deltas	
	this.dx = 1;
	this.dy = 1;

	this._stage = stage_ref;
	this._actor = new Actor(stage_ref, x, y, default_image_source, 5);
}

/*
 * 
 */
Monster.prototype.getPosition = function() {
	return this._actor.getPosition();
}

Monster.prototype.setPosition = function(x, y) {
	return this._actor.setPosition(x, y);
}

Monster.prototype.getImage = function() {
	return this._actor.getImage();
}

Monster.prototype.setImage = function(image_source) {
	return this._actor.setImage(image_source);
}

/*
 * Will check if monster is dead, will appropriately delay itself if need be,
 * and make itself move
 */
Monster.prototype.tick = function(force_update) {
	if(force_update) {
	//TODO(SLatychev): force_update being used temporarily as it may not be called just on initialization later
	/*NOTE(SLatychev): The current state of tick is jerry rigged (if it works at all) because without the force_update
	 * check the tick will fall into the isDead code to try and extract a false result, unfortunately this doesn't occur
	 * instead the monster while being initialized will think it is surrounded by default(check if this is actually true and 
	 * not further broken logic) and mess up the spawn sequence
	 */
		if (this.isDead()) {
			this._stage.removeActor(this);
		} else if (!this._actor.delay()) {
			return this.move(this.dx, this.dy);
		}
	}
	return false;
}

/*
 *	Checks surrounding squares and adds up the total number of blocks the
 * monster is surrounded by, if it is surrounded keep alive for 3 more ticks
 * to ensure it is really dead
 */
Monster.prototype.isDead = function() {
	var counter = 0;	
	var delta = [-1, 0, 1];
	var monster_pos = this.getPosition();

	for(var i = 0; i < delta.length; i++) {
		for(var j = 0; j < delta.length; j++) {

			var surroundCheck = this._stage.getActor(monster_pos[0] + delta[i], monster_pos[1]+ delta[j]);
			//Individual square check
			if(surroundCheck !== null) {
				counter += 1;

				if(counter === 8) {
					this.deathCheck += 1;
					//Checking for death ensurance
					if(deathCheck === 3) {
						return true;
					}
				}
			}
		}
	}
	counter = 0;
	return false;
}

/*
 *	(According to test deltas) will move diagonally, if it hits a wall will
 * determine if it is being blocked in the x or y directions and "bounce" in
 * the opposite direction (deltas get sign flipped)
 */
Monster.prototype.move = function() {
	var monster_pos = this._actor.getPosition();
	var new_x = monster_pos[0] + this.dx;
	var new_y = monster_pos[1] + this.dy;
	var nNew_x = monster_pos[0] - this.dx;
	var nNew_y = monster_pos[1] - this.dy;

	var other_actor = this._stage.getActor(new_x, new_y);
	var relativePos_x = this._stage.getActor(nNew_x, new_y);
	var relativePos_y = this._stage.getActor(new_x, nNew_y);

	/*
	//Tell player that they are dead
	if (other_actor === this._stage.player) {
		this._stage.player.killed = true;
	}


	//Don't allow player to move if they collide with a sticky box
	if (other_actor instanceof StickyBox){
		return false;
	}
	*/

	//Ricochet collision
	if (other_actor !== null) {
		//TODO(SLatychev): Case hit corner, and gets blocked from behind
		if (relativePos_x !== null) {
			this.dy = -this.dy;
		}
		if (relativePos_y !== null) {
			this.dx = -this.dx;
		}
		return true; 
	}
	
	this._actor.setPosition(monster_pos[0]+this.dx, monster_pos[1]+this.dy);

	return true;
}









