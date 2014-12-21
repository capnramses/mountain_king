var bullet_tex;
var bullet_active = false;
var bullet_x = 0.0;
var bullet_y = 0.0;
var bullet_row = 0;
var bullet_col = 0;
var bullet_dir = 1.0;
var bullet_speed = 1.0;

function init_bullet () {
	bullet_tex = create_texture_from_file ("art/bullet.png");
}

function fire_bullet (x, y, dir) {
	bullet_active = true;
	bullet_x = x;
	bullet_y = y;
	bullet_dir = dir;
}

function update_bullet () {
	if (!bullet_active) {
		return;
	}
	bullet_x += bullet_speed * bullet_dir * time_step_size_s;
	bullet_row = -(bullet_y - 0.1) / 0.2;
	bullet_row = Math.floor (bullet_row);
	bullet_col = (bullet_x + 0.1) / 0.2;
	bullet_col = Math.floor (bullet_col);
	// check for troll? or on troll's turn?
	
	// check for dead end
	if (is_dead_end (bullet_row, bullet_col)) {
		bullet_active = false;
		console.log ("bullet hit dead end");
		return;
	}
	if (bullet_x < -0.2 || bullet_x > num_cols * 0.2) {
		bullet_active = false;
		console.log ("bullet OOB");
		return;
	}
}

function draw_bullet () {
	if (!bullet_active) {
		return;
	}
	gl.bindBuffer (gl.ARRAY_BUFFER, player_vbo); // uses player's VBO
	gl.vertexAttribPointer (0, 2, gl.FLOAT, false, 8, 0);
	gl.enableVertexAttribArray (0);

	gl.useProgram (troll_door_sp); // uses troll door generic shader
	gl.uniform1f (troll_door_scale_loc, 0.02);
	gl.activeTexture (gl.TEXTURE0);
	gl.bindTexture (gl.TEXTURE_2D, bullet_tex);
	gl.uniform2f (
		troll_door_pos_offset_loc,
		bullet_x - player_pos_x,
		bullet_y - player_pos_y
	);
	gl.drawArrays (gl.TRIANGLE_STRIP, 0, 4);
	
	gl.disableVertexAttribArray (0);
}
