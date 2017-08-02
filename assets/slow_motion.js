var canvas;
window.onload = init;

function init(){
  var canvas_e = document.getElementsByClassName('visualizer')[0];
  canvas = canvas_e.getContext("2d");
  canvas.clearRect(0, 0, WIDTH, HEIGHT);
  var WIDTH = canvas_e.width;
  var HEIGHT = canvas_e.height;
  canvas.fillStyle = 'rgb(255, 255, 255)';
  canvas.fillRect(0, 0, WIDTH, HEIGHT);

  var sample = 1000;
  var frequency = 6;
  var N = Math.round(sample / frequency);
  var impulse = N;
  var y = new Float32Array(N);
  y.fill(0);
  var n = 0;
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
    setTimeout(draw, 400)
    
  }

  draw();
};
