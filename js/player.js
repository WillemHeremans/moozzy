
let play = true;
let pause = false;
const songInfo = document.getElementById('songInfo');
const audioElement = document.getElementById('audioElement');
const progressBar = document.getElementById('progressBar');
const playPauseIcon = document.getElementById('playPauseIcon');
const playPauseButton = document.getElementById('playPauseButton');
const backwardButton = document.getElementById('backwardButton');
const forwardButton = document.getElementById('forwardButton');
const durationMetaData = document.getElementById('durationMetaData');
const fastForward = document.getElementById('fastForward');
const fastBackward = document.getElementById('fastBackward');
const mutedButton = document.getElementById('muted');
const loopButton = document.getElementById('loop');
const volumeDownButton = document.getElementById('volumeDown');
const volumeUpButton = document.getElementById('volumeUp');
const volumeDownValue = document.getElementById('downValue');
const volumeUpValue = document.getElementById('upValue');
const songsList = document.getElementById('songsList');

progressBar.addEventListener('click', progressClick);
progressBar.addEventListener('mouseover', progressOver);
playPauseButton.addEventListener('click', playPause);
forwardButton.addEventListener('click', forward);
backwardButton.addEventListener('click', backward);
mutedButton.addEventListener('click', muted);
loopButton.addEventListener('click', loop);
volumeDownButton.addEventListener('click', volumeDown);
volumeUpButton.addEventListener('click', volumeUp);
songsList.addEventListener('click', loadSong);
progressBar.setAttribute('value', audioElement.currentTime.toString());
progressBar.setAttribute('max', audioElement.duration.toString());

function loadSong(element, name, url) {
  if (element != event) {
    if (document.getElementById('onPlay')) {
      document.getElementById('onPlay').removeAttribute('class');
      document.getElementById('onPlay').removeAttribute('id');
    }
    element.parentNode.setAttribute('id', 'onPlay');
    element.parentNode.setAttribute('class', 'text-primary border border-bottom-0 border-primary');
    songInfo.firstElementChild.innerHTML =  name;
    audioElement.src = 'http://' + url;
    audioElement.preload = 'metadata';

  } else {
    if (event.target.className === 'fas fa-bars') {
      songSettings(event.target.parentNode.parentNode);
    } else {
      if (document.getElementById('onPlay')) {
        document.getElementById('onPlay').removeAttribute('class');
        document.getElementById('onPlay').removeAttribute('id');
      }
      event.target.parentNode.setAttribute('id', 'onPlay');
      event.target.parentNode.setAttribute('class', 'text-primary border border-bottom-0 border-primary');
      songInfo.firstElementChild.innerHTML = event.target.parentNode.children[0].innerHTML;
      audioElement.src = 'http://' + event.target.parentNode.children[2].innerHTML;
      audioElement.preload = 'metadata';
    }
  }

  audioElement.onloadedmetadata = function () {
    duration = audioElement.duration;
    start = audioElement.currentTime;
    durationMetaData.innerHTML = convertTime(~~(start / 3600)) + ':' + convertTime(~~((start % 3600) / 60)) + ':' + convertTime(~~start % 60) + ' / '
    + convertTime(~~(duration / 3600)) + ':' + convertTime(~~((duration % 3600) / 60)) + ':' + convertTime(~~duration % 60);
    if (!play) {
      audioElement.pause();
      play = true;
      playPause();
    } else {
      playPause();
    }
  }
}

function playPause() {
  if (!document.getElementById('onPlay')) {
    loadSong(songsList.children[0].children[0], songsList.children[0].children[0].innerHTML,
      songsList.children[0].children[2].innerHTML);
  } else {

    if (play) {
      play = false;
      playPauseIcon.setAttribute('class', 'fas fa-pause')
      audioElement.currentTime = start;
      audioElement.play();
      pause = true;
      autoMove();
    } else {
      play = true;
      playPauseIcon.setAttribute('class', 'fas fa-play')
      audioElement.pause();
      duration = audioElement.duration;
      pause = false;
    }
  }
}

function forward() {
  if (document.getElementById('onPlay')) {
    let onPlay = document.getElementById('onPlay');
    let rank = onPlay.sectionRowIndex;
    let forwardElement = onPlay.parentNode.children[rank + 1];
    if (forwardElement) {
      loadSong(forwardElement.children[0], forwardElement.childNodes[0].innerHTML, forwardElement.childNodes[2].innerHTML)
    } else {
      loadSong(songsList.children[0].children[0], songsList.children[0].children[0].innerHTML,
        songsList.children[0].children[2].innerHTML)
    }
  }
}

