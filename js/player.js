
let play = false;
let pause = false;
let sequenceLoopWait = false;
let sequenceLoopOn = false;
let isRandom = false;
let start = 0;
let duration = 0;
let sequenceStart = 0;
let sequenceEnd = 0;
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
const sequenceLoopButton = document.getElementById('sequenceLoop');
const sequenceLoopIcon = sequenceLoopButton.children[0];
const randomButton = document.getElementById('random');
const volumeDownButton = document.getElementById('volumeDown');
const volumeUpButton = document.getElementById('volumeUp');
const volumeDownValue = document.getElementById('downValue');
const volumeUpValue = document.getElementById('upValue');
const table = document.getElementById('table');
const styleTag = document.getElementById('style');

progressBar.addEventListener('click', progressClick);
progressBar.addEventListener('mouseover', progressOver);
playPauseButton.addEventListener('click', playPause);
forwardButton.addEventListener('click', forward);
backwardButton.addEventListener('click', backward);
mutedButton.addEventListener('click', muted);
loopButton.addEventListener('click', loop);
randomButton.addEventListener('click', randomSong);
volumeDownButton.addEventListener('click', volumeDown);
volumeUpButton.addEventListener('click', volumeUp);
sequenceLoopButton.addEventListener('click', sequenceLoop);

progressBar.value = start;
progressBar.max = duration;

function loadSong(element, name, url) {
  if (element != event) {
    if (document.getElementById('onPlay')) {
      document.getElementById('onPlay').removeAttribute('class');
      document.getElementById('onPlay').removeAttribute('id');
    }
    element.parentNode.setAttribute('id', 'onPlay');
    element.parentNode.setAttribute('class', 'text-primary border border-bottom-0 border-primary');
    songInfo.firstElementChild.textContent = name;
    audioElement.src = url;
    audioElement.preload = 'metadata';
  } else {
    if (event.target.className === 'fas fa-bars') {
      songSettings(event.target.parentNode);
    } else {
      if (document.getElementById('onPlay')) {
        document.getElementById('onPlay').removeAttribute('class');
        document.getElementById('onPlay').removeAttribute('id');
      }
      if (event.target.parentNode.children[2]) {
        event.target.parentNode.setAttribute('id', 'onPlay');
        event.target.parentNode.setAttribute('class', 'text-primary border border-bottom-0 border-primary');
        songInfo.firstElementChild.textContent = event.target.parentNode.children[0].textContent;
        audioElement.src = event.target.parentNode.children[0].dataset.musicUrl;
        audioElement.preload = 'metadata';
      }
    }
  }
  audioElement.onloadedmetadata = function () {
    duration = audioElement.duration;
    start = audioElement.currentTime;
    durationMetaData.textContent = convertTime(~~(start / 3600)) + ':' + convertTime(~~((start % 3600) / 60)) + ':' + convertTime(~~start % 60) + ' / '
      + convertTime(~~(duration / 3600)) + ':' + convertTime(~~((duration % 3600) / 60)) + ':' + convertTime(~~duration % 60);
    if (play) {
      audioElement.pause();
      play = false;
      playPause();
    } else {
      playPause();
    }
  }
}

function playPause() {
  if (!document.getElementById('onPlay')) {
    loadSong(table.children[context.index].children[0].children[0], table.children[context.index].children[0].children[0].textContent,
      table.children[context.index].children[0].children[0].dataset.musicUrl);

  } else {

    if (!play) {
      play = true;
      playPauseIcon.setAttribute('class', 'fas fa-pause')
      audioElement.currentTime = start;
      audioElement.play();
      pause = true;
      autoMove();
    } else {
      play = false;
      playPauseIcon.setAttribute('class', 'fas fa-play')
      audioElement.pause();
      pause = false;
    }
  }
}

function forward() {
  if (document.getElementById('onPlay')) {
    let onPlay = document.getElementById('onPlay');
    let rank = onPlay.sectionRowIndex;
    let forwardElement = onPlay.parentNode.children[rank + 1];
    if (isRandom) {
      let random = Math.floor(Math.random() * table.children[context.index].childElementCount) + 1;
      forwardElement = onPlay.parentNode.children[random];
    }
    if (forwardElement) {
      loadSong(forwardElement.children[0], forwardElement.childNodes[0].textContent,
        forwardElement.childNodes[0].dataset.musicUrl)
    } else {
      loadSong(table.children[context.index].children[0].children[0], table.children[context.index].children[0].children[0].textContent,
        table.children[context.index].children[0].children[0].dataset.musicUrl)
    }
  }
}

