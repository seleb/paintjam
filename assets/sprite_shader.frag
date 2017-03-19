precision mediump float;
varying vec2 vTextureCoord;
uniform sampler2D uSampler;

void main(void){
	vec2 uvs = vTextureCoord.xy;
	vec4 fg = texture2D(uSampler, uvs);

	float l = fg.r;
	float a = fg.b - fg.r + fg.g;

	// output
	gl_FragColor.rgb = vec3(l * a);
	gl_FragColor.a = a;
}