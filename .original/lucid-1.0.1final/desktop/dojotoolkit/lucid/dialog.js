dojo.provide("lucid.dialog");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dojox.widget.Toaster");
dojo.require("dijit.Dialog");
dojo.requireLocalization("lucid", "common");

lucid.dialog = {
	//	summary:
	//		An API that provides things like dialogs and such
    /*=====
    _alertArgs: {
        //  title: String
        //      the title of the dialog
        title: "",
        //  message: String
        //      the message to be shown in the body of the window
        message: "",
        //  onComplete: Function?
        //      a function that is called when the dialog is closed
        onComplete: function(){},
        //  onError: Function?
        //      since there's no way this can result in an error, this is never called. It's just here because this function uses dojo.Deferred.
        onError: function(){}
    },
    =====*/
	alert: function(/*lucid.dialog._alertArgs*/object)
	{
		//	summary:
		//		Shows a simple alert dialog
        var d = new dojo.Deferred();
        if(object.onComplete) d.addCallback(object.onComplete);
        if(object.onError) d.addErrback(object.onError);

		var div = dojo.doc.createElement("div");
		div.innerHTML = "<center> "+(object.message||"")+" </center>";
		var box = new dijit.Dialog({title: object.title, style: object.style || ""}, div);
		box.show();
		dojo.connect(box, 'onUnload', d, "callback");
        return d; // dojo.Deferred
	},
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
	authentication: function(/*lucid.dialog._authenticationArgs*/object)
	{
		//	summary:
		//		Shows a simple authentication dialog
        var d = new dojo.Deferred();
        if(object.onComplete) d.addCallback(object.onComplete);
        if(object.onError) d.addErrback(object.onError);

		var cm = dojo.i18n.getLocalization("lucid", "common");
		var ac = dojo.i18n.getLocalization("lucid.ui", "accountInfo");
		if(this.authenticationWin) this.authenticationWin.bringToFront();
		else {
		if(!object.program){ object.program = ac.unknown; }
		var times = 3;
		var success = 1;
		var win = this.authenticationWin = new lucid.widget.Window({
			title: ac.authRequired,
			width: "450px",
			height: "350px",
			onClose: dojo.hitch(this, function(){
				this.authenticationWin = false;
				if(success != 0){ d.callback(); }
			}),
			showClose: false,
			showMinimize: false,
			showMaximize: false
		});
		var top = new dijit.layout.ContentPane({region: "top", style: "padding: 20px;"});
		top.setContent(ac.sudoExplanation);
		var client = new dijit.layout.ContentPane({region: "center", style: "padding: 40px;"});
		var row3 = document.createElement("span");
		var row1 = document.createElement("div");
		row1.innerHTML = ac.password+":&nbsp;";
		var current = new dijit.form.TextBox({type: "password", style: "width: 125px;"});
		row1.appendChild(current.domNode);
		var row2 = document.createElement("div");
		var authButton = this.authButton = new dijit.form.Button({
			label: ac.authenticate,
			onClick: dojo.hitch(this, function(){	
				lucid.user.authentication({
					permission: object.permission,
					action: "set",
					password: current.getValue(),
					callback: dojo.hitch(this, function(data){
						if(data == 1 && (times - 1) != 0){ times--; row3.innerHTML = times; } //TODO: client side security? wtf are you on?!
						else { d[data == "1" ? "callback" : "errback"](); success = data; win.close(); }
					})
				})
			})
		})
		var closeButton = this.authButton = new dijit.form.Button({
			label: cm.close,
			onClick: dojo.hitch(win, win.close)
		});
		row2.appendChild(authButton.domNode);
		row2.appendChild(closeButton.domNode);
		var row4 = document.createElement("div");
		lucid.textContent(row4, ac.attemptsRemaining+": ");
		row3.innerHTML = times;
		row4.appendChild(row3);
		var main = document.createElement("div"); main.appendChild(row1); main.appendChild(row2); main.appendChild(row4);
		client.setContent(main);
		var bottom = new dijit.layout.ContentPane({region: "bottom", style: "padding: 20px;"});
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
    _inputArgs: {
        //  title: String
        //      the title of the dialog
        title: "",
        //  message: String
        //      the message to display above the text field and buttons
        message: "",
        //  initial: String?
        //      the initial contents fo the text field
        initial: "",
        //  onComplete: Function
        //      a callback function, The first argument is the text that was inputted into the dialog
        onComplete: function(text){},
        //  onError: Function
        //      if the user closed the dialog box or hit cancel, then this will be called.
        onError: function(){}
    },
    =====*/
	input: function(/*lucid.dialog._inputArgs*/object)
	{
		//	summary:
		//		A dialog with a text field
		//	example:
		//	|	lucid.dialog.input({title: "UI Test", message: "What is your name?", onComplete: lucid.log});
        var d = new dojo.Deferred();
        if(object.onComplete) d.addCallback(object.onComplete);
        if(object.onError) d.addErrback(object.onError);

		var cm = dojo.i18n.getLocalization("lucid", "common");
		var dialog = new lucid.widget.Window();
		dialog.title = object.title;
		dialog.width = "400px";
		dialog.height = "150px";
		var onClose = dojo.connect(dialog, "onClose", null, function(){d.errback()});
		var details = new dijit.layout.ContentPane({region: "center"}, document.createElement("div"));
		var text = new dijit.form.TextBox({value: object.initial || ""});
		var all = document.createElement("div");
		var blah = new dijit.form.Button({label: cm.ok, onClick: dojo.hitch(this, function(){  dojo.disconnect(onClose); d.callback(text.getValue()); dialog.close(); })});
		var ablah = new dijit.form.Button({label: cm.cancel, onClick: dojo.hitch(this, function(){  dojo.disconnect(onClose); d.errback(); dialog.close(); })});
		var line = document.createElement("div");
        var p = document.createElement("span");
		var q = document.createElement("span");
		p.innerHTML = "<center>"+(object.message||"")+"</center>";
		line.appendChild(p);
		all.appendChild(line);
		all.style.textAlign = "center";
		all.appendChild(text.domNode);
		all.appendChild(blah.domNode);
		all.appendChild(ablah.domNode);
		details.setContent(all);
		dialog.addChild(details);
		dialog.showClose = false;
		dialog.show();
		dialog.startup();
        setTimeout(dojo.hitch(text, "focus"), 400);
        dojo.connect(text.domNode, "onkeyup", this, function(e){
            if(e.keyCode == dojo.keys.ENTER)
                blah.onClick();
        });
        return d; // dojo.Deferred
	},
    /*=====
    _yesnoArgs: {
        //  title: String
        //      the title of the dialog
        title: "",
        //  message: String
        //      the message to display above the yes/no buttons
        message: "",
        //  onComplete: Function
        //      called with what the user chose. The first argument is true if the user selected 'yes', or false if they selected 'no'.
        onComplete: function(result){},
        //  onError: Function?
        //      if the user closed the dialog without choosing, this will be called.
    },
    =====*/
	yesno: function(/*lucid.dialog._yesnoArgs*/object)
	{
		//	summary:
		//		A yes or no dialog
		//	example:
		//	|	lucid.dialog.yesno({title: "UI Test", message: "Did you sign your NDA?", onComplete: function(p){
		//	|		if(p) alert("Good for you!");
		//	|		else alert("Then sign it allready!");
		//	|	}});
		
        var d = new dojo.Deferred();
        if(object.onComplete) d.addCallback(object.onComplete);
        if(object.onError) d.addErrback(object.onError);
		var cm = dojo.i18n.getLocalization("lucid", "common");
		var dialog = new lucid.widget.Window();
		dialog.title = object.title;	
		dialog.width = "400px";
		dialog.height = "150px";
		var onClose = dojo.connect(dialog, "onClose", null, function(){d.errback();});
		var details = new dijit.layout.ContentPane({region: "center"}, document.createElement("div"));
		var all = document.createElement("div");
		var blah = new dijit.form.Button({label: cm.yes, onClick: dojo.hitch(this, function(){ dojo.disconnect(onClose); d.callback(true); dialog.close(); })});
		var ablah = new dijit.form.Button({label: cm.no, onClick: dojo.hitch(this, function(){ dojo.disconnect(onClose); d.callback(false); dialog.close(); })});
		var line = document.createElement("div");
        var p = document.createElement("span");
		var q = document.createElement("span");
		p.innerHTML = "<center>"+(object.message||"")+"</center>";
		line.appendChild(p);
		all.appendChild(line);
		all.style.textAlign = "center";
		all.appendChild(blah.domNode);
		all.appendChild(ablah.domNode);
		details.setContent(all);
		dialog.addChild(details);
		dialog.showClose = false;
		dialog.show();
		dialog.startup();
        setTimeout(dojo.hitch(blah, "focus"), 400);
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
	file: function(/*lucid.dialog._fileArgs*/object)
	{
		//	summary:
		//		Shows a file selector dialog
        var d = new dojo.Deferred();
        if(object.onComplete) d.addCallback(object.onComplete);
        if(object.onError) d.addErrback(object.onError);
		var cm = dojo.i18n.getLocalization("lucid", "common");
		var pl = dojo.i18n.getLocalization("lucid", "places");
		dojo.require("dijit.layout.SplitContainer");
		dojo.require("dijit.layout.LayoutContainer");
		//dojo.require("dijit.form.FilteringSelect");
		dojo.require("dijit.Toolbar");
		dojo.require("dijit.Menu");
		var dialog = new lucid.widget.Window(); //Make the window
		dialog.title = object.title;
		dialog.width = "500px";
		dialog.height = "300px";
		var file = new lucid.widget.FileArea({path: "file://", onItem: dojo.hitch(this, function(path){
			d.callback(path);
			dialog.close();
		})}); //Make the fileArea
		var toolbar = new dijit.Toolbar({region: "top"});
		var layout = new dijit.layout.SplitContainer({sizeMin: 60, sizeShare: 60}, document.createElement("div"));
		var button = new dijit.form.Button({
			onClick: dojo.hitch(file, "setPath", "file://"),
			iconClass: "icon-16-places-user-home",
			label: pl.Home
		});
		toolbar.addChild(button);
		var button = new dijit.form.Button({
			onClick: dojo.hitch(file, "up"),
			iconClass: "icon-16-actions-go-up",
			label: cm.up
		});
		toolbar.addChild(button);
		var button = new dijit.form.Button({
			onClick: dojo.hitch(file, "refresh"),
			iconClass: "icon-16-actions-view-refresh",
			label: cm.refresh
		});
		toolbar.addChild(button);
		dialog.addChild(toolbar);
		var client = new dijit.layout.SplitContainer({sizeMin: 60, sizeShare: 70, region: "center"});
		var pane = new dijit.layout.ContentPane({sizeMin: 125}, document.createElement("div"));
		var details = new dijit.layout.ContentPane({region: "bottom"}, document.createElement("div"));
		var menu = new dijit.Menu({
			style: "width: 100%;"
		});
		dojo.forEach(lucid.config.filesystem.places, function(place){
			var item = new dijit.MenuItem({label: place.name,
				iconClass: place.icon || "icon-16-places-folder",
				onClick: dojo.hitch(file, "setPath", place.path)
			});
			menu.addChild(item);
		}, this);
		pane.setContent(menu.domNode);
   		var address = new dijit.form.TextBox({value: "file://"});
		if(object.types){
			var store = this.internalStore = new dojo.data.ItemFileWriteStore({
				data: {
					identifier: "type",
					label: "label",
					items: object.types
				}
			});
			store.newItem({type: "", label: ""});
			var select = new dijit.form.FilteringSelect({
				store: store
			});
		}
		var button = new dijit.form.Button({label: cm.loadOrSave, onClick: dojo.hitch(this, function(){ 
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
		var ablah = new dijit.form.Button({label: cm.cancel, onClick: dojo.hitch(this, function(){
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
    /*=====
    _notifyArgs: {
        //  message: String
        //      the message to show
        message: "",
        //  type: String?
        //      the type of message. can be "message", "warning", "error", or "fatal"
        type: "message",
        //  duration: Integer?
        //      how long the message will be displayed in miliseconds
        duration: 5000
    },
    =====*/
	notify: function(/*String|lucid.dialog._notifyArgs*/message)
	{
		//	summary:
		//		Show a toaster popup (similar to libnotify)
		dojo.publish("desktop_notification", [message]);
	},
	init: function(){
		lucid.addDojoCss("dojox/widget/Toaster/Toaster.css"); //TODO: theme it!
		var toaster = new dojox.widget.Toaster({
			messageTopic: "desktop_notification",
			positionDirection: lucid.config.toasterPos
		});
		document.body.appendChild(toaster.domNode);
		dojo.subscribe("configApply", function(){
			toaster.positionDirection = lucid.config.toasterPos;
		})
	}
}
