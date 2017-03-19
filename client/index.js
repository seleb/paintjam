var startTime = 0;
var lastTime = 0;
var curTime = 0;

var game;
try{
	game = new PIXI.Container();
}catch(e){
	document.body.innerHTML='<p>Unsupported Browser. Sorry :(</p>';
}
var resizeTimeout=null;

var size={x:1920/3,y:1080/3};

var sounds=[];

var scaleMode = 0;
var scaleMultiplier = 1;

$(document).ready(function(){

	// try to auto-focus and make sure the game can be focused with a click if run from an iframe
	window.focus();
	$(document).on('mousedown',function(){
		window.focus();
	});

	// setup game
	startTime=Date.now();


	// create renderer
	renderer = new PIXI.autoDetectRenderer(size.x, size.y, {
		antiAlias:false,
		transparent:false,
		resolution:1,
		roundPixels:true,
		clearBeforeRender:true,
		autoResize:false,
	});
	
	renderer.backgroundColor = 0x000000;

	PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;

	// add the canvas to the html document
	$('#display').prepend(renderer.view);


	/*sounds['bgm']=new Howl({
		urls:['assets/audio/flatgame recording.ogg'],
		autoplay:true,
		loop:true,
		volume:0
	});
	sounds['bgm'].fadeIn(1,2000);*/

	// create render texture
	renderTexture = PIXI.RenderTexture.create(size.x,size.y,PIXI.SCALE_MODES.NEAREST,1);
	 
	// create a sprite that uses the render texture
	renderSprite = new PIXI.Sprite(renderTexture, new PIXI.Rectangle(0,0,size.x,size.y));

	CustomFilter.prototype = Object.create(PIXI.Filter.prototype);
	CustomFilter.prototype.constructor = CustomFilter;

	PIXI.loader
		.add('textures', 'assets/textures.png')
		.add('textures_json', 'assets/textures.json')
		.add('vert','assets/passthrough.vert')
		.add('screen_shader','assets/screen_shader.frag')
		.add('sprite_shader','assets/sprite_shader.frag');

	PIXI.loader
		.on('progress', loadProgressHandler)
		.load(init);
});


function CustomFilter(vertSource, fragSource){
	PIXI.Filter.call(this,
		// vertex shader
		vertSource,
		// fragment shader
		fragSource
	);
}


function loadProgressHandler(__loader, __resource){
	// called during loading
	console.log('loading: ' + __resource.url);
	console.log('progress: ' + __loader.progress+'%');
}


function _resize(){
	var w=$('#display').innerWidth();
	var h=$('#display').innerHeight();
	var ratio=size.x/size.y;

	
	if(w/h < ratio){
		h = Math.round(w/ratio);
	}else{
		w = Math.round(h*ratio);
	}
	
	var aw,ah;

	if(scaleMode==0){
		// largest multiple
		scaleMultiplier = 1;
		aw=size.x;
		ah=size.y;

		do{
			aw+=size.x;
			ah+=size.y;
			scaleMultiplier += 1;
		}while(aw <= w || ah <= h);

		scaleMultiplier -= 1;
		aw-=size.x;
		ah-=size.y;
	}else if(scaleMode==1){
		// stretch to fit
		aw=w;
		ah=h;
		scaleMultiplier = w/size.x;
	}else{
		// 1:1
		scaleMultiplier = 1;
		aw=size.x;
		ah=size.y;
	}

	renderer.view.style.width=aw+'px';
	renderer.view.style.height=ah+'px';
}

PIXI.zero=new PIXI.Point(0,0);