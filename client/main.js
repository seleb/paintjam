function main(){
	// step
	curTime = Date.now()-startTime;
	deltaTime = curTime-lastTime;

	if(!gameEnded){
		update();
	}
	render();

	lastTime = curTime;

	// request another frame to keeps the loop going
	requestAnimationFrame(main);
}

function init(){
	gameEnded = false;

	// save a reference to the texture atlas
	for(var i = 0; i < PIXI.loader.resources.textures_json.data.frames.length; ++i){
		PIXI.TextureCache[PIXI.loader.resources.textures_json.data.frames[i].filename.split('.')[0]] = PIXI.TextureCache[i];
	}

	// initialize input managers
	keys.init();
	keys.capture = [keys.LEFT,keys.RIGHT,keys.UP,keys.DOWN,keys.SPACE,keys.ENTER,keys.BACKSPACE,keys.ESCAPE,keys.W,keys.A,keys.S,keys.D,keys.P,keys.M];
	gamepads.init();

	// setup screen filter
	screen_filter = new CustomFilter(PIXI.loader.resources.vert.data, PIXI.loader.resources.screen_shader.data);
	screen_filter.padding = 0;
	
	renderSprite.filterArea = new PIXI.Rectangle(0,0,size.x,size.y);

	renderSprite.filters = [screen_filter];


	sprite_filter = new CustomFilter(PIXI.loader.resources.vert.data, PIXI.loader.resources.sprite_shader.data);
	sprite_filter.padding = 0;

	window.onresize = onResize;
	onResize();



	world = {
		p:{
			x:0,y:0
		},
		scale: 1
	};
	world.con = new PIXI.Container();
	bg = new PIXI.Graphics();
	bg.beginFill(0xFFFFFF,1);
	bg.drawRect(0,0,size.x,size.y);
	bg.endFill();

	game.addChild(bg);
	game.addChild(world.con);

	bushes={
		layersBack: [],
		layersFront: [],
		bushes: []
	}

	var numBushes = 120;
	bushWidth = 0;
	for(var l = 0; l < 3; ++l){
		var layer = new PIXI.Container();
		layer.filters = [sprite_filter];
		bushes.layersBack.push(layer);
	for (var i = 0, x = 0; i < numBushes/2; ++i){
		bush = new PIXI.Sprite(PIXI.TextureCache['bush_'+((l*i+i+i*4)%3+1).toString(10)]);
		bush.scale.x = bush.scale.y = (i%(numBushes/3)/(numBushes/3)-.5)*.8 + 1.25 + l/8;
		bush.rootX = x;//Math.floor(i/(numBushes/2+.5)*size.x)*bushWidth;
		x += bush.width;
		bush.x = bush.rootX;
		bush.y = -150+i%5+l*40;
		bush.anchor.x = 0;
		bush.anchor.y = 1;
		layer.addChild(bush);
		bushes.bushes.push(bush);
		bushWidth = Math.max(bushWidth, x);
	}
	}
	for(var l = 0; l < 3; ++l){
		var layer = new PIXI.Container();
		layer.filters = [sprite_filter];
		bushes.layersFront.push(layer);
	for (var i = 0, x = 0; i < numBushes/2; ++i){
		bush = new PIXI.Sprite(PIXI.TextureCache['bush_'+((l*i+i+i*9)%3+1).toString(10)]);
		bush.scale.x = bush.scale.y = (i%(numBushes/3)/(numBushes/3)-.5)*.3 + 1.5 + l/8;
		bush.rootX = x;//Math.floor(i/(numBushes/2)*size.x)*bushWidth;
		x += bush.width;
		bush.x = bush.rootX;
		bush.y = 80+i%5+l*40;
		bush.anchor.x = 0;
		bush.anchor.y = 1;
		layer.addChild(bush);
		bushes.bushes.push(bush);
		bushWidth = Math.max(bushWidth, x);
	}
	}
	bushWidth /= size.x;


	characters = {
		con: new PIXI.Container(),
		characters: [],
		data: PIXI.loader.resources.characters.data.characters
	}

	player = new Character('player_idle');
	player.camPoint = new PIXI.DisplayObject();
	player.camPoint.visible = false;
	player.con.addChild(player.camPoint);
	characters.characters.push(player);

	WORLD_RIGHT = 3000;
	WORLD_LEFT = -8500;
	player.p.x = WORLD_LEFT;
	player.p.y = -50;
	world.p.x = WORLD_LEFT;


	for(var i = 0; i < characters.data.length; ++i){
		var c = new Character(characters.data[i].name);
		c.text = characters.data[i].text;
		c.p.x = ((i+1)/characters.data.length) * (WORLD_LEFT - WORLD_RIGHT)*.8 + WORLD_RIGHT;
		c.p.y = -30;
		characters.con.addChild(c.con);
		characters.characters.push(c);
	}



	house = new PIXI.Sprite(PIXI.TextureCache['house']);
	house.x = WORLD_RIGHT;
	house.y = -60;
	house.scale.x = house.scale.y = 2;
	house.anchor.x = 0.5;
	house.anchor.y = 1;
	house.filters = [sprite_filter];


	house2 = new PIXI.Sprite(PIXI.TextureCache['house']);
	house2.x = WORLD_LEFT+20;
	house2.y = -60;
	house2.scale.x = house2.scale.y = 2;
	house2.anchor.x = 0.5;
	house2.anchor.y = 1;
	house2.filters = [sprite_filter];

	fence = new PIXI.Sprite(PIXI.TextureCache['fence']);
	fence.x = WORLD_RIGHT+40;
	fence.y = -10;
	fence.scale.x = fence.scale.y = 2;
	fence.anchor.x = 0;
	fence.anchor.y = 0.5;
	fence.filters = [sprite_filter];

	fence2 = new PIXI.Sprite(PIXI.TextureCache['fence']);
	fence2.x = WORLD_LEFT-40;
	fence2.y = -10;
	fence2.scale.x = fence2.scale.y = 2;
	fence2.scale.x *= -1;
	fence2.anchor.x = 0;
	fence2.anchor.y = 0.5;
	fence2.filters = [sprite_filter];


	characters.con.addChild(player.con);

	for(var i = 0; i < bushes.layersBack.length; ++i){
		world.con.addChild(bushes.layersBack[i]);
	}
	world.con.addChild(house);
	world.con.addChild(house2);


	world.con.addChild(characters.con);

	world.con.addChild(fence);
	world.con.addChild(fence2);

	for(var i = 0; i < bushes.layersFront.length; ++i){
		world.con.addChild(bushes.layersFront[i]);
	}

	font = {
		fontFamily: 'Comic Sans MS',
		fontWeight: 'bold',
		fontSize: 32,
		fill : 0x000000,
		stroke : 0xFFFFFF,
		strokeThickness : 3,
		align : 'left',
		antiAliased: false
	};
	text = new PIXI.Text("", font);
	text.y = -200;
	text.anchor.x = 0.5;
	text.anchor.y = 0.5;
	player.con.addChild(text);

	// start the main loop
	main();
}

