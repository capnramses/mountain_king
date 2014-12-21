<?php
$file = @fopen('hiscore.txt', "r");
while (!feof($file)) {
	// Get the current line that the file is reading
	$line = fgets($file);
	$n = sscanf ($line, "%d %s", $score, $name);
//	echo "high score is $score by $name<br />";
}
fclose ($file);

$newscore = $_GET['score'];
$newname = $_GET['name'];
if ($newscore > $score) {
//	echo "new high score of $newname";
	$filea = @fopen('hiscore.txt', "w");
	fprintf ($filea, '%d %s', $newscore, $newname);
	fclose ($filea);
}
?>
