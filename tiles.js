/*
MOUNTAIN KING
Game entry for Ludum Dare 29
Anton Gerdelan (@capnramses)
26 April 2014
*/

var tile_sp;
var tile_pp_loc;
var tile_row_vbos = new Array ();
var tile_tex;
var curr_col = 2;
var curr_row = 2;
var num_cols = 32;
var num_rows = 23;
var atlas_tile_choices = new Array ();
var dead_ends = [];
var down_ladders = [];

function gen_dead_ends () {
	for (var i = 0; i < num_rows; i++) {
		dead_ends[i] = [];
		for (var j = 0; j < num_cols; j++) {
			dead_ends[i][j] = false;
			// no blocks until 2nd level underground
			if (i > 3) {
				var r = Math.floor ((Math.random () * 10));
				if (r > 7.0) {
					dead_ends[i][j] = true;
				}
			}
		}
	}
}

function is_dead_end (r, c) {
	if (r >= num_rows || r < 0) {
		return true;
	}
	if (c >= num_cols || c < 0) {
		return true;
	}
	return dead_ends[r][c];
}

function gen_ladders () {
	var ladders_per_row = 10;
	for (var i = 0; i < num_rows; i++) {
		down_ladders[i] = [];
		for (var j = 0; j < num_cols; j++) {
			down_ladders[i][j] = false;
		}
		if (i >= 3 && i < num_rows - 1) {
			for (var l = 0; l < ladders_per_row; l++) {
				var c = Math.floor ((Math.random () * num_cols));
				down_ladders[i][c] = true;
				// remove dead-end on stairs
				if (is_dead_end (i, c)) {
					dead_ends[i][c] = false;
				}
				// remove dead end below
				if (is_dead_end (i + 1, c)) {
					dead_ends[i + 1][c] = false;
				}
			}
		}
	}
	// add entry ladder
	down_ladders[2][num_cols - 2] = true;
}

function is_down_ladder (r, c) {
	if (r < 2) {
		return false;
	}
	return down_ladders[r][c];
}

