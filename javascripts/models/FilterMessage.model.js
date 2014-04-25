define(['BaseFilter'], function(BaseFilter) {
  "use strict";

  return BaseFilter.extend({

    defaults: {
      active: false
    },

    initialize: function(options){
      
    },

    apply: function(stream){
      console.log("[FilterRoster] apply. This should be overwritten");
    }
    

  });
});
