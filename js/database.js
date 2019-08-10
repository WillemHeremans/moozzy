let indexedDB = window.indexedDB;
let dbName = 'MusicPlayer';
let dbVersion = 1;
let storeName = 'MySongs';
let url = '';
const body = document.getElementById('body');
const songName = document.getElementById('songName');
const songGenre = document.getElementById('songGenre');
const songURL = document.getElementById('songURL');
const songID = document.getElementById('songID');
const modalTitle = document.getElementById('modalTitle');
const submitButton = document.getElementById('submit');
const deleteButton = document.getElementById('delete');
const plusButton = document.getElementById('plusButton');
const confirmDelete = document.getElementById('confirmDelete');
const addFileButton = document.getElementById('addFile');

addFileButton.addEventListener('change', addFile);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/moozzy/serviceWorker.js').then(function (registration) {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function (err) {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}

function songNode(url, name, genre, id) {
  return `<td data-music-url="${url}">${name}</td>`
  + `<td>${genre}</td>`
  + `<td id="${id}" title="Edit this item"><a href="#broadcast" style="color: black;"><i class="fas fa-bars"></i></a></td>`;
}

function checkUrl(string) {
  if (!string.includes('https://')) {
    if (string.includes('http://')) {
      string = string.replace('http://', 'https://');
    } else {
      const protocol = 'https://';
      string = protocol.concat(string);
    }
  }
  return string;
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

      let song = getDB.result;

      getKeys.onsuccess = function () {

        let key = getKeys.result;

        for (i in song) {
          if (typeof (song[i].url) !== 'string') {
            url = window.URL.createObjectURL(song[i].url);
          } else {
            url = song[i].url;
          }
          songsList.insertAdjacentHTML('beforeend',
          '<tr>' + songNode(url, song[i].name, song[i].genre, key[i]) + '</tr>');
        }
      }
    }
    countData.onsuccess = function () {
      console.log(countData.result);
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
    let getSongData = transaction.objectStore(storeName).get(Number(element.id));

    getSongData.onsuccess = function () {
      let song = getSongData.result;
      songName.value = song.name;
      songGenre.value = song.genre;
      songURL.value = song.url;
      songID.value = element.id;
    }
  }
}

plusButton.onclick = function unloadModal() {
  modalTitle.innerHTML = 'Add a song';
  submitButton.innerHTML = 'Add';
  deleteButton.style.display = 'none';
  songName.value = '';
  songGenre.value = '';
  songURL.value = '';
  songID.value = '';
}

submitButton.onclick = function submit() {

  let request = indexedDB.open(dbName, dbVersion);
  url = checkUrl(songURL.value);

  if (songID.value) {

    request.onsuccess = function () {
      fetch(url).then((response) => {
        if (response.ok) {
          let transaction = db.transaction([storeName], 'readwrite');
          transaction.objectStore(storeName).put({
            'name': songName.value, 'genre': songGenre.value,
            'url': url, 'date': new Date().toLocaleString('fr-FR')
          }, Number(songID.value));
          document.getElementById(songID.value).parentNode.innerHTML =
          songNode(songURL.value, songName.value, songGenre.value, songID.value);
        } else {
          alert(`Les données n'ont pu être ajoutée :
          l'URL ne fournit pas de protocole HTTPS`)
        }
      })
    }

  } else {

    request.onsuccess = function () {
      fetch(url)
        .then((response) => {
          if (response.ok) {
            let transaction = db.transaction([storeName], 'readwrite');
            let newSong = transaction.objectStore(storeName).put({ 'name': songName.value, 'genre': songGenre.value, 'url': url, 'date': new Date().toLocaleString('fr-FR') });
            newSong.onsuccess = function () {
              let getSongData = transaction.objectStore(storeName).get(newSong.result);
              getSongData.onsuccess = function () {
                let song = getSongData.result;
                songsList.insertAdjacentHTML('beforeend',
                '<tr>' + songNode(song.url, song.name, song.genre, newSong.result) + '</tr>');
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
    let deletingSong = transaction.objectStore(storeName).delete(Number(songID.value));
    deletingSong.onsuccess = function () {
      document.getElementById(songID.value).parentNode.remove();
    }
  }
}

function addFile(e) {

  let file = e.target.files;
  for (let i = 0; i < file.length; i++) {
    let blob = new Blob([file[i]], { type: file[i].type });
    let request = indexedDB.open(dbName, dbVersion);
    request.onsuccess = () => {
      let transaction = db.transaction([storeName], 'readwrite');
      let newSong = transaction.objectStore(storeName).put({ 'name': file[i].name, 'genre': file[i].type, 'url': blob, 'date': new Date().toLocaleString('fr-FR') });
      newSong.onsuccess = function () {
        let getSongData = transaction.objectStore(storeName).get(newSong.result);
        getSongData.onsuccess = function () {
          let song = getSongData.result;
          url = window.URL.createObjectURL(song.url);
          songsList.insertAdjacentHTML('beforeend',
          '<tr>' + songNode(url, song.name, song.genre, newSong.result) + '</tr>');
        }
      }
    }
  }


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
