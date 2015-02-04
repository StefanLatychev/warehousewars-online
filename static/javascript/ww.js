// Stage
// Note: Yet another way to declare a class, using .prototype.

function Stage(width, height, stageElementID){
	this.actors=[]; // all actors on this stage (monsters, player, boxes, ...)
	this.player=null; // a special actor, the player

	// the logical width and height of the stage
	this.width=width;
	this.height=height;

	// the element containing the visual representation of the stage
	this.stageElementID=stageElementID;

	// take a look at the value of these to understand why we capture them this way
	// an alternative would be to use 'new Image()'
	this.blankImageSrc=document.getElementById('blankImage').src;
	this.monsterImageSrc=document.getElementById('monsterImage').src;
	this.playerImageSrc=document.getElementById('playerImage').src;
	this.boxImageSrc=document.getElementById('boxImage').src;
	this.wallImageSrc=document.getElementById('wallImage').src;
}

// initialize an instance of the game
Stage.prototype.initialize=function(){
	// Create a table of blank images, give each image an ID so we can reference it later
	var s='<table>\n';

	for (var x = 0; x < this.width; x++) {
		s += "<tr>\n";
		for (var y = 0; y < this.height; y++) {
			s += "<td><img id='stage_"+x+"_"+y+"' src='"+ this.blankImageSrc + "' /></td>\n";
		}
		s += "</tr>\n";
	}
	s+="</table>\n";
	
	// Put it in the stageElementID (innerHTML)
	document.getElementById(this.stageElementID).innerHTML = s;

	// Add the player to the center of the stage
	

	// Add walls around the outside of the stage, so actors can't leave the stage

	// Add some Boxes to the stage

	// Add in some Monsters

}
// Return the ID of a particular image, useful so we don't have to continually reconstruct IDs
Stage.prototype.getStageId=function(x,y){ return "stage_"+x+"_"+y; }

Stage.prototype.addActor=function(actor){
	this.actors.push(actor);
}

/*
 * Removes the given actor from the stage and return the removed actor.
 */
Stage.prototype.removeActor=function(actor){
	// Lookup javascript array manipulation (indexOf and splice).
	var actor_index = this.actors.indexOf(actor);
	return this.actors.splice(actor_index, 1);
}

// Set the src of the image at stage location (x,y) to src
Stage.prototype.setImage=function(x, y, src){
	document.getElementById(this.getStageId(x,y)).innerHTML = "<img src=\""+src+" />";
}

// Take one step in the animation of the game.  
Stage.prototype.step=function(){
	for(var i=0;i<this.actors.length;i++){
		// each actor takes a single step in the game
	}
}

// return the first actor at coordinates (x,y) return null if there is no such actor
// there should be only one actor at (x,y)!
Stage.prototype.getActor=function(x, y){
	return null;
}
// End Class Stage



/* BEGIN Class Actor */
/*
 * Actor constructor. Take stage position (x,y) and the source of the image to
 * be displayed in its position.
 */
function Actor(x, y, imgsrc, delay=5) {
	this.pos_x = x;
	this.pos_y = y;
	this.imgsrc = imgsrc;
	this.delay_count = 0;
	this.delay = delay;
	
}

Actor.prototype.getPosition=function(){
	return (this.pos_x, this.pos_y);
}

Actor.prototype.setPosition=function=(x, y){
	this.pos_x = x;
	this.pos_y = y;	
}

Actor.prototype.getImage=function(){
	return this.imgsrc;
}

Actor.prototype.setImage=function(imgsrc){
	this.imgsrc = imgsrc;
}

//Generic step function to be overridden by specific actors that will use it
Actor.prototype.step=function(){
	return true;
}

//Generic is_dead function to be overridden by specific actors
Actor.prototype.is_dead(){
	return false;
}

//Generic move function that moves the actor by dx, dy relative to their position
Actor.prototype.move(dx, dy){
	this.setPosition(this.pos_x + dx, this.pos_y + dy);
	return true;
}

//Delay function that will allow for speed settings of different actors relative to the base delay amount.
Actor.prototype.delay(){
	this.delay_count = (this.delay_count + 1) % this.delay;
	return this.delay_count == 0;
}
/* END Class Actor */








