dojo.provide("lucid.ui._base");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dojo.data.ItemFileReadStore");
dojo.require("dojo.data.ItemFileWriteStore");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.form.Form");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dijit.form.CheckBox");
dojo.require("dojo.fx");
dojo.require("dijit.ColorPalette");
dojo.require("dojox.validate.web");
dojo.require("dijit.layout.LayoutContainer");
dojo.require("dijit.form.Slider");
dojo.require("dijit.form.NumberSpinner");
dojo.require("dijit.Menu");
dojo.require("dojo.cookie");

dojo.require("lucid.ui._appletMoveable");
dojo.require("lucid.ui.Area");
dojo.require("lucid.ui.Applet");
dojo.require("lucid.ui.Credits");
dojo.require("lucid.ui.Panel");
dojo.require("lucid.ui.applets.Clock");
dojo.require("lucid.ui.applets.User");
dojo.require("lucid.ui.applets.Menu");
dojo.require("lucid.ui.applets.Menubar");
dojo.require("lucid.ui.applets.Netmonitor");
dojo.require("lucid.ui.applets.Separator");
dojo.require("lucid.ui.applets.Taskbar");
dojo.require("lucid.ui.applets.Twitter");
dojo.require("lucid.ui.applets.Quota");

dojo.requireLocalization("lucid.ui", "appearance");
dojo.requireLocalization("lucid.ui", "accountInfo");
dojo.requireLocalization("lucid", "languages");
dojo.requireLocalization("lucid", "common");

/*
 * Class: lucid.ui
 * 
 * Summary:
 * 		Draws core UI for the desktop such as panels and wallpaper
 */
dojo.mixin(lucid.ui, {
	//	_windowList: dojo.data.ItemFileWriteStore
	//		A dojo.data.ItemFileWriteStore containing a list of windows
	_windowList: new dojo.data.ItemFileWriteStore({
		data: {identifer: "id", items: []}
	}),
	//	_drawn: Boolean
	//		true after the UI has been drawn
	_drawn: false,
	_draw: function(){
		//	summary:
		//		creates a lucid.ui.Area widget and places it on the screen
		//		waits for the config to load so we can get the locale set right
		if(this._drawn === true) return;
		this._drawn = true;
		dojo.locale = lucid.config.locale;
		this._area = new lucid.ui.Area({});
		document.body.appendChild(lucid.ui._area.domNode);
		this._area.updateWallpaper();
		this.makePanels();
		dojo.subscribe("configApply", this, function(){
			this._area.updateWallpaper();
		});
	},
	init: function(){
		dojo.subscribe("configApply", this, function(){
			if(lucid.config.fx > 0) setTimeout(dojo.hitch(this, "_draw"), 100);
			else this._draw();
		});
		dojo.require("dojo.dnd.autoscroll");
		dojo.dnd.autoScroll = function(e){} //in order to prevent autoscrolling of the window
	},
	//	drawn: Boolean
	//		have the panels been drawn yet?
    drawn: false,
	makePanels: function(){
		//	summary:
		//		the first time it is called it draws each panel based on what's stored in the configuration,
		//		after that it cycles through each panel and calls it's _place(); method
        if(this.drawn){
	        dojo.query(".desktopPanel").forEach(function(panel){
		       var p = dijit.byNode(panel);
		       p._place();
	        }, this);
            return;
        }
        this.drawn = true;
        var panels = lucid.config.panels;
		dojo.forEach(panels, function(panel){
			var args = {
				thickness: panel.thickness,
				span: panel.span,
				placement: panel.placement,
				opacity: panel.opacity
			}
			var p = new lucid.ui.Panel(args);
			if(panel.locked) p.lock();
			else p.unlock();
			p.restore(panel.applets);
			lucid.ui._area.domNode.appendChild(p.domNode);
			p.startup();
		});
		lucid.ui._area.resize();
	},
	save: function(){
		//	summary:
		//		Cylces through each panel and stores each panel's information in lucid.config
		//		so it can be restored during the next login
		lucid.config.panels = [];
		dojo.query(".desktopPanel").forEach(function(panel, i){
			var wid = dijit.byNode(panel);
			lucid.config.panels[i] = {
				thickness: wid.thickness,
				span: wid.span,
				locked: wid.locked,
				placement: wid.placement,
				opacity: wid.opacity,
				applets: wid.dump()
			}
		});
	},
	//	appletList: Object
	//		A object where the keys are applet categories, and their values are an array of applet names.
	//		These are used when showing the "Add to panel" dialog
	appletList: {
		"Accessories": ["Clock"],
		"Internet": ["Twitter"],
		"Desktop & Windows": ["Taskbar", "User"],
		"System": ["Netmonitor", "Quota"],
		"Utilities": ["Menu", "Menubar", "Separator"]
	}
});
