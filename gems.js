var gems_tex;
var gems_sp;
var gems_st_mod_loc;
var gems_pos_offset_loc;
var gem_tiles = [];
var gem_sound_el;
var gems_points = 0;

function gen_gems () {
	for (var i = 3; i < num_rows; i++) {
		gem_tiles[i] = [];
		for (var j = 0; j < num_cols; j++) {
			gem_tiles[i][j] = false;
			if (!is_dead_end (i, j)) {
				var r = Math.floor ((Math.random () * 10));
				if (r > 8.0) {
					gem_tiles[i][j] = true;
				}
			}
		}
	}
}

function is_gem_tile (r, c) {
	if (r >= num_rows || r < 3) {
		return false;
	}
	if (c >= num_cols || c < 0) {
		return false;
	}
	return gem_tiles[r][c];
}

function pick_up_gems (r, c) {
	if (is_gem_tile (r, c)) {
		gem_tiles[r][c] = false;
		if (r < 8) {
			score += 100;
			gems_points += 100;
		} else if (r < 13) {
			score += 150;
			gems_points += 150;
		} else if (r < 18) {
			score += 200;
			gems_points += 200;
		} else {
			score += 250;
			gems_points += 250;
		}
		
		score_el.innerHTML = "score: " + score + "<br />high: " + high_score + " (" +
			high_scorer + ")";
		
		gem_sound_el.currentTime = 0.0;
		gem_sound_el.play (); // also pause ()
	}
}

function init_gems () {
	gem_sound_el = document.getElementById ("gem_sound");
	gem_sound_el.volume = 0.5
	gems_sp = load_shaders_from_files ("shaders/gems.vert", "shaders/gems.frag");
	gl.linkProgram (gems_sp);
	gems_st_mod_loc = get_uniform_loc (gems_sp, "st_mod");
	gems_pos_offset_loc = get_uniform_loc (gems_sp, "pos_offset");
	gems_tex = create_texture_from_file ("art/gems.png");
	
	// add gems to world
	gen_gems ();
}

function draw_gems () {
	gl.useProgram (gems_sp);
	gl.activeTexture (gl.TEXTURE0);
	gl.bindTexture (gl.TEXTURE_2D, gems_tex);
	gl.bindBuffer (gl.ARRAY_BUFFER, player_vbo); // uses player's VBO
	gl.vertexAttribPointer (0, 2, gl.FLOAT, false, 8, 0);
	gl.enableVertexAttribArray (0);

	var top = Math.max (3, curr_row - 5);
	var bottom = Math.min (num_rows - 1, curr_row + 5);
	var left = Math.max (0, curr_col - 5);
	var right = Math.min (num_cols - 1, curr_col + 5);
	for (var row = top; row <= bottom; row++) {
		if (row < 8) {
			gl.uniform2f (gems_st_mod_loc, 0.0, 0.0);
		} else if (row < 13) {
			gl.uniform2f (gems_st_mod_loc, 0.0, 1.0);
		} else if (row < 18) {
			gl.uniform2f (gems_st_mod_loc, 1.0, 1.0);
		} else {
			gl.uniform2f (gems_st_mod_loc, 1.0, 0.0);
		}
		for (var col = left; col <= right; col++) {
			if (is_gem_tile (row, col)) {
				var x = (0.2 * col) - player_pos_x;
				var y = (-0.2 * row) - player_pos_y;
				gl.uniform2f (gems_pos_offset_loc, x, y);
				gl.drawArrays (gl.TRIANGLE_STRIP, 0, 4);
			}
		}
	}
	
	gl.disableVertexAttribArray (0);
}