function endGame(){

	game.removeChild(world.con);
	world.con.destroy();
	world = null;

	var spr = new PIXI.Sprite(PIXI.TextureCache["endgame"]);
	spr.filters = [sprite_filter];
	game.addChild(spr);

	blah = new PIXI.Text("the end", font);

	game.addChild(blah);
	blah.x = size.x/4;
	blah.y = size.y/4;
	blah.anchor.x = 0.5;
	blah.anchor.y = 0.5;


	gameEnded = true;
}

function onResize() {
	_resize();
	screen_filter.uniforms["uScreenSize"] = [size.x,size.y];
	screen_filter.uniforms["uBufferSize"] = [nextPowerOfTwo(size.x),nextPowerOfTwo(size.y)];
	console.log('Resized',size,scaleMultiplier,[size.x*scaleMultiplier,size.y*scaleMultiplier]);
}

function update(){
	// game update


	var input = getInput();



	// TALKING
	var target = null;
	for(var i = 0; i < characters.characters.length; ++i){
		var c = characters.characters[i];
		if(c== player){
			continue;
		}

		if (Math.pow(c.p.x - player.p.x, 2.0)/4 + Math.pow((c.p.y+20) - player.p.y, 2.0)*2 < 4000){
			target = c;
		}
	}
	if(player.talkTarget != target){
		player.talkTarget = target;

		if(target){
			text.text = "talk to "+target.name;
		}else{
			text.text = "";
		}
	}

	if(target && input.talk){
		text.text = target.text[target.talkOffset];
		target.talkOffset = (target.talkOffset + 1)%target.text.length;

		text.scale.x -= .5;
		text.scale.y += 2;
		target.scale += .2;
	}

	text.scale.x = lerp(text.scale.x, 1, 0.2);
	text.scale.y = lerp(text.scale.y, 1, 0.2);



	// update player
	player.v.x *= 0.8;
	player.v.x += input.move.x*2.0;

	player.v.y *= 0.8;
	player.v.y += input.move.y;

	if (player.p.y > 70) {
		player.v.y -= (player.p.y - 70)/3;
	}
	if (player.p.y < -70) {
		player.v.y -= (player.p.y + 70)/3;
	}

	if (player.p.x > WORLD_RIGHT) {
		player.v.x -= (player.p.x - WORLD_RIGHT)/3;
	}
	if (player.p.x < WORLD_LEFT) {
		player.v.x -= (player.p.x - WORLD_LEFT)/3;
	}

	player.p.x += player.v.x;
	player.p.y += player.v.y;


	if(Math.abs(player.v.x) + Math.abs(player.v.y) > 1){
		if(player.running){
			player.running += 1;
		}else{
			player.running = 1;
		}
	}else{
		if(player.running){
			player.running = 0;
			player.spr.texture = PIXI.TextureCache['player_idle'];
		}
	}
	player.freq = (player.running ? 0.5 : 1.0) * 200;
	if (player.running) {
		if(player.running > 5){
			player.spr.texture = PIXI.TextureCache['player_run_'+(Math.floor(curTime/player.freq)%2+1)];
		}
		player.flipped = player.v.x < 0;
		player.spr.anchor.y = 1 + Math.abs(Math.pow(Math.sin(curTime/player.freq),2))/20;
	} else {
		player.spr.anchor.y = 1;
	}

	if (player.p.y > -30) {
		characters.con.addChild(player.con);
	}else {
		characters.con.addChildAt(player.con,0);
	}

	player.camPoint.position.x = clamp(-1, player.v.x/3, 1) * size.x * 0.7;

	for(var i = 0; i < characters.characters.length; ++i){
		characters.characters[i].update();
	}

	for(var i = 0, bush; i < bushes.bushes.length; ++i){
		bush = bushes.bushes[i];
		bush.position.x = Math.floor(bush.rootX + Math.floor((player.p.x-bush.rootX)/(size.x*bushWidth))*size.x*bushWidth)+size.x*bushWidth/2;
	}

	// camera
	world.scale = lerp(world.scale, 1 - (Math.abs(player.v.y)+Math.abs(player.v.x))/32, 0.2);
	world.con.scale.x = world.con.scale.y = lerp(world.con.scale.x, Math.floor(world.scale*8+.1)/8, 0.2);

	var p = world.con.toLocal(PIXI.zero, player.camPoint);

	world.p.x = lerp(world.p.x, p.x, 0.03);
	world.p.y = lerp(world.p.y, player.p.y*world.con.scale.y, 0.03);
	world.con.pivot.x = Math.floor(world.p.x);
	world.con.pivot.y = Math.floor(world.p.y);
	world.con.position.x = size.x/2;
	world.con.position.y = size.y/4*3;




	// ENDGAME
	if (Math.pow(WORLD_RIGHT - player.p.x, 2.0)/4 + Math.pow(-80 - player.p.y, 2.0)*2 < 4000){
		text.text = "go to blank's house";
		player.talkTarget = "endgame";
		if(input.talk){
			endGame();
		}
	}

	// update input managers
	keys.update();
	gamepads.update();
}

