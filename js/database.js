let indexedDB = window.indexedDB;
let dbName = 'MusicPlayer';
let dbVersion = 1;
let storeName = 'MySongs';

let body = document.getElementById('body');
let trackName = document.getElementById('trackName');
let trackGenre = document.getElementById('trackGenre');
let trackURL = document.getElementById('trackURL');
let trackID = document.getElementById('trackID');
let modalTitle = document.getElementById('modalTitle');
let submitButton = document.getElementById('submit');
let deleteButton = document.getElementById('delete');
let plusButton = document.getElementById('plusButton');
let confirmDelete = document.getElementById('confirmDelete');

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/moozzy/serviceWorker.js').then(function (registration) {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function (err) {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}

function checkUrl(url) {
  if (!url.includes('https://')) {
    if (url.includes('http://')) {
      url = url.replace('http://', 'https://');
    } else {
      const protocol = 'https://';
      url = protocol.concat(url);
    }
  }
  return url;
}

body.onload = function loadSongsData() {

  let request = indexedDB.open(dbName, dbVersion);

  request.onerror = function (event) {
    console.log('Error creating/accessing IndexedDB database');
  };

  request.onupgradeneeded = function () {
    db = request.result;
    let objectStore = db.createObjectStore(storeName, { autoIncrement: true });
    objectStore.createIndex("name", "name", { unique: false });
    objectStore.createIndex("genre", "genre", { unique: false });
    objectStore.createIndex("url", "url", { unique: false });
    objectStore.createIndex("date", "date", { unique: false });
  }

  request.onsuccess = function () {
    console.log('Success creating/accessing IndexedDB database :');
    db = request.result;

    let transaction = db.transaction([storeName], 'readonly');
    let getDB = transaction.objectStore(storeName).getAll();
    let getKeys = transaction.objectStore(storeName).getAllKeys();
    let countData = transaction.objectStore(storeName).count();

    getDB.onsuccess = function () {

      let songs = getDB.result;

      getKeys.onsuccess = function () {

        let key = getKeys.result;

        for (i in songs) {
          songsList.insertAdjacentHTML('beforeend', `<tr><td>` + songs[i].name + `</td>`
            + `<td>` + songs[i].genre + `</td>`
            + `<td id="` + key[i] + `" title="Edit this item"><a href="#broadcast" style="color: black;"><i class="fas fa-bars"></i></a></td></tr>`);
        }
      }
    }
    countData.onsuccess = function () {
      console.log(countData.result);
    }
  }
}

