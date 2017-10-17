var audio_context;
var str1;
var str2;
var str3;
var thin = {'freq': 400};
var regular = {'freq': 200};
var thick = {'freq': 100};

document.addEventListener("keydown", key_down, false);
document.addEventListener("keyup", key_up, false);

function key_down(event){
  if(!event.repeat){
    switch(event.keyCode){
      case 49: play_string(str1, 110); break;
      case 50: play_string(str2, 123.47); break;
      case 51: play_string(str3, 130.81); break;
      case 52: play_string(str4, 146.83); break;
      case 53: play_string(str5, 164.81); break;
      case 54: play_string(str6, 174.61); break;
      case 55: play_string(str7, 196); break;
    }
  }
}

function key_up(event){
  switch(event.keyCode){
    case 49: stop(str1, 110); break;
    case 50: stop(str2, 123.47); break;
    case 51: stop(str3, 130.81); break;
    case 52: stop(str4, 146.83); break;
    case 53: stop(str5, 164.81); break;
    case 54: stop(str6, 174.61); break;
    case 55: stop(str7, 196); break;
  }
}

function set_freq(freq, element, string){
  document.getElementById(element).textContent = freq;
  string.freq = freq;
}

function quiet(){
  stop(str1);
  stop(str2);
  stop(str3);
}

function play_string(str, freq){
  stop(str);
  str.play(freq);
}

function stop(str){
  str.stop();
}

function KarplusString(context, id, size){
  this.context = context;
  this.node = this.context.createScriptProcessor(4096, 0, 1);
  this.volume = this.context.createGain();
  create_analyser(this.volume, id, size);
}

function create_analyser(node, id, size){
  var a = audio_context.createAnalyser();
  a.fftSize = 128;
  node.connect(a);
  var bufferLength = a.frequencyBinCount;
  var dataArray = new Float32Array(bufferLength);
  var canvas_e = document.getElementById(id);
  var canvas = canvas_e.getContext("2d");
  canvas.clearRect(0, 0, WIDTH, HEIGHT);
  var WIDTH = canvas_e.width;
  var HEIGHT = canvas_e.height;
  canvas.fillStyle = 'rgb(255, 255, 255)';
  canvas.fillRect(0, 0, WIDTH, HEIGHT);
  canvas.lineWidth = size;

  function d() {
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
      //canvas.fillStyle = 'black';
      //canvas.fillRect(i * barWidth, offset, 1, 1);
      canvas.lineTo(i*barWidth,offset);
      canvas.stroke();
    }
    requestAnimationFrame(d);
  };
  d();
}

KarplusString.prototype.stop = function(time){
  this.node.disconnect();
}

KarplusString.prototype.play = function(frequency) {

  var N = Math.round(this.context.sampleRate / frequency);
  var impulse = N/16;
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

  this.volume.connect(this.context.destination);
  this.node.connect(this.volume);
}

var canvas;
var analyser;
window.onload = function(){
  audio_context = new (window.AudioContext || window.webkitAudioContext)();
  str1 = new KarplusString(audio_context, 'visualizer1', 3.5);
  str2 = new KarplusString(audio_context, 'visualizer2', 3);
  str3 = new KarplusString(audio_context, 'visualizer3', 2.5);
  str4 = new KarplusString(audio_context, 'visualizer4', 2);
  str5 = new KarplusString(audio_context, 'visualizer5', 1.5);
  str6 = new KarplusString(audio_context, 'visualizer6', 1);
  str7 = new KarplusString(audio_context, 'visualizer7', 0.5);
};
