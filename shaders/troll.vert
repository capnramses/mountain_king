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
uniform float player_dir;

float point_scale = 0.09;
float st_scale = 0.25;

void main () {
	gl_Position = vec4 (vp * point_scale + pos_offset, 0.0, 1.0);
	st = (vp + 1.0) * 0.5 * st_scale;
	if (player_dir < 0.0) {
		st.s *= player_dir;
		st.s += (st_mod.s + 1.0) * st_scale;
	} else {
		st.s += st_mod.s * st_scale;
	}
	st.t += (3.0 - st_mod.t) * st_scale;
}
