dojo.provide("lucid.apps.Terminal");

dojo.declare("lucid.apps.Terminal", lucid.apps._App, {
	init: function(args)
	{
		dojo.require("dijit.layout.LayoutContainer");
		dojo.requireLocalization("lucid", "apps");
		var app = dojo.i18n.getLocalization("lucid", "apps");
		this.win = new lucid.widget.Window({
			title: app["Terminal"],
			iconClass: this.iconClass,
			onClose: dojo.hitch(this, "kill")
		});
		this.term = new lucid.widget.Console({region: "center", path: (args.path || "/")})
		var killMyself = dojo.hitch(this, "kill");
		this.term.aliases.exit = function(params){
			killMyself();
		}
		this.win.addChild(this.term);
		this.win.show();
		this.win.startup();
	},
	
	kill: function(){
		if(!this.win.closed){ this.win.close(); }
	}
})
