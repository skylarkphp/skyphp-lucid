dojo.provide("lucid.ui.applets.Separator");
dojo.declare("lucid.ui.applets.Separator", lucid.ui.Applet, {
	//	summary:
	//		A basic Separator applet
	dispName: "Separator",
	postCreate: function(){
		dojo.addClass(this.containerNode, "separator");
		dojo.style(this.handleNode, "background", "transparent none");
		dojo.style(this.handleNode, "zIndex", "100");
		dojo.style(this.containerNode, "zIndex", "1");
		this.inherited("postCreate", arguments);
	}
});