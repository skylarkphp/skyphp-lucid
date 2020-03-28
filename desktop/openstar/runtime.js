define("openstar/runtime" ,[
   	 "qface/runtime"
],function(qfRuntime) {
	var runtime = dojo.getObject("openstar.runtime",true);
	
    dojo.mixin(runtime,qfRuntime,{
		plugins: [],
		extensionPoints: [],
		subscriptions: [],
		currentSelection: [],
		commandStack: new CommandStack(),
		
		addPlugin: function(pluginName) {
			url = pluginName + ".plugin";
			dojo.xhrGet( {
				// The following URL must match that used to test
				// the server.
				url:url,
				handleAs:"json",
				sync:true,
				load: function(responseObject, ioArgs) {
					runtime._loadPlugin(responseObject,url);
				}
			});
		},

		getUser: function() {
			
			if(this._userInfo) {
				return this._userInfo;
			}
			
			this._userInfo = runtime.serverJSONRequest({
				url: "cmd/getUserInfo",
				handleAs: "json",
				content:{},
				sync:true
			});

			return this._userInfo;
		},
		
		/*
		 * Based on the information available, provides an appropriate string to
		 * display that identifies the user. 
		 * 
		 * userInfo should be of the form:
		 * 
		 * 		{
		 * 			email: "person@place.com",
		 *			isLocalInstall: "false",
		 * 			userFirstName: "",
		 *			userId: "A",
		 *			userLastName: "";
		 * 		}
		 * 
		 * Because of the current user sign-up we have with Orion, we're not making 
		 * any attempt to honor userId. In the future, it would be nice if the server
		 * could signal us if userId is appropriate.
		 * 
		 * If userInfo is undefined, then the function will look up the info for the
		 * current user.
		 * 
		 */
		getUserDisplayName: function(userInfo) {
			if (!userInfo) {
				userInfo = this.getUser();
			}

			// Can't reliably use userId anymore (because of Orion), so first try first name and then
			// drop back to e-mail
			var displayName = userInfo.userFirstName;
			if (!userInfo.userFirstName) {
				displayName = userInfo.email;
			}
			return displayName;		
		},
		
		/*
		 * The goal is to return a string of the form:
		 * 
		 * 		displayName <email>
		 * 
		 * such as
		 * 
		 * 		Joe <joesmith@place.com>
		 * 
		 * but if displayName = email, then email will be returned.
		 * 
		 */
		getUserDisplayNamePlusEmail: function(userInfo) {
			if (!userInfo) {
				userInfo = this.getUser();
			}
			
			var result = this.getUserDisplayName(userInfo);
			
			if (result != userInfo.email) {
				result += " &lt;" + userInfo.email + "&gt;";
			}

			return result;
		},
		
		loadPlugins: function() {
			plugins.forEach(function(plugin) {
				var pluginID = plugin.id;
				runtime.plugins[pluginID] = plugin;
				for (var id in plugin) {
					var extension = plugin[id];
					if (typeof extension != "string") {
						if (extension instanceof Array) {
							extension.forEach(function(ext) {
								runtime._addExtension(id, ext, pluginID);
							});
						} else {
							runtime._addExtension(id, extension, pluginID);
						}
					}
				}
			});
		},

		singleUserMode: function() {
			return runtime.isLocalInstall;
		},

		/*
		 * If in single user mode, returns the current active project.
		 * 
		 */
		
		location: function(){
			return document.location.href.split("?")[0];
		},

		getUserWorkspaceUrl: function(){
			var loc = this.location();
			//FIXME: replace this stuff with a regexp
			if (loc.charAt(loc.length-1)=='/'){
				loc=loc.substring(0,loc.length-1);
			}
			var workspaceUrl=loc+'/user/'+runtime.userName+'/ws/workspace/';
			return workspaceUrl;
		},

		run: function() {
			// add class to root HTML element to indicate if mac or windows
			// this is because of different alignment on mac/chrome vs win/chrome
			// FIXME: this platform-dependent logic might not be necessary if
			// main toolbar changes or different CSS applies to that toolbar
			if (dojo.isMac) {
				dojo.addClass(document.documentElement,"isMac");
			}
			
		    // determine if the browser supports CSS3 transitions
		    var thisStyle = document.body.style;
		    runtime.supportsCSS3Transitions = thisStyle.WebkitTransition !== undefined ||
		        thisStyle.MozTransition !== undefined ||
		        thisStyle.OTransition !== undefined ||
		        thisStyle.transition !== undefined;
			
		    runtime.subscribe("/davinci/ui/selectionChanged",runtime._selectionChanged);
			
			// intercept BS key - prompt user before navigating backwards
			dojo.connect(dojo.doc.documentElement, "onkeypress", function(e){
				if(e.charOrCode==8){
					window.davinciBackspaceKeyTime = Date.now();
				}
			});	
			UserActivityMonitor.setUpInActivityMonitor(dojo.doc);

			// add key press listener
			dojo.connect(dojo.doc.documentElement, "onkeydown", this, "_handleGlobalDocumentKeyEvent");
					
			dojo.addOnUnload(function (e) {
				//This will hold a warning message (if any) that we'll want to display to the
				//user.
				var message = null;
				
				//Loop through all of the editor containers and give them a chance to tell us
				//the user should be warned before leaving the page.
				var editorContainers = davinci.Workbench.editorTabs.getChildren();
				var editorsWithWarningsCount = 0;
				for (var i = 0; i < editorContainers.length; i++) {
					var editorContainer = editorContainers[i];
					if (editorContainer.editor) {
						var editorResponse = editorContainer.editor.getOnUnloadWarningMessage();

						if (editorResponse) {
							//Let's keep track of the first message. If we end up finding multiple messages, we'll
							//augment what the user will see shortly.
							if (!message) {
								message = editorResponse;
							}
							editorsWithWarningsCount++;
						}
					}
				}
				//If multiple warnings, augment message user will see
				if (editorsWithWarningsCount > 1) {
					message = dojo.string.substitute(webContent.multipleFilesUnsaved, [message, editorsWithWarningsCount]);
				}
				
				if (!message) {
					//No warnings so far, let's see if use maybe accidentally hit backspace
					var shouldDisplayForBackspace = Date.now() - window.davinciBackspaceKeyTime < 100;
					if (shouldDisplayForBackspace) {
						message = webContent.careful;
					}
				}
				
				if (message) {
					// We've found warnings, so we want to warn the user they run the risk of 
					// losing data if they leave the page.
					
					// For Mozilla/IE, we need to see the return value directly on the 
					// event. But, note in FF 4 and later that the browser ignores our
					// message and uses a default message of its own.
					if (e = e || window.event) {
						e.returnValue = message;
					}
					
					// For other browsers (like Chrome), the message returned by the
					// handler is honored.
					return message;
				}
			});
		},
		
		subscribe: function(topic,func) {
			runtime.subscriptions.push(dojo.subscribe(topic,this,func));
		},
		
		destroy: function() {
			dojo.forEach(runtime.subscriptions, dojo.unsubscribe);
			UserActivityMonitor.destroy();
		},
		
		_addExtension: function(id, extension, pluginID) {
			if (extension.id) {
				extension.id = pluginID + "." + extension.id;
			}

			runtime.extensionPoints[id] = runtime.extensionPoints[id] || [];
			var extensions = runtime.extensionPoints[id];
			extensions.push(extension);
			runtime.extensionPoints[id] = extensions;
		},
		
		getExtensions: function(extensionID, testFunction) {
			
			var extensions = runtime.extensionPoints[extensionID];
			if (testFunction) {
				var matching=[];
				var isFunction = testFunction instanceof Function;
				if (extensions) {
					return extensions.filter(function(ext) {
						return (isFunction && testFunction(ext)) || ext.id == testFunction;
					});
				}
			}
			return extensions;
		},
		
		getExtension: function(extensionID, testFunction) {
			return runtime.getExtensions(extensionID, testFunction)[0];
		},

		handleError: function(error) {
			var redirectUrl = "welcome";
			if(runtime.singleUserMode()){
				redirectUrl = ".";
			}
			
			window.document.body.innerHTML = dojo.string.substitute(webContent.serverConnectError, {redirectUrl:redirectUrl, error: error});
		},

		executeCommand: function(cmdID) {
			var cmd=runtime.getExtension("davinci.commands", cmdID);
			if (cmd && cmd.run) {
				cmd.run();
			}
		},
		
		_selectionChanged: function(selection) {
			runtime.currentSelection=selection;
		},
		
		getSelection: function() {
			return runtime.currentSelection;
		},

		doLogin: function() {
			var retry=true;
			var formHtml = "<table>" +
	        "<tr><td><label for=\"username\">User: </label></td>" +
	        "<td><input dojoType=\dijit.form.TextBox\ type=\"text\" name=\"username\" id='username' ></input></td></tr>" +
	        "<tr><td><label for=\"password\">Password: </label></td> <td><input dojoType=\"dijit.form.TextBox\" type=\"password\" name=\"password\" id='password'></input></td></tr>" +
	        "<tr><td colspan=\"2\" align=\"center\"><button dojoType=\"dijit.form.Button\" type=\"submit\" >Login</button></td>" +
	        "</tr></table>"; // FIXME: i18n
			do {
				var isInput=false;
				var dialog = new Dialog({
					id: "connectDialog",
					title: "Please login", 
					onExecute: function(){
						dojo.xhrGet({
							url: "cmd/login",
							sync: true,
							handleAs: "text",
							content:{
							    userName: dojo.byId("username").value,
							    password: dojo.byId("password").value,
							    noRedirect: true
							}
						}).then(function(result) {
							if (result=="OK") {
							    // cheap fix.
							    //window.location.reload();
							    window.location.href= 'welcome';
							    //retry=false;
							} else {
							    console.warn("Unknown error: result="+result);
							}
						    }, function(error) {
						    	console.warn("Login error", error);
						    });
						isInput=true;
					},
					onCancel:function(){
					    isInput=true;
					    runtime.destroyRecursive(false);
					}
				});	
				dialog.setContent(formHtml);
				dialog.show();			
			} while (retry);
		},
		
		// deprecated.  will fail for async.  use dojo/_base/xhr directly
		serverJSONRequest: function (ioArgs) {
			var resultObj;
			var args = {handleAs: "json"};
			dojo.mixin(args, ioArgs);

			dojo.xhrGet(args).then(function(result) {
				if (result) {
					resultObj=result;
				}
			});

			return resultObj;
		},

		logoff: function(args) {
			var loading = dojo.create("div",null, dojo.body(), "first");
			loading.innerHTML='<table><tr><td><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>&nbsp;Logging off...</td></tr></table>'; // FIXME: i18n
			dojo.addClass(loading, 'loading');
			require("davinci/Workbench").unload();
			runtime.serverJSONRequest({
				url:"cmd/logoff", handleAs:"text", sync:true
			});
			var newLocation = runtime.location(); //
			var lastChar=newLocation.length-1;
			if (newLocation.charAt(lastChar)=='/') {
				newLocation=newLocation.substr(0,lastChar);
			}
			location.href = newLocation+"/welcome";
		},


		registerKeyBinding: function(keyBinding, pluginAction) {
			if (!this._globalKeyBindings) {
				this._globalKeyBindings = [];
			}

			this._globalKeyBindings.push({keyBinding: keyBinding, action: pluginAction});
		},

		/* called by any widgets that pass in events from other documents, so iframes from editors */
		handleKeyEvent: function(e) {
			this._handleKeyEvent(e, true);
		},

		/* called when events are trigged on the main document */
		_handleGlobalDocumentKeyEvent: function(e) {
			this._handleKeyEvent(e);
		},

		_handleKeyEvent: function(e, isFromSubDocument) {
			if (!this._globalKeyBindings) {
				return;
			}

			var stopEvent = false;

			stopEvent = dojo.some(this._globalKeyBindings, dojo.hitch(this, function(globalBinding) {
				if (runtime.isKeyEqualToEvent(globalBinding.keyBinding, e)) {
					davinci.Workbench._runAction(globalBinding.action);
					return true;
				}
			}));

			if (stopEvent) {
				dojo.stopEvent(e);
			} else if (!isFromSubDocument) {
				// if not from sub document, let the active editor take a stab
				if (this.currentEditor && this.currentEditor.handleKeyEvent) {
					// pass in true to tell it its a global event
					this.currentEditor.handleKeyEvent(e, true);
				}
			}
		},

		// compares keybinding to event
		isKeyEqualToEvent: function(keybinding, e) {
			var equal = true;

			var hasAccel = ((e.ctrlKey && !dojo.isMac) || (dojo.isMac && e.metaKey))
			var hasMeta = ((e.altKey && !dojo.isMac) || (dojo.isMac && e.ctrlKey))


			if (!!keybinding.accel !== hasAccel) {
				equal = false;
			}

			if (!!keybinding.meta !== hasMeta) {
				equal = false;
			}

			if (!!keybinding.shift !== e.shiftKey) {
				equal = false;
			}

			if (equal && keybinding.charOrCode && e.which) {
				if (dojo.isArray(keybinding.charOrCode)) {
					equal = dojo.some(keybinding.charOrCode, dojo.hitch(this, function(charOrCode) {
						return this._comparecharOrCode(charOrCode, e);
					}));
				} else {
					equal = this._comparecharOrCode(keybinding.charOrCode, e);
				}
			}

			return equal;
		},

		_comparecharOrCode: function(charOrCode, e) {
			var equal;

			if (dojo.isString(charOrCode)) {
				// if we have a string, use fromCharCode
				equal = (charOrCode.toLowerCase() === String.fromCharCode(e.which).toLowerCase());
			} else {
				equal = (charOrCode === e.which);
			}

			return equal;
		},
		_loadApp : function(app){
		    //declared outside of security scope so apps can't access security variables
		    dojo.require("desktop.apps."+app,true);
//		    desktop.registerModule("desktop.apps."+app);
//			require(["desktop/apps/"+app],function(){
//		    });
		},
		addDojoCss :function(/*String*/path){
			//	summary:
			//		Adds an additional dojo CSS file (useful for the dojox modules)
			//
			//	path:
			//		the path to the css file (the path to dojo is placed in front)
			//	
			//	example:
			//	|	api.addDojoCss("/dojox/widget/somewidget/foo.css");
			var element = document.createElement("link");
			element.rel = "stylesheet";
			element.type = "text/css";
			element.media = "screen";
			element.href = "./dojotoolkit/"+path;
			document.getElementsByTagName("head")[0].appendChild(element);
		}
	}
);


return runtime;
});

