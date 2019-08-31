let indexedDB = window.indexedDB;
let dbName = 'MusicPlayer';
let dbVersion = 1;
let storeName = 'MySongs';
let url = '';
let songsList = HTMLElement;
let radiosList = HTMLElement;
const body = document.getElementById('body');
const radioName = document.getElementById('radioName');
const artistName = document.getElementById('artistName');
const songTitle = document.getElementById('songTitle');
const albumName = document.getElementById('albumName');
const songGenre = document.getElementById('songGenre');
const radioURL = document.getElementById('radioURL');
const songID = document.getElementById('songID');
const modalTitle = document.getElementById('modalTitle');
const submitButton = document.getElementById('submit');
const deleteButton = document.getElementById('delete');
const plusButton = document.getElementById('plusButton');
const confirmDelete = document.getElementById('confirmDelete');
const addFileButton = document.getElementById('addFile');
const addRadioModal = document.getElementById('addRadio');
const closeModal = document.getElementById('closeModal');

// Metadata utilities
const decode = (format, string) => new TextDecoder(format).decode(string);
const synchToInt = synch => {
  const mask = 0b01111111;
  let b1 = synch & mask;
  let b2 = (synch >> 8) & mask;
  let b3 = (synch >> 16) & mask;
  let b4 = (synch >> 24) & mask;

  return b1 | (b2 << 7) | (b3 << 14) | (b4 << 21);
};

const HEADER_SIZE = 10;
const ID3_ENCODINGS = [
  'ascii',
  'utf-16',
  'utf-16be',
  'utf-8'
];
const LANG_FRAMES = [
  'USLT',
  'SYLT',
  'COMM',
  'USER'
];

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
    + `<td id="${id}" title="Edit this item"><i class="fas fa-bars"></i></td>`;
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
        songsList = document.createElement('tbody');
        radiosList = document.createElement('tbody');
        songsList.id = 'songsList';
        radiosList.id = 'radiosList';
        songsList.addEventListener('click', loadSong);
        radiosList.addEventListener('click', loadSong);

        if (context.name === 'Radios') {
          songsList.style.display = 'none';
          tabs.children[0].children[0].classList.add('active');
        } else {
          radiosList.style.display = 'none';
          tabs.children[1].children[0].classList.add('active');
        }

        table.insertAdjacentElement('beforeend', songsList)
        table.insertAdjacentElement('beforeend', radiosList);

        for (i in song) {
          if (typeof (song[i].url) !== 'string') {
            url = window.URL.createObjectURL(song[i].url);
            songsList.insertAdjacentHTML('beforeend',
              '<tr>' + songNode(url, (`${song[i].title}` ? `${song[i].artist} - ${song[i].title}` : `${song[i].artist}`), song[i].genre, key[i]) + '</tr>');
          } else {
            url = song[i].url;
            radiosList.insertAdjacentHTML('beforeend',
              '<tr>' + songNode(url, song[i].name, song[i].genre, key[i]) + '</tr>');
          }
        }
        songsList = document.getElementById('songsList');
        radiosList = document.getElementById('radiosList');
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
  if (context.name !== 'Radios') {
    artistName.parentNode.style.display = 'inline-flex';
    songTitle.parentNode.style.display = 'inline-flex';
    albumName.parentNode.style.display = 'inline-flex';
    radioName.parentNode.style.display = 'none';
    radioURL.parentNode.style.display = 'none';
  } else {
    artistName.parentNode.style.display = 'none';
    songTitle.parentNode.style.display = 'none';
    albumName.parentNode.style.display = 'none';
    radioName.parentNode.style.display = 'inline-flex';
    radioURL.parentNode.style.display = 'inline-flex';
  }
  deleteButton.style.display = 'block';
  deleteButton.innerHTML = 'Delete';

  addRadioModal.style.display = 'block';

  let request = indexedDB.open(dbName, dbVersion);

  request.onsuccess = function () {

    let transaction = db.transaction([storeName], 'readwrite');
    let getSongData = transaction.objectStore(storeName).get(Number(element.id));

    getSongData.onsuccess = function () {
      let song = getSongData.result;
      artistName.value = song.artist;
      songTitle.value = song.title;
      albumName.value = song.album;
      songGenre.value = song.genre;
      if (typeof (song.url) === 'string') {
        radioURL.value = song.url;
        radioName.value = song.name;
      }
      songID.value = element.id;
    }
  }
}

plusButton.onclick = function unloadModal() {

  if (context.name === 'Radios') {
    modalTitle.innerHTML = 'Add a radio station';
    submitButton.innerHTML = 'Add';
    artistName.parentNode.style.display = 'none';
    songTitle.parentNode.style.display = 'none';
    albumName.parentNode.style.display = 'none';
    deleteButton.style.display = 'none';
    radioName.value = '';
    songGenre.value = '';
    radioURL.value = '';
    songID.value = '';
    radioName.parentNode.style.display = 'inline-flex';
    radioURL.parentNode.style.display = 'inline-flex';
    addRadioModal.style.display = 'block';
  } else {
    addFileButton.click();
  }

}

closeModal.onclick = () => {
  addRadioModal.style.display = 'none';
}

