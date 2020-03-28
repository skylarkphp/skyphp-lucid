require(["dojo/_base/kernel", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/loader"], 
function(dojo, lang, array){
    var path = window.location.pathname;
    if (path.charAt(path.length)!="/"){
    	path = path.split("/");
    	path.pop();
    	path=path.join("/");	
    }

    dojo.registerModulePath("app",path);
    require(["dojo/_base/html","dojox/app/main", "dojo/text!app/config.json"],
	function(dojo,Application,config){
    	app = Application(eval("(" + config + ")"));
    });
});


define([
  "dojo",
  "require",
  "qface/apps/JsonXAMLApplication",
  "dojo/json!./config.json,
                   
],function(dojo,require,JsonXAMLApplication,jsonConfig) {
  
  return dojo.declare([JsonXAMLApplication],{
    init : function() {
      return this.inherited(jsonConfig);

    }
  
  	
  });

};
