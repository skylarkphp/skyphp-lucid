dojo.provide("lucid.flash.flash");
dojo.require("dojox.flash");
if (dojox.flash.info.capable == true){
	dojox.flash.addLoadedListener(function(){
		console.log("js:flash loaded");
	});
	dojox.flash.Embed.prototype.width = 1;
	dojox.flash.Embed.prototype.height = 1;
	dojox.flash.setSwf("./dojotoolkit/desktop/flash/objManager.swf", false);
}