function backward() {
  if (document.getElementById('onPlay')) {
    let onPlay = document.getElementById('onPlay');
    let rank = onPlay.sectionRowIndex;
    let backwardElement = onPlay.parentNode.children[rank - 1];
    if (backwardElement) {
      loadSong(backwardElement.children[0], backwardElement.children[0].textContent,
        backwardElement.children[0].dataset.musicUrl)
    } else {
      rank = table.children[context.index].childElementCount - 1;
      loadSong(table.children[context.index].children[rank].children[0], table.children[context.index].children[rank].children[0].textContent,
        table.children[context.index].children[rank].children[0].dataset.musicUrl)
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

function sequenceLoop() {
  if (document.getElementById('onPlay')) {
    if (sequenceLoopOn && !sequenceLoopWait) {
      sequenceLoopOn = false;
      sequenceLoopIcon.style.color = 'rgb(76, 76, 76)';
      progressBar.classList.remove('sequenceLoop');
      audioElement.ontimeupdate = null;
    } else if (sequenceLoopWait) {
      sequenceEnd = audioElement.currentTime;
      sequenceLoopWait = false;
      audioElement.ontimeupdate = () => {
        sequence();
      }
    } else {
      sequenceLoopOn = sequenceLoopWait = true;
      sequenceLoopIcon.classList.add('blink');
      sequenceStart = audioElement.currentTime;
      if (!styleTag.sheet.rules[0]) {
        styleTag.sheet.insertRule('.sequenceLoop::-moz-progress-bar {background-image: linear-gradient(to right, rgb(230, 230, 230) 100%, rgb(23, 162, 184) 0%);}');
      }
      styleTag.sheet.rules[0].style['backgroundImage'] = 'linear-gradient(to right, rgb(230, 230, 230) 100%, rgb(23, 162, 184) 0%)'
      progressBar.classList.add('sequenceLoop');
    }
  }
}

function sequence() {
  if (sequenceLoopOn) {
    if (!sequenceLoopWait) {
      if (start > sequenceEnd) {
        styleTag.sheet.rules[0].style['backgroundImage'] = 'linear-gradient(to right, rgb(230, 230, 230) 100%, rgb(23, 162, 184) 0%)';
        playPause();
        play = false;
        progressClick();
      }
    }
  }
}

function loop() {
  if (audioElement.loop) {
    audioElement.loop = false;
    this.children[0].classList.replace('fa-undo-alt', 'fa-sync-alt');
    audioElement.onended = () => {
      forward()
    }
  } else if (audioElement.onended) {
    audioElement.onended = null;
    randomButton.disabled = false;
    this.style.color = 'rgb(76, 76, 76)';
    this.children[0].classList.replace('fa-sync-alt', 'fa-undo-alt');
  } else {
    randomButton.disabled = true;
    audioElement.loop = true;
    this.style.color = '#dc3545';
  }
}

function randomSong() {
  if (isRandom) {
    isRandom = false;
    this.style.color = 'rgb(76, 76, 76)';
    audioElement.onended = null;
    loopButton.disabled = false;
  } else {
    isRandom = true;
    loopButton.disabled = true;
    this.style.color = '#dc3545';
    audioElement.onended = () => {
      forward()
    }
  }
}

function muted() {
  if (audioElement.muted) {
    audioElement.muted = false;
    mutedButton.style.color = 'rgb(76, 76, 76)';
    if (audioElement.volume < 0.1) {
      audioElement.volume = 0.1;
      volumeDownButton.disabled = false;
    }
  } else {
    audioElement.muted = true;
    mutedButton.style.color = '#dc3545';
  }
}

function volumeDown() {
  if (audioElement.volume > 0) {
    if (audioElement.muted) {
      muted();
    }
    volumeUpButton.disabled = false;
    volumeUpValue.textContent = '';
    audioElement.volume = Math.round(audioElement.volume * 100) / 100;
    audioElement.volume -= 0.1;
    volumeDownValue.textContent = Math.round(audioElement.volume * 10).toString().replace('0', '');
    if (volumeDownValue.textContent === '') {
      this.disabled = true;
      if (!audioElement.muted) {
        muted();
      }
    }
  }
}

function volumeUp() {
  if (audioElement.muted) {
    muted();
  }
  if (audioElement.volume < 1) {
    volumeDownValue.textContent = '';
    audioElement.volume = Math.round(audioElement.volume * 100) / 100;
    audioElement.volume += 0.1;
    volumeUpValue.textContent = Math.round(audioElement.volume * 10).toString().replace('10', '');
    if (volumeUpValue.textContent === '') {
      this.disabled = true;
    }
  } else {
    this.disabled = true;
  }
}

function autoMove() {
  setInterval(move, 1000);
  function move() {
    duration = audioElement.duration;
    start = audioElement.currentTime;

    if (sequenceLoopOn) {
      style.sheet.rules[0].style['backgroundImage'] = 'linear-gradient(to right, rgb(230, 230, 230) ' +
        ((sequenceStart / start) * 100) + '%, rgb(23, 162, 184) 0%)';
    }

    progressBar.setAttribute('max', duration.toString());
    progressBar.setAttribute('value', start.toString());
    durationMetaData.textContent = convertTime(~~(start / 3600)) + ':' + convertTime(~~((start % 3600) / 60)) + ':' + convertTime(~~start % 60) + ' / '
      + convertTime(~~(duration / 3600)) + ':' + convertTime(~~((duration % 3600) / 60)) + ':' + convertTime(~~duration % 60);
  }
}

function progressClick() {
  if (document.getElementById('onPlay')) {
    let maxValue = (event.target['offsetWidth']).toString();
    let clickValue = (event.clientX) - (event.target['offsetLeft']).toString();
    event.target['max'] = (maxValue / maxValue) * duration;
    event.target['value'] = (clickValue / maxValue) * duration;
    if (!sequenceLoopOn) {
      start = event.target['value'];
      if (play) {
        audioElement.pause();
        play = false;
        playPause();
      } else {
        playPause();
      }
    } else {
      start = sequenceStart;
      if (sequenceLoopWait) {
        sequenceEnd = event.target['value'];
        sequenceLoopWait = false;
        audioElement.ontimeupdate = () => {
          sequence();
        }
      }
      sequenceLoopIcon.classList.remove('blink');
      sequenceLoopIcon.style.color = '#dc3545';
      if (!play) {
        playPause();
      }
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
