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

	var bushes = new PIXI.Container();
	for (var i = 0; i < 10; ++i){
		bush = new PIXI.Sprite(PIXI.TextureCache['bush_'+(i%3+1).toString(10)]);
		bush.filters = [sprite_filter];
		bush.x = Math.floor(Math.random()*size.x*4);
		bush.y = -70+i;
		bush.scale.x = bush.scale.y = (Math.random()-.5)*.6 + 1;
		bush.anchor.x = 0.5;
		bush.anchor.y = 1;
		bushes.addChild(bush);
	}


	characters = new PIXI.Container();

	frogge = new PIXI.Sprite(PIXI.TextureCache['frogge']);
	frogge.filters = [sprite_filter];
	frogge.x = 200;
	frogge.y = 0;
	frogge.anchor.x = 0.5;
	frogge.anchor.y = 1;
	characters.addChild(frogge);



	player = {
		p:{
			x:0,y:0
		},
		v:{
			x:0,y:0
		}
	};

	player.con = new PIXI.Container();
	player.shadow = new PIXI.Sprite(PIXI.TextureCache['shadows']);
	player.shadow.filters = [sprite_filter];
	player.shadow.anchor.x = 0.5;
	player.shadow.anchor.y = .75;
	player.spr = new PIXI.Sprite(PIXI.TextureCache['player_idle']);
	player.spr.filters = [sprite_filter];
	player.spr.anchor.x = 0.5;
	player.spr.anchor.y = 1.0;
	player.camPoint = new PIXI.DisplayObject();
	player.camPoint.visible = false;
	player.con.addChild(player.shadow);
	player.con.addChild(player.spr);
	player.con.addChild(player.camPoint);
	characters.addChild(player.con);

	var bushes2 = new PIXI.Container();
	for (var i = 0; i < 10; ++i){
		bush = new PIXI.Sprite(PIXI.TextureCache['bush_'+(i%1+1).toString(10)]);
		bush.filters = [sprite_filter];
		bush.x = Math.floor(Math.random()*size.x*4);
		bush.y = 80+i;
		bush.scale.x = bush.scale.y = (Math.random()-.5)*.3 + 1.5;
		bush.anchor.x = 0.5;
		bush.anchor.y = 1;
		bushes2.addChild(bush);
	}

	world.con.addChild(bushes);
	world.con.addChild(characters);
	world.con.addChild(bushes2);


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

	if (player.p.y > 50) {
		player.v.y -= (player.p.y - 50)/3;
	}
	if (player.p.y < -50) {
		player.v.y -= (player.p.y + 50)/3;
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
	var freq = (player.running ? 0.5 : 1.0) * 200;
	if (player.running) {
		if(player.running > 5){
			player.spr.texture = PIXI.TextureCache['player_run_'+(Math.floor(curTime/freq)%2+1)];
		}
		player.flipped = player.v.x < 0;
		player.spr.anchor.y = 1 + Math.abs(Math.pow(Math.sin(curTime/freq),2))/20;
	} else {
		player.spr.anchor.y = 1;
	}

	if (player.p.y > 0) {
		characters.addChild(player.con);
	}else {
		characters.addChildAt(player.con,0);
	}

	// update player sprite
	player.camPoint.position.x = clamp(-1, player.v.x/3, 1) * size.x * 0.7;

	player.con.x = Math.floor(player.p.x);
	player.con.y = Math.floor(player.p.y);

	player.scale = .8+(player.p.y+50)/300;
	player.spr.scale.y = player.scale + (Math.sin(curTime/freq)/30 + Math.abs(Math.sin(curTime/freq)/10));
	player.spr.scale.x = player.flipped ? -player.scale : player.scale;
	player.spr.skew.x = player.v.x/50;
	player.shadow.width = player.spr.width - (Math.sin(curTime/freq)/30 + Math.abs(Math.sin(curTime/freq)/10))*64;

	// camera
	world.scale = lerp(world.scale, 1 - Math.abs(player.v.y+player.v.x)/32, 0.1);
	world.con.scale.x = world.con.scale.y = Math.floor(world.scale*64)/64;

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