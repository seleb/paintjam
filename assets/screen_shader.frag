precision mediump float;
varying vec2 vTextureCoord;
uniform sampler2D uSampler;

uniform vec2 uScreenSize;
uniform vec2 uBufferSize;

vec3 tex(vec2 _uv){
	_uv.x = clamp(_uv.x, 0.0, 0.9999);
	_uv.y = clamp(_uv.y, 0.0, 0.9999);
	_uv = _uv/uBufferSize*uScreenSize;
	vec4 v = texture2D(uSampler, _uv);
	return v.rgb;
}

void main(void){
	vec2 uvs = vTextureCoord.xy;

	uvs = uvs*uBufferSize/uScreenSize;
	float center = pow(distance(uvs, vec2(0.5)),2.0)/4.0;
	uvs.y -= center;

	float blur = 32.0 / length(uBufferSize) * center + (max(0.0, distance(uvs.y, 0.7)-0.2))/128.0;
	vec3 fg = vec3(0.0);
    fg += tex(vec2(uvs.x - 3.0*blur, uvs.y - 3.0*blur)) * 0.00022511343538252827;
    fg += tex(vec2(uvs.x - 2.0*blur, uvs.y - 2.0*blur)) * 0.022986583012949275;
    fg += tex(vec2(uvs.x - 1.0*blur, uvs.y - 1.0*blur)) * 0.3657342946848143;
    fg += tex(vec2(uvs.x, uvs.y)) * 0.8552309536221563;
    fg += tex(vec2(uvs.x + 1.0*blur, uvs.y + 1.0*blur)) * 0.3657342946848143;
    fg += tex(vec2(uvs.x + 2.0*blur, uvs.y + 2.0*blur)) * 0.022986583012949275;
    fg += tex(vec2(uvs.x + 3.0*blur, uvs.y + 3.0*blur)) * 0.00022511343538252827;

	// output
	gl_FragColor.rgb = fg;
	gl_FragColor.a = 1.0;
}