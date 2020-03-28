dojo.provide("lucid.ui.applets.Taskbar");
dojo.declare("lucid.ui.applets.Taskbar", lucid.ui.Applet, {
	//	summary:
	//		A window list applet that you can minimize windows to
	dispName: "Window List",
	fullspan: true,
	_buttons: {},
	_labels: {},
	_storeconnects: [],
	_winconnects: [],
	postCreate: function(){
		dojo.addClass(this.containerNode, "desktopTaskbarApplet");
		var tbl = document.createElement("table");
		var tbody = document.createElement("tbody");
		var tr = this.trNode = document.createElement("tr");
		tbody.appendChild(tr);
		tbl.appendChild(tbody);
		this.containerNode.appendChild(tbl);
		this.inherited(arguments);
	},
	startup: function(){
		var store = lucid.ui._windowList;
		this._storeconnects = [
			dojo.connect(store, "onNew", this, "onNew"),
			dojo.connect(store, "onDelete", this, "onDelete"),
			dojo.connect(store, "onSet", this, "onSet")
		];
		store.fetch({
			onItem: dojo.hitch(this, "onNew")
		});
        this.setupLaunchApp();
	},
	uninitialize: function(){
		dojo.forEach(this._storeconnects, function(e){
			dojo.disconnect(e);
		});
        dojo.unsubscribe(this._onLaunch);
		this.inherited("uninitialize", arguments);
	},
	onSet: function(item, attribute, oldValue, v){
		var store = lucid.ui._windowList;
		if(attribute != "label") return;
		if(v.length >= 18){
			v = v.slice(0, 18) + "...";
		}
		lucid.textContent(this._labels[store.getValue(item, "id")], v);
	},
	onNew: function(item){
		var store = lucid.ui._windowList;
		var domNode=document.createElement("td");
		dojo.setSelectable(domNode, false);
		dojo.addClass(domNode, "taskBarItem");
		if(this.getParent().getOrientation() == "horizontal") dojo.addClass(domNode, "taskBarItemHorizontal");
		else dojo.addClass(domNode, "taskBarItemVertical");
		
		var v = store.getValue(item, "label");
		if(v.length >= 18){
			v = v.slice(0, 18) + "...";
		}
		
		if(store.hasAttribute(item, "icon")) domNode.innerHTML = "<div class='"+store.getValue(item, "icon")+"' style='float: left;'></div>";
		
		var labelNode = document.createElement("div");
		lucid.textContent(labelNode, v);
		domNode.appendChild(labelNode);
		
        if(store.getValue(item, "id").indexOf("load") == -1)
		    this._winconnects[store.getValue(item, "id")] = dojo.connect(domNode, "onclick", dijit.byId(store.getValue(item, "id")), "_onTaskClick");
		
		this._buttons[store.getValue(item, "id")] = domNode;
		this._labels[store.getValue(item, "id")] = labelNode;
		this.trNode.appendChild(domNode);
		if(lucid.config.fx > 0){
			dojo.style(domNode, "opacity", 0);
			dojo.fadeIn({node: domNode, duration: lucid.config.window.animSpeed}).play();
		}
        if(store.getValue(item, "id").indexOf("load") == -1)
            dijit.byId(store.getValue(item, "id"))._menu.bindDomNode(domNode);
	},
	onDelete: function(item){
		var node = this._buttons[item.id[0]];
        if(item.id[0].indexOf("load") == -1)
		    dojo.disconnect(this._winconnects[item.id[0]]);
		var onEnd = function(){
			node.parentNode.removeChild(node);
			node=null;
		}
		if (lucid.config.fx >= 1){
			var fade = dojo.fadeOut({
				node: node,
				duration: lucid.config.window.animSpeed
			});
			var slide = dojo.animateProperty({
				node: node,
				duration: 1000,
				properties: {
					width: {
						end: 0
					},
					height: {
						end: 0
					}
				}
			});
			var anim = dojo.fx.chain([fade, slide]);
			dojo.connect(slide, "onEnd", null, onEnd);
			anim.play();
		}
		else onEnd();
	},
    setupLaunchApp: function(){
        this._onLaunch = dojo.subscribe("launchApp", this, function(name){
            var id = (new Date()).toString();
    		var l = dojo.i18n.getLocalization("lucid", "system");
	    	var apploc = dojo.i18n.getLocalization("lucid", "apps");
            var store = lucid.ui._windowList;
            if(typeof dojo._loadedModules["lucid.apps."+name] != "undefined") return;
			var appName = false;
			dojo.forEach(lucid.app.appList, function(app){
				if(app.sysname == name)
					appName = "\""+(apploc[app.name] || app.name)+"\"";
			});
            var item = store.newItem({
                id: "load_"+id,
                icon: "icon-loading-indicator",
                label: l.launchingApp.replace("%s", appName || name),
                load: true
            });
            var onEnd = dojo.subscribe("launchAppEnd",this,function(){
				dojo.unsubscribe(onEnd);
				store.deleteItem(item);
			});
        });
    }
});
