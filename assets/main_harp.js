var audio_context;
var strings = [];
var num_strings = 10

function play_string(string, frequency){
  string.stop();
  string.play(frequency);
}

function KarplusString(context, canvas, size){
  this.context = context;
  this.node = this.context.createScriptProcessor(4096, 0, 1);
  this.volume = this.context.createGain();
  create_analyser(this.volume, canvas, size);
}

function create_analyser(node, canvas, size){
  var analyser = audio_context.createAnalyser();
  analyser.fftSize = 128;
  node.connect(analyser);
  var bufferLength = analyser.frequencyBinCount;
  var dataArray = new Float32Array(bufferLength);
  canvas.clearRect(0, 0, WIDTH, HEIGHT);
  var WIDTH = document.body.offsetWidth;
  var HEIGHT = 10;
  canvas.fillStyle = 'rgb(255, 255, 255)';
  canvas.fillRect(0, 0, WIDTH, HEIGHT);
  canvas.lineWidth = size;
  strings.push({'canvas': canvas, 'analyser': analyser});
}

KarplusString.prototype.stop = function(time){
  this.node.disconnect();
}

KarplusString.prototype.play = function(frequency) {
  var N = Math.round(this.context.sampleRate / frequency);
  var impulse = N;
  var y = new Float32Array(N);
  y.fill(0);
  var n = 0;
  this.node.onaudioprocess = function (e) {
    var output = e.outputBuffer.getChannelData(0);
    for (var i = 0; i < e.outputBuffer.length; i++) {
      if(impulse<1) output[i] = y[n] = (y[n] + y[(n + 1) % N]) / 2;
      else{
        output[i] = y[n] = 2*(Math.random()-0.5) + (y[n] + y[(n + 1) % N]) / 2;
        impulse--;
      }
      n = (n+1)%N;
    }
  }

  this.volume.gain.cancelScheduledValues(this.context.currentTime);
  this.volume.gain.setValueAtTime(1,this.context.currentTime);
  this.volume.connect(this.context.destination);
  this.node.connect(this.volume);
  this.volume.gain.setValueAtTime(1,this.context.currentTime+5);
  this.volume.gain.linearRampToValueAtTime(0.0,this.context.currentTime+6);
}

function add_string(frequency){
  var canvas_e = document.createElement('canvas');
  canvas_e.id = frequency;
  canvas_e.className = 'visualizer'
  document.body.appendChild(canvas_e); 
  var string = new KarplusString(audio_context, canvas_e.getContext('2d'), 10);
  canvas_e.addEventListener('touchstart', function(ev) {
    stop(string);
  }, false);
  canvas_e.addEventListener('touchend', function(ev) {
    play_string(string, frequency);
  }, false);
  canvas_e.addEventListener('mouseover', function(ev) {
    stop(string);
  }, false);
  canvas_e.addEventListener('mouseout', function(ev) {
    play_string(string, frequency);
  }, false);
}

window.onload = function(){
  audio_context = new (window.AudioContext || window.webkitAudioContext)();
  for(i=0; i<num_strings; i++) add_string(Math.pow(2,(i/12))*86.1328125);
  draw();
};

function draw() {
  var WIDTH = document.body.offsetWidth;
  var HEIGHT = 100;
  for(i in strings){
    var canvas = strings[i]['canvas'];
    var a = strings[i]['analyser'];
    canvas.clearRect(0, 0, WIDTH, HEIGHT);
    var timeDomain = new Uint8Array(a.frequencyBinCount);
    a.getByteTimeDomainData(timeDomain);
    var offset = 0;
    for (var i = 0; i < a.frequencyBinCount; i++) {
      canvas.beginPath();
      canvas.moveTo((i-1)*barWidth,offset);
      var value = timeDomain[i];
      var percent = value / 256;
      var height = HEIGHT * percent;
      offset = HEIGHT - height - 1;
      var barWidth = WIDTH/a.frequencyBinCount;
      canvas.lineTo(i*barWidth,offset);
      canvas.stroke();
    }
  }
  requestAnimationFrame(draw);
};
