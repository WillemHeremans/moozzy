
let play = true;
let pause = false;
let songInfo = document.getElementById('songInfo');
let progressBar = document.getElementById('progressBar');
let playPause = document.getElementById('playPause');
let durationMetaData = document.getElementById('durationMetaData');
let fastForward = document.getElementById('fastForward');
let fastBackward = document.getElementById('fastBackward');
let volumeUpValue = document.getElementById('volumeUp');
let volumeDownValue = document.getElementById('volumeDown');

document.getElementById('progressBar').addEventListener('click', progressClick);
progressBar.setAttribute('value', music.currentTime.toString())
progressBar.setAttribute('max', music.duration.toString())

function loadSong(element, name, url) {
  let music = new Audio();
  music.load();
  if (document.getElementById('onPlay')) {
    document.getElementById('onPlay').removeAttribute('class');
    document.getElementById('onPlay').removeAttribute('id');
  }
  element.parentNode.setAttribute('id', 'onPlay');
  element.parentNode.setAttribute('class', 'text-primary border border-bottom-0 border-primary');
  document.getElementById('songInfo').innerHTML = name;
  document.getElementById('music').setAttribute('src', 'http://' + url);
  music.src = 'http://' + url;
  music.preload = 'metadata';
  console.log(music);

  music.onloadedmetadata = function () {
    duration = music.duration;
    start = music.currentTime;
    durationMetaData.innerHTML = ~~(start / 3600) + ':' + ~~((start % 3600) / 60) + ':' + (~~start % 60) + ' / ' + ~~(duration / 3600) + ':' + ~~((duration % 3600) / 60) + ':' + (~~duration % 60);
    if (!play) {
      music.pause();
      play = true;
      playButton();
    } else {
      playButton();
    }
  }
}


fastForward.onpointerdown = function () {
  music.playbackRate += 2.0;
}

fastForward.onpointerup = function () {
  music.playbackRate = 1.0;
}

fastBackward.onpointerdown = function () {
  music.playbackRate -= 0.5;
}

fastBackward.onpointerup = function () {
  music.playbackRate = 1.0;
}

function playButton() {
  if (play) {
    play = false;
    playPause.setAttribute('class', 'fas fa-pause')
    music.currentTime = start;
    music.play();
    pause = true;
    autoMove();
  } else {
    play = true;
    playPause.setAttribute('class', 'fas fa-play')
    music.pause();
    duration = music.duration;
    pause = false;
  }
}

function autoMove() {
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
      durationMetaData.innerHTML = ~~(start / 3600) + ':' + ~~((start % 3600) / 60) + ':' + (~~start % 60) + ' / ' + ~~(duration / 3600) + ':' + ~~((duration % 3600) / 60) + ':' + (~~duration % 60);
    }
  }
}

function progressClick(event) {
  let maxValue = (event.target['offsetWidth']).toString();
  let currentValue = (event.clientX) - (event.target['offsetLeft']).toString();
  event.target['max'] = (maxValue / maxValue) * duration;
  event.target['value'] = (currentValue / maxValue) * duration;
  if (!play) {
    music.pause();
    play = true;
    start = event.target['value'];
    playButton();
  } else {
    start = event.target['value'];
    playButton();
  }
}

function loop(element) {
  if (music.loop) {
    music.loop = false;
    element.style.color = 'rgb(76, 76, 76)';
  } else {
    music.loop = true;
    element.style.color = '#dc3545';
  }
}

function muted(element) {
  if (music.muted) {
    music.muted = false;
    element.style.color = 'rgb(76, 76, 76)';
    if (music.volume < 0.10000000000000014) {
      music.volume = 0.10000000000000014;
    }
  } else {
    music.muted = true;
    element.style.color = '#dc3545';
  }
}

function volumeUp(element) {
  if (music.muted) {
    muted(document.getElementById('muted'));
  }
  if (music.volume < 1) {
    if (volumeDownValue.childNodes[1]) {
      volumeDownValue.removeChild(volumeDownValue.childNodes[1]);
    }
    let span = document.createElement('SPAN');
    let volumeValue = document.createTextNode(Math.round((music.volume * 10) + 1).toString().replace('10', ''));
    span.appendChild(volumeValue);
    element.appendChild(span);
    element.onpointerup = function () {
      if (element.childNodes[1]) {
        element.removeChild(span);
      }
    }
    music.volume += 0.1;
  }
}

function volumeDown(element) {
  if (music.volume > 1.3877787807814457e-16) {
    if (music.muted) {
      muted(document.getElementById('muted'));
    }
    if (volumeUpValue.childNodes[1]) {
      volumeUpValue.removeChild(volumeUpValue.childNodes[1]);
    }
    let span = document.createElement('SPAN');
    let volumeValue = document.createTextNode(Math.round((music.volume * 10) - 1).toString().replace('0', ''));
    if (volumeValue.nodeValue === '') {
      if (!music.muted) {
        muted(document.getElementById('muted'));
      }
    }
    span.appendChild(volumeValue);
    element.appendChild(span);
    element.onpointerup = function () {
      if (element.childNodes[1]) {
        element.removeChild(span);
      }
    }
    music.volume -= 0.1;
  }
}

