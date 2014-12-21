var trolls = [];
var troll_doors = [];

var troll_sp;
var troll_st_mod_loc;
var troll_pos_offset_loc;
var troll_dir_loc;

var troll_door_sp;
var troll_door_pos_offset_loc;
var troll_door_scale_loc;

var troll_tex;
var troll_door_tex;
var troll_x_speed = 0.6;
var troll_y_speed = 0.4;
var troll_brown_respawn_time = 20.0;
var troll_grey_respawn_time = 10.0;
var troll_blue_respawn_time = 5.0;
var troll_green_respawn_time = 2.5;

var num_active_trolls = 0;
var next_troll = 0;
var time_since_brown_update = 0.0;
var time_since_grey_update = 0.0;
var time_since_blue_update = 0.0;
var time_since_green_update = 0.0;

var trolls_points = 0;

function troll_cons () {
	this.row = 2;
	this.col = 10;
	this.x = this.col * 0.2;
	this.y = this.row * -0.2;
	this.dir = 1.0;
	this.chasing = false;
	this.climbing_up = false;
	this.climbing_down = false;
	this.anim_counter = 0.0;
	// frames
	this.across = 0.0;
	this.down = 0.0;
	this.target_height = 0.0;
	this.active = false;
	this.dead = false;
	this.whacking = false;
}

function gen_trolls () {
	for (var i = 0; i < 10; i++) {
		trolls[i] = new troll_cons ();
	}
}

// TODO preallocate 20 trolls
// TODO add active/inactive flag

function gen_troll_doors () {
	var total = 0;
	for (var i = 0; i < num_rows; i++) {
		troll_doors[i] = [];
		for (var j = 0; j < num_cols; j++) {
			troll_doors[i][j] = false;
			if (i < 3) {
				continue;
			}
			if (!is_dead_end (i, j) && !is_down_ladder (i, j) &&
				!is_down_ladder (i - 1, j)) {
				var r = Math.floor ((Math.random () * 100));
				if (r > 95) {
					troll_doors[i][j] = true;
					total++;
				}
			}
		}
	}
	console.log ("generated troll doors. count: " + total);
}

function init_trolls () {
	troll_sp = load_shaders_from_files ("shaders/troll.vert", "shaders/troll.frag");
	gl.linkProgram (troll_sp);
	troll_st_mod_loc = get_uniform_loc (troll_sp, "st_mod");
	troll_pos_offset_loc = get_uniform_loc (troll_sp, "pos_offset");
	troll_dir_loc = get_uniform_loc (troll_sp, "player_dir");
	
	troll_door_sp = load_shaders_from_files (
		"shaders/troll_door.vert", "shaders/troll_door.frag");
	gl.linkProgram (troll_door_sp);
	troll_door_pos_offset_loc = get_uniform_loc (troll_door_sp, "pos_offset");
	troll_door_scale_loc = get_uniform_loc (troll_door_sp, "point_scale");
	
	troll_tex = create_texture_from_file ("art/troll.png");
	troll_door_tex = create_texture_from_file ("art/troll_door.png");
	// add trolls to world
	gen_trolls ();
	gen_troll_doors ();
}

function update_troll_doors () {
	time_since_brown_update += time_step_size_s;
	time_since_grey_update += time_step_size_s;
	time_since_blue_update += time_step_size_s;
	time_since_green_update += time_step_size_s;
	var top = Math.max (3, curr_row - 5);
	var bottom = Math.min (num_rows - 1, curr_row + 5);
	var left = Math.max (0, curr_col - 5);
	var right = Math.min (num_cols - 1, curr_col + 5);
	for (var row = top; row <= bottom; row++) {
		for (var col = left; col <= right; col++) {
			if (troll_doors[row][col]) {
				// distribute between multiple doors
				var r = Math.floor ((Math.random () * 100));
				if (r < 75) {
					continue;
				}
				if (row >= 3 && row <= 7 &&
					time_since_brown_update > troll_brown_respawn_time) {
					time_since_brown_update = 0.0;
				} else if (row >= 8 && row <= 12 &&
					time_since_grey_update > troll_grey_respawn_time) {
					time_since_grey_update = 0.0;
				} else if (row >= 13 && row <= 17 &&
					time_since_blue_update > troll_blue_respawn_time) {
					time_since_blue_update = 0.0;
				} else if (row >= 18 &&
					time_since_green_update > troll_green_respawn_time) {
					time_since_green_update = 0.0;
				} else {
					continue;
				}
				// TODO play spawn sound
				
				trolls[next_troll].active = true;
				trolls[next_troll].dead = false;
				trolls[next_troll].row = row;
				trolls[next_troll].col = col;
				trolls[next_troll].x = col * 0.2;
				trolls[next_troll].y = row * -0.2;
				trolls[next_troll].chasing = true;
				trolls[next_troll].climbing_up = false;
				trolls[next_troll].climbing_down = false;
				trolls[next_troll].anim_counter = 0.0;
				
				next_troll++;
				if (next_troll >= 10) {
					next_troll = 0;
				}
			}
		}
	}
}

