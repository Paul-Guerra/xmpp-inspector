define(['BaseCollection', 'ChromeConnection', 'RequestListener', 'lib/utils'], function(BaseCollection, ChromeConnection, RequestListener, Utils) {
  "use strict";


  return Backbone.Collection.extend({
    
    model: ChromeConnection,

    initialize: function(){
      console.log("[RequestListeners] initialize");
      this.addListeners();
      window.RLC = this;
    },

    addListeners: function(){      
      // listen for panel connections
      chrome.runtime.onConnect.addListener(function(port) {
        console.log("[RequestListeners] Recvd 'onConnect' event", port );  
        if( !this.findWhere({id: port.name}) ) {
          this.add({id: port.name, port: port});
        }
        // this.add(new RequestListener().setPort(port));

      }.bind(this));

      // this.on("add", this._handleConnect.bind(this));
      this.on("remove", this._handleDisconnect.bind(this));
      // when the tab has completed its connection workflow, do
      chrome.tabs.onUpdated.addListener(function(responseListenerId, changeInfo) {
        var responseListener = null;
        if (changeInfo.status === 'complete') {
          if( responseListener = this.get(responseListenerId) ){
            responseListener.sendMessageToResponseListener({
              event: "state:update",
              data: "tab:update:complete"
            });
          }
        }
      }.bind(this));

      chrome.tabs.onRemoved.addListener(function(responseListenerId, isWindowClosing) {
        console.log("TAB closing", responseListenerId, "TODO: removelisteners and port");
        // !!!: remove all the listeners from that tab
        this.remove({id: "port:"+responseListenerId});
      }.bind(this));

    },

    // _handleConnect: function( chromeConnection ){
    //   console.info("connect", chromeConnection );
    // },

    _handleDisconnect: function( chromeConnection ){
      console.info("panel disconnect", chromeConnection );
      if( typeof chromeConnection === "undefined" || chromeConnection === null ){
        console.error( "No chromeConnection found to call removeListeners().");
        return;
      }
      // chromeConnection.removeWRListeners();
    }


  });
});