/* load resources and randomly generate a map layout */
function init_tiles () {
	// shaders
	tile_sp = load_shaders_from_files (
		"shaders/tiles.vert", "shaders/tiles.frag");
	gl.bindAttribLocation (tile_sp, 0, "vp");
	gl.bindAttribLocation (tile_sp, 1, "vt");
	gl.linkProgram (tile_sp);
	gl.useProgram (tile_sp);
	tile_pp_loc = get_uniform_loc (tile_sp, "pp");
	gl.uniform2f (tile_pp_loc, 1.0, -1.0);
	
	gen_dead_ends ();
	gen_ladders ();
	
	/* sky rows */
	for (var row = 0; row < 2; row++) {
		for (var col = 0; col < num_cols; col++) {
			var r = Math.floor ((Math.random () * 6));
			atlas_tile_choices.push (r);
			atlas_tile_choices.push (0);
		}
	}
	/* grass row */
	for (var col = 0; col < num_cols; col++) {
		if (is_down_ladder (row, col)) {
			atlas_tile_choices.push (7);
		} else {
			var r = Math.floor ((Math.random () * 6));
			atlas_tile_choices.push (r);
		}
		atlas_tile_choices.push (1);
	}
	/* brown cave */
	for (var row = 3; row < 8; row++) {
		for (var col = 0; col < num_cols; col++) {
			if (dead_ends[row][col]) {
				atlas_tile_choices.push (6);
			} else if (is_down_ladder (row, col)) {
				// down and up
				if (is_down_ladder (row - 1, col)) {
					atlas_tile_choices.push (9);
				// just down
				} else {
					atlas_tile_choices.push (7);
				}
			// just up
			} else if (is_down_ladder (row - 1, col)) {
				atlas_tile_choices.push (8);
			} else {
				var r = Math.floor ((Math.random () * 6));
				atlas_tile_choices.push (r);
			}
			atlas_tile_choices.push (3);
		}
	}
	for (var row = 8; row < 13; row++) {
		for (var col = 0; col < num_cols; col++) {
			if (dead_ends[row][col]) {
				atlas_tile_choices.push (6);
			} else if (is_down_ladder (row, col)) {
				// down and up
				if (is_down_ladder (row - 1, col)) {
					atlas_tile_choices.push (9);
				// just down
				} else {
					atlas_tile_choices.push (7);
				}
			// just up
			} else if (is_down_ladder (row - 1, col)) {
				atlas_tile_choices.push (8);
			} else {
				var r = Math.floor ((Math.random () * 6));
				atlas_tile_choices.push (r);
			}
			atlas_tile_choices.push (5);
		}
	}
	for (var row = 13; row < 18; row++) {
		for (var col = 0; col < num_cols; col++) {
			if (dead_ends[row][col]) {
				atlas_tile_choices.push (6);
			} else if (is_down_ladder (row, col)) {
				// down and up
				if (is_down_ladder (row - 1, col)) {
					atlas_tile_choices.push (9);
				// just down
				} else {
					atlas_tile_choices.push (7);
				}
			// just up
			} else if (is_down_ladder (row - 1, col)) {
				atlas_tile_choices.push (8);
			} else {
				var r = Math.floor ((Math.random () * 6));
				atlas_tile_choices.push (r);
			}
			atlas_tile_choices.push (7);
		}
	}
	for (var row = 18; row < num_rows; row++) {
		for (var col = 0; col < num_cols; col++) {
			if (row == 22 && col == 15) {
				dead_ends[row][col] = false;
				atlas_tile_choices.push (10);
			} else if (dead_ends[row][col]) {
				atlas_tile_choices.push (6);
			} else if (is_down_ladder (row, col)) {
				// down and up
				if (is_down_ladder (row - 1, col)) {
					atlas_tile_choices.push (9);
				// just down
				} else {
					atlas_tile_choices.push (7);
				}
			// just up
			} else if (is_down_ladder (row - 1, col)) {
				atlas_tile_choices.push (8);
			} else {
				var r = Math.floor ((Math.random () * 6));
				atlas_tile_choices.push (r);
			}
			atlas_tile_choices.push (9);
		}
	}
	
	// texture
	tile_tex = create_texture_from_file ("art/tiles.png");
	
	// geometry
	var st_scale = 1.0 / 16.0;
	var atlas_index = 0;
	for (var row = 0; row < num_rows; row++) {
		var geom = new Array ();
		// TODO maybe split geometry by row
		for (var col = 0; col < num_cols; col++) {
			/* positions */
			var txp = col * 0.2; // 10% of view area
			var typ = row * -0.2; // y goes down
			
			// TODO randomise atlas tile and TODO store type
			var atlas_across = atlas_tile_choices[atlas_index++];
			var atlas_down = atlas_tile_choices[atlas_index++];
			
			var xp = txp - 0.1;
			var yp = typ + 0.1;
			xp = xp.toFixed (2);
			yp = yp.toFixed (2);
			var s = 0.0 * st_scale + (atlas_across * st_scale);
			var t = 1.0 * st_scale + ((15 - atlas_down) * st_scale);
			geom.push (xp);
			geom.push (yp);
			geom.push (s);
			geom.push (t);
			
			xp = txp - 0.1;
			yp = typ - 0.1;
			xp = xp.toFixed (2);
			yp = yp.toFixed (2);
			s = 0.0 * st_scale + (atlas_across * st_scale);
			t = 0.0 * st_scale + ((15 - atlas_down) * st_scale);
			geom.push (xp);
			geom.push (yp);
			geom.push (s);
			geom.push (t);
			
			xp = txp + 0.1;
			yp = typ + 0.1;
			xp = xp.toFixed (2);
			yp = yp.toFixed (2);
			s = 1.0 * st_scale + (atlas_across * st_scale);
			t = 1.0 * st_scale + ((15 - atlas_down) * st_scale);
			geom.push (xp);
			geom.push (yp);
			geom.push (s);
			geom.push (t);

			xp = txp + 0.1;
			yp = typ + 0.1;
			xp = xp.toFixed (2);
			yp = yp.toFixed (2);
			s = 1.0 * st_scale + (atlas_across * st_scale);
			t = 1.0 * st_scale + ((15 - atlas_down) * st_scale);
			geom.push (xp);
			geom.push (yp);
			geom.push (s);
			geom.push (t);
			
			xp = txp - 0.1;
			yp = typ - 0.1;
			xp = xp.toFixed (2);
			yp = yp.toFixed (2);
			s = 0.0 * st_scale + (atlas_across * st_scale);
			t = 0.0 * st_scale + ((15 - atlas_down) * st_scale);
			geom.push (xp);
			geom.push (yp);
			geom.push (s);
			geom.push (t);
			
			xp = txp + 0.1;
			yp = typ - 0.1;
			xp = xp.toFixed (2);
			yp = yp.toFixed (2);
			s = 1.0 * st_scale + (atlas_across * st_scale);
			t = 0.0 * st_scale + ((15 - atlas_down) * st_scale);
			geom.push (xp);
			geom.push (yp);
			geom.push (s);
			geom.push (t);
		}
		tile_row_vbos[row] = gl.createBuffer ();
		gl.bindBuffer (gl.ARRAY_BUFFER, tile_row_vbos[row]);
		gl.bufferData (gl.ARRAY_BUFFER, new Float32Array (geom), gl.STATIC_DRAW);
	}
}

function draw_tiles () {
	gl.activeTexture (gl.TEXTURE0);
	gl.bindTexture (gl.TEXTURE_2D, tile_tex);

	gl.useProgram (tile_sp);
	
	gl.enableVertexAttribArray (0);
	gl.enableVertexAttribArray (1);
	
	var top = Math.max (0, curr_row - 5);
	var bottom = Math.min (num_rows - 1, curr_row + 6);
	for (var row = top; row <= bottom; row++) {
		gl.bindBuffer (gl.ARRAY_BUFFER, tile_row_vbos[row]);
		gl.vertexAttribPointer (0, 2, gl.FLOAT, false, 16, 0);
		gl.vertexAttribPointer (1, 2, gl.FLOAT, false, 16, 8);
		gl.drawArrays (gl.TRIANGLES, 0, 6 * num_cols);
	}
	
	gl.disableVertexAttribArray (0);
	gl.disableVertexAttribArray (1);
}

