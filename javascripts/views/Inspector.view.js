define(["BaseView",
  "InspectorModel",
  "ResponseListener",
  "XMPPStreamView",
  "StreamToolbarView",
  "Stream",
  'text!templates/inspector.template.html',
  'lib/utils'], function(BaseView, InspectorModel, ResponseListener, XMPPStreamView, StreamToolbarView, Stream, inspectorTemplate, Utils) {
  "use strict";

  return BaseView.extend({

    el: "body",

    stream: null,
    
    toolbar: null,

    template: _.template(inspectorTemplate),

    initialize: function(){
      this.model = new InspectorModel();
      this.render();
      this.addListeners();
    },

    render: function(){
      this.$el.html(this.template({}));
      this.renderStream();
      this.stream.model.on("change:scheme change:host change:path", this.renderToolbar.bind(this) );
      this.renderToolbar(this.stream.model.defaults)
    },

    renderToolbar: function(options){
      if(!options){
        options = {};
      }

      if( this.toolbar ){
        // sync
        this.toolbar.model.set(options);
        return;
      }

      options.inspectorView = this;
      this.toolbar = new StreamToolbarView(options);
      this.toolbar.model.on("change",function(data){
        this.stream.model.sendToBackground( data.changed );
        this.stream.model.set(data.changed,{silent:true});
      }.bind(this));

      this.toolbar.model.on( "toolbar:command", this._handleToolbarCommand.bind(this) );
    },

    renderStream: function(){
      this.stream = new XMPPStreamView({
        model: new Stream(),
        inspectorView: this
      });
    },

    addListeners: function(){

      document.addEventListener("keydown", function(event){
        
        // cmd+f or ctrl+f trigger search
        if((event.metaKey || event.ctrlKey) && event.which === 70){
          Utils.stopEvent(event);
          this.model.set("state", "search");
          this.trigger("search:init");
          return false;
        }
        
        // ESC cancels search state
        if(this.model.get("state") === "search" && event.which === 27){
          Utils.stopEvent(event);
          this.model.set("state", null);
          this.trigger("search:cancel");
          return false;
        }
      }.bind(this), true);

    },

    _handleToolbarCommand: function( command ){
      switch( command.name ){
        case "clear":
          this.stream.clear();
          break;
        case "copy":
          this.stream.copy();
          break;
        case "url-pattern-update":
          this.stream.model.updateFilter(command.pattern);
          break;
        case "toggle-subbar":
          this.stream.toggleForSubbar(command.state);
          break;

        default:
          console.error( "[STREAM.VIEW] Unknown command: ", command );
      }
    },

  });
});
