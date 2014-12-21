/*
Tile Shaders
MOUNTAIN KING
Game entry for Ludum Dare 29
Anton Gerdelan (@capnramses)
26 April 2014
*/

attribute vec2 vp;
varying vec2 st;
uniform vec2 st_mod;
uniform vec2 pos_offset;

float point_scale = 0.07;
float st_scale = 0.5;

void main () {
	gl_Position = vec4 (vp * point_scale + pos_offset, 0.0, 1.0);
	st = (vp + 1.0) * 0.5 * st_scale;
	st.s += st_mod.s * st_scale;
	st.t += (1.0 - st_mod.t) * st_scale;
}
