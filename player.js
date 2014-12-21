//var player_pos_el;
var player_pos_x;
var player_pos_y;
var player_x_speed_mps = 0.7; // whole width in 3 secs
var player_y_speed_mps = 0.4; // whole width in 3 secs
var recoil_speed_mps = 0.4;
var player_x_dir = 1.0;
var player_frame_time = 0.2;
var first_player_update = true;
var player_state_walking = false;
var player_state_climbing_up = false;
var player_state_climbing_down = false;
var player_state_shooting = false;
var player_state_reloading = false;
var player_unloaded = false;
var player_anim_counter = 0.0;
var player_target_height = 0.0;
var shoot_sound_el;
var reload_sound_el;
var player_flattened = false;

var player_sp;
var player_vbo;
var player_tex;
var player_st_mod_loc;
var player_dir_loc;

function init_player () {
	//player_pos_el = document.getElementById ("pos");
	shoot_sound_el = document.getElementById ("shoot_sound");
	shoot_sound_el.volume = 0.5;
	reload_sound_el = document.getElementById ("reload_sound");
	reload_sound_el.volume = 0.5;
	player_pos_x = 0.2;
	player_pos_y = -0.4;

	// load resources
	var points = [
		-1.0, 1.0,
		-1.0, -1.0,
		1.0, 1.0,
		1.0, -1.0
	];
	player_vbo = gl.createBuffer ();
	gl.bindBuffer (gl.ARRAY_BUFFER, player_vbo);
	gl.bufferData (gl.ARRAY_BUFFER, new Float32Array (points), gl.STATIC_DRAW);
	
	player_sp = load_shaders_from_files (
		"shaders/player.vert", "shaders/player.frag");
	gl.linkProgram (player_sp);
	player_st_mod_loc = get_uniform_loc (player_sp, "st_mod");
	player_dir_loc = get_uniform_loc (player_sp, "player_dir");
	gl.useProgram (player_sp);
	gl.uniform1f (player_dir_loc, player_x_dir);
	
	player_tex = create_texture_from_file ("art/player2.png")
}