function getSongDataUrl(id) {
  let request = indexedDB.open(dbName, dbVersion);
  request.onsuccess = () => {
    let transaction = db.transaction([storeName], 'readonly');
    let getDataUrl = transaction.objectStore(storeName).get(id);
    getDataUrl.onsuccess = () => {
      let url = getDataUrl.result.url;
      audioElement.src = url;
      audioElement.preload = 'metadata';
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
  }
}

function songSettings(element) {

  modalTitle.innerHTML = 'Edit song settings';
  submitButton.innerHTML = 'Edit';
  deleteButton.style.display = 'block';
  deleteButton.innerHTML = 'Delete';

  let request = indexedDB.open(dbName, dbVersion);

  request.onsuccess = function () {

    let transaction = db.transaction([storeName], 'readwrite');
    let getTrackData = transaction.objectStore(storeName).get(Number(element.id));

    getTrackData.onsuccess = function () {
      let track = getTrackData.result;
      trackName.value = track.name;
      trackGenre.value = track.genre;
      trackURL.value = track.url;
      trackID.value = element.id;
    }
  }
}

plusButton.onclick = function unloadModal() {
  modalTitle.innerHTML = 'Add a song';
  submitButton.innerHTML = 'Add';
  deleteButton.style.display = 'none';
  trackName.value = '';
  trackGenre.value = '';
  trackURL.value = '';
  trackID.value = '';
}

submitButton.onclick = function submit() {

  let request = indexedDB.open(dbName, dbVersion);
  const url = checkUrl(trackURL.value);

  if (trackID.value) {

    request.onsuccess = function () {

      fetch(url).then((response) => {
        console.log(response);
        if (response.ok) {
          let transaction = db.transaction([storeName], 'readwrite');
          transaction.objectStore(storeName).put({ 'name': trackName.value, 'genre': trackGenre.value, 'url': url, 'date': new Date().toLocaleString('fr-FR') }, Number(trackID.value));
          document.getElementById(trackID.value).parentNode.innerHTML = `<td>` + trackName.value + `</td>`
            + `<td>` + trackGenre.value + `</td>`
            + `<td id="` + trackID.value + `" title="Edit this item"><a href="#broadcast" style="color: black;"><i class="fas fa-bars"></i></a></td>`;
        }
      })
        .catch((e) => alert('L\'URL fournie n\'offre pas de solution sécurisée (HTTPS) et ne peut être ajoutée ' + '(' + e + ')'))
    }

  } else {

    request.onsuccess = function () {
      fetch(url)
        .then((response) => {
          if (response.ok) {
            let transaction = db.transaction([storeName], 'readwrite');
            let newTrack = transaction.objectStore(storeName).put({ 'name': trackName.value, 'genre': trackGenre.value, 'url': url, 'date': new Date().toLocaleString('fr-FR') });
            newTrack.onsuccess = function () {
              let getTrackData = transaction.objectStore(storeName).get(newTrack.result);
              getTrackData.onsuccess = function () {
                let song = getTrackData.result;
                songsList.insertAdjacentHTML('beforeend', `<tr><td>` + song.name + `</td>`
                  + `<td>` + song.genre + `</td>`
                  + `<td id="` + newTrack.result + `" title="Edit this item"><a href="#broadcast" style="color: black;"><i class="fas fa-bars"></i></a></td></tr>`);
              }
            }
          }
        })
        .catch((e) => alert('L\'URL fournie n\'offre pas de solution sécurisée (HTTPS) et ne peut être ajoutée ' + '(' + e + ')'))
    }
  }
}

confirmDelete.onclick = function deleteSong() {

  let request = indexedDB.open(dbName, dbVersion);
  request.onsuccess = function () {
    let transaction = db.transaction([storeName], 'readwrite');
    let deletingSong = transaction.objectStore(storeName).delete(Number(trackID.value));
    deletingSong.onsuccess = function () {
      document.getElementById(trackID.value).parentNode.remove();
    }
  }
}

function addFile(e) {

  let file = e.target.files[0];
  let reader = new FileReader();
  reader.onload = (evt) => {
    let data = evt.target.result;
    let request = indexedDB.open(dbName, dbVersion);
    request.onsuccess = () => {
      let transaction = db.transaction([storeName], 'readwrite');
      let newSong = transaction.objectStore(storeName).put({ 'name': file.name, 'genre': file.type, 'url': data, 'date': new Date().toLocaleString('fr-FR') });
      newSong.onsuccess = function () {
        let getTrackData = transaction.objectStore(storeName).get(newSong.result);
        getTrackData.onsuccess = function () {
          let song = getTrackData.result;
          songsList.insertAdjacentHTML('beforeend', `<tr><td>` + song.name + `</td>`
            + `<td>` + song.genre + `</td>`
            // + `<td>` + song.url + `</td>`
            + `<td id="` + newSong.result + `" title="Edit this item"><a href="#broadcast" style="color: black;"><i class="fas fa-bars"></i></a></td></tr>`);
        }
      }
    }
  }
  reader.readAsDataURL(file);

  // metatag :

  // let decode = (format, string) => new TextDecoder(format).decode(string);

  // let synchToInt = synch => {
  //   const mask = 0b01111111;
  //   let b1 = synch & mask;
  //   let b2 = (synch >> 8) & mask;
  //   let b3 = (synch >> 16) & mask;
  //   let b4 = (synch >> 24) & mask;

  //   return b1 | (b2 << 7) | (b3 << 14) | (b4 << 21);
  // };

  // const HEADER_SIZE = 10;
  // const ID3_ENCODINGS = [
  //   'ascii',
  //   'utf-16',
  //   'utf-16be',
  //   'utf-8'
  // ];
  // const LANG_FRAMES = [
  //   'USLT',
  //   'SYLT',
  //   'COMM',
  //   'USER'
  // ];

  // reader.onload = (evt) => {
  //   let buffer = evt.target.result;
  //   let header = new DataView(buffer, 0, HEADER_SIZE);
  //   let major = header.getUint8(3);
  //   let minor = header.getUint8(4);

  //   let version = `ID3v2.${major}.${minor}`;
  //   console.log(version);

  //   let size = synchToInt(header.getUint32(6));

  //   let offset = HEADER_SIZE;
  //   let id3Size = HEADER_SIZE + size;

  //   let decodeFrame = (buffer, offset) => {
  //     let header = new DataView(buffer, offset, HEADER_SIZE + 1);

  //     if (header.getUint8(0) === 0) { return; }

  //     let id = decode('ascii', new Uint8Array(buffer, offset, 4));

  //     let size = header.getUint32(4);
  //     let contentSize = size - 1;
  //     let encoding = header.getUint8(HEADER_SIZE);

  //     let contentOffset = offset + HEADER_SIZE + 1;

  //     let lang;
  //     if (LANG_FRAMES.includes(id)) {
  //       lang = decode('ascii', new Uint8Array(buffer, contentOffset, 3));
  //       contentOffset += 3;
  //       contentSize -= 3;
  //     }

  //     let value = decode(ID3_ENCODINGS[encoding],
  //       new Uint8Array(buffer, contentOffset, contentSize));

  //     return {
  //       id, value, lang,
  //       size: size + HEADER_SIZE
  //     };
  //   };


  //   while (offset < id3Size) {
  //     let frame = decodeFrame(buffer, offset);
  //     if (!frame) { break; }
  //     console.log(`${frame.id}: ${frame.value.length > 200 ? '...' : frame.value}`);
  //     offset += frame.size;
  //   }

  // }

  // reader.readAsArrayBuffer(file);


}
