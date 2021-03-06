define(["StreamsView"], function(StreamsView) {
  "use strict";

  return StreamsView.extend({
    
    el                      : "#streams",
    requestSentPrefix       : function(){ return "<!-- " + new Date().toTimeString() + " request sent >>>>>>>>>>>> -->";},
    responseReceivedPrefix  : function(){ return "<!-- <<<<<<<<<<<< " + new Date().toTimeString() + " response received -->";}
  });
});
