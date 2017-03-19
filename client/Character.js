function Character(_spr){
	this.p = {x:0,y:0};
	this.v = {x:0,y:0};
	this.scale = 1.0;
	this.freq = 200;
	this.offset = Character.offset;
	Character.offset += 1;

	this.flipped = false;

	this.con = new PIXI.Container();
	this.shadow = new PIXI.Sprite(PIXI.TextureCache['shadows']);
	this.shadow.filters = [sprite_filter];
	this.shadow.anchor.x = 0.5;
	this.shadow.anchor.y = .75;
	this.spr = new PIXI.Sprite(PIXI.TextureCache[_spr]);
	this.spr.filters = [sprite_filter];
	this.spr.anchor.x = 0.5;
	this.spr.anchor.y = 1.0;
	this.con.addChild(this.shadow);
	this.con.addChild(this.spr);
}

Character.offset = 0;

Character.prototype.update = function(){
	this.con.x = Math.floor(this.p.x);
	this.con.y = Math.floor(this.p.y);

	this.scale = .8+(this.p.y+50)/300;
	this.spr.scale.y = this.scale + (Math.sin(curTime/this.freq + this.offset)/30 + Math.abs(Math.sin(curTime/this.freq + this.offset)/10));
	this.spr.scale.x = this.flipped ? -this.scale : this.scale;
	this.spr.skew.x = this.v.x/50;
	this.shadow.width = this.spr.width - (Math.sin(curTime/this.freq + this.offset)/30 + Math.abs(Math.sin(curTime/this.freq + this.offset)/10))*64;
}