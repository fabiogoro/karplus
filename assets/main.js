var audio_context;
var str1;
var str2;
var str3;
var thin = {'freq': 400};
var regular = {'freq': 200};
var thick = {'freq': 100};

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
  a.fftSize = 4096;
  node.connect(a);
  var bufferLength = a.frequencyBinCount;
  var dataArray = new Float32Array(bufferLength);
  var canvas_e = document.getElementsByClassName(id)[0];
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
    var zoom = 32;
    var offset = 0;
    for (var i = 0; i < a.frequencyBinCount/zoom; i++) {
      canvas.beginPath();
      canvas.moveTo((i-1)*barWidth,offset);
      var value = timeDomain[i];
      var percent = value / 256;
      var height = HEIGHT * percent;
      offset = HEIGHT - height - 1;
      var barWidth = WIDTH/a.frequencyBinCount*zoom;
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

  this.volume.connect(this.context.destination);
  this.node.connect(this.volume);
  this.volume.connect(analyser);
}

var canvas;
var analyser;
window.onload = function(){
  audio_context = new (window.AudioContext || window.webkitAudioContext)();
  str1 = new KarplusString(audio_context, 'visualizer2', 1);
  str2 = new KarplusString(audio_context, 'visualizer3', 2);
  str3 = new KarplusString(audio_context, 'visualizer4', 3);

  document.getElementById('visualizer2').addEventListener('touchstart', function(ev) {
    stop(str1);
  }, false);
  document.getElementById('visualizer2').addEventListener('touchend', function(ev) {
    play_string(str1, thin.freq);
  }, false);
  document.getElementById('visualizer3').addEventListener('touchstart', function(ev) {
    stop(str2);
  }, false);
  document.getElementById('visualizer3').addEventListener('touchend', function(ev) {
    play_string(str2, regular.freq);
  }, false);
  document.getElementById('visualizer4').addEventListener('touchstart', function(ev) {
    stop(str3);
  }, false);
  document.getElementById('visualizer4').addEventListener('touchend', function(ev) {
    play_string(str3, thick.freq);
  }, false);

  analyser = audio_context.createAnalyser();
  analyser.fftSize = 4096;
  var bufferLength = analyser.frequencyBinCount;
  var dataArray = new Float32Array(bufferLength);
  var canvas_e = document.getElementsByClassName('visualizer')[0];
  canvas = canvas_e.getContext("2d");
  canvas.clearRect(0, 0, WIDTH, HEIGHT);
  var WIDTH = canvas_e.width;
  var HEIGHT = canvas_e.height;
  canvas.fillStyle = 'rgb(255, 255, 255)';
  canvas.fillRect(0, 0, WIDTH, HEIGHT);

  function draw4() {
    canvas.clearRect(0, 0, WIDTH, HEIGHT);
    var freqDomain = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(freqDomain);
    for (var i = 0; i < analyser.frequencyBinCount; i++) {
      var value = freqDomain[i];
      var percent = value / 256;
      var height = HEIGHT * percent;
      var offset = HEIGHT - height - 1;
      var barWidth = WIDTH/analyser.frequencyBinCount;
      var hue = i/analyser.frequencyBinCount * 360;
      canvas.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
      canvas.fillRect(i * barWidth, offset, barWidth, height);
    }
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
      //canvas.fillStyle = 'black';
      //canvas.fillRect(i * barWidth, offset, 1, 1);
      canvas.lineTo(i*barWidth,offset);
      canvas.stroke();
    }
    drawVisual = requestAnimationFrame(draw4);
  }

  function draw2() {
    canvas.clearRect(0, 0, WIDTH, HEIGHT);
    /*var freqDomain = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(freqDomain);
    for (var i = 0; i < analyser.frequencyBinCount; i++) {
      var value = freqDomain[i];
      var percent = value / 256;
      var height = HEIGHT * percent;
      var offset = HEIGHT - height - 1;
      var barWidth = WIDTH/analyser.frequencyBinCount;
      var hue = i/analyser.frequencyBinCount * 360;
      canvas.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
      canvas.fillRect(i * barWidth, offset, barWidth, height);
    }*/
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
      //canvas.fillStyle = 'black';
      //canvas.fillRect(i * barWidth, offset, 1, 1);
      canvas.lineTo(i*barWidth,offset);
      canvas.stroke();
    }
    drawVisual = requestAnimationFrame(draw2);
  }

  var sample = 1000;
  var frequency = 25;
  var N = Math.round(sample / frequency);
  var impulse = N;
  var y = new Float32Array(N);
  y.fill(0);
  var n = 0;
  function draw3(){
    canvas.clearRect(0, 0, WIDTH, HEIGHT);
    var output = new Float32Array(sample);
    var offset = 0;
    for (var i = 0; i < output.length; i++) {
      if(impulse<1) output[i] = y[n];
      else{
        output[i] = y[n] = (Math.random()-0.5);
        impulse--;
      }
      n = (n+1)%N;
      canvas.beginPath();
      canvas.moveTo((i-1)*barWidth,offset);
      var value = output[i];
      var percent = value+0.5;
      var height = HEIGHT * percent;
      offset = HEIGHT - height - 1;
      var barWidth = WIDTH/sample;
      //canvas.fillStyle = 'black';
      //canvas.fillRect(i * barWidth, offset, 1, 1);
      canvas.lineTo(i*barWidth,offset);
      canvas.stroke();
    }
    drawVisual = requestAnimationFrame(draw3);
  }

  function draw(){
    canvas.clearRect(0, 0, WIDTH, HEIGHT);
    var output = new Float32Array(sample);
    var offset = 0;
    for (var i = 0; i < output.length; i++) {
      if(impulse<1) output[i] = y[n] = (y[n] + y[(n + 1) % N]) / 2;
      else{
        output[i] = y[n] = (Math.random()-0.5) + (y[n] + y[(n + 1) % N]) / 2;
        impulse--;
      }
      n = (n+1)%N;
      canvas.beginPath();
      canvas.moveTo((i-1)*barWidth,offset);
      var value = output[i];
      var percent = value+0.5;
      var height = HEIGHT * percent;
      offset = HEIGHT - height - 1;
      var barWidth = WIDTH/sample;
      //canvas.fillStyle = 'black';
      //canvas.fillRect(i * barWidth, offset, 1, 1);
      canvas.lineTo(i*barWidth,offset);
      canvas.stroke();
    }
    drawVisual = requestAnimationFrame(draw);
  }

  draw4();
};
