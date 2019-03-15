
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

function loadSong(element) {
  let music = new Audio();
  document.getElementById('music').setAttribute('src', element.textContent)
  music.src = element.textContent;
  music.preload = 'metadata';
  console.log(music);

  music.onloadedmetadata = function () {
    duration = music.duration;
    start = music.currentTime;
    durationMetaData.innerHTML = ~~(start / 3600) + ':' + ~~((start % 3600) / 60) + ':' + (~~start % 60) + ' / ' + ~~(duration / 3600) + ':' + ~~((duration % 3600) / 60) + ':' + (~~duration % 60);
    console.log(music.mozGetMetadata());
  }
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
    element.style.color = 'black';
  } else {
    music.loop = true;
    element.style.color = 'red';
  }
}

function muted(element) {
  if (music.muted) {
    music.muted = false;
    element.style.color = 'black';
  } else {
    music.muted = true;
    element.style.color = 'red';
  }
}

function volumeUp(element) {
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
    if (volumeUpValue.childNodes[1]) {
      volumeUpValue.removeChild(volumeUpValue.childNodes[1]);
    }
    let span = document.createElement('SPAN');
    let volumeValue = document.createTextNode(Math.round((music.volume * 10) - 1).toString().replace('0', ''));
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

// function addFile() {
//   let inp = document.getElementById("get-files");
// // Access and handle the files 
// for (i = 0; i < inp.files.length; i++) {
//   let file = inp.files[i];
//   // do things with file
//   console.log(file['name']);
//   openIndexedDB(file['name']);
// }

// }


// function openIndexedDB (fileindex) {
//   // This works on all devices/browsers, and uses IndexedDBShim as a final fallback 
//   var indexedDB = window.indexedDB;

//   var openDB = indexedDB.open("MyDatabase", 1);

//   openDB.onupgradeneeded = function() {
//     var db = {}
//     db.result = openDB.result;
//     db.store = db.result.createObjectStore("MyObjectStore", {keyPath: "id"});
//     if (fileindex) db.index = db.store.createIndex("NameIndex", fileindex);
//   };

//   console.log(openDB);
// }

// function getStoreIndexedDB (openDB) {
//   var db = {};
//   db.result = openDB.result;
//   db.tx = db.result.transaction("MyObjectStore", "readwrite");
//   db.store = db.tx.objectStore("MyObjectStore");
//   db.index = db.store.index("NameIndex");

//   console.log(db);
// }

