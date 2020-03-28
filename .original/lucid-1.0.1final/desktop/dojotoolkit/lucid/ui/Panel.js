dojo.provide("lucid.ui.Panel");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit._Container");
dojo.require("dijit.Menu");
dojo.require("dijit.form.Button");
dojo.requireLocalization("lucid.ui", "panel");
dojo.requireLocalization("lucid.ui", "applets");
dojo.requireLocalization("lucid", "common");
dojo.declare("lucid.ui.Panel", [dijit._Widget, dijit._Templated, dijit._Container], {
	//	summary:
	//		A customizable toolbar that you can reposition and add/remove/reposition applets on
	templateString: "<div class=\"desktopPanel\" dojoAttachEvent=\"onmousedown:_onClick, oncontextmenu:_onRightClick\"><div class=\"desktopPanel-start\"><div class=\"desktopPanel-end\"><div class=\"desktopPanel-middle\" dojoAttachPoint=\"containerNode\"></div></div></div></div>",
	//	span: Float
	//		a number between 0 and 1 indicating how far the panel should span accross (1 being the whole screen, 0 being none)
	span: 1,
	//	opacity: Float
	//		a number between 0 and 1 indicating how opaque the panel should be (1 being visible, 0 being completely transparent)
	opacity: 1,
	//	thickness: Integer
	//		how thick the panel should be in pixels
	thickness: 24,
	//	locked: Boolean
	//		are the applets and the panel itself be repositionable?
	locked: false,
	//	placement: String
	//		where the panel should be placed on the screen. 
	//		acceptible values are "BL", "BR", "BC", "TL", "TR", "TC", "LT", "LB", "LC", "RT", "RB", or "RC".
	//		The first character indicates the edge, the second character indicates the placement.
	//		R = right, L = left, T = top, and B = bottom.
	//		So LT would be on the left edge on the top corner.
	placement: "BL",
	getOrientation: function(){
		//	summary:
		//		Gets the orientation of the panel
		//	returns:
		//		"horizontal" or "vertical"
		var s = this.placement.charAt(0);
		return (s == "B" || s == "T") ? "horizontal" : "vertical";
	},
	_onClick: function(e){
		//	summary:
		//		Event handler for when the mouse is pressed. Makes various event connections.
		if(!this.locked){
			this._docMouseUpEvent = dojo.connect(document, "onmouseup", this, "_onRelease");
			this._onOutEvent = dojo.connect(this.domNode, "onmouseout", this, function(){
				dojo.disconnect(this._onOutEvent);
				this._onDragEvent = dojo.connect(document, "onmousemove", this, "_onMove");
				this._docEvents = [
					dojo.connect(document, "ondragstart", dojo, "stopEvent"),
					dojo.connect(document, "onselectstart", dojo, "stopEvent")
				];
				this._docMouseUpEvent = dojo.connect(document, "onmouseup", this, "_onRelease");
			});
		}
		dojo.stopEvent(e);
	},
	_onRightClick: function(e){
		//	summary:
		//		Event handler for when the right mouse button is pressed. Shows the panel's context menu.
		var l = dojo.i18n.getLocalization("lucid.ui", "panel");
		if(this.menu) this.menu.destroy();
		this.menu = new dijit.Menu({});
		this.menu.addChild(new dijit.MenuItem({label: l.addToPanel, iconClass: "icon-16-actions-list-add", onClick: dojo.hitch(this, this.addDialog)}));
		this.menu.addChild(new dijit.MenuItem({label: l.properties, iconClass: "icon-16-actions-document-properties", onClick: dojo.hitch(this, this.propertiesDialog)}));
		this.menu.addChild(new dijit.MenuItem({label: l.deletePanel, iconClass: "icon-16-actions-edit-delete", disabled: (typeof dojo.query(".desktopPanel")[1] == "undefined"), onClick: dojo.hitch(this, function(){
			//TODO: animate?
			this.destroy();
		})}));
		this.menu.addChild(new dijit.MenuSeparator);
		if(this.locked){
			this.menu.addChild(new dijit.MenuItem({label: l.unlock, onClick: dojo.hitch(this, this.unlock)}));
		}
		else {
			this.menu.addChild(new dijit.MenuItem({label: l.lock, onClick: dojo.hitch(this, this.lock)}));
		}
		this.menu.addChild(new dijit.MenuSeparator);
		this.menu.addChild(new dijit.MenuItem({label: l.newPanel, iconClass: "icon-16-actions-document-new", onClick: dojo.hitch(this, function(){
			var p = new lucid.ui.Panel();
			lucid.ui._area.domNode.appendChild(p.domNode);
			p.startup();
		})}));
		this.menu._contextMouse();
		this.menu._openMyself(e);
		//TODO: destroy menu when blurred?
	},
	propertiesDialog: function(){
		//	summary:
		//		Shows a small properties dialog for the panel.
		var l = dojo.i18n.getLocalization("lucid.ui", "panel");
		var c = dojo.i18n.getLocalization("lucid", "common");
		if(this.propertiesWin){
			this.propertiesWin.bringToFront();
			return;
		}
		var win = this.propertiesWin = new lucid.widget.Window({
			title: l.panelProperties,
			width: "180px",
			height: "200px",
			onClose: dojo.hitch(this, function(){
				this.propertiesWin = false;
			})
		});
		var client = new dijit.layout.ContentPane({region: "center", style: "padding: 5px;"});
		var div = document.createElement("div");
		var rows = {
			width: {
				widget: "HorizontalSlider",
				params: {
					maximum: 1,
					minimum: 0.01,
					value: this.span,
					showButtons: false,
					onChange: dojo.hitch(this, function(value){
						this.span = value;
						this._place();
					})
				}
			},
			thickness: {
				widget: "NumberSpinner",
				params: {
					constraints: {min: 20, max: 200},
					value: this.thickness,
					style: "width: 60px;",
					onChange: dojo.hitch(this, function(value){
						this.thickness = value;
						dojo.style(this.domNode, this.getOrientation() == "horizontal" ? "width" : "height", this.thickness+"px");
						this._place();
					})
				}
			},
			opacity: {
				widget: "HorizontalSlider",
				params: {
					maximum: 1,
					minimum: 0.1,
					value: this.opacity,
					showButtons: false,
					onChange: dojo.hitch(this, function(value){
						this.opacity = value;
						dojo.style(this.domNode, "opacity", value);
					})
				}
			}
		};
		for(var key in rows){
			var row = document.createElement("div");
			dojo.style(row, "marginBottom", "5px");
			row.innerHTML = (l[key] || key)+":&nbsp;";
			row.appendChild(new dijit.form[rows[key].widget](rows[key].params).domNode);
			div.appendChild(row);
		};
		client.setContent(new dijit.form.Form({}, div).domNode);
		win.addChild(client);
		var bottom = new dijit.layout.ContentPane({region: "bottom", style: "height: 40px;"});
		var button = new dijit.form.Button({label: c.close});
		bottom.setContent(button.domNode);
		win.addChild(bottom);
		dojo.connect(button, "onClick", this, function(){
			this.propertiesWin.close();
		});
		win.show();
		win.startup();
	},
	addDialog: function(){
		//	summary:
		//		Shows the "Add to panel" dialog so the user can add applets
		var l = dojo.i18n.getLocalization("lucid.ui", "panel");
		var a = dojo.i18n.getLocalization("lucid.ui", "applets");
		var c = dojo.i18n.getLocalization("lucid", "common");
		if(this.window){
			this.window.bringToFront();
			return;
		}
		var win = this.window = new lucid.widget.Window({
			title: l.addToPanel,
			onClose: dojo.hitch(this, function(){
				this.window = false;
			})
		});
		var client = new dijit.layout.ContentPane({region: "center", style: "border: 1px solid black;"});
		this.addDialogSelected = "";
		this.addDialogIcons = [];
		var div = document.createElement("div");
		dojo.forEach([
			{k: "overflow", v: "auto"},
			{k: "width", v: "100%"},
			{k: "height", v: "100%"}
		], function(i){
			dojo.style(div, i.k, i.v);
		});
		for(var key in lucid.ui.appletList){
			var header = document.createElement("div");
			dojo.style(header, {
				textSize: "larger",
				fontWeight: "bold",
				marginTop: "10px"
			})
			lucid.textContent(header, a[key] || key);
			div.appendChild(header);
			div.appendChild(document.createElement("hr"));
			for(var applet in lucid.ui.appletList[key]){
				var name = lucid.ui.appletList[key][applet];
				var iconClass = lucid.ui.applets[name].prototype.appletIcon;
				var dispName = lucid.ui.applets[name].prototype.dispName;
				dispName = a[dispName] || dispName;
				c = document.createElement("div");
				c.name = name;
				dojo.addClass(c, "dijitInline");
				dojo.style(c, "padding", "5px");
				c.innerHTML = "<div class='"+iconClass+"' style='margin-left: auto; margin-right: auto;'></div><div style='padding-top: 5px; padding-bottom: 5px;'>"+dispName+"</div>";
				div.appendChild(c);
				this.addDialogIcons.push(c);
			}
		}
		client.setContent(div);
		win.addChild(client);
		dojo.forEach(this.addDialogIcons, function(c){
			dojo.connect(c, "onclick", this, function(e){
				dojo.forEach(this.addDialogIcons, function(icon){
					dojo.removeClass(icon, "selectedItem");
				})
				dojo.addClass(c, "selectedItem");
				this.addDialogSelected = c.name;
			});
		}, this);
		var bottom = new dijit.layout.ContentPane({region: "bottom", style: "height: 40px;"});
		var button = new dijit.form.Button({label: l.addToPanel, style: "float: right;"});
		bottom.setContent(button.domNode);
		win.addChild(bottom);
		dojo.connect(button, "onClick", this, function(){
			if(dojo.isFunction(lucid.ui.applets[this.addDialogSelected])){
				var applet = new lucid.ui.applets[this.addDialogSelected]();
				this.addChild(applet);
				applet.startup();
				lucid.ui.save();
				this.unlock();
				lucid.dialog.notify(l.unlocknote);
			}
		});
		win.show();
		win.startup();
	},
	_onRelease: function(){
		//	summary:
		//		Disconnects the event handlers that were created in _onClick
		dojo.disconnect(this._onDragEvent);
		dojo.disconnect(this._docMouseUpEvent);
		dojo.disconnect(this._onOutEvent); //just to be sure...
		dojo.forEach(this._docEvents, dojo.disconnect);
	},
	_onMove: function(e){
		//	summary:
		//		Event handler for when the panel is being dragged.
		//		gets nearest edge, moves the panel there if we're not allready, and re-orients itself
		//		also checks for any panels allready placed on that edge
		dojo.stopEvent(e);
		var viewport = dijit.getViewport();
		var newPos;
		
		if(e.clientY < viewport.h/3 && e.clientX < viewport.w/3){
			if(e.clientX / (viewport.w/3) > e.clientY / (viewport.h/3)) newPos = "TL";
			else newPos = "LT";
		}
		else if(e.clientY > (viewport.h/3)*2 && e.clientX < viewport.w/3){
			if(e.clientX / (viewport.w/3) > ((viewport.h/3)-(e.clientY-(viewport.h/3)*2)) / (viewport.h/3))
				newPos = "BL";
			else
				newPos = "LB";
			
		}
		else if(e.clientY < viewport.h/3 && e.clientX > (viewport.w/3)*2){
			if(((viewport.w/3)-(e.clientX-(viewport.w/3)*2)) / (viewport.w/3) > e.clientY / (viewport.h/3))
				newPos = "TR";
			else
				newPos = "RT";
		}
		else if(e.clientY > (viewport.h/3)*2 && e.clientX > (viewport.w/3)*2){
			if((e.clientX - (viewport.w/3)*2) / (viewport.w/3) > (e.clientY - (viewport.h/3)*2) / (viewport.h/3)) newPos = "RB";
			else newPos = "BR";
		}
		else {
			if(e.clientY < viewport.h/3) newPos = "TC";
			else if(e.clientX < viewport.w/3) newPos = "LC";
			else if(e.clientY > (viewport.h/3)*2) newPos = "BC";
			else if(e.clientX > (viewport.w/3)*2) newPos = "RC";
			else newPos = this.placement;
		}
		if (this.placement != newPos){
			this.placement = newPos;
			lucid.ui._area.resize();
			this._place();
		}
	},
	uninitialize: function(){
		dojo.forEach(this.getChildren(), function(item){
			item.destroy();
		});
		setTimeout(dojo.hitch(lucid.ui._area, "resize"), 1000);
		if(this.window) this.window.close();
	},
	_place: function(){
		//	summary:
		//		Updates the position and size of the panel
		var viewport = dijit.getViewport();
		var s = {};
		if(this.placement.charAt(0) == "T" || this.placement.charAt(0) == "B"){
			this._makeHorizontal();
			if(this.placement.charAt(1) == "R") 
				s.left = (viewport.w - this.domNode.offsetWidth);
			if(this.placement.charAt(1) == "L") 
				s.left = viewport.l;
			if(this.placement.charAt(1) == "C"){
				if(this.span != 1){
					s.left = (viewport.w - (this.span*viewport.w)) / 2;
				}
				else 
					s.left = viewport.l;
			}
			
			if(this.placement.charAt(0) == "B") 
				s.top = (viewport.h + viewport.t) - this.domNode.offsetHeight;
			else 
				if(this.placement.charAt(0) == "T") 
					s.top = viewport.t;
		}
		else {
			//we need a completely different layout algorytm :D
			this._makeVertical();
			if(this.placement.charAt(1) == "C"){
				if(this.span != 1){
					var span = dojo.style(this.domNode, "height");
					s.top = (viewport.h - span)/2;
				}
			}
			else if(this.placement.charAt(1) == "B"){
				s.top = (viewport.h + viewport.t) - this.domNode.offsetHeight;
			}
			else {
				s.top = viewport.t;
			}
			if(this.placement.charAt(0) == "L"){
				s.left = viewport.l;
			}
			else {
				s.left = (viewport.w + viewport.l) - this.domNode.offsetWidth;
			}
		}
		var sides = {
			T: "Top",
			L: "Left",
			R: "Right",
			B: "Bottom"
		}
		for(var sk in sides){
			dojo.removeClass(this.domNode, "desktopPanel"+sides[sk]);
		}
		dojo.addClass(this.domNode, "desktopPanel"+sides[this.placement.charAt(0)]);
		
		var count = 0;
		//check for other panels in the same slot as us
		dojo.query(".desktopPanel").forEach(dojo.hitch(this, function(panel){
			var panel = dijit.byNode(panel);
			if(panel.id != this.id){
				if(this.placement.charAt(0) == panel.placement.charAt(0) && (panel.span==1 || this.span==1)) count += panel.thickness;
				else if(panel.placement == this.placement)
					count += panel.thickness;
			}
		}));
		if(this.placement.charAt(0) == "L" || this.placement.charAt(0) == "T") s[this.getOrientation() == "horizontal" ? "top" : "left"] += count;
		else s[this.getOrientation() == "horizontal" ? "top" : "left"] -= count;
		if(lucid.config.fx){
			var props = {};
			for(var key in s){
				props[key] = {end: s[key], unit: "px"};
			}
			dojo.animateProperty({
				node: this.domNode,
				properties: props,
				duration: lucid.config.window.animSpeed
			}).play();
		}
		else {
			for(var key in s){
				dojo.style(this.domNode, key, s[key]+"px");
			}
		}
		dojo.forEach(this.getChildren(), function(item){
			item.resize();
		});
		lucid.ui.save();
	},
	resize: function(){
		//	summary:
		//		Called when the window is resized. Resizes the panel to the new window height
		var viewport = dijit.getViewport();
		dojo.style(this.domNode, (this.getOrientation() == "horizontal" ? "width" : "height"), (this.span*viewport[(this.getOrientation() == "horizontal" ? "w" : "h")])+"px");
		dojo.style(this.domNode, (this.getOrientation() == "vertical" ? "width" : "height"), this.thickness+"px");
		dojo.forEach(this.getChildren(), function(item){
			item.resize();
		});
	},
	_makeVertical: function(){
		//	summary:
		//		Orients the panel's applets vertically
		dojo.removeClass(this.domNode, "desktopPanelHorizontal");
		dojo.addClass(this.domNode, "desktopPanelVertical");
		this.resize();
	},
	_makeHorizontal: function(){
		//	summary:
		//		Orients the panel's applets horizontally
		dojo.removeClass(this.domNode, "desktopPanelVertical");
		dojo.addClass(this.domNode, "desktopPanelHorizontal");
		this.resize();
	},
	lock: function(){
		//	summary:
		//		Locks the panel
		this.locked = true;
		dojo.forEach(this.getChildren(), function(item){
			item.lock();
		});
	},
	unlock: function(){
		//	summary:
		//		Unlocks the panel
		this.locked = false;
		dojo.forEach(this.getChildren(), function(item){
			item.unlock();
		});
	},
	dump: function(){
		//	summary:
		//		Returns a javascript object that can be used to restore the panel using the restore method
		var applets = [];
		var myw = dojo.style(this.domNode, "width"), myh = dojo.style(this.domNode, "height");
		dojo.forEach(this.getChildren(), dojo.hitch(this, function(item){
			var left=dojo.style(item.domNode, "left"), top=dojo.style(item.domNode, "top");
			var pos = (this.getOrientation() == "horizontal" ? left : top);
			pos = pos / (this.getOrientation() == "horizontal" ? myw : myh);
			var applet = {
				settings: item.settings,
				pos: pos,
				declaredClass: item.declaredClass
			};
			applets.push(applet);
		}));
		return applets;
	},
	restore: function(/*Array*/applets){
		//	summary:
		//		Restores the panel's applets
		//	applets:
		//		an array of applets to restore (generated by the dump method)
		var size = dojo.style(this.domNode, this.getOrientation() == "horizontal" ? "width" : "height");
		dojo.forEach(applets, dojo.hitch(this, function(applet){
			//dojo["require"](applet.declaredClass);
			var construct = dojo.getObject(applet.declaredClass);
			var a = new construct({settings: applet.settings, pos: applet.pos});
			if(this.locked) a.lock();
			else a.unlock();
			this.addChild(a);
			a.startup();
		}));
	},
	startup: function(){
		dojo.setSelectable(this.domNode, false);
		if(lucid.config.fx){
			//TODO: add to viewport when there are other panels around!
			var viewport = dijit.getViewport();
			if(this.placement.charAt(0) == "B"){
				dojo.style(this.domNode, "top", (viewport.h + this.thickness)+"px");
			}
			else if(this.placement.charAt(0) == "T"){
				dojo.style(this.domNode, "top", (-(this.thickness))+"px")
			}
			else if(this.placement.charAt(0) == "R"){
				dojo.style(this.domNode, "left", (viewport.w + this.thickness)+"px");
			}
			else {
				dojo.style(this.domNode, "left", (-(this.thickness))+"px");
			}
			
			if(this.placement.charAt(1) == "T"){
				dojo.style(this.domNode, "top", "0px");
			} else if(this.placement.charAt(1) == "B"){
				dojo.style(this.domNode, "top", (viewport.h - this.domNode.offsetHeight)+"px");
			} else if(this.placement.charAt(1) == "L"){
				dojo.style(this.domNode, "left", "0px");
			} else if(this.placement.charAt(1) == "R"){
				dojo.style(this.domNode, "left", (viewport.w - this.domNode.offsetWidth)+"px");
			}
			else {
				if(this.getOrientation() == "horizontal")
					dojo.style(this.domNode, "left", (( viewport.w - (viewport.w*this.span))/2)+"px");
				else
					dojo.style(this.domNode, "top", ((viewport.h - (this.span*viewport.h)) / 2)+"px");
			}
		}
		dojo.style(this.domNode, "zIndex", 9999*9999);
		dojo.style(this.domNode, "opacity", this.opacity);
		if(dojo.isIE){
			dojo.connect(this.domNode,'onresize', this,"_place");
		}
		dojo.connect(window,'onresize',this, "_place");
		this._place();
		//if(this.getOrientation() == "horizontal") this._makeHorizontal();
		//else this._makeVertical();
	}
});
