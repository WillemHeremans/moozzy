function addFile() {

  let inp = document.getElementById("get-files");
  // Access and handle the files 
  for (i = 0; i < inp.files.length; i++) {
    let file = inp.files[i];
    // do things with file
    console.log(file['name']);
  console.log('Ce script est bien appelé')
  // IndexedDB
  var indexedDB = window.indexedDB
      dbVersion = 1.0;

  // Create/open database
  var request = indexedDB.open("songs", dbVersion),
      db,
      createObjectStore = function (dataBase) {
          // Create an objectStore
          console.log("Creating objectStore")
          dataBase.createObjectStore("MySongs");
      }

  request.onerror = function (event) {
      console.log("Error creating/accessing IndexedDB database");
  };

  request.onsuccess = function (event) {
      console.log("Success creating/accessing IndexedDB database");
      db = request.result;
    console.log(db);


    var transaction = db.transaction(["MySongs"], "readwrite");
    console.log(transaction.objectStore("MySongs").put(file['name'], new Date().toLocaleString('fr-FR')));
    let getDB = transaction.objectStore("MySongs").getAll();
    let getKey = transaction.objectStore("MySongs").getAllKeys();
  
    getDB.onsuccess = function () {
      let tracks = getDB.result;
      for (i in tracks) {
        console.log(tracks[i]);
      }
     
      getKey.onsuccess = function() {
        let trackTime = getKey.result;
        for (i in trackTime) {
          console.log(trackTime[i]);
        }

      }

    }
      db.onerror = function (event) {
          console.log("Error creating/accessing IndexedDB database");
      };
      
  }
  
  // For future use. Currently only in latest Firefox versions
  request.onupgradeneeded = function (event) {
      createObjectStore(event.target.result);
      console.log(event.target.result);
  };
}}