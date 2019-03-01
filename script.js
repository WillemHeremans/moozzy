
let play  = true;
let pause = false;
let music = new Audio('Blue_Dot_Sessions.mp3');
music.preload = 'metadata';
// let start = 0;
// let duration = 0;
let progressBar = document.getElementById('progressBar');
let playPause =  document.getElementById('playPause');
let durationMetaData = document.getElementById('durationMetaData');
progressBar.setAttribute('value', music.currentTime.toString())
progressBar.setAttribute('max', music.duration.toString())
console.log(music);

music.onloadedmetadata = function() {
  duration = music.duration;
  start = music.currentTime;
  durationMetaData.innerHTML = start + ' / ' + duration;
}


function playButton() {
  if (play) {
    play = false;
    playPause.setAttribute('class', 'fas fa-pause')
    music.currentTime = start;
    music.play();
    pause = true;
    move();
  } else {
    play = true;
    playPause.setAttribute('class', 'fas fa-play')
    music.pause();
    duration = music.duration;
    pause = false;
  }
}

function move() {
  const song = music;
  const id = setInterval(frame, 500);
  function frame() {
    if (song.currentTime >= song.duration) {
      clearInterval(id);
    } else {
      duration = song.duration;
      start = song.currentTime;
      progressBar.setAttribute('max', duration.toString());
      progressBar.setAttribute('value', start.toString());
      durationMetaData.innerHTML = start + ' / ' + duration;
    }
  }
}

function progressClick(event) {
  let maxValue = (event.target['offsetWidth']).toString();
  let currentValue = (event.clientX) - (event.target['offsetLeft']).toString();
  event.target['max'] = (maxValue / maxValue) * duration;
  event.target['value'] = (currentValue / maxValue) * duration;
  start = event.target['value'];
  console.log(event);
  console.log(currentValue + ' / ' + maxValue);
  console.log( ((currentValue / maxValue) * duration) + ' / ' + ((maxValue / maxValue) * duration) );
  console.log(start);

}