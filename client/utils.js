// linear interpolation
function lerp(from,to,t){
	if(Math.abs(to-from) < 0.0000001){
		return to;
	}
	return from+(to-from)*t;
}

function slerp(from,to,by){
	from /= Math.PI*2;
	to /= Math.PI*2;
 while (to-from > 0.5){ from += 1 }
 while (to-from < -0.5){ from -= 1 }
 return ((from + by * (to - from)) % 1) * Math.PI * 2;
}

// returns v, clamped between min and max
function clamp(min,v,max){
	return Math.max(min,Math.min(v,max));
}



function toggleMute(){
	if(Howler._muted){
		Howler.unmute();
	}else{
		Howler.mute();
	}
}


function ease(t) {
	if ((t/=0.5) < 1) {
		return 0.5*t*t*t;
	}
	return 0.5*((t-=2)*t*t + 2);
};


// returns the smallest power-of-2 which contains v 
function nextPowerOfTwo(v){
	return Math.pow(2, Math.ceil(Math.log(v)/Math.log(2)));
}


// returns fractional part of number
function fract(v){
	return v-Math.floor(Math.abs(v))*Math.sign(v);
}