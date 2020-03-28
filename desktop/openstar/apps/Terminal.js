define([
	 "dojo/_base/array", // array.forEach
	 "dojo/_base/declare", // declare
	 "dojo/_base/lang", // lang.extend lang.isArray
	 "dojo/_base/kernel", // kernel.deprecated
	 "dojo/i18n", // i18n.getLocalization
	 "dijit/form/_FormValueWidget",
	 "qfacex/dijit/button/Button",
	 "qfacex/dijit/input/TextBox",
	 "qfacex/dijit/toolbar/Toolbar",
	 "openstar/desktop2/Application",
	 "qfacex/dijit/container/deprecated/Window",
	 "qfacex/dijit/infomation/StatusBar",
	 "openstar/services/filesystem",
	 "openstar/ui/dialog",
	 "openstar/ui/widget/Console",
	 "dojo/i18n!openstar/nls/common",
	 "dojo/i18n!./nls/apps",
	 "dojo/i18n!openstar/nls/messages"
],function(array, declare, lang, dojo,i18n,_FormValueWidget,Button,TextBox,Toolbar,_App,Window,StatusBar,filesystem,dialog,Console,nlsCommon,nlsApps,nlsMessages) {


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
			
			},
			"-attributes-"	:	{
			},
			"-methods-"	:	{
				init: function(args){
					var app = nlsApps;//i18n.getLocalization("desktop", "apps",this.lang);
					this.win = new Window({
		        		app  : this,
						title: app["Terminal"],
						iconClass: this.iconClass,
						onClose: dojo.hitch(this, "kill")
					});
					this.term = new Console({region: "center", app:this,path: (args.path || "/")})
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

