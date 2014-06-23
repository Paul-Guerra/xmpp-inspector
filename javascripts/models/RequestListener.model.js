define(['BaseModel', 'lib/utils'], function(BaseModel, Utils) {
  "use strict";

  // Description: Listen for webRequests in the background and send message to dev tools extension
  return BaseModel.extend({

    defaults: {
      scheme: "http", 
      host: "*", 
      path: "http-bind",
      types: ["xmlhttprequest"],
      tabId: -1
    },
    port: null,
    requestHandlers: {},

    _responseListener: null,

    initialize: function(){
      console.log("[RequestListener] init");
    },

    generateWebRequestFilter: function(){
      //["*://*/*http-bind*"]
      return [this.get("scheme")+"://"+this.get("host")+"/*"+this.get("path")+"*"];
    },

    setPort: function( port ){

      this.port = port;

      this.on("change:host change:scheme change:path", function( model ){
        this.removeListeners();
        this.addListeners();
      }.bind(this))

      // handle messages
      port.onMessage.addListener( function( message ){
        console.info( "RAW MEssage", message );
        if( typeof message.event === "undefined" ){
          this.set( message );
        }else{
          this.onMessage( message.event, message.data );
        }
      }.bind(this)); 


      this.id = port["name"];
      return this;
    },

    // onChangeURLs: function( update ){

    //   if( update.change.urls ){

    //   }
    // },

    onBeforeRequest: function(info) {

      var content = "";
      // note: requestBody.raw[0].bytes is an ArrayBuffer type object 
      //  but it becomes a regular object when passed to the devtools extension page.
      //  we can either parse the ArrayBuffer here or serialize it here then deserialize it
      //  in devtools page. see http://stackoverflow.com/questions/8593896/chrome-extension-how-to-pass-arraybuffer-or-blob-from-content-script-to-the-bac
      //  for details.
      if(info.requestBody)
        content = Utils.ArrayBufferToString(info.requestBody.raw[0].bytes);
      this.sendToResponseListener({
        event: "stream:update", 
        data:{
          state:"beforeRequest", 
          info: info,
          requestBody: content
        }
      });
    },

    onCompleted: function(info) {    

      console.info( "oncompleted", info );
      this.sendToResponseListener({
        event: "stream:update", 
        data: {
          state:"completed",
          info: info
        }
      });
    },

    addListeners: function(){
      console.log("[StreamListener] addListeners");
      this.listenToBeforeRequest();
      //this.listenToSendHeaders();
      this.listenToCompleted();
    },

    removeListeners: function(){
      console.log("[StreamListener] removeListeners");
      var handlers = this.requestHandlers;
      for(var handle in handlers){
        console.log("handlers:", handlers);
        console.log("handle:", handle);
        console.log("handlers[handle]:", handlers[handle]);

        chrome.webRequest[handle].removeListener(handlers[handle]);
        delete handlers[handle];
      }
    },

    listenToBeforeRequest: function(){
      // Get the request body
      this.requestHandlers["onBeforeRequest"] = this.onBeforeRequest.bind(this);

      chrome.webRequest.onBeforeRequest.addListener(
          this.requestHandlers["onBeforeRequest"],
          // filters
          {
            urls  : this.generateWebRequestFilter(),
            types : this.get("types"),
            tabId : this.get("tabId")
          },
          ["requestBody"]
      );
    },
    
    // listenToSendHeaders: function(){
    //   // get request headers (after everyone has had a chance to change them)
    //   var _this = this;
    //   this.onSendHeaders = chrome.webRequest.onSendHeaders.addListener(
    //       function(info) {
    //       },
    //       // filters
    //       {
    //         urls  : this.generateWebRequestFilter(),
    //         types : this.get("types"),
    //         tabId : this.get("tabId")
    //       }, 
    //       ["requestHeaders"]
    //   );
    // },
    
    listenToCompleted: function(){
      // get response headers, http status & response
      // chrome.webRequest.onResponseStarted.addListener()
      this.requestHandlers["onCompleted"] = this.onCompleted.bind(this);

      chrome.webRequest.onCompleted.addListener(
          this.requestHandlers["onCompleted"],
          // filters
          {
            urls  : this.generateWebRequestFilter(),
            types : this.get("types"),
            tabId : this.get("tabId")
          },
          ["responseHeaders"]
      );
    },

    sendToResponseListener: function( message ){
      console.info( this.port );
      if( this.port.postMessage ){
        this.port.postMessage(message);
        console.info( "postmessage", message );
      }else{
        console.error("could not send message to response listener" );
        debugger;
      }
    },


    onMessage: function(event,data) {
      console.log("[RequestListener] onMessage", event, ":",data );

      switch(event){
        case "add:listener":
          console.log("add:listener", data );
          this.set(data); // manifest
          this.addListeners();
          break;

        case "change:protocol":
          this.set(data);
        break;
        case "copy:text":
          console.log("copy:text");
          Utils.copyText(data);
          break;
      }
    }


  });
});