function update_player () {
	if (player_flattened) {
		
		return;
	}
	var moved = false;
	var next_x = player_pos_x;
	var next_y = player_pos_y;
	var next_row = curr_row;
	var next_col = curr_col;
	player_state_walking = false;
	
	// left
	if (keys_down[37] || keys_down[65]) {
		if (!player_state_shooting) {
			player_x_dir = -1.0;
			player_state_walking = true;
		}
	}

	// right
	if (keys_down[39] || keys_down[68]) {
		if (!player_state_shooting) {
			player_x_dir = 1.0;
			player_state_walking = true;
		}
	}
	
	// down arrow or s
	if (keys_down[40] || keys_down[83]) {
		if (is_down_ladder (curr_row, curr_col)) {
			// dont interrupt
			if (!player_state_climbing_down && !player_state_climbing_up &&
				!player_state_shooting) {
				player_state_climbing_down = true;
				player_anim_counter = 0.0;
				player_target_height = player_pos_y - 0.2;
			}
		}
	} else
	
	// up arrow or w
	if (keys_down[38] || keys_down[87]) {
		if (is_down_ladder (curr_row - 1, curr_col)) {
			// dont interrupt
			if (!player_state_climbing_down && !player_state_climbing_up &&
				!player_state_shooting) {
				player_state_climbing_up = true;
				player_anim_counter = 0.0;
				player_target_height = player_pos_y + 0.2;
			}
		}
	} else 
	
	if (keys_down[32] || keys_down[70]) {
		// only allow interrupt of walking
		if (!player_state_climbing_up && !player_state_climbing_down &&
			!player_state_shooting && !player_unloaded) {
			player_state_shooting = true;
			player_anim_counter = 0.0;
			player_unloaded = true;
			shoot_sound_el.play ();
			fire_bullet (player_pos_x, player_pos_y + 0.04, player_x_dir);
		}
	}
	
	// bounds
	var max_x = num_cols * 0.2 - 0.2;
	if (next_x < 0.0) {
		next_x = 0.0;
	} else if (next_x > max_x) {
		next_x = max_x;
	}
	
	if (player_state_climbing_down) {
		next_y -= player_y_speed_mps * time_step_size_s;
		if (next_y <= player_target_height) {
			next_y = player_target_height;
			player_state_climbing_down = false;
		}
		moved = true;
		player_state_walking = false;
		player_anim_counter += time_step_size_s;
		player_state_reloading = false;
		if (!reload_sound_el.paused) {
			reload_sound_el.currentTime = 0.0;
			reload_sound_el.pause ();
		}
	} else if (player_state_climbing_up) {
		next_y += player_y_speed_mps * time_step_size_s;
		if (next_y >= player_target_height) {
			next_y = player_target_height;
			player_state_climbing_up = false;
		}
		moved = true;
		player_state_walking = false;
		player_anim_counter += time_step_size_s;
		player_state_reloading = false;
		if (!reload_sound_el.paused) {
			reload_sound_el.currentTime = 0.0;
			reload_sound_el.pause ();
		}
	} else if (player_state_shooting) {
		moved = true;
		player_state_walking = false;
		player_anim_counter += time_step_size_s;
		if (player_anim_counter < 0.2) {
			next_x += recoil_speed_mps * -player_x_dir * time_step_size_s;
		}
		player_state_reloading = false;
		if (!reload_sound_el.paused) {
			reload_sound_el.currentTime = 0.0;
			reload_sound_el.pause ();
		}
	} else if (player_state_walking) {
		next_x += player_x_speed_mps * player_x_dir * time_step_size_s;
		moved = true;
		player_state_reloading = false;
		if (!reload_sound_el.paused) {
			reload_sound_el.currentTime = 0.0;
			reload_sound_el.pause ();
		}
	} else if (player_unloaded) {
		moved = true;
		player_anim_counter += time_step_size_s;
		if (!player_state_reloading) {
			player_anim_counter = 0.0;
			player_state_reloading = true;
			if (reload_sound_el.paused) {
				reload_sound_el.play ();
			}
		}
	}
	var across = 0.0;
	var down = 0.0;
	if (moved) {
		next_row = -(next_y - 0.1) / 0.2;
		next_row = Math.floor (next_row);
		next_col = (next_x + 0.1) / 0.2;
		next_col = Math.floor (next_col);
		
		// loop after third frame
		if (player_state_walking) {
			if (player_anim_counter > player_frame_time * 3.0) {
				player_anim_counter -= player_frame_time * 3.0;
			}
			if (player_anim_counter > player_frame_time * 2.0) {
				across = 3.0;
				down = 0.0;
			} else if (player_anim_counter > player_frame_time * 1.0) {
				across = 2.0;
				down = 0.0;
			} else {
				across = 1.0;
				down = 0.0;
			}
			player_anim_counter += time_step_size_s;
		} else if (player_state_climbing_down || player_state_climbing_up) {
			if (player_anim_counter > player_frame_time * 2.0) {
				player_anim_counter -= player_frame_time * 2.0;
			}
			if (player_anim_counter > player_frame_time * 1.0) {
				across = 1.0;
				down = 1.0;
			} else {
				across = 0.0;
				down = 1.0;
			}
		} else if (player_state_shooting) {
			if (player_anim_counter > player_frame_time * 2.0) {
				player_state_shooting = false;
			}
			if (player_anim_counter > player_frame_time * 1.0) {
				across = 1.0;
				down = 2.0;
			} else {
				across = 0.0;
				down = 2.0;
			}
		} else if (player_state_reloading) {
			if (player_anim_counter > player_frame_time * 6.0) {
				player_state_reloading = false;
				player_unloaded = false;
				if (!reload_sound_el.paused) {
					reload_sound_el.pause ();
					reload_sound_el.currentTime = 0.0;
				}
			}
			if (player_anim_counter < player_frame_time * 1.0) {
				across = 2.0;
				down = 2.0;
			} else if (player_anim_counter < player_frame_time * 2.0) {
				across = 3.0;
				down = 2.0;
			} else if (player_anim_counter < player_frame_time * 3.0) {
				across = 2.0;
				down = 2.0;
			} else if (player_anim_counter < player_frame_time * 4.0) {
				across = 3.0;
				down = 2.0;
			} else if (player_anim_counter < player_frame_time * 5.0) {
				across = 2.0;
				down = 2.0;
			} else {
				across = 3.0;
				down = 2.0;
			}
		}
		
		/*
		sky and ground 0 to 2 inclusive
		brown 3 to 7 inclusive
		grey 8 to 12 inclusive
		blue 13 to 17 inclusive
		green 18 to 22 inclusive
		*/
		
		if (!is_dead_end (next_row, next_col)) {
			/* check for music change */
			
			// enter brown
			var this_music = 0;
			if (next_row <= 7) {
				this_music = 0;
			// enter grey
			} else if (next_row >= 8 && next_row <= 12) {
				this_music = 1
			// enter blue
			} else if (next_row >= 13 && next_row <= 17) {
				this_music = 2
			// enter green
			} else if (next_row >= 18 && next_row <= 22) {
				this_music = 3
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
		
			curr_col = next_col;
			curr_row = next_row;
			player_pos_x = next_x;
			player_pos_y = next_y;
			/* check for gems */
			pick_up_gems (curr_row, curr_col);
		}
	} else {
		player_anim_counter = 0.0;
	}
	gl.useProgram (player_sp);
	gl.uniform2f (player_st_mod_loc, across, down);
	gl.uniform1f (player_dir_loc, player_x_dir);
	
	if (first_player_update || moved) {
		gl.useProgram (tile_sp);
		gl.uniform2f (tile_pp_loc, player_pos_x, player_pos_y);
		//player_pos_el.innerHTML = player_pos_x + ", " + player_pos_y + " " + curr_row;
		first_player_update = false;
	}
}

function draw_player () {
	gl.activeTexture (gl.TEXTURE0);
	gl.bindTexture (gl.TEXTURE_2D, player_tex);
	gl.useProgram (player_sp);
	gl.bindBuffer (gl.ARRAY_BUFFER, player_vbo);
	gl.vertexAttribPointer (0, 2, gl.FLOAT, false, 8, 0);
	gl.enableVertexAttribArray (0);
	gl.drawArrays (gl.TRIANGLE_STRIP, 0, 4);
	gl.disableVertexAttribArray (0);
}