submitButton.onclick = function submit() {
  closeModal.click();
  let request = indexedDB.open(dbName, dbVersion);
  url = checkUrl(radioURL.value);

  if (songID.value) {

    request.onsuccess = function () {

          let transaction = db.transaction([storeName], 'readwrite');
          if (context.name === 'Radios') {
            transaction.objectStore(storeName).put({
              'name': radioName.value, 'genre': songGenre.value,
              'url': url, 'date': new Date().toLocaleString('fr-FR')
            }, Number(songID.value));
            document.getElementById(songID.value).parentNode.innerHTML =
              songNode(radioURL.value, radioName.value, songGenre.value, songID.value);
          } else {
            let data = transaction.objectStore(storeName).get(Number(songID.value));
            data.onsuccess = () => {
              let song = data.result;
              song.artist = artistName.value;
              song.title = songTitle.value;
              song.album = albumName.value;
              song.genre = songGenre.value;
              transaction.objectStore(storeName).put(song, Number(songID.value));
            }
            let node = document.getElementById(songID.value);
            node.parentNode.innerHTML =
              songNode(node.parentNode.children[0].dataset.musicUrl, (`${songTitle.value}` ? `${artistName.value} - ${songTitle.value}` : `${artistName.value}`), songGenre.value, songID.value);
          }
          

    }

  } else {

    request.onsuccess = function () {
      fetch(url)
        .then((response) => {
          if (response.ok) {
            let transaction = db.transaction([storeName], 'readwrite');
            let newSong = transaction.objectStore(storeName).put({ 'name': radioName.value, 'genre': songGenre.value, 'url': url, 'date': new Date().toLocaleString('fr-FR') });
            newSong.onsuccess = function () {
              let getSongData = transaction.objectStore(storeName).get(newSong.result);
              getSongData.onsuccess = function () {
                let song = getSongData.result;
                radiosList.insertAdjacentHTML('beforeend',
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
  closeModal.click();
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

    let title = '';
    let artist = '';
    let album = '';
    let comment = '';
    let trackPosition = '';
    let genre = '';
    let reader = new FileReader();

    reader.readAsArrayBuffer(file[i]);
    reader.onload = (evt) => {
      let buffer = evt.target.result;
      let header = new DataView(buffer, 0, HEADER_SIZE);

      let size = synchToInt(header.getUint32(6));

      let offset = HEADER_SIZE;
      let id3Size = HEADER_SIZE + size;

      let decodeFrame = (buffer, offset) => {

        let header = new DataView(buffer, offset, HEADER_SIZE + 1);

        if (header.getUint8(0) === 0) { return; }

        let id = decode('ascii', new Uint8Array(buffer, offset, 4));
        let size = header.getUint32(4);
        let contentSize = size - 1;
        let encoding = header.getUint8(HEADER_SIZE);
        let contentOffset = offset + HEADER_SIZE + 1;

        if (LANG_FRAMES.includes(id)) {
          contentOffset += 4;
          contentSize -= 4;
        }

        let value = decode(ID3_ENCODINGS[encoding],
          new Uint8Array(buffer, contentOffset, contentSize));

        return {
          id, value,
          size: size + HEADER_SIZE
        };
      };

      while (offset < id3Size) {
        let frame = decodeFrame(buffer, offset);
        if (!frame) { break; }
        // console.log(`${frame.id}: ${frame.value}`);
        // console.log(frame.value.length);
        switch (frame.id) {
          case 'TIT2':
            title = frame.value;
            console.log(`title: ${title}`);
            break;
          case 'TPE1':
            artist = frame.value;
            console.log(`artist: ${artist}`);
            break;
          case 'TALB':
            album = frame.value;
            console.log(`album: ${album}`);
            break;
          case 'COMM':
            comment = frame.value;
            console.log(`comment: ${comment}`);
            break;
          case 'TRCK':
            trackPosition = frame.value;
            console.log(`trackPosition: ${trackPosition}`);
            break;
          case 'TCON':
            genre = frame.value;
            console.log(`genre: ${genre}`);
            break;
        }
        offset += frame.size;
      }

      let blob = new Blob([file[i]], { type: file[i].type });
      let request = indexedDB.open(dbName, dbVersion);

      request.onsuccess = () => {
        // console.log(`default: ${title}, ${artist}, ${album}, ${comment}`);
        let transaction = db.transaction([storeName], 'readwrite');
        let newSong = transaction.objectStore(storeName).put({ 'artist': artist ? artist : file[i].name, 'title': title, 'album': album, 'comment': comment, 'genre': genre ? genre : 'Various', 'url': blob, 'date': new Date().toLocaleString('fr-FR') });
        newSong.onsuccess = function () {
          let getSongData = transaction.objectStore(storeName).get(newSong.result);
          getSongData.onsuccess = function () {
            let song = getSongData.result;
            url = window.URL.createObjectURL(song.url);
            songsList.insertAdjacentHTML('beforeend',
              '<tr>' + songNode(url, (`${song.title}` ? `${song.artist} - ${song.title}` : `${song.artist}`), song.genre, newSong.result) + '</tr>');
          }
        }
      }
    }
  }
}
