define("openstar/ui/dialog",[
	"dojo",
	"dojo/data/ItemFileWriteStore",
	"dijit/Dialog",
	"qfacex/dijit/container/ContentPane",
	"dijit/layout/SplitContainer",
	"qfacex/dijit/input/TextBox",
	"qfacex/dijit/button/Button",
	"qfacex/dijit/selection/FilteringSelect",
	"qfacex/dijit/toolbar/Toolbar",
	"qfacex/dijit/menu/Menu",
	"qfacex/dijit/menu/MenuItem",
	"dojox/widget/Toaster",
	"qfacex/dijit/container/deprecated/Window",
	"openstar/desktop2/window/dialog",
	"openstar/ui/widget/FileArea",
	"openstar/services/config",
	"dojo/i18n!../nls/common",
	"dojo/i18n!../desktop/nls/places",
	"dojo/i18n!../apps/nls/accountInfo"
	
],function(dojo,ItemFileWriteStore,Dialog,ContentPane,SplitContainer,TextBox,Button,FilteringSelect,Toolbar,Menu,MenuItem,Toaster,Window,qDialog,FileArea,srvConfig,nlsCommon,nlsPlaces,nlsAccountInfo) {
	var dialog = dojo.getObject("openstar.ui.dialog",true);
		
	dojo.mixin(dialog ,qDialog,{
		//	summary:
		//		An API that provides things like dialogs and such
	    /*=====
	    _authenticationArgs: {
	        //  permission: String
	        //      The permission to authenticate
	        permission: "",
	        //  program: String?
	        //      the program that wants this authentication (for UI only)
	        program: "",
	        //  onComplete: Function
	        //      will be called if authenticated succesfully
	        onComplete: function(){},
	        //  onError: Function?
	        //      will be called if authentication failed
	        onError: function(){}
	    },
	    =====*/
		authentication: function(/*scene.dialog._authenticationArgs*/object)
		{
			//	summary:
			//		Shows a simple authentication dialog
	        var d = new dojo.Deferred();
	        if(object.onComplete) d.addCallback(object.onComplete);
	        if(object.onError) d.addErrback(object.onError);

			var cm = nlsCommon;//dojo.i18n.getLocalization("scene", "common");
			var ac = nlsAccountInfo;//dojo.i18n.getLocalization("scene.ui", "accountInfo");
			if(this.authenticationWin) this.authenticationWin.bringToFront();
			else {
			if(!object.program){ object.program = ac.unknown; }
			var times = 3;
			var success = 1;
			var win = this.authenticationWin = new Window({
				title: ac.authRequired,
				width: "450px",
				height: "350px",
				scene : object.scene,
				onClose: dojo.hitch(this, function(){
					this.authenticationWin = false;
					if(success != 0){ d.callback(); }
				}),
				showClose: false,
				showMinimize: false,
				showMaximize: false
			});
			var top = new ContentPane({region: "top", style: "padding: 20px;"});
			top.setContent(ac.sudoExplanation);
			var client = new ContentPane({region: "center", style: "padding: 40px;"});
			var row3 = document.createElement("span");
			var row1 = document.createElement("div");
			row1.innerHTML = ac.password+":&nbsp;";
			var current = new TextBox({type: "password", style: "width: 125px;"});
			row1.appendChild(current.domNode);
			var row2 = document.createElement("div");
			var authButton = this.authButton = new Button({
				label: ac.authenticate,
				onClick: dojo.hitch(this, function(){	
					scene.user.authentication({
						permission: object.permission,
						action: "set",
						password: current.getValue(),
						callback: dojo.hitch(this, function(data){
							if(data == 1 && (times - 1) != 0){ times--; row3.innerHTML = times; } //TODO: client side security? wtf are you on?!
							else { d[data == "1" ? "callback" : "errback"](); success = data; win.close(); }
						})
					})
				})
			});
			var closeButton = this.authButton = new Button({
				label: cm.close,
				onClick: dojo.hitch(win, win.close)
			});
			row2.appendChild(authButton.domNode);
			row2.appendChild(closeButton.domNode);
			var row4 = document.createElement("div");
			scene.textContent(row4, ac.attemptsRemaining+": ");
			row3.innerHTML = times;
			row4.appendChild(row3);
			var main = document.createElement("div"); main.appendChild(row1); main.appendChild(row2); main.appendChild(row4);
			client.setContent(main);
			var bottom = new ContentPane({region: "bottom", style: "padding: 20px;"});
			bottom.setContent(ac.program+": "+object.program+"<br />"+ac.action+": "+object.permission+"<br />"+ac.vendor+": "+ac.unknown);
			dojo.forEach([top, bottom, client], function(e){
				win.addChild(e);
			});
			win.show();
			win.startup();
	        setTimeout(dojo.hitch(current, "focus"), 400);

			}
			return d; // dojo.Deferred
		},
	    /*=====
	    _fileArgs: {
	        //  title: String
	        //      the title of the dialog
	        title: "",
	        //  types: Array?
	        //      array which contains an object. e.g types[0].type = "txt"; types[0].label = ".txt (Text)";
	        types: [],
	        //  onComplete: Function
	        //      a callback function. returns the path to the file/folder selected as a string
	        onComplete: function(path){},
	        //  onError: Function?
	        //      if the user hits cancel, then this will be called
	        onError: function(){}
	    },
	    =====*/
		file: function(/*scene.dialog._fileArgs*/object)
		{
			//	summary:
			//		Shows a file selector dialog
	        var d = new dojo.Deferred();
	        if(object.onComplete) d.addCallback(object.onComplete);
	        if(object.onError) d.addErrback(object.onError);
			var cm = nlsCommon;//dojo.i18n.getLocalization("scene", "common");
			var pl = nlsPlaces;//dojo.i18n.getLocalization("scene", "places");
			
			var dialog = new Window({scene : object.scene}); //Make the window
			dialog.title = object.title;
			dialog.width = "500px";
			dialog.height = "300px";
			var file = new 	FileArea({path: "file://", onItem: dojo.hitch(this, function(path){   //TODO will be modified
				d.callback(path);
				dialog.close();
			})}); //Make the fileArea
			var toolbar = new Toolbar({region: "top"});
			var layout = new SplitContainer({sizeMin: 60, sizeShare: 60}, document.createElement("div"));
			var button = new Button({
				onClick: dojo.hitch(file, "setPath", "file://"),
				iconClass: "icon-16-places-user-home",
				label: pl.Home
			});
			toolbar.addChild(button);
			var button = new Button({
				onClick: dojo.hitch(file, "up"),
				iconClass: "icon-16-actions-go-up",
				label: cm.up
			});
			toolbar.addChild(button);
			var button = new Button({
				onClick: dojo.hitch(file, "refresh"),
				iconClass: "icon-16-actions-view-refresh",
				label: cm.refresh
			});
			toolbar.addChild(button);
			dialog.addChild(toolbar);
			var client = new SplitContainer({sizeMin: 60, sizeShare: 70, region: "center"});
			var pane = new ContentPane({sizeMin: 125}, document.createElement("div"));
			var details = new ContentPane({region: "bottom"}, document.createElement("div"));
			var menu = new Menu({
				style: "width: 100%;"
			});
			dojo.forEach(srvConfig.filesystem.places, function(place){
				var item = new MenuItem({label: place.name,
					iconClass: place.icon || "icon-16-places-folder",
					onClick: dojo.hitch(file, "setPath", place.path)
				});
				menu.addChild(item);
			}, this);
			pane.setContent(menu.domNode);
	   		var address = new TextBox({value: "file://"});
			if(object.types){
				var store = this.internalStore = new ItemFileWriteStore({
					data: {
						identifier: "type",
						label: "label",
						items: object.types
					}
				});
				store.newItem({type: "", label: ""});
				var select = new FilteringSelect({
					store: store
				});
			}
			var button = new Button({label: cm.loadOrSave, onClick: dojo.hitch(this, function(){ 
				var solved = false;
				dojo.forEach(file.getChildren(), function(item){ //Works for existing files
					if(item.type=="text/directory"){ // Is it a directory?
						if(file.path+item.name == address.getValue()){
							file.setPath(file.path+item.name);
							solved = true;
							return;
						}
					}
					else {
						if(file.path+item.name == address.getValue()){ // Is it a file?
							d.callback(file.path+item.name);
							dialog.close();
							solved = true;
							return;
						}
					}		
				});
				if(!solved){ //Are we creating a new file?
					d.callback(address.getValue());
					dialog.close();
				}
			})});
			var ablah = new Button({label: cm.cancel, onClick: dojo.hitch(this, function(){
				d.errback();
				dialog.close();
			})});
			var all = document.createElement("div");
			var line = document.createElement("div");
	        var p = document.createElement("span");
			p.innerHTML = cm.path+":";
			line.appendChild(p);
			line.appendChild(address.domNode);
			if(object.types) line.appendChild(select.domNode);
			line.appendChild(button.domNode);
			line.appendChild(ablah.domNode);
			all.appendChild(line);
			details.setContent(all);
			file.onPathChange = dojo.hitch(this, function(path){ address.setValue(path); });
			file.onHighlight = dojo.hitch(this, function(path){ address.setValue(path); });
			client.addChild(pane);
			layout.addChild(file);
			client.addChild(layout);
			dialog.addChild(client);
			dialog.addChild(details);
			dialog.showClose = false;
			dialog.show();
	        file.startup();
			file.refresh();
			dialog.startup();
	        return d; // dojo.Deferred
		},
		init: function(){
//			qface.addDojoCss("dojox/widget/Toaster/Toaster.css"); //TODO: theme it!
			var toaster = new Toaster({
				messageTopic: "scene_notification",
				positionDirection: srvConfig.toasterPos
			});
			document.body.appendChild(toaster.domNode);
			dojo.subscribe("configApply", function(){
				toaster.positionDirection = srvConfig.toasterPos;
			});
		}
	});
	
	return dialog;

});

