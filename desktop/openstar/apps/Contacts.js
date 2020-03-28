define([
	"qscript/lang/Class", // declare
	"dojo/_base/lang",
	"dijit/form/_FormValueWidget",
	"dijit/_Templated",
	"qfacex/dijit/button/Button",
	"qfacex/dijit/input/TextBox",
	"dijit/form/Form",
	"qfacex/dijit/toolbar/Toolbar",
	"dojox/gfx", 
	"dojox/grid/DataGrid",
	"openstar/desktop2/Application",
	"qfacex/dijit/container/deprecated/Window",
	"qfacex/dijit/infomation/StatusBar",
	"openstar/services/filesystem",
	"openstar/services/Registry",
	"openstar/ui/dialog",
	"dojo/i18n!openstar/nls/common",
	"dojo/i18n!./nls/apps",
	"dojo/i18n!openstar/nls/messages",
	"dojo/i18n!./Contacts/nls/contacts"
],function(Class,lang,_FormValueWidget,_Templated,Button,TextBox,Form,Toolbar,gfx,DataGrid,_App,Window,StatusBar,filesystem,
  SrvRegistry,dialog,nlsCommon,nlsApps,nlsMessages,nlsContacts) {

  var Contacts =  Class.declare({
		"-parent-"		:	_App,
		
		"-interfaces-"	:	[],
		
		"--mixins--"	:	[],

		"-protected-"	:	{
			"-fields-"	:	{
			
			},
			
			"-methods-"	:	{
			
			}
		},
		
		"-public-"	:	{
			"-fields-"	:	{
			
			},
			"-attributes-"	:	{
			},
			"-methods-"	:	{
			    init: function(args){
			      var nls = nlsContacts;//i18n.getLocalization("openstar.apps.Contacts", "Contacts",this.lang);
			      var app = nlsApps;//i18n.getLocalization("desktop", "apps",this.lang);
			      this.windows = [];
			      var win = new Window({
			      	app  : this,
			        title: app["Contacts"],
			        iconClass: this.iconClass,
			        onClose: lang.hitch(this, "kill")
			      });
			      this.windows.push(win);

			      var contactStore = this.contactStore = new SrvRegistry({
			        name: "contacts",
			        appname: this.sysname,
			        data: {
			          identifier: "id",
			          items: []
			        }
			      });
			      dojo.connect(contactStore, "onDelete", function(){ contactStore.save(); });
			      
			      var toolbar = new Toolbar({region: "top"});

			      var newButton = new Button({
			        label: nls.newContact,
			        iconClass: "icon-16-actions-contact-new",
			        onClick: lang.hitch(this, "newContact")
			      });
			      toolbar.addChild(newButton);

			      var removeButton = new Button({
			        label: nls.removeContact,
			        iconClass: "icon-16-actions-edit-delete",
			        onClick: lang.hitch(this, "removeContact")
			      });
			      toolbar.addChild(removeButton);
			      
			      var exportButton = new Button({
			        label: nls["export"],
			        onClick: lang.hitch(this, "doExport")
			      });
			      toolbar.addChild(exportButton);

			      var importButton = new Button({
			        label: nls["import"],
			        onClick: lang.hitch(this, "doImport")
			      });
			      toolbar.addChild(importButton);

			      win.addChild(toolbar);

			      win.show();

			      var grid = this.grid = new DataGrid({
			        store: contactStore,
			        region: "center",
			        structure: [{
			          cells: [[
			          {field: "name", name: nls.name, width: "100px"},
			          {field: "email", name: nls.email, width: "150px"},
			          {field: "phone-home", name: nls.phone, width: "auto"}
			          ]]
			        }],
			        columnToggling: true,
			        columnReordering: true
			      });
			      dojo.connect(grid, "onRowDblClick", this, "openContact");
			      win.addChild(grid);
			      grid.startup();
			    },

			    newContact: function(e){
			      var store = this.contactStore;
			      var nls = nlsContacts;//i18n.getLocalization("openstar.apps.Contacts", "Contacts",this.lang);
			      store.newItem({
			          id: (new Date()).getTime(), //to prevent id collisions
			          name: nls.newContact,
			          email: "",
			          phone: "",
			          address: ""
			        });
			      store.save();
			    },

			    openContact: function(e){
			      var nls = nlsContacts;//i18n.getLocalization("openstar.apps.Contacts", "Contacts",this.lang);
			      var item = this.grid.getItem(e.rowIndex);
			      var form = new ContactForm({
			        item: item,
			        store: this.contactStore,
			        region: "center"
			      });
			      var win = new Window({
			      	app  : this,
			        width: "450px",
			        height: "350px",
			        title: nls.editContact.replace("%s", this.contactStore.getValue(item, "name"))
			      });
			      dojo.connect(form, "onCancel", win, "close");
			      dojo.connect(form, "onSubmit", win, "close");
			      dojo.connect(win, "onResize", form.borderContainer, "resize");
			      dojo.connect(win, "onResize", form.tabContainer, "resize");
			      win.addChild(form);
			      win.show();
			      this.windows.push(win);
			    },

			    removeContact: function(e){
			      this.grid.removeSelectedRows();
			    },

			    kill: function(args){
			      dojo.forEach(this.windows, function(win){
			        if(!win.closed)
			          win.close();
			      });
			    }
			
			}
		},
		"-constructor-"	:	{
			"initialize"	:	[
				function(info){
					this.overrided(info);
				}				
			
			]
			
		}
  });


(function(){
  var keys = {
    FN: "name",
    ADR: "address",
    TEL: "phone",
    EMAIL: "email"
  }
  Class.extend(Contacts, {
	"-public-"	:	{
		"-fields-"	:	{
		
		},
		"-attributes-"	:	{
		},
		"-methods-"	:	{
		    doImport: function(){
		      var msg = nlsMessages;//dojo.i18n.getLocalization("desktop", "messages");
		      dialog.file({
		       title: msg.chooseFileOpen,
		       scene:this.scene,
		       onComplete: lang.hitch(this, function(path){
		             this.importData(path, function(){}, function(){}); //TODO: add notifications? 
		           })
		      });
		    },

		    importData: function(path, onComplete, onError){
		      var store = this.contactStore;
		      var parseType = function(params){
		        var types = {
		          FAX: "fax",
		          HOME: "home",
		          WORK: "work",
		          MOBILE: "mobile"
		        }
		        var p = params.split(";");
		        for(var i in p){
		          if(p[i] == "" || p[i].indexOf("=") === -1) continue;
		          var kv = p[i].split("=");
		          if(kv[0] != "TYPE") continue;
		          for(var t in types){
		            if(kv[1].indexOf(t) !== -1){
		              return types[t];
		            }
		          }
		          return "";
		        }
		      }
		      srvFilesystem.readFileContents(path, function(data){ 
		        var lines = (data+"\r\n").split("\n");
		        var vcard = {};
		        var vcards = [];
		        var info;
		        var lastKey;
		        var counter = 0;
		        dojo.forEach(lines, function(line){
		          if(line == "") return;
		          var re = new RegExp("^([^:;]+)([^:]+:|\:)(|.|.+)$", "mg");
		          var info = re.exec(line);
		          if(!info){
		            vcard[lastKey]+= line;
		            return;
		          }
		          var key = info[1];
		          var params = info[2];
		          var value = info[3];
		          if(key == "BEGIN"){
		            vcard = {id: (new Date()).getTime().toString()+(counter++)}
		          }
		          else if(key == "END"){
		            vcards.push(vcard);
		          }
		          else if(keys[key] == "address"){
		            //import address
		            var type = "";
		            if(!params){
		                // just throw it in home I guess...
		                type = "home";
		              }else{
		                type = parseType(params);
		              }
		              if(type != ""){
		                // ok, now break out each part of the address
		                var parts = value.split(";");
		                var addrKeys = ["pobox", "", "address", "city", "state", "zip", "country"];
		                for(var i in parts){
		                  if(addrKeys[i] == "") continue;
		                  if(parts[i] != "")
		                    vcard[addrKeys[i]+"-"+type] = parts[i];
		                }
		              }
		            }
		            else if(keys[key] == "phone"){
		            //import phone
		            var type="";
		            if(!params){
		              type = "home";
		            }else{
		              type = parseType(params);
		            }
		            if(type != ""){
		              vcard["phone-"+type] = value;
		            }
		          }
		          else if(keys[key]){
		            vcard[keys[key]] = value;
		            lastKey = keys[key];
		          }
		        });
		        dojo.forEach(vcards, lang.hitch(store, "newItem"));
		        store.save();
		      }, onError);
		    }
		
		}
	}
  });
})();



(function(){
  var keys = {
    name: "FN",
    address: "ADR",
    phone: "TEL",
    email: "EMAIL"
  };
Class.extend(Contacts, {
	"-public-"	:	{
		"-fields-"	:	{
		
		},
		"-attributes-"	:	{
		},
		"-methods-"	:	{
		    doExport: function(){
		      var msg = nlsMessages;//dojo.i18n.getLocalization("desktop", "messages",this.lang);
		        dialog.file({
		        title: msg.chooseFileSave,
		        scene:this.scene,
		        onComplete: lang.hitch(this, function(path){
		          this.exportData(path, function(){}, function(){}); //TODO: add notifications? 
		        })
		      });

		    },
		    exportData: function(path, onComplete, onError){
		      var data = [];
		      var store = this.contactStore;
		      store.fetch({
		        query: {id: "*"},
		        onItem: function(item){
		         var card = "BEGIN:VCARD\r\nVERSION:3.0\r\n";
		         for(var key in keys){
		           if(key == "address"){
		            var types = ["work", "home"];
		            for(var t in types){
		              var type = types[t];
		              //grab all the address fields, merge into one
		              var fields = ["pobox", "", "address", "city", "state", "zip", "country"];
		              var parts = [];
		              for(var i in fields){
		                if(fields[i] == ""){
		                  parts.push("");
		                  continue;
		                }
		                var field = fields[i]+"-"+type;
		                if(store.hasAttribute(item, field) && store.getValue(item, field) != ""){
		                  parts.push(store.getValue(item, field));
		                }else{
		                  parts.push("");
		                }
		              }
		              card += keys[key]+";TYPE="+type.toUpperCase()+":";
		              card += parts.join(";");
		              card += "\r\n";
		            }
		          } else if(key == "phone"){
		            var types=["work", "home", "mobile", "fax"];
		            for(var t in types){
		              var type = types[t];
		              var field = "phone-"+type;
		              var vcardFields = {
		                work: "WORK,VOICE",
		                home: "HOME,VOICE",
		                mobile: "MOBILE,VOICE",
		                fax: "WORK,FAX"
		              }
		              if(store.hasAttribute(item, field) && store.getValue(item, field) != ""){
		                card += "TEL;TYPE="+vcardFields[type]+":"+store.getValue(item, field)+"\r\n";
		              }
		            }
		          } else if(store.hasAttribute(item, key) && store.getValue(item, key) != "")
		            card += keys[key]+":"+store.getValue(item, key)+"\r\n";
		          }
		          card += "END:VCARD";
		          data.push(card);
		        },
		        onComplete: function(){
		         srvFilesystem.writeFileContents(path, data.join("\r\n\r\n"), onComplete, onError);
		        }
		      });
		    }
		}
	}
});
})();


  var ContactForm = dojo.declare([Form,_Templated], {
    widgetsInTemplate: true,
    templateString: null,
    templateString:"<form dojoAttachPoint='containerNode' dojoAttachEvent='onreset:_onReset,onsubmit:_onSubmit'>\n    <div dojoType=\"dijit.layout.BorderContainer\" dojoAttachPoint=\"borderContainer\" style=\"width: 100%; height: 100%;\">\n        <div dojoType=\"dijit.layout.TabContainer\" dojoAttachPoint=\"tabContainer\" region=\"center\">\n            <div dojoType=\"dijit.layout.ContentPane\" dojoAttachPoint=\"contactTab\" title=\"Contact\">\n                <div>\n                    <label for=\"${id}_name\" dojoAttachPoint=\"nameLabelNode\">Name:</label>\n                    <input dojoType=\"dijit.form.TextBox\" id=\"${id}_name\" name=\"name\" required=\"true\" />\n                </div>\n                <div>\n                    <label for=\"${id}_email\" dojoAttachPoint=\"emailLabelNode\">Email:</label>\n                    <input id=\"${id}_email\" name=\"email\" dojoType=\"dijit.form.TextBox\" />\n                </div>\n                <div>\n                    <label for=\"${id}_phone_home\" dojoAttachPoint=\"homephoneLabelNode\">Home Phone:</label>\n                    <input id=\"${id}_phone_home\" name=\"phone-home\" dojoType=\"dijit.form.TextBox\" />\n                </div>\n                <div>\n                    <label for=\"${id}_phone_work\" dojoAttachPoint=\"workphoneLabelNode\">Work Phone:</label>\n                    <input id=\"${id}_phone_work\" name=\"phone-work\" dojoType=\"dijit.form.TextBox\" />\n                </div>\n                <div>\n                    <label for=\"${id}_phone_mobile\" dojoAttachPoint=\"mobilephoneLabelNode\">Mobile Phone:</label>\n                    <input id=\"${id}_phone_mobile\" name=\"phone-mobile\" dojoType=\"dijit.form.TextBox\" />\n                </div>\n                <div>\n                    <label for=\"${id}_fax\" dojoAttachPoint=\"faxLabelNode\">Fax:</label>\n                    <input id=\"${id}_fax\" name=\"phone-fax\" dojoType=\"dijit.form.TextBox\" />\n                </div>\n\n            </div>\n            <div dojoType=\"dijit.layout.ContentPane\" dojoAttachPoint=\"addressTab\" title=\"Address\">\n                <b dojoAttachPoint=\"homeLabelNode\">Home</b>\n                <hr />\n                <div>\n                    <label for=\"${id}_address_home\" dojoAttachPoint=\"addressHomeLabelNode\">Address:</label>\n                    <input dojoType=\"dijit.form.Textarea\" id=\"${id}_address_home\" name=\"address-home\" style=\"width: 70%;\" />\n                </div>\n                <div>\n                    <label for=\"${id}_pobox_home\" dojoAttachPoint=\"poboxHomeLabelNode\">PO Box:</label>\n                    <input id=\"${id}_pobox_home\" name=\"pobox-home\" dojoType=\"dijit.form.TextBox\" />\n                </div>\n                <div>\n                    <label for=\"${id}_city_home\" dojoAttachPoint=\"cityHomeLabelNode\">City:</label>\n                    <input id=\"${id}_city_home\" name=\"city-home\" dojoType=\"dijit.form.TextBox\" />\n                </div>\n                <div>\n                    <label for=\"${id}_zip_home\" dojoAttachPoint=\"zipHomeLabelNode\">Zip/Postal Code:</label>\n                    <input id=\"${id}_zip_home\" name=\"zip-home\" dojoType=\"dijit.form.TextBox\" />\n                </div>\n                <div>\n                    <label for=\"${id}_state_home\" dojoAttachPoint=\"stateHomeLabelNode\">State/Province:</label>\n                    <input id=\"${id}_state_home\" name=\"state-home\" dojoType=\"dijit.form.TextBox\" />\n                </div>\n                <div style=\"margin-bottom: 10px;\">\n                    <label for=\"${id}_country_home\" dojoAttachPoint=\"countryHomeLabelNode\">Country:</label>\n                    <input id=\"${id}_country_home\" name=\"country-home\" dojoType=\"dijit.form.TextBox\" />\n                </div>\n\n                <b dojoAttachPoint=\"workLabelNode\">Work</b>\n                <hr />\n                <div>\n                    <label for=\"${id}_address_work\" dojoAttachPoint=\"addressWorkLabelNode\">Address:</label>\n                    <input dojoType=\"dijit.form.Textarea\" id=\"${id}_address_work\" name=\"address-work\" style=\"width: 70%;\" />\n                </div>\n                <div>\n                    <label for=\"${id}_pobox_work\" dojoAttachPoint=\"poboxWorkLabelNode\">PO Box:</label>\n                    <input id=\"${id}_pobox_work\" name=\"pobox-work\" dojoType=\"dijit.form.TextBox\" />\n                </div>\n                <div>\n                    <label for=\"${id}_city_work\" dojoAttachPoint=\"cityWorkLabelNode\">City:</label>\n                    <input id=\"${id}_city_work\" name=\"city-work\" dojoType=\"dijit.form.TextBox\" />\n                </div>\n                <div>\n                    <label for=\"${id}_zip_work\" dojoAttachPoint=\"zipWorkLabelNode\">Zip/Postal Code:</label>\n                    <input id=\"${id}_zip_work\" name=\"zip-work\" dojoType=\"dijit.form.TextBox\" />\n                </div>\n                <div>\n                    <label for=\"${id}_state_work\" dojoAttachPoint=\"stateWorkLabelNode\">State/Province:</label>\n                    <input id=\"${id}_state_work\" name=\"state-work\" dojoType=\"dijit.form.TextBox\" />\n                </div>\n                <div style=\"margin-bottom: 10px;\">\n                    <label for=\"${id}_country_work\" dojoAttachPoint=\"countryWorkLabelNode\">Country:</label>\n                    <input id=\"${id}_country_work\" name=\"country-work\" dojoType=\"dijit.form.TextBox\" />\n                </div>\n\n            </div>\n    \n        </div>\n        <div dojoType=\"dijit.layout.ContentPane\" region=\"bottom\">\n            <div style=\"text-align: right; margin-top: 5px;\">\n                <div dojoType=\"dijit.form.Button\" dojoAttachPoint=\"cancelButton\" class=\"dijitInline\" label=\"Cancel\" dojoAttachEvent=\"onClick:onCancel\"></div>\n                <div dojoType=\"dijit.form.Button\" dojoAttachPoint=\"saveButton\" class=\"dijitInline\" iconClass=\"icon-16-actions-document-save\" label=\"Save\" dojoAttachEvent=\"onClick:onSubmit\"></div>\n            </div>\n        </div>\n    </div>\n</form> \n",
    postCreate: function(){
      var values = {};
      dojo.forEach(this.store.getAttributes(this.item), function(key){
        values[key] = this.store.getValue(this.item, key);
      }, this);
      this.attr('value', values);
      this.doTranslations();
    },
    doTranslations: function(){
      var nls = nlsContacts;//i18n.getLocalization("openstar.apps.Contacts", "Contacts",this.lang);
      for(var key in this){
        if(key.indexOf("LabelNode") === -1) continue;
        var str = key.match(/[a-z]+/)[0];
        if(nls[str])
          this[key].childNodes[0].data = nls[str]+":";
      }
      this.saveButton.attr("label", nls.save);
      this.cancelButton.attr("label", nls.cancel);
      this.contactTab.attr("title", nls.contact);
      this.addressTab.attr("title", nls.address);
    },
    onSubmit: function(){
      var values = this.getValues();
      for(var key in values){
        var value = values[key];
        this.store.setValue(this.item, key, value);
      }
      setTimeout(lang.hitch(this.store, "save"), 200);
    },
    onCancel: function(){
    }
  });

  return Contacts;

});

