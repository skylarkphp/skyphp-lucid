define("openstar/services/Registry",[
  "dojo",
	"dojo/data/ItemFileWriteStore", 
	"./general"
],function(dojo,ItemFileWriteStore,srvGeneral) {
	
	return dojo.declare("openstar.services.Registry", ItemFileWriteStore, {
		//	summary:
		//		An API that allows storage in a table format for users.
		//		This is basically a persistant dojo.data store with write capabilities.
		//		See dojo's documentation on dojo.data for more info.
		__desktop_name: "",
		__desktop_appname: "",
	  __desktop_id: "",
		constructor: function(/*Object*/args){
			//	args: {name: String}
			//		the name of the store
			//	args: {appname: String}
			//		the current app's name. (this.sysname)
			//	args: {data: Object}
			//		this argument differs from a regular datastore; if the database exists on the server then it is ignored and the server-side data is used.
			this.__desktop_name = args.name;
			this.__desktop_appname = args.appname;//desktop.app.currentApp;
			
			this._jsonData = null;
			this.exists(dojo.hitch(this, function(e){
				if(e == true) this.url = this._jsonFileUrl = srvGeneral.xhr("api.registry.stream.load")
				+ "&appname=" + encodeURIComponent(this.__desktop_owner)
				+ "&name=" + encodeURIComponent(args.name);
				else this.data = this._jsonData = args.data;
			}), null, true);
		},

    _fetchItems: function(){
      //hack so we have the xhr through desktop
      var oxhr=dojo.xhrGet;
      var self = this;
      dojo.xhrGet = function(){
        return srvGeneral.xhr({
          backend: "api.registry.stream.load",
          content: {
            name: self.__desktop_name,
            appname: self.__desktop_owner
          },
          handleAs: "json-comment-optional"
        });
      };
      var ret = this.inherited(arguments);
      dojo.xhrGet = oxhr;
      return ret;
    },

		_saveEverything: function(saveCompleteCallback, saveFailedCallback, newFileContentString){
			srvGeneral.xhr({
				backend: ("api.registry.stream.save"),
				content: {
					value: newFileContentString,
					appname: this.__desktop_owner,
					name: this.__desktop_name
				},
				load: function(data, ioArgs){
					saveCompleteCallback();
				},
				error: function(type, error){
					saveFailedCallback();
				}
			});
		},

		exists: function(/*Function*/onComplete, /*Function*/onError, /*Boolean*/sync)
		{
			//	summary:
			//		Checks if this store exists on the server. Returns a dojo.Deferred object.
			//	onSuccess:
			//		a callback function. The first argument passed to it is true if it does exist, false if it does not.
	        //	onError:
	        //	    if for some reason there was an error, this will be called.
			//	sync:
			//		should the call be syncronous? defaults to false
	    var d = new dojo.Deferred();
	    if(onComplete) d.addCallback(onComplete);
	    if(onError) d.addErrback(onError);
			srvGeneral.xhr({
				backend: "api.registry.info.exists",
				sync: sync,
				content: {
					name: this.__desktop_name,
					appname: this.__desktop_owner
				},
				load: function(data, ioArgs){
					d.callback(data.exists);
				},
	      error: dojo.hitch(d, "errback"),
				handleAs: "json"
			});
	    return d; // dojo.Deferred
		},

		drop: function(/*Function?*/onComplete, /*Function?*/onError)
		{
			//	summary:
			//		Deletes the store on the server. Returns a dojo.Deferred object.
			//	onComplete:
			//		a callback function.
	        //	onError:
	        //	    if for some reason there was an error, this will be called
	        var d = dojo.Deferred();
	        if(onSuccess) d.addCallback(onSuccess);
	        if(onError) d.addErrback(onError);
			srvGeneral.xhr({
				backend: "api.registry.stream.delete",
				content: {
					name: this.__desktop_name,
					appname: this.__desktop_owner
				},
				load: function(data, ioArgs){
					d[data == "0" ? "callback" : "errback"]();
				},
	            error: dojo.hitch(d, "errback")
			});
	        return d; // dojo.Deferred
		}
	});

});
