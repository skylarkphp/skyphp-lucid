define([
	"qscript/lang/Class", // declare
	"dijit/form/_FormValueWidget",
	"qfacex/dijit/button/Button",
	"qfacex/dijit/input/TextBox",
	"dijit/form/Form",
	"qfacex/dijit/toolbar/Toolbar",
	"dojox/gfx", 
	"dojox/grid/DataGrid",
	"dojox/layout/DragPane",
	"openstar/desktop2/Application",
	"qfacex/dijit/container/deprecated/Window",
	"qfacex/dijit/infomation/StatusBar",
	"openstar/services/filesystem",
	"openstar/ui/dialog",
	"dojo/i18n!openstar/nls/common",
	"dojo/i18n!./nls/apps",
	"dojo/i18n!openstar/nls/messages"
	 
],function(Class,_FormValueWidget,Button,TextBox,Form,Toolbar,gfx,DataGrid,DragPane,_App,Window,StatusBar,srvFilesystem,dialog,nlsCommon,nlsApps,nlsMessages) {

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
				imgNode: false,
				timer: false
			
			},
			"-attributes-"	:	{
			},
			"-methods-"	:	{
				kill: function(){
					if(!this.win.closed) this.win.close();
					if(this.timer) clearInterval(this.timer);
				},
				init: function(args){
					var cm = nlsCommon;//i18n.getLocalization("desktop", "common",this.lang);
					var app = nlsApps;//i18n.getLocalization("desktop", "apps",this.lang);
					this.win = new Window({
			        	app  : this,
						title: app["Image Viewer"],
						iconClass: this.iconClass,
						onClose: dojo.hitch(this, "kill")
					});
					var toolbar = new Toolbar({region: "top"});
					dojo.forEach([
						{
							label: cm.open,
					        iconClass: "icon-16-actions-document-open",
							onClick: dojo.hitch(this, function(){
								dialog.file({
									title: "Choose an image to open",
									scene:this.scene,
									onComplete: dojo.hitch(this, "open")
								});
							})
						}
					], function(a){
						toolbar.addChild(new dijit.form.Button(a));
					});
					this.win.addChild(toolbar);
					this.dragPane = new DragPane({region: "center", style: "overflow: auto;"});
					this.win.addChild(this.dragPane);
					this.win.show();
					this.win.startup();
					if(typeof args.file != "undefined") this.open(args.file);
				},
				open: function(path){
					if(!this.imgNode){
						this.imgNode = document.createElement("div");
						var img = document.createElement("img");
						this.imgNode.appendChild(img);
						var overlay = document.createElement("div");
						dojo.style(overlay, "width", "100%");
						dojo.style(overlay, "height", "100%");
						dojo.style(overlay, "position", "absolute");
						dojo.style(overlay, "top", "0px");
						dojo.style(overlay, "left", "0px");
						dojo.style(overlay, "zIndex", "100");
						this.imgNode.appendChild(overlay);
				
						this.timer = setInterval(dojo.hitch(this, function(){
							dojo.style(overlay, "width", this.dragPane.domNode.scrollWidth+"px");
							dojo.style(overlay, "height", this.dragPane.domNode.scrollHeight+"px");
						}), 1000);
						
						this.dragPane.domNode.appendChild(this.imgNode);
					}
					dojo.query("img", this.imgNode)[0].src =srvFilesystem.embed(path);
			        dojo.query("*", this.imgNode).style({
			            "MozUserFocus": "ignore",
			            "MozUserInput": "disabled",
			            "MozUserSelect": "none"
			        });
			        //update win title
			        var app = nlsApps;//i18n.getLocalization("desktop", "apps",this.lang);
			        var files = path.split("/");
			        this.win.attr("title", files[files.length-1]+" - "+app["Image Viewer"]);
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
