dojo.provide("lucid.ui.applets.Menubar");
dojo.require("lucid.ui.applets.Menu");
dojo.require("dijit.Menu");
dojo.require("dijit.Toolbar");
dojo.require("dijit.form.Button");
dojo.requireLocalization("lucid.ui", "menus");
dojo.requireLocalization("lucid", "places");
dojo.declare("lucid.ui.applets.Menubar", lucid.ui.applets.Menu, {
	//	summary:
	//		An extention of lucid.ui.applets.Menu except it seperates the application, places, and system menus into their own buttons
	dispName: "Menu Bar",
	_drawn: false,
	postCreate: function(){
		this._prefsMenu = [];
		this._adminMenu = [];
		this.inherited("postCreate", arguments);
	},
	_drawButton: function(){
		//	summary:
		//		Draws the button for the applet
		var l = dojo.i18n.getLocalization("lucid.ui", "menus");
		if(this._drawn){
			this._appMenuButton.dropDown = this._menu;
			this._appMenuButton._started = false; //hackish....
			this._appMenuButton.startup();
			return;
		}
		else this._drawn = true;
		var tbar = new dijit.Toolbar();
		this.addChild(tbar);
		dojo.forEach([
			{
				iconClass: "icon-16-places-start-here",
				label: l.applications,
				dropDown: this._menu
			},
			{
				label: l.places,
				dropDown: this._makePlacesMenu()
			},
			{
				label: l.system,
				dropDown: this._makeSystemMenu()
			}
		], function(i){
			var b = new dijit.form.DropDownButton(i);
			tbar.addChild(b);
			b.domNode.style.height="100%";
			b.startup();
			if(i.label == l.applications) this._appMenuButton = b;
			if(i.label == l.system){
				b.dropDown.addChild(new dijit.MenuSeparator());
				b.dropDown.addChild(new dijit.MenuItem({
					label: l.logOut, 
					iconClass: "icon-16-actions-system-log-out",
					onClick: lucid.user.logout
				}))
			}
		}, this);
	}
});
