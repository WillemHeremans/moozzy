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
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function (err) {
      // registration failed :(
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

      let songs = getDB.result;

      getKey.onsuccess = function () {

        let key = getKey.result;

        for (i in songs) {
          songsList.insertAdjacentHTML('beforeend', `<tr><td>` + songs[i].name + `</td>`
            + `<td>` + songs[i].genre + `</td>`
            + `<td>` + songs[i].url + `</td>`
            + `<td id="` + key[i] + `" title="Edit this item"><a href="#broadcast" style="color: black;"><i class="fas fa-bars"></i></a></td></tr>`);
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
            + `<td>` + url + `</td>`
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
                  + `<td>` + url + `</td>`
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

// function addFile() {

//   let inp = document.getElementById('get-files');
//   // Access and handle the files 
//   for (i = 0; i < inp.files.length; i++) {
//     let file = inp.files[i];
//     // do things with file
//     console.log(file['name']);
//     console.log('Ce script est bien appelé')
//     // IndexedDB

//     // Create/open database
//     var request = indexedDB.open(dbName, dbVersion),
//       db,
//       createObjectStore = function (dataBase) {
//         // Create an objectStore
//         console.log('Creating objectStore')
//         //   var objectStore = db.createObjectStore('listeRadios', { autoIncrement: true });
//         dataBase.createObjectStore('MyNewData');
//       }

//     request.onerror = function (event) {
//       console.log('Error creating/accessing IndexedDB database');
//     };

//     request.onsuccess = function (event) {
//       console.log('Success creating/accessing IndexedDB database');
//       db = request.result;
//       console.log(db);

//       var transaction = db.transaction([storeName], 'readwrite');
//       console.log(transaction.objectStore(storeName).put({ 'name': 'SWIGG', 'genre': 'Pop, RnB, rap', 'url': 'http://swingfm.ice.infomaniak.ch/swingfm-128', 'date': new Date().toLocaleString('fr-FR') }));
//       let getDB = transaction.objectStore(storeName).getAll();
//       let getKey = transaction.objectStore(storeName).get('juno');

//       getDB.onsuccess = function () {
//         let songs = getDB.result;
//         // var table = document.getElementById('tBody');
//         for (i in songs) {
//           console.log(songs[i]);
//           //       var row = table.insertRow(i);
//           //       var cell1 = row.insertCell(i);
//           // cell1.insertAdjacentHTML('beforeend', )'songs[i]';
//         }

//         getKey.onsuccess = function () {
//           let trackTime = getKey.result;
//           // for (i in trackTime) {
//           console.log('result de get : ');
//           console.log(trackTime);
//           document.getElementById('music').src = trackTime;
//           let music = new Audio();
//           music.src = document.getElementById('music').src;
//           music.onloadedmetadata = function () {
//             duration = music.duration;
//             start = music.currentTime;
//             durationMetaData.insertAdjacentHTML('beforeend', )start + ' / ' + duration;
//             console.log(music.mozGetMetadata());
//           }
//           // }
//         }

//       }
//       db.onerror = function (event) {
//         console.log('Error creating/accessing IndexedDB database');
//       };
//     }

//     // For future use. Currently only in latest Firefox versions
//     request.onupgradeneeded = function (event) {
//       createObjectStore(event.target.result);
//       console.log(event.target.result);
//     };
//   }
// }