function render(){
	renderer.render(game,renderTexture,true,false);
	renderer.render(renderSprite,null,true,false);
}



function getInput(){
	var res = {
		move:{
			x: gamepads.getAxis(gamepads.LSTICK_H),
			y: gamepads.getAxis(gamepads.LSTICK_V)
		},
		talk:
			gamepads.isJustDown(gamepads.A) || 
			gamepads.isJustDown(gamepads.B) || 
			gamepads.isJustDown(gamepads.X) || 
			gamepads.isJustDown(gamepads.Y) || 
			keys.isJustDown(keys.SPACE) ||
			keys.isJustDown(keys.E) ||
			keys.isJustDown(keys.Z) ||
			keys.isJustDown(keys.X) ||
			keys.isJustDown(keys.ENTER)
	};

	if(keys.isDown(keys.A) || keys.isDown(keys.LEFT)){
		res.move.x -= 1;
	}if(keys.isDown(keys.D) || keys.isDown(keys.RIGHT)){
		res.move.x += 1;
	}if(keys.isDown(keys.W) || keys.isDown(keys.UP)){
		res.move.y -= 1;
	}if(keys.isDown(keys.S) || keys.isDown(keys.DOWN)){
		res.move.y += 1;
	}

	res.move.x = clamp(-1.0, res.move.x, 1.0);
	res.move.y = clamp(-1.0, res.move.y, 1.0);

	return res;
}