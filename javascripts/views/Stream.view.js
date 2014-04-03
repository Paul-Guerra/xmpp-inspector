define(['BaseView', 'prettyPrint', 'text!templates/stream-data.template.html', 'text!templates/stream-data-wrapper.template.html'], 
  function(BaseView, prettyPrint, streamDataTemplate, streamDataWrapperTemplate) {
  "use strict";

  return BaseView.extend({
    
    el: "#stream",

    template: _.template(streamDataTemplate),
    wrapperTemplate: _.template(streamDataWrapperTemplate),
    
    initialize: function(){
      console.log("[StreamView] initialize");
    },

    guidGen: function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    },

    // Description: Encoded mark up languages, like HTML and XML, for display on a webpage
    formatMarkUp: function(markup){
      return markup.replace(/</g, '&lt;')
               .replace(/>/g, '&gt;');
    },

    appendRequestWrapper: function(){
      var guid = this.guidGen();
      this.$el.append(this.wrapperTemplate({guid: guid}));
      return guid;
    },    

    appendRequestData: function(targetId, contents){
      this.$el.append(this.template({payload: contents}));
    },

    appendData: function(contents){
      var targetId = this.appendRequestWrapper();
      var targetEl = this.$el.find("#" + targetId)[0];
      contents = this.formatMarkUp(contents);
      $(targetEl).append( this.template({payload: contents}) );
      
      PR.prettyPrint(null, targetEl);
    }

  });
});
