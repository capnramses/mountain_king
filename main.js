/*
MOUNTAIN KING
Game entry for Ludum Dare 29
Anton Gerdelan (@capnramses)
26 April 2014
*/

var gl;
var canvas;

var time_step_size_s  = 1.0 / 50.0;
var previous_millis;
var time_step_accum = 0.0;
var music_els = [];
var current_music = 0;

var score = 0;
var score_el;
var high_score = 0;
var high_scorer;

init ();
function init () {
	music_els[0] = document.getElementById ("one_music");
	music_els[1] = document.getElementById ("two_music");
	music_els[2] = document.getElementById ("three_music");
	music_els[3] = document.getElementById ("four_music");
	music_els[4] = document.getElementById ("killed_music");
	music_els[5] = document.getElementById ("ending_music");
	
	if (music_els[0].paused) {
		music_els[0].play (); // also pause ()
	}
	
	// high score
	var hsfs = get_string_from_URL ("hiscore.txt").split (" ");
	high_score = parseFloat (hsfs[0]);
	high_scorer = hsfs[1];
	score_el = document.getElementById ("score");
	score_el.innerHTML = "score: " + score + "<br />high: " + high_score + " (" +
			high_scorer + ")";

	canvas = document.getElementById ("canvas");
	gl = WebGLUtils.setupWebGL (canvas);
	
	init_tiles ();
	init_player ();
	init_trolls ();
	init_gems ();
	init_bullet ();
	
	gl.cullFace (gl.BACK);
	gl.frontFace (gl.CCW);
	gl.enable (gl.CULL_FACE);
	gl.blendFunc (gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.enable (gl.BLEND);
	gl.clearColor (0.0, 0.0, 0.0, 1.0);
	gl.viewport (0, 0, canvas.width, canvas.height);
	
	previous_millis = (new Date).getTime ();
	main_loop ();
}

function main_loop () {
	var current_millis = (new Date).getTime ();
	var elapsed_millis = current_millis - previous_millis;
	previous_millis = current_millis;
	var elapsed_s = elapsed_millis / 1000.0;
	
	time_step_accum += elapsed_s;
	while (time_step_accum > time_step_size_s) {
		compute_time_step ();
		time_step_accum -= time_step_size_s;
	}

	draw ();
	// this function is from webgl-utils
	window.requestAnimFrame (main_loop, canvas);
}

function compute_time_step () {
	if (player_flattened) {
		return;
	}
	update_player ();
	update_trolls ();
	update_troll_doors ();
	update_bullet ();
}

function draw () {
	gl.clear (gl.COLOR_BUFFER_BIT); //  | gl.DEPTH_BUFFER_BIT
	draw_tiles ();
	draw_troll_doors ();
	draw_trolls ();
	draw_player ();
	draw_gems ();
	draw_bullet ();
}

function show_game_over_panel () {
	document.getElementById('dead_gems_text').innerHTML = gems_points.toString ();
	document.getElementById('dead_trolls_text').innerHTML =
		trolls_points.toString ();
	document.getElementById('dead_total_text').innerHTML = score.toString ();
	document.getElementById('death_overlay').style.visibility = 'visible';
}

function show_high_score_panel () {
	var name = document.getElementById ("entered_name");
	var button = document.getElementById ("subbutt");
	name.disabled = false;
	button.disabled = false;
	document.getElementById('hs_gems_text').innerHTML = gems_points.toString ();
	document.getElementById('hs_trolls_text').innerHTML =
		trolls_points.toString ();
	document.getElementById('hs_total_text').innerHTML = score.toString ();
	document.getElementById('hiscore_overlay').style.visibility = 'visible';
}

function submit_score () {
	var name = document.getElementById ("entered_name");
	console.log ("sub score: " + score + " " + name.value);
	send_score (score, name.value);
	var button = document.getElementById ("subbutt");
	name.disabled = true;
	button.disabled = true;
}
