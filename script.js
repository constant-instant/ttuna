"use strict"

var barColor = "#fc89ac";
var context, source, analyser, 
	frequencies, barWidth, delta,
	barHeight, nearPoint = 0, lastNote = 0;
var display = document.getElementById("display");
var frq = document.getElementById("frequency");

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
	ballRad = mobile ? dim * .015 : dim * .0075;
	meanHeight = mobile ? dim * .25 : dim * .17;
	visRadius = dim * .003;
	ringWidth = 1;
	fontSize = mobile ? dim * .05 : dim * .04;
	display.style.fontSize = fontSize * 2 + "px";
}

window.onresize = initValues;


function tune( stream ) {
	context = new ( window.AudioContext || window.webkitAudioContext );
	source = context.createMediaStreamSource(stream);
	analyser = context.createAnalyser();
	analyser.smoothingTimeConstant = .9;
	source.connect(analyser);
	frequencies = new Float32Array(analyser.frequencyBinCount);
	anim();
}
var meanHeight, sum;
function anim() {
	var timeDomain = new Uint8Array(analyser.fftSize);
	analyser.getByteTimeDomainData(timeDomain);

	var pitch = WAD.autoCorrelate(timeDomain, context.sampleRate);
	var noteName = WAD.noteFromPitch( pitch ) || lastNote;
	

	vis.width = vis.width;
	var freq, barHeight, barWidth;
	var sum = 0;
	var len = frequencies.length;
	var start = parseInt(len * .1);
	var end = parseInt(len * .5);
	var step = 2 * Math.PI / ( end - start );
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
		sum += barHeight;
	}

	meanHeight = Math.abs(sum / (end - start));


	c.width = c.width;
	if(noteName != lastNote) {
		display.innerHTML = noteName;
		frq.innerHTML = Math.round(pitch) + " Hz";
	}
	lastNote = noteName;
	
	
	delta = WAD.getDelta();
	showDelta();
	window.requestAnimationFrame(anim);
}

function showDelta() {
	kursor();
}


function kursor() {
	move();
	function move() {
		
		var step = .01;
		var pi =  Math.PI / 3;
		var point = Math.PI / 2 - delta * pi;
		var sign = point - nearPoint;
		nearPoint += step * sign;
		var diff = point - nearPoint;
		var bx = ox + Math.cos(nearPoint) * meanHeight;
		var by = oy - Math.sin(nearPoint) * meanHeight;
		var rad = ballRad;
		ctx.fillStyle = "#000";
		ctx.moveTo(bx, by);
		ctx.beginPath();
		ctx.ellipse( bx, by, rad, rad, 0, 0, 2 * Math.PI);
		ctx.moveTo(ox, oy);
		ctx.ellipse(ox, oy, meanHeight, meanHeight,0,  - nearPoint - .02,  -nearPoint + .02);
		ctx.fill(); 

		if( Math.abs(diff) > step ) {
			window.requestAnimationFrame(move);
		}
	}
}

