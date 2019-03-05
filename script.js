
let play = true;
let pause = false;
let music = new Audio('./songs/Blue_Dot_Sessions.mp3');
music.preload = 'metadata';
// let start = 0;
// let duration = 0;
let progressBar = document.getElementById('progressBar');
let playPause = document.getElementById('playPause');
let durationMetaData = document.getElementById('durationMetaData');
progressBar.setAttribute('value', music.currentTime.toString())
progressBar.setAttribute('max', music.duration.toString())
console.log(music);

music.onloadedmetadata = function () {
  duration = music.duration;
  start = music.currentTime;
  durationMetaData.innerHTML = start + ' / ' + duration;
  console.log(music.mozGetMetadata());
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


function openIndexedDB (fileindex) {
  // This works on all devices/browsers, and uses IndexedDBShim as a final fallback 
  var indexedDB = window.indexedDB;

  var openDB = indexedDB.open("MyDatabase", 1);

  openDB.onupgradeneeded = function() {
    var db = {}
    db.result = openDB.result;
    db.store = db.result.createObjectStore("MyObjectStore", {keyPath: "id"});
    if (fileindex) db.index = db.store.createIndex("NameIndex", fileindex);
  };

  console.log(openDB);
}

function getStoreIndexedDB (openDB) {
  var db = {};
  db.result = openDB.result;
  db.tx = db.result.transaction("MyObjectStore", "readwrite");
  db.store = db.tx.objectStore("MyObjectStore");
  db.index = db.store.index("NameIndex");

  console.log(db);
}

