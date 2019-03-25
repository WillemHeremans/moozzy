let indexedDB = window.indexedDB;
let dbName = 'MusicPlayer';
let dbVersion = 1;
let storeName = 'MySongs';

let trackName = document.getElementById('trackName');
let trackGenre = document.getElementById('trackGenre');
let trackURL = document.getElementById('trackURL');
let trackID = document.getElementById('trackID');

function loadSongsData() {

  let request = indexedDB.open(dbName, dbVersion);

  request.onerror = function (event) {
    console.log('Error creating/accessing IndexedDB database');
  };

  request.onupgradeneeded = function () {
    db = request.result;
    db.createObjectStore(storeName, { autoIncrement: true });
  }

  request.onsuccess = function () {
    console.log('Success creating/accessing IndexedDB database :');
    db = request.result;

    let transaction = db.transaction([storeName], 'readonly');
    let getDB = transaction.objectStore(storeName).getAll();
    let getKey = transaction.objectStore(storeName).getAllKeys();
    let countData = transaction.objectStore(storeName).count();

    getDB.onsuccess = function () {

      let tracks = getDB.result;

      getKey.onsuccess = function () {

        let key = getKey.result;
        let displayData = document.getElementById('datas');
        displayData.innerHTML = '';

        for (i in tracks) {
          console.log(tracks[i].name + ' ' + tracks[i].gender + ' ' + tracks[i].url);
          let trTag = document.createElement('tr');
          trTag.innerHTML = `<td onclick="loadSong('`+ tracks[i].name +`', '`+ tracks[i].url +`')">` + tracks[i].name + `</td>`
            + `<td onclick="loadSong('`+ tracks[i].name +`', '`+ tracks[i].url +`')">` + tracks[i].gender + `</td>`
            + `<td onclick="loadSong('`+ tracks[i].name +`', '`+ tracks[i].url +`')">` + tracks[i].url + `</td>`
            + `<td id="` + key[i] + `" onclick="songSettings(this)" title="Edit this item"><a href="#broadcast" style="color: black;"><i class="fas fa-bars"></i></a></td>`;
          displayData.appendChild(trTag);
        }

      }
    }
    countData.onsuccess = function () {
      console.log(countData.result);
    }
  }
}

function songSettings(element) {

  let request = indexedDB.open(dbName, dbVersion);

  request.onsuccess = function () {

    let transaction = db.transaction([storeName], 'readwrite');
    let getTrackData = transaction.objectStore(storeName).get(Number(element.id));

    getTrackData.onsuccess = function () {
      let track = getTrackData.result;
      trackName.value = track.name;
      trackGenre.value = track.gender;
      trackURL.value = track.url;
      trackID.value = element.id;
    }

  }

}

function unloadModal() {
  trackName.value = '';
  trackGenre.value = '';
  trackURL.value = '';
  trackID.value = '';
}

function submit() {

  let request = indexedDB.open(dbName, dbVersion);

  if (trackID.value) {

    request.onsuccess = function () {

      let transaction = db.transaction([storeName], 'readwrite');
      transaction.objectStore(storeName).put({ 'name': trackName.value, 'gender': trackGenre.value, 'url': (trackURL.value).replace(/^.*:\/\//i, ''), 'date': new Date().toLocaleString('fr-FR') }, Number(trackID.value));

    }

  } else {

    request.onsuccess = function () {

      let transaction = db.transaction([storeName], 'readwrite');
      transaction.objectStore(storeName).put({ 'name': trackName.value, 'gender': trackGenre.value, 'url': (trackURL.value).replace(/^.*:\/\//i, ''), 'date': new Date().toLocaleString('fr-FR') });

    }

  }
  
  loadSongsData();

}

function addFile() {

  let inp = document.getElementById('get-files');
  // Access and handle the files 
  for (i = 0; i < inp.files.length; i++) {
    let file = inp.files[i];
    // do things with file
    console.log(file['name']);
    console.log('Ce script est bien appelé')
    // IndexedDB

    // Create/open database
    var request = indexedDB.open(dbName, dbVersion),
      db,
      createObjectStore = function (dataBase) {
        // Create an objectStore
        console.log('Creating objectStore')
        //   var objectStore = db.createObjectStore('listeRadios', { autoIncrement: true });
        dataBase.createObjectStore('MyNewData');
      }

    request.onerror = function (event) {
      console.log('Error creating/accessing IndexedDB database');
    };

    request.onsuccess = function (event) {
      console.log('Success creating/accessing IndexedDB database');
      db = request.result;
      console.log(db);

      var transaction = db.transaction([storeName], 'readwrite');
      console.log(transaction.objectStore(storeName).put({ 'name': 'SWIGG', 'gender': 'Pop, RnB, rap', 'url': 'http://swingfm.ice.infomaniak.ch/swingfm-128', 'date': new Date().toLocaleString('fr-FR') }));
      let getDB = transaction.objectStore(storeName).getAll();
      let getKey = transaction.objectStore(storeName).get('juno');

      getDB.onsuccess = function () {
        let tracks = getDB.result;
        // var table = document.getElementById('tBody');
        for (i in tracks) {
          console.log(tracks[i]);
          //       var row = table.insertRow(i);
          //       var cell1 = row.insertCell(i);
          // cell1.innerHTML = 'tracks[i]';
        }

        getKey.onsuccess = function () {
          let trackTime = getKey.result;
          // for (i in trackTime) {
          console.log('result de get : ');
          console.log(trackTime);
          document.getElementById('music').src = trackTime;
          let music = new Audio();
          music.src = document.getElementById('music').src;
          music.onloadedmetadata = function () {
            duration = music.duration;
            start = music.currentTime;
            durationMetaData.innerHTML = start + ' / ' + duration;
            console.log(music.mozGetMetadata());
          }
          // }
        }

      }
      db.onerror = function (event) {
        console.log('Error creating/accessing IndexedDB database');
      };
    }

    // For future use. Currently only in latest Firefox versions
    request.onupgradeneeded = function (event) {
      createObjectStore(event.target.result);
      console.log(event.target.result);
    };
  }
}
