define(['BaseView',
  'text!templates/stream-data.template.html',
  'text!templates/stream-data-wrapper.template.html',
  'codemirror/mode/xml/xml',
  'beautifier/beautify-html'],
  function(BaseView, streamDataTemplate, streamDataWrapperTemplate) {
  "use strict";
  
  var format = require('beautifier/beautify-html');
  var CodeMirror = require('codemirror/lib/codemirror');
  var Bridge = null;
  return BaseView.extend({

    defaults: {
      test: "test"
    },
    el: "#stream",

    template: _.template(streamDataTemplate),

    dataStreamConfig: {
      mode: "text/html",
      lineNumbers: true,
      lineWrapping: true,
      readOnly: true,
      theme: "xmpp default", // apply our modifications to the default CodeMirror theme.
    },

    // map the line number in the data stream to the networkEvent stored in the model
    networkEventMap: {},

    initialize: function(options){
      console.log("[StreamView] initialize");
      Bridge = this.model;
      this.render();
      this.dataStream = CodeMirror.fromTextArea(document.getElementById("dataStream"), this.dataStreamConfig);
      this.addlisteners(options);
    },

    addlisteners: function(options){
      var _this = this;
      
      console.info( "Bridge?", Bridge );

      Bridge.on( "request:sent", function(data){
        var prefix = this.requestSentPrefix;
        if (typeof(prefix) == "function") {
          prefix = prefix(data);
        }
        this.appendData(data, {prefix: prefix});

      }.bind(this));

      Bridge.on("request:finished", function(data){
        console.info( "[rquest finished]", data );
        var prefix = this.responseReceivedPrefix;
        if (typeof(prefix) == "function") {
          prefix = prefix(data);
        }
        this.appendData(data, {prefix: prefix});

      }.bind(this));

    },

    render: function(){
      this.$el.html(this.template({}));
      return this;
    },

    isAtBottom: function(){
      var scrollInfo = this.dataStream.getScrollInfo();
      if(scrollInfo.clientHeight + scrollInfo.top === scrollInfo.height)
        return true;
      else
        return false;
      
    },

    getLastLineInfo: function(){
      // note: lastLine() return value is one less than the number displayed in the gutter, must be 0 indexed,
      //  but the value still works for getting the line handler & content so no need to offset by one
      //  use lineCount() to get the displayed line number
      var lastLineNumber = this.dataStream.lastLine();
      var handler = this.dataStream.getLineHandle(lastLineNumber);

      return {
        number    : lastLineNumber,
        handler   : handler,
        charCount : handler.text.length
      };
    },

    appendData: function(data, options){
      if(!options)
        options = {}
      var content = data.body;
      var scollToBottom = false;
      var lastLine = this.getLastLineInfo();      

      // if the user is already at  the bottom of the stream scroll to the bottom after appending the new content
      if(this.isAtBottom()){
        scollToBottom = true;
      }

      if(content){
        content = format.html_beautify(content);
        
        if(options.prefix){ 
          if(lastLine.number > 0)
            options.prefix = "\n\n" + options.prefix + "\n";
          else
            options.prefix = options.prefix + "\n";

          this.dataStream.replaceRange(options.prefix, {line: Infinity, ch: lastLine.charCount});
          lastLine = this.getLastLineInfo();
        }

        this.dataStream.replaceRange(content, {line: Infinity, ch: lastLine.charCount});
        this.networkEventMap["line:" + lastLine.number] = data.id;
        if( this.streamShare ){
          Bridge.trigger("streamdata", content);
        }
      }

      if(scollToBottom){
        this.dataStream.scrollIntoView({line: this.dataStream.lastLine(), ch: 1});
      }
    },

    clear: function(){      
      this.dataStream.setValue("");
      this.dataStream.clearHistory();
      this.dataStream.clearGutter();
    },

    copy: function() {
      var stream = this.dataStream;
      var content = "";

      content = stream.getSelection();
      
      if(content.length === 0){
        content = stream.getValue();
      }

      Bridge.sendToBackground({event: "copy:text", data: content});
    },

    toggleForSubbar: function(){
      this.$el.toggleClass("toolbar-expanded");
    },

    streamShare: function(enabled){
      this.shareStream = enabled;
    }

  });
});
