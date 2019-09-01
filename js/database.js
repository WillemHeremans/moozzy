let indexedDB = window.indexedDB;
let dbName = 'MusicPlayer';
let dbVersion = 1;
let storeName = 'MySongs';
let url = '';
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
const songsList = document.getElementById('songsList');
const radiosList = document.getElementById('radiosList');
const radiosThead = document.getElementById('radiosThead');
const songsThead = document.getElementById('songsThead');

songsList.addEventListener('click', loadSong);
radiosList.addEventListener('click', loadSong);
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

function songNode(url, name, album, genre, id) {
  return `<td data-music-url="${url}">${name}</td>`
  + (album ? `<td>${album}</td>` : `<td></td>`)
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

        for (i in song) {
          if (typeof (song[i].url) !== 'string') {
            url = window.URL.createObjectURL(song[i].url);
            songsList.insertAdjacentHTML('afterbegin',
              '<tr>' + songNode(url, (`${song[i].title}` ? `${song[i].artist} - ${song[i].title}` : `${song[i].artist}`),
              song[i].album, song[i].genre, key[i]) + '</tr>');
          } else {
            url = song[i].url;
            radiosList.insertAdjacentHTML('afterbegin',
              '<tr>' + songNode(url, song[i].name, undefined, song[i].genre, key[i]) + '</tr>');
          }
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
          songNode(radioURL.value, radioName.value, undefined, songGenre.value, songID.value);
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
          songNode(node.parentNode.children[0].dataset.musicUrl, (`${songTitle.value}` ? `${artistName.value} - ${songTitle.value}` : `${artistName.value}`), albumName.value, songGenre.value, songID.value);
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
                radiosList.insertAdjacentHTML('afterbegin',
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
    let trackPosition = '';
    let genre = '';

    jsmediatags.read(file[i], {
      onSuccess: function (data) {
        data.tags.title ? title = data.tags.title : undefined;
        data.tags.artist ? artist = data.tags.artist : undefined;
        data.tags.album ? album = data.tags.album : undefined;
        data.tags.track ? trackPosition = data.tags.track : undefined;
        data.tags.genre ? genre = data.tags.genre : undefined;

        let blob = new Blob([file[i]], { type: file[i].type });
        let request = indexedDB.open(dbName, dbVersion);

        request.onsuccess = () => {
          let transaction = db.transaction([storeName], 'readwrite');
          let newSong = transaction.objectStore(storeName).put({ 'artist': artist ? artist : file[i].name, 'title': title, 'album': album, 'trackPosition': trackPosition, 'genre': genre ? genre : 'Various', 'url': blob, 'date': new Date().toLocaleString('fr-FR') });
          newSong.onsuccess = function () {
            let getSongData = transaction.objectStore(storeName).get(newSong.result);
            getSongData.onsuccess = function () {
              let song = getSongData.result;
              url = window.URL.createObjectURL(song.url);
              songsList.insertAdjacentHTML('afterbegin',
                '<tr>' + songNode(url, (`${song.title}` ? `${song.artist} - ${song.title}` : `${song.artist}`), song.album, song.genre, newSong.result) + '</tr>');
            }
          }
        }
      },
      onError: function (error) {
        console.log(error);
      }
    });
  }
}
