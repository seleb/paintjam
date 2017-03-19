function main(){
	// step
	curTime = Date.now()-startTime;
	deltaTime = curTime-lastTime;

	update();
	render();

	lastTime = curTime;

	// request another frame to keeps the loop going
	requestAnimationFrame(main);
}

function init(){
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
		bush.scale.x = bush.scale.y = (i%(numBushes/3)/(numBushes/3)-.5)*.8 + 1.5 + l/8;
		bush.rootX = x;//Math.floor(i/(numBushes/2+.5)*size.x)*bushWidth;
		x += bush.width;
		bush.x = bush.rootX;
		bush.y = -120+i%5+l*20;
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
		bush.scale.x = bush.scale.y = (i%(numBushes/3)/(numBushes/3)-.5)*.3 + 1.85 + l/8;
		bush.rootX = x;//Math.floor(i/(numBushes/2)*size.x)*bushWidth;
		x += bush.width;
		bush.x = bush.rootX;
		bush.y = 80+i%5+l*20;
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
		characters: []
	}

	player = new Character('player_idle');
	player.camPoint = new PIXI.DisplayObject();
	player.camPoint.visible = false;
	player.con.addChild(player.camPoint);
	characters.characters.push(player);

	player.p.x = 5000;
	world.p.x = 5000;

	frogge = new Character('frogge');
	frogge.p.x = 200;
	frogge.p.y = 0;
	characters.con.addChild(frogge.con);
	characters.characters.push(frogge);

	birb = new Character('birb');
	birb.p.x = 400;
	birb.p.y = 0;
	characters.con.addChild(birb.con);
	characters.characters.push(birb);




	characters.con.addChild(player.con);

	for(var i = 0; i < bushes.layersBack.length; ++i){
		world.con.addChild(bushes.layersBack[i]);
	}
	world.con.addChild(characters.con);
	for(var i = 0; i < bushes.layersFront.length; ++i){
		world.con.addChild(bushes.layersFront[i]);
	}

	text = new PIXI.Text("hey what's up", {
		fontFamily: 'Comic Sans MS',
		fontWeight: 'bold',
		fontSize: 24,
		fill : 0x000000,
		align : 'center',
		antiAliased: false
	});
	text.y = -200;
	player.con.addChild(text);

	// start the main loop
	main();
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

	if (player.p.x > 5000) {
		player.v.x -= (player.p.x - 5000)/3;
	}
	if (player.p.x < -10000) {
		player.v.x -= (player.p.x + 10000)/3;
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

	if (player.p.y > 0) {
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
	world.scale = lerp(world.scale, 1 - Math.abs(player.v.y+player.v.x)/32, 0.2);
	world.con.scale.x = world.con.scale.y = lerp(world.con.scale.x, Math.floor(world.scale*8+.1)/8, 0.2);

	var p = world.con.toLocal(PIXI.zero, player.camPoint);

	world.p.x = lerp(world.p.x, p.x, 0.03);
	world.p.y = lerp(world.p.y, player.p.y*world.con.scale.y, 0.03);
	world.con.pivot.x = Math.floor(world.p.x);
	world.con.pivot.y = Math.floor(world.p.y);
	world.con.position.x = size.x/2;
	world.con.position.y = size.y/4*3;

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
		aim:{
			x: gamepads.getAxis(gamepads.RSTICK_H),
			y: gamepads.getAxis(gamepads.RSTICK_V)
		},
		jump: gamepads.isJustDown(gamepads.A) || keys.isJustDown(keys.SPACE),
		jumpExtend: gamepads.isDown(gamepads.A) || keys.isDown(keys.SPACE)
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