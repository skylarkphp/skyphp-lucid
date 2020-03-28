define([
   "dojo",
   "openstar/system2/Runtime",
  "openstar/desktop2/deprecated/jaml/Application",
  "dojo/text!./config.json"
],function(dojo,Runtime,_JsonAMLApplication,config) {
	var meta = new _JsonAMLApplication._Meta(config);

    Runtime.addDojoCss("dojox/mobile/themes/iphone/base.css");

	return dojo.declare([_JsonAMLApplication], {
		init: function(args){
		    this.meta = meta;
			this.inherited(arguments);
		}
		
	});
	
});
