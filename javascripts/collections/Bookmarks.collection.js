define(['BaseCollection'], function(BaseCollection) {
  "use strict";
     
  return BaseCollection.extend({
    
    initialize: function(){
      console.log("[BaseCollection] initialize");
      this.on("add remove reset", this.save);
    },

    save: function(){
      localStorage.set("bookmarks", this.toJSON());
    },

  });
});
