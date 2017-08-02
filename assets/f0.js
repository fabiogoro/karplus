var audio_context;
var node;

function set_freq(freq){
  document.getElementById("freq").textContent = freq;
  node.play(freq);
  setTimeout(draw,300);
}

function F0(context){
  this.context = context;
  this.node = this.context.createScriptProcessor(4096, 0, 1);
  this.volume = this.context.createGain();
}

F0.prototype.play = function(frequency) {
  var N = Math.round(this.context.sampleRate / frequency);
  var impulse = N;
  var y = new Float32Array(N);
  y.fill(0);
  var n = 0;
  this.node.onaudioprocess = function (e) {
    var output = e.outputBuffer.getChannelData(0);
    for (var i = 0; i < e.outputBuffer.length; i++) {
      if(impulse<1) output[i] = y[n];
      else{
        output[i] = y[n] = 2*(Math.random()-0.5);
        impulse--;
      }
      n = (n+1)%N;
    }
  }

  this.volume.connect(this.context.destination);
  this.node.connect(this.volume);
  this.volume.connect(analyser);
}

var canvas;
var analyser;
var draw;
window.onload = function(){
  audio_context = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audio_context.createAnalyser();
  analyser.fftSize = 4096;
  node = new F0(audio_context);
  var bufferLength = analyser.frequencyBinCount;
  var dataArray = new Float32Array(bufferLength);
  var canvas_e = document.getElementsByClassName('visualizer')[0];
  canvas = canvas_e.getContext("2d");
  canvas.clearRect(0, 0, WIDTH, HEIGHT);
  var WIDTH = canvas_e.width;
  var HEIGHT = canvas_e.height;
  canvas.fillStyle = 'rgb(255, 255, 255)';
  canvas.fillRect(0, 0, WIDTH, HEIGHT);

  draw = function() {
    canvas.clearRect(0, 0, WIDTH, HEIGHT);
    var timeDomain = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteTimeDomainData(timeDomain);
    var zoom = 8;
    var offset = 0;
    for (var i = 0; i < analyser.frequencyBinCount/zoom; i++) {
      canvas.beginPath();
      canvas.moveTo((i-1)*barWidth,offset);
      var value = timeDomain[i];
      var percent = value / 256;
      var height = HEIGHT * percent;
      offset = HEIGHT - height - 1;
      var barWidth = WIDTH/analyser.frequencyBinCount*zoom;
      canvas.lineTo(i*barWidth,offset);
      canvas.stroke();
    }
  }
  var canvas_e = document.getElementsByClassName('visualizer2')[0];
  var canvas2 = canvas_e.getContext("2d");
  canvas2.clearRect(0, 0, WIDTH, HEIGHT);
  var WIDTH = canvas_e.width;
  var HEIGHT = canvas_e.height;
  canvas2.fillStyle = 'rgb(255, 255, 255)';
  canvas2.fillRect(0, 0, WIDTH, HEIGHT);
  function draw2() {
    canvas2.clearRect(0, 0, WIDTH, HEIGHT);
    var freqDomain = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(freqDomain);
    for (var i = 0; i < analyser.frequencyBinCount; i++) {
      var value = freqDomain[i];
      var percent = value / 256;
      var height = HEIGHT * percent;
      var offset = HEIGHT - height - 1;
      var barWidth = WIDTH/analyser.frequencyBinCount;
      var hue = i/analyser.frequencyBinCount * 360;
      canvas2.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
      canvas2.fillRect(i * barWidth, offset, barWidth, height);
    }
    drawVisual = requestAnimationFrame(draw2);
  }

  draw();
  draw2();
};
