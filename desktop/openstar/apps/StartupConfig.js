define([
	"qscript/lang/Class", // declare
	 "dojo/data/ItemFileWriteStore",
	 "dijit/form/_FormValueWidget",
	 "qfacex/dijit/button/Button",
	 "qfacex/dijit/input/TextBox",
	 "qfacex/dijit/selection/CheckBox",
	 "qfacex/dijit/toolbar/Toolbar",
	 "qfacex/dijit/container/ContentPane",
	 "dojox/gfx",
	 "dojox/gfx/Moveable",
	 "dojox/grid/DataGrid",
	 "openstar/desktop2/Application",
	 "qfacex/dijit/container/deprecated/Window",
	 "qfacex/dijit/infomation/StatusBar",
	 "qscript/util/html",
	 "openstar/services/filesystem",
	 "openstar/services/config",
	 "openstar/services/app",
	 "openstar/ui/dialog",
	 "dojo/i18n!openstar/nls/common",
	 "dojo/i18n!./nls/apps",
	 "dojo/i18n!openstar/nls/system",
	 "dojo/i18n!openstar/nls/messages"
	 
],function(Class,ItemFileWriteStore,_FormValueWidget,Button,TextBox,CheckBox,Toolbar,ContentPane,gfx,Moveable,DataGrid,_App,Window,StatusBar,utilHtml,srvFilesystem,srvConfig,srvApp,dialog,nlsCommon,nlsApps,nlsSystem,nlsMessages) {

	return Class.declare({
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
				cbs: {}
			},
			"-attributes-"	:	{
			},
			"-methods-"	:	{
				init: function(args){
					var appNls = nlsApps;//i18n.getLocalization("desktop", "apps",this.lang);
					var win = this.win = new Window({
			    	app  : this,
						title: appNls["Startup Applications"],
						iconClass: this.iconClass,
						onClose: dojo.hitch(this, "kill"),
						width: "300px",
						height: "300px"
					});
					var cpane = new ContentPane({
						region: "center",
						style: "overflow-y: auto; padding: 5px;"
					});
					var div = document.createElement("div");
					dojo.forEach(srvApp.appList, function(app){
						//make checkbox
						var onStartup = false;
						dojo.forEach(srvConfig.startupApps, function(item){
							if(item == app.sysname || item.name == app.sysname) onStartup = true;
						});
						var cb = new CheckBox({
							checked: onStartup,
							onChange: dojo.hitch(this, "saveConfig")
						});
						this.cbs[app.sysname] = cb;
						
						//make row
						var row = document.createElement("div");
						var label = document.createElement("span");
						dojo.style(label, "marginLeft", "5px");
						utilHtml.textContent(label, appNls[app.name] || app.name);
						row.appendChild(cb.domNode);
						row.appendChild(label);
						div.appendChild(row);
					}, this);
					cpane.setContent(div);
					win.addChild(cpane);
					win.show();
					win.startup();
				},
				saveConfig: function(){
			        var sApps = srvConfig.startupApps;
			        var config = dojo.clone(sApps);
					for(var key in this.cbs){
						if(!this.cbs[key].checked){
			                for(var i in sApps){
			                    if(sApps[i] == key || sApps[i].name == key)
			                        config.splice(i, 1);
			                }
			            }else{
			                var exists = false;
			                for(var i in sApps){
			                    if(sApps[i] == key || sApps[i].name == key)
			                        exists = true;
			                }
			                if(!exists)
			                    config.push(key);
			            }
			            srvConfig.startupApps = config;
					}
				},
				kill: function(){
					if(!this.win.closed) this.win.close();
					srvConfig.save();
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

});

