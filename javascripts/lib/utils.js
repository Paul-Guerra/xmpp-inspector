define([], function() {
  "use strict";

  // Description: Listen for webRequests in the background and send message to dev tools extension
  return {

    guidGen: function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    },

    // borrowed from http://updates.html5rocks.com/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
    // for a more robust library we can always use https://github.com/inexorabletash/text-encoding
    ArrayBufferToString: function(buf) {
        // !!! using Uint8Array because we are assuming utf 8 encoded
        // we should attempt to detect this if possible and accomodate other encodings using the library mentioned above
       // return String.fromCharCode.apply(null, new Uint16Array(buf));
       return String.fromCharCode.apply(null, new Uint8Array(buf));
     },

    StringToArrayBuffer: function(str) {
       var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char !!!UTF-16!!!
       var bufView = new Uint16Array(buf); 
       for (var i=0, strLen=str.length; i<strLen; i++) {
         bufView[i] = str.charCodeAt(i);
       }
       return buf;
     }

  }
});