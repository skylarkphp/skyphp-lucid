define([
	"qscript/lang/Class", // declare
	"require",
	"dijit/form/_FormValueWidget",
	"qfacex/dijit/button/Button",
	"qfacex/dijit/input/TextBox",
	"qfacex/dijit/toolbar/Toolbar",
	"qfacex/dijit/container/ContentPane",
	"openstar/desktop2/Application",
	"qfacex/dijit/container/deprecated/Window",
	"qfacex/dijit/infomation/StatusBar",
	"openstar/services/general",
	"openstar/services/admin",
	"openstar/ui/dialog",
	"dojo/i18n!openstar/nls/common",
	"dojo/i18n!./nls/apps",
	"dojo/i18n!./UpdateManager/nls/messages"
],function(Class,require,_FormValueWidget,Button,TextBox,Toolbar,ContentPane,_App,Window,StatusBar,srvGeneral,srvAdmin,dialog,nlsCommon,nlsApps,nlsMessages) {
//	var openstar = require("openstar/main");
	
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
			    drawUi: true
			
			},
			"-attributes-"	:	{
			},
			"-methods-"	:	{
			    init: function(args){
					if(!args.background && args._startup)
						args.background = args._startup;
			        this.drawUi = !args.background;
			        if(srvAdmin.isAdmin){
			            srvGeneral.xhr({
			                xsite: true,
			                url: "http://www.w3term.com/download/latest.json",
			                load: dojo.hitch(this, "checkVersion"),
			                error: dojo.hitch(this, "handleError"),
			                handleAs: "json"
			            });
			            //debugging
			            /*setTimeout(lang.hitch(this, "checkVersion", {
			                stable: null,
			                unstable: "1.0.1.stable"
			            }), 2000);*/
			            if(this.drawUi){
			                var app = nlsApps;//i18n.getLocalization("desktop", "apps",this.lang);
			                var cmn = nlsCommon;//i18n.getLocalization("desktop", "common",this.lang);
			                var nls = nlsMessages;//i18n.getLocalization("openstar.apps.UpdateManager", "messages",this.lang);
			                var win = this.window = new Window({
			        			app  : this,
			                    title: app["Update Manager"],
			                    width: "400px",
			                    height: "300px",
			                    iconClass: this.iconClass
			                });
			                var top = this.header = new ContentPane({
			                    region: "top",
			                    style: "padding: 5px;"
			                });
			                top.setContent("<h1>"+nlsMessages.checking+"</h1>");
			                win.addChild(top);

			                var bottom = new ContentPane({
			                    region: "bottom",
			                    style: "text-align: right;"
			                });
			                var closeButton = new Button({
			                    label: cmn.close,
			                    onClick: dojo.hitch(this, "kill")
			                });
			                bottom.setContent(closeButton);
			                win.addChild(bottom);
			                
			                var center = this.center = new ContentPane({
			                    region: "center",
			                    style: "overflow: auto; padding: 5px;"
			                });
			                win.addChild(center);

			                this.window.show();
			            }
			        }
			    },
			    parseVersion: function(str){
			        if(str == "null")
			            return null;
			        var p = str.split(".");
			        return {
			            major: p[0],
			            minor: p[1],
			            patch: p[2],
			            flag: p[3],
			            toString: function(){
			                return desktop.version.toString.apply(this, arguments);
			            }
			        };
			    },
			    isNewer: function(current, latest){
			       return (current.major < latest.major
			            || current.minor < latest.minor
			            || (current.patch < latest.patch || (current.patch == latest.patch && current.flag != latest.flag)));
			    },
			    checkVersion: function(versions){
			        var v = desktop.version;
			        if((!v.flag || v.flag == "stable" || v.flag == "final") && this.parseVersion(versions.stable) !== null){
			            //use stable version
			            var l = this.parseVersion(versions.stable);
			        }
			        else{
			            //use unstable version
			            var l = this.parseVersion(versions.unstable);
			        }
			        this.notify(l, this.isNewer(v, l));
			    },
			    handleError: function(e){
			        if(!this.drawUi){
			            this.kill();
			            return;
			        }
			        this.header.setContent("<h1>"+nlsMessages.comError+"</h1>");
			        this.center.setContent(nlsMessages.comDesc);
			    },
			    notify: function(version, isNewer){
			        if(this.drawUi)
			            this.notifyWindow(version, isNewer);
			        else if(isNewer)
			            this.notifyPopup(version);
			    },
			    notifyWindow: function(version, isNewer){
			        var nls = nlsMessages;//i18n.getLocalization("openstar.apps.UpdateManager", "messages",this.lang);
			        if(isNewer){
			            this.header.setContent("<h1>"+nlsMessages.updatesFound.replace("%s", version)+"</h1>");
			            this.center.setContent(nlsMessages.instructions
			                                   +"<br /><a href=\"%s\">%s</a>".replace(/\%s/g, "http://www.w3term.com/downloads/"+version+"/")
			                                   +"<br /><br />"+nlsMessages.currentVersion.replace("%s", desktop.version));
			            dojo.query("a", this.center.domNode).forEach(function(node){
			    			dojo.connect(node, "onclick", node, function(e){
				        		if(!e.shiftKey && !e.ctrlKey){
							    	openstar.launchHandler(null, {url: this.href}, "text/x-uri");
						    		e.preventDefault();
					    		}
				    		});
			    		});
			        }
			        else
			            this.header.setContent("<h1>"+nlsMessages.noUpdates+"</h1>");
			    },
			    notifyPopup: function(version){
			        var nls = nlsMessages;//i18n.getLocalization("openstar.apps.UpdateManager", "messages",this.lang);
			        dialog.notify({
			            message: nlsMessages.updatesFound.replace("%s", version)
			                    +"<br /><a href=\"javascript://\" onClick=\"desktop.app.launch('"+this.sysname+"');\">"+nlsMessages.moreDetails+"</a>",
			            duration: 10000,
			            scene:this.scene
			        });
			        this.kill();
			    },
			    kill: function(){
			        if(this.window && !this.window.closed)
			            this.window.close();
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
