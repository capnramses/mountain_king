/*
Tile Shaders
MOUNTAIN KING
Game entry for Ludum Dare 29
Anton Gerdelan (@capnramses)
26 April 2014
*/

attribute vec2 vp;
attribute vec2 vt;
uniform vec2 pp;
varying vec2 st;

float tile_scale = 128.0 / 2048.0;

void main () {
	gl_Position = vec4 (vp - pp, 0.0, 1.0);
	st = vt;
}