// TODO increase troll speed at end
function update_trolls () {
	for (var i = 0; i < trolls.length; i++) {
		if (!trolls[i].active) {
			continue;
		}
		if (trolls[i].dead) {
			continue;
		}
		// check if hit by bullet
		if (bullet_active) {
			if (bullet_row == trolls[i].row && bullet_col == trolls[i].col) {
				console.log ("HIT!");
				trolls[i].dead = true;
				score += 50;
				trolls_points += 50;
				score_el.innerHTML = "score: " + score + "<br />high: " + high_score +
					" (" + high_scorer + ")";
				trolls[i].across = 3.0;
				trolls[i].down = 3.0;
				bullet_active = false;
				continue;
			}
		}
		
		// check if close enough for chasing
		var dx = player_pos_x - trolls[i].x;
		var dy = player_pos_y - trolls[i].y;
		/*if (Math.abs (dx) < 0.5 && Math.abs (dy) < 0.3) {
			trolls[i].chasing = true;
		}*/
		
		var next_x = trolls[i].x;
		var next_y = trolls[i].y;
		var next_col;
		var next_row;
		var moved = false;
		if (trolls[i].climbing_down) {
			next_y -= troll_y_speed * time_step_size_s;
			if (next_y <= trolls[i].target_height) {
				next_y = trolls[i].target_height;
				trolls[i].climbing_down = false;
			}
		
			if (trolls[i].anim_counter > player_frame_time * 2.0) {
				trolls[i].anim_counter -= player_frame_time * 2.0;
			}
			if (trolls[i].anim_counter > player_frame_time * 1.0) {
				trolls[i].across = 1.0;
				trolls[i].down = 1.0;
			} else {
				trolls[i].across = 0.0;
				trolls[i].down = 1.0;
			}
		
			trolls[i].anim_counter += time_step_size_s;
			moved = true;
		} else if (trolls[i].climbing_up) {
			next_y += troll_y_speed * time_step_size_s;
			if (next_y >= trolls[i].target_height) {
				next_y = trolls[i].target_height;
				trolls[i].climbing_up = false;
			}
		
			if (trolls[i].anim_counter > player_frame_time * 2.0) {
				trolls[i].anim_counter -= player_frame_time * 2.0;
			}
			if (trolls[i].anim_counter > player_frame_time * 1.0) {
				trolls[i].across = 1.0;
				trolls[i].down = 1.0;
			} else {
				trolls[i].across = 0.0;
				trolls[i].down = 1.0;
			}
		
			trolls[i].anim_counter += time_step_size_s;
			moved = true;
		} else if (trolls[i].chasing) {
			// check if close enough for bommyknockering
				if (Math.abs (dx) < 0.16 && Math.abs (dy) < 0.1) {
					if (!trolls[i].whacking) {
						trolls[i].whacking = true;
						trolls[i].anim_counter = 0.0;
					}
				}
		
				if (trolls[i].whacking) {
					trolls[i].anim_counter += time_step_size_s;
					if (trolls[i].anim_counter > player_frame_time * 2.0) {
						trolls[i].whacking = false;
						if (Math.abs (dx) < 0.16 && Math.abs (dy) < 0.1) {
							if (dx < 0.0 && trolls[i].dir < 0.0 ||
							dx > 0.0 && trolls[i].dir > 0.0) {
								console.log ("PLAYER WHACKED");
								player_flattened = true;
								var across = 3.0;
								var down = 3.0;
								gl.useProgram (player_sp);
								gl.uniform2f (player_st_mod_loc, across, down);
								
								if (!music_els[current_music].paused) {
									music_els[current_music].pause ();
								}
								
								var this_music = 4;
								if (score > high_score) {
									show_high_score_panel ();
									var this_music = 5;
								} else {
									show_game_over_panel ();
								}
								
								if (current_music != this_music) {
									if (!music_els[current_music].paused) {
										music_els[current_music].pause ();
									}
									if (music_els[this_music].paused) {
										music_els[this_music].play ();
									}
									current_music = this_music;
								}
								
							}
						}
					}
					if (trolls[i].anim_counter > player_frame_time * 1.0) {
						trolls[i].across = 1.0;
						trolls[i].down = 2.0;
					} else {
						trolls[i].across = 0.0;
						trolls[i].down = 2.0;
					}
					continue;
				}
		
			// try to climb up if player above
			if (dy > 0.1) {
				if (is_down_ladder (trolls[i].row - 1, trolls[i].col)) {
					trolls[i].climbing_up = true;
					trolls[i].anim_counter = 0.0;
					trolls[i].target_height = trolls[i].y + 0.2;
				}
			// try to climb down if player below
			} else if (dy < -0.1) {
				if (is_down_ladder (trolls[i].row, trolls[i].col)) {
					trolls[i].climbing_down = true;
					trolls[i].anim_counter = 0.0;
					trolls[i].target_height = trolls[i].y - 0.2;
				}
			// walking otherwise
			}
			if (!trolls[i].climbing_up && !trolls[i].climbing_down &&
				Math.abs (dx) > 0.05) {
				if (dx > 0.0) {
					trolls[i].dir = 1.0;
				} else {
					trolls[i].dir = -1.0;
				}
				next_x += troll_x_speed * trolls[i].dir * time_step_size_s;
			
				// bounds
				var max_x = num_cols * 0.2 - 0.2;
				if (next_x < 0.0) {
					next_x = 0.0;
				} else if (next_x > max_x) {
					next_x = max_x;
				}
			
				if (trolls[i].anim_counter > player_frame_time * 3.0) {
					trolls[i].anim_counter -= player_frame_time * 3.0;
				}
				if (trolls[i].anim_counter > player_frame_time * 2.0) {
					trolls[i].across = 3.0;
					trolls[i].down = 0.0;
				} else if (trolls[i].anim_counter > player_frame_time * 1.0) {
					trolls[i].across = 2.0;
					trolls[i].down = 0.0;
				} else {
					trolls[i].across = 1.0;
					trolls[i].down = 0.0;
				}
				trolls[i].anim_counter += time_step_size_s;
				moved = true;
			}
		} // endif chasing
		if (moved) {
				next_row = -(next_y - 0.1) / 0.2;
				next_row = Math.floor (next_row);
				next_col = (next_x + 0.1) / 0.2;
				next_col = Math.floor (next_col);
			
				if (!is_dead_end (next_row, next_col)) {
					trolls[i].x = next_x;
					trolls[i].y = next_y;
					trolls[i].col = next_col;
					trolls[i].row = next_row;
				} else {
					trolls[i].anim_counter = 0.0;
				}
			}
	}
}

