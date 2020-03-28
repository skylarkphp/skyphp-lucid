define("openstar/services/app",[
	 "dojo", // dojo
	 "qscript/util/html",
	 "./general",
     "./config",
     "./filesystem"
],function(dojo,utilHtml,srvGeneral,srvConfig,srvFilesystem) {
	var app = dojo.getObject("openstar.services.app",true);

	dojo.mixin(app , {
		appList: [],

		init: function(callback){
			//	summary:
			//		Loads the app list from the server
			//var xtalkInit = dojo.subscribe("crosstalkInit", this, function(){
	        //    dojo.unsubscribe(xtalkInit);
	        //    setTimeout(dojo.hitch(this, "startupApps"), 300);
	        //});
			srvGeneral.xhr({
				backend: "core.app.fetch.list",
	            sync: true,
				load: dojo.hitch(this, function(data, ioArgs){
					this.appList = data;
					var style = document.createElement("style");
					style.type="text/css";
					var contents = "";
					dojo.forEach(data, function(item){
						if(!item.icon || item.icon.indexOf(".") === -1) return;
						contents += ".icon-app-"+item.sysname+" {"
									+"width: 16px; height: 16px;"
									//+"background-image: url('"+dojo.moduleUrl("openstar.apps."+item.sysname, item.icon)+"');"
									+"background-image: url('"+require.toUrl("openstar/apps/"+item.sysname+"/"+item.icon)+"');"
									+"}";
					});
					utilHtml.textContent(style, contents);
					document.getElementsByTagName("head")[0].appendChild(style);
	                if (callback) {
	                	callback();
	                }
				}),
				handleAs: "json"
			});
		},
		/*=====
		_listCallbackItem: {
			//	sysname: String
			//		the app's system name
			sysname: 0,
			//	name: String
			//		the app's name
			name: "",
			//	author: String
			//		the app's author
			author: "",
			//	email: String
			//		the app's author's email
			email: "",
			//	maturity: String
			//		the app's maturity (Alpha/Beta/Stable)
			maturity: "",
			//	category: String
			//		the app's category. See desktop.config.set for a list of catagories possible
			category: "",
			//	version: String
			//		the version of the app
			version: "",
			//	filetypes: Array
			//		an array of mimetypes the app can open
			filetypes: []
		},
		=====*/
		list: function(/*Function*/onComplete, /*Function?*/onError){
			//	summary:
			//		Lists the apps available on the server. Returns a dojo.Deferred object.
			//	onComplete:
			//		a callback function. First argument passed is an array with desktop.app._listCallbackItem objects for each app.
	        //	onError:
	        //	    if there was an error, this will be called
	        var d = new dojo.Deferred();
	        if(onComplete) d.addCallback(onComplete);
	        if(onError) d.addErrback(onError);
			srvGeneral.xhr({
				backend: "core.app.fetch.listAll",
				load: dojo.hitch(d, "callback"),
	            error: dojo.hitch(d, "errback"),
				handleAs: "json"
			});
	        return d; // dojo.Deferred
		},
		//IDE functions
		/*=====
		_saveArgs: {
			//	sysname: String?
			//		the unique system name of the app. Cannot contain spaces.
			sysname: "",
			//	name: String?
			//		the name of the app
			name: "my supercool app",
			//	author: String?
			//		the person who wrote the app
			author: "foo barson",
			//	email: String?
			//		the email address of the author
			email: "foo@barson.org",
			//	version: String?
			//		the version of the app
			version: "1.0",
			//	maturity: String?
			//		The development stage of the app. Can be "Alpha", "Beta", or "Stable"
			maturity: "Alpha",
			//	category: String?
			//		The app's category
			//		Can be "Accessories", "Development", "Games", "Graphics", "Internet", "Multimedia", "Office", "Other", or "System"
			category: "Accessories",
			//	filename: String?
			//		the path to the filename to write the code to. Relative to the app's namespace.
			//		provide "<appSysnameHere>.js" to write to the main file
			filename: "",
			//	contents: String?
			//		the new code to write to the file specified
			contents: "({init: function(args){ alert('hi'); }})",
			//	onComplete: Function
			//		a callback function. First argument is the ID of the app just saved (if a sysname was provided)
			onComplete: function(id){},
	        //  onError: Function
	        //      if there was an error, this will be called.
	        onError: function(){}
		},
		=====*/
		save: function(/*desktop.app._saveArgs*/app)
		{
			//	summary:
			//		saves an app to the server. Returns a dojo.Deferred object.
	        var onComplete = app.onComplete;
	        var onError = app.onError;
	        var d = new dojo.Deferred();
	        if(onComplete) d.addCallback(onComplete);
	        if(onError) d.addErrback(onError);
			if((app.sysname||app.filename)||(app.sysname&&app.filename))
			{
				  qface.log("IDE API: Saving application...");
		          srvGeneral.xhr({
		               backend: "core.app.write.save",
		               content : app,
			       error: function(data, ioArgs){
							d.errback(data);
				},
		               load: function(data, ioArgs){
							d.callback(data.sysname||true);
							delete app.apps[parseInt(data.id)];//TODO will be modified?
							srvGeneral.xhr({
								backend: "core.app.fetch.list",
								load: dojo.hitch(this, function(data, ioArgs){
									this.appList = data;
									dojo.publish("updateMenu", [data]);
								}),
								handleAs: "json"
							});
					   },
					   handleAs: "json"
		          });
		     }
			 else
			 {
			 	d.errback();
			 }
	         return d; // dojo.Deferred
		},
		createFolder: function(/*String*/path, /*Function?*/onComplete, /*Function?*/onError){
			//	summary:
			//		creates a folder for an app. Returns a dojo.Deferred object.
			//	path:
			//		the path to the folder to create, relative to the apps directory
			//	onComplete:
			//		a callback function once the operation is complete
	        //	onError:
	        //	    if there was an error, this will be called
	        var d = new dojo.Deferred();
	        if(onComplete) d.addCallback(onComplete);
	        if(onError) d.addErrback(onError);
			return srvGeneral.xhr({
				backend: "core.app.write.createFolder",
				content: {
					dirname: path
				},
				load: function(data){
					d[data=="0" ? "callback" : "errback"]();
				},
	            error: dojo.hitch(d, "errback")
			})
	        return d; // dojo.Deferred
		},
		get: function(/*String*/name, /*String?*/file, /*Function*/onComplete, /*Function?*/onError)
		{
			//	summary:
			//		Loads an app's information from the server w/o caching. Returns a dojo.Deferred object.
			//	name:
			//		the system name of the app to fetch
			//	file:
			//		the filename to open. If excluded, the callback will get an array of filenames
			//	callback:
			//		A callback function. Gets passed a desktop.app._saveArgs object, excluding the callback.
	        var d = new dojo.Deferred();
	        if(onComplete) d.addCallback(onComplete);
	        if(onError) d.addErrback(onError);
			srvGeneral.xhr({
				backend: "core.app.fetch.full",
				content: {
					sysname: name,
					filename: file
				},
				load: function(data, ioArgs)
				{
					if(data.contents)
						d.callback(/*String*/data.contents);
					else
						d.callback(/*Array*/data);
				},
	            error: dojo.hitch(d, "errback"),
				handleAs: "json"
			});
	        return d; // dojo.Deferred
		},
		renameFile: function(/*String*/origName, /*String*/newName, /*Function?*/onComplete, /*Function?*/onError){
			//	summary:
			//		renames a file in the app directory
			//	origName:
			//		the original name of the file
			//	newName:
			//		the new name of the file
			//	callback:
			//		a callback function once the action is complete
	        var d = new dojo.Deferred();
	        if(onComplete) d.addCallback(onComplete);
	        if(onError) d.addErrback(onError);
			return srvGeneral.xhr({
				backend: "core.app.write.rename",
				content: {
					origName: origName,
					newName: newName
				},
				load: function(data){
					d[data=="0" ? "callback" : "errback"]();
				},
	            error: dojo.hitch(d, "errback")
			});
	        return d; // dojo.Deferred
		},
		remove: function(/*String?*/name, /*String?*/filePath, /*Function?*/onComplete, /*Function?*/onError){
			//	summary:
			//		removes an app from the system
			//	name:
			//		the app's system name
			//	filePath:
			//		the path to the specific file to remove
			//	onComplete:
			//		a callback function once the app has been removed
	        //	onError:
	        //	    if there was a problem, this will be called
	        var d = new dojo.Deferred();
	        if(onComplete) d.addCallback(onComplete);
	        if(onError) d.addErrback(onError);
			var args = {};
			if(name) args.sysname = name;
			if(filePath) args.filePath = filePath;
			srvGeneral.xhr({
				backend: "core.app.write.remove",
				content: args,
				load: function(data){
					d[data=="0" ? "callback" : "errback"]();
				},
	            error: dojo.hitch(d, "errback")
			});
	        return d; // dojo.Deferred
		}
	});

	return app;
});

