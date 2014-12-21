/*
Tile Shaders
MOUNTAIN KING
Game entry for Ludum Dare 29
Anton Gerdelan (@capnramses)
26 April 2014
*/

precision mediump float;

varying vec2 st;
uniform sampler2D atlas_tex;

void main () {
	gl_FragColor = texture2D (atlas_tex, st);
}
