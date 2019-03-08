function onFilesSupplied( )

{
 // Get all the files from the input of type file
 var files = e.files || e.dataTransfer.files,
  file,
  fr = new FileReader();

 // Handle the typed array read by the FileReader,
 // when it's finished loading
 function _handleFileLoad()
 {
  // This is the point where the real tag
  // read is happening - covered later on
  var tags =readTags( this.result );
 }

 // Listen when FileReader finishes reading and
 // pass result to the handler
 fr.addEventListener( 'load', _handleFileLoad );

 // This example uses only the first file to load,
 // but you can loop them all and read them
 file = files[0];

 // Do the actual read, by saying to the reader
 // we want the result as ArrayBuffer
 fr.readAsArrayBuffer( file );
}