function backward() {
  if (document.getElementById('onPlay')) {
    let onPlay = document.getElementById('onPlay');
    let rank = onPlay.sectionRowIndex;
    let backwardElement = onPlay.parentNode.children[rank - 1];
    if (backwardElement) {
      loadSong(backwardElement.children[0], backwardElement.children[0].innerHTML,
        backwardElement.children[2].innerHTML)
    } else {
      rank = songsList.childElementCount - 1;
      loadSong(songsList.children[rank].children[0], songsList.children[rank].children[0].innerHTML,
        songsList.children[rank].children[2].innerHTML)
    }
  }
}

fastForward.onpointerdown = function () {
  audioElement.playbackRate += 2.0;
}

fastForward.onpointerup = function () {
  audioElement.playbackRate = 1.0;
}

fastBackward.onpointerdown = function () {
  audioElement.playbackRate -= 0.5;
}

fastBackward.onpointerup = function () {
  audioElement.playbackRate = 1.0;
}

function loop() {
  if (audioElement.loop) {
    audioElement.loop = false;
    this.style.color = 'rgb(76, 76, 76)';
  } else {
    audioElement.loop = true;
    this.style.color = '#dc3545';
  }
}

function muted() {
  if (audioElement.muted) {
    audioElement.muted = false;
    mutedButton.style.color = 'rgb(76, 76, 76)';
    if (audioElement.volume < 0.10000000000000014) {
      audioElement.volume = 0.10000000000000014;
    }
  } else {
    audioElement.muted = true;
    mutedButton.style.color = '#dc3545';
  }
}

function volumeDown() {
  if (audioElement.volume > 1.3877787807814457e-16) {
    if (audioElement.muted) {
      muted(mutedButton);
    }
    let volumeValue = Math.round((audioElement.volume * 10) - 1).toString().replace('0', '');
    volumeUpValue.innerHTML = '';
    volumeDownValue.innerHTML = volumeValue;
    if (volumeValue === '') {
      if (!audioElement.muted) {
        muted(mutedButton);
      }
    }
    audioElement.volume -= 0.1;
  }
}

function volumeUp() {
  if (audioElement.muted) {
    muted(mutedButton);
  }
  if (audioElement.volume < 1) {
    let volumeValue = Math.round((audioElement.volume * 10) + 1).toString().replace('10', '');
    volumeDownValue.innerHTML = '';
    volumeUpValue.innerHTML = volumeValue;
    audioElement.volume += 0.1;
  }
}

function autoMove() {
  let id = setInterval(frame, 500);
  function frame() {
    if (audioElement.currentTime >= audioElement.duration) {
      clearInterval(id);
    } else {
      duration = audioElement.duration;
      start = audioElement.currentTime;
      progressBar.setAttribute('max', duration.toString());
      progressBar.setAttribute('value', start.toString());
      durationMetaData.innerHTML = convertTime(~~(start / 3600)) + ':' + convertTime(~~((start % 3600) / 60)) + ':' + convertTime(~~start % 60) + ' / '
      + convertTime(~~(duration / 3600)) + ':' + convertTime(~~((duration % 3600) / 60)) + ':' + convertTime(~~duration % 60);
    }
  }
}

function progressClick() {
  if (document.getElementById('onPlay')) {
    let maxValue = (event.target['offsetWidth']).toString();
    let clickValue = (event.clientX) - (event.target['offsetLeft']).toString();
    event.target['max'] = (maxValue / maxValue) * duration;
    event.target['value'] = (clickValue / maxValue) * duration;
    if (!play) {
      audioElement.pause();
      play = true;
      start = event.target['value'];
      playPause();
    } else {
      start = event.target['value'];
      playPause();
    }
  }
}

function progressOver() {
  if (document.getElementById('onPlay')) {
    let maxValue = (event.target['offsetWidth']).toString();
    let overValue = (event.clientX) - (event.target['offsetLeft']).toString();
    overValue = (overValue / maxValue) * duration;
    overValue = convertTime(~~(overValue / 3600)) + ':' + convertTime(~~((overValue % 3600) / 60)) + ':' + convertTime(~~overValue % 60);
    progressBar.setAttribute('title', overValue);

  }
}

function convertTime(timeValue) {
  if (timeValue < 10) { timeValue = '0' + timeValue };
  return timeValue;
}
