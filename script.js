"use strict"

// Analyser and animation
var barColor = "#fc89ac"//"rgb(100,255,100)";
var context, source, analyser, 
    frequencies, barWidth,
	barHeight,lastNote = 0;
var display = document.getElementById("display");
var frq = document.getElementById("frequency");

// Canvas
var w = window.innerWidth;
var h = window.innerHeight;
var c = document.getElementById("canvas");
var vis = document.getElementById("visualization");
var ctx = c.getContext("2d");
var ctxVis = vis.getContext("2d");

var mobile, dim, ballRad, ringWidth, 
	ox, oy, visRadius, fontSize;

function init() {
	initValues();
	if(navigator.mediaDevices) {
		navigator.mediaDevices
		.getUserMedia({audio: true, video: false})
		.then( tune )
	}
}
window.setTimeout(init, 200);

function initValues() {
	w = window.innerWidth;
	h = window.innerHeight;
	mobile = w / h < .8 ? true : false;
	c.width = w;
	c.height = h;
	vis.width = w;
	vis.height = h;
	ox = w / 2;
	oy = h / 2;
	dim = Math.min( h, w );
	visRadius = dim * .003;
	fontSize = mobile ? dim * .05 : dim * .04;
	display.style.fontSize = fontSize * 2 + "px";
}

window.onresize = initValues;


function tune( stream ) {
	context = new ( window.AudioContext 	|| 
			  			window.webkitAudioContext );
	source = context.createMediaStreamSource(stream);
	analyser = context.createAnalyser();
	analyser.smoothingTimeConstant = .9;
	source.connect(analyser);
	frequencies = 
		new Float32Array(analyser.frequencyBinCount);
	anim();
}
var sum;
//////////////******************
function anim() {
	//Pitch recognition / note display
	var timeDomain = new Uint8Array(analyser.fftSize);
	analyser.getByteTimeDomainData(timeDomain);

	// < < <
	/* The following relies on code from:           *
	 *	 Web Audio DAW Library by Raphael Serota    *
	 * Author on GitHub: https://github.com/rserota *		
	 * GitHub repo: https://github.com/rserota/wad  */
	var pitch = WAD.autoCorrelate(timeDomain, context.sampleRate);
	var noteName = WAD.noteFromPitch( pitch ) || lastNote;
	// > > >
	
	//Visualization
	vis.width = vis.width;
	var freq, barHeight, barWidth;
	var len = frequencies.length;
	var start = parseInt(len * .1);
	//var end = parseInt(len * .3);
	var end = parseInt(len * .11);
	//var step = 2 * Math.PI / ( end - start );
	var step = 2 * Math.PI / 10;
	analyser.getFloatFrequencyData(frequencies);
	for(var i  = start; i < end; i++) {
		freq = dim / 4 + frequencies[i];
		freq += mobile ? 100 : 0;
		barWidth = mobile ? 12 * w / len : 4 * w / len;
		barHeight = visRadius * freq;
		ctxVis.fillStyle = barColor;
		ctxVis.translate(ox, oy); 
		ctxVis.rotate(step);
		ctxVis.translate(-ox, -oy); 
		ctxVis.fillRect(ox, oy, barWidth, barHeight );
	}

	// Display
	c.width = c.width;
	if(noteName != lastNote) {
		display.innerHTML = noteName;
		frq.innerHTML = Math.round(pitch) + " Hz";
	}
	lastNote = noteName;
	////////////////************
	window.requestAnimationFrame(anim);
}
