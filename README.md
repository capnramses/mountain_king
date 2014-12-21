#Mountain King#

Game jam entry for Ludum Dare 29 theme: "Beneath the Surface", 25-28 April
2014.

* Anton Gerdelan (code, pix) @capnramses
* Tom Snively (music loops) @tomsnively

* Entry URL in LD29: http://ludumdare.com/compo/ludum-dare-29/?action=preview&uid=30024
* On-line URL (so you can play it now): http://antongerdelan.net/mountain_king/

##Comments##

This is a 2d WebGL game, and my second Ludum Dare game in this format - I did
"Dolphin Rescue" for LD28.
I wanted to team up to do audio with Tom so entered the 2-day Jam event rather
than the 48hr main event. I was pretty tired so I was happy to have the second
day to tidy up code and do the audio nicely.
The game ranked really well in Fun/Audio/Humour.

The game draws on one or two elements from:

* Digger (1983) http://youtu.be/dAlxnHRoGfM
* Snarf (1988) http://youtu.be/oSIIt3WHkmE
* Dangerous Dave in the Haunted Mansion (1991) http://youtu.be/9Bo_dpRk3So
* Crystal Caves (1991) http://youtu.be/iE9GVn2mjs8
* Blake Stone: Aliens of Gold (1993) http://youtu.be/OQEUV5FAp6g

The high-score idea was a first attempt and is in no way secure - it's pretty
easy to interactively modify the JavaScript that controls your current score
so that it submits something huge to the server (just a little PHP script).

The audio is better than Dolphin's but HTML5 audio still isn't great - there
needs to be a way to pre-buffer the sounds nicely so that there is no delay
between the WAV download and the first sound playing.