function draw_troll_doors () {
	gl.bindBuffer (gl.ARRAY_BUFFER, player_vbo); // uses player's VBO
	gl.vertexAttribPointer (0, 2, gl.FLOAT, false, 8, 0);
	gl.enableVertexAttribArray (0);

	gl.useProgram (troll_door_sp);
	gl.uniform1f (troll_door_scale_loc, 0.08);
	gl.activeTexture (gl.TEXTURE0);
	gl.bindTexture (gl.TEXTURE_2D, troll_door_tex);
	var top = Math.max (3, curr_row - 5);
	var bottom = Math.min (num_rows - 1, curr_row + 5);
	var left = Math.max (0, curr_col - 5);
	var right = Math.min (num_cols - 1, curr_col + 5);
	for (var row = top; row <= bottom; row++) {
		for (var col = left; col <= right; col++) {
			if (troll_doors[row][col]) {
				var x = col * 0.2;
				var y = row * -0.2;
				gl.uniform2f (
					troll_door_pos_offset_loc,
					x - player_pos_x,
					y - player_pos_y
				);
				gl.drawArrays (gl.TRIANGLE_STRIP, 0, 4);
			}
		}
	}
	
	gl.disableVertexAttribArray (0);
}

function draw_trolls () {
	// draw trolls
	gl.useProgram (troll_sp);
	gl.activeTexture (gl.TEXTURE0);
	gl.bindTexture (gl.TEXTURE_2D, troll_tex);
	gl.bindBuffer (gl.ARRAY_BUFFER, player_vbo); // uses player's VBO
	gl.vertexAttribPointer (0, 2, gl.FLOAT, false, 8, 0);
	gl.enableVertexAttribArray (0);
	
	for (var i = 0; i < trolls.length; i++) {
		if (!trolls[i].active) {
			continue;
		}
		// skip out-of-shot trolls
		if (Math.abs (trolls[i].x - player_pos_x) > 1.1) {
			continue;
		}
		if (Math.abs (trolls[i].y - player_pos_y) > 1.1) {
			continue;
		}
		gl.uniform2f (troll_st_mod_loc, trolls[i].across, trolls[i].down);
		gl.uniform2f (
			troll_pos_offset_loc,
			trolls[i].x - player_pos_x,
			trolls[i].y - player_pos_y
		);
		gl.uniform1f (troll_dir_loc, trolls[i].dir);
		gl.drawArrays (gl.TRIANGLE_STRIP, 0, 4);
	}
	
	gl.disableVertexAttribArray (0);
}
