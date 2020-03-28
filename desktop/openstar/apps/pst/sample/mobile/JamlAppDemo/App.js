define([
   "dojo/_base/declare", // declare
  "openstar/system2/Runtime",
  "openstar/desktop2/deprecated/jaml/Application",
  "dojo/text!./config.json"
],function(declare,Runtime,_JsonAMLApplication,config) {
	var meta = new _JsonAMLApplication._Meta(config);

    Runtime.addDojoCss("dojox/mobile/themes/iphone/base.css");

	return declare([_JsonAMLApplication], {
		init: function(args){
		    this.meta = meta;
			this.inherited(arguments);
		}
		
	});
	
});
