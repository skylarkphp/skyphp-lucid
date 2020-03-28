define([
  "dojo/_base/kernel", 
  "dojo/_base/declare",
  "dojo/_base/lang", 
  "openstar/desktop2/deprecated/jaml/Model",
  "openstar/desktop2/deprecated/jaml/Controller"
], function(dojo, declare,lang,Model,Controller){
        return declare([Controller], {
            // used in the Generate View demo
 
            updateView : function () {
                try {
                    var modeldata = dojo.fromJson(this._view.modelArea.get("value"));
                    var genmodel = new Model(modeldata );
                    this._view.app.models.set("names",genmodel);
	                this._view.viewArea.set("style",{display:""});
	                this._view.outerModelArea.set("style",{display:"none"});
                }catch(err){
                    console.error("Error parsing json from model: "+err);
                }
            },

            // used in the Generate View demo
            updateModel : function () {
                this._view.viewArea.set("style",{display:"none"});
                this._view.outerModelArea.set("style",{display:""});
                this._view.modelArea.focus(); // hack: do this to force focus off of the textbox, bug on mobile?
                this._view.modelArea.set("value",(dojo.toJson(this._view.app.models.names.toPlainObject(), true)));
            },
            
            generate1_click : function(){
            	this.updateView();
            },
            
            updateModel_click : function(){
            	this.updateModel();
            }
       });
});
