
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
let songsList = document.getElementById('songsList');

progressBar.addEventListener('click', progressClick);
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
  songInfo.firstElementChild.innerHTML = name;
  document.getElementById('music').setAttribute('src', 'http://' + url);
  music.src = '//' + url;
  music.preload = 'metadata';
  console.log(music);

  music.onloadedmetadata = function () {
    duration = music.duration;
    start = music.currentTime;
    durationMetaData.innerHTML = convertTime(~~(start / 3600)) + ':' + convertTime(~~((start % 3600) / 60)) + ':' + convertTime(~~start % 60) + ' / ' + convertTime(~~(duration / 3600)) + ':' + convertTime(~~((duration % 3600) / 60)) + ':' + convertTime(~~duration % 60);;
    if (!play) {
      music.pause();
      play = true;
      playButton();
    } else {
      playButton();
    }
  }
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

function forward() {
  if (document.getElementById('onPlay')) {
    let onPlay = document.getElementById('onPlay');
    let rank = onPlay.rowIndex - 1;
    let forwardElement = onPlay.parentNode.children[rank + 1];
    if (forwardElement) {
      loadSong(forwardElement.children[0], forwardElement.childNodes[0].innerHTML, forwardElement.childNodes[2].innerHTML)
    } else {
      loadSong(songsList.children[0].children[0], songsList.children[0].children[0].innerHTML, songsList.children[0].children[2].innerHTML)
    }
  }
}

function backward() {
  if (document.getElementById('onPlay')) {
    let onPlay = document.getElementById('onPlay');
    let rank = onPlay.rowIndex - 1;
    console.log(rank);
    let forwardElement = onPlay.parentNode.children[rank - 1];
    if (forwardElement) {
      loadSong(forwardElement.children[0], forwardElement.childNodes[0].innerHTML, forwardElement.childNodes[2].innerHTML)
    } else {
      rank = songsList.childElementCount - 1;
      loadSong(songsList.children[rank].children[0], songsList.children[rank].children[0].innerHTML, songsList.children[rank].children[2].innerHTML)
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
    let volumeValue = Math.round((music.volume * 10) + 1).toString().replace('10', '');
    document.getElementById('downValue').innerHTML = '';
    document.getElementById('upValue').innerHTML = volumeValue;
    music.volume += 0.1;
  }
}

function volumeDown(element) {
  if (music.volume > 1.3877787807814457e-16) {
    if (music.muted) {
      muted(document.getElementById('muted'));
    }
    let volumeValue = Math.round((music.volume * 10) - 1).toString().replace('0', '');
    document.getElementById('upValue').innerHTML = '';
    document.getElementById('downValue').innerHTML = volumeValue;
    if (volumeValue === '') {
      if (!music.muted) {
        muted(document.getElementById('muted'));
      }
    }
    music.volume -= 0.1;
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
      durationMetaData.innerHTML = convertTime(~~(start / 3600)) + ':' + convertTime(~~((start % 3600) / 60)) + ':' + convertTime(~~start % 60) + ' / ' + convertTime(~~(duration / 3600)) + ':' + convertTime(~~((duration % 3600) / 60)) + ':' + convertTime(~~duration % 60);
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

function convertTime(timeValue) {
  if (timeValue < 10) { timeValue = '0' + timeValue };
  return timeValue;
}
