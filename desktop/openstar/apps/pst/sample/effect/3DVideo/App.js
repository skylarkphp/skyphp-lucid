define([
	"dojo/_base/array", // array.forEach
	"dojo/_base/declare", // declare
	"dojo/_base/lang", // lang.extend lang.isArray
	"dojo/_base/kernel", // kernel.deprecated
	"dojo/topic",
	"dijit/_Widget",
	"dijit/_TemplatedMixin",
	"dijit/form/_FormValueWidget",
	"qfacex/dijit/button/Button",
	"qfacex/dijit/input/TextBox",
	"qfacex/dijit/toolbar/Toolbar",
	"qfacex/dijit/container/ContentPane",
	"openstar/desktop2/Application",
	"qfacex/dijit/container/deprecated/Window",
	"qfacex/dijit/infomation/StatusBar",
	"qfacex/dijit/media/CubeVideo",
	"dojo/i18n!./nls/app"
],function(array, declare, lang, dojo,topic,_Widget,_TemplatedMixin,_FormValueWidget,Button,TextBox,Toolbar,ContentPane,_App,Window,StatusBar,CubeVideo,nlsApp) {


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
		   		video : null,
				copy: null,
				copycanvas: null,
				outputcanvas:null,
				draw: null
			
			},
			"-attributes-"	:	{
			},
			"-methods-"	:	{
		        kill: function(){
		            if(!this.win.closed){ this.win.close(); }
		        },
		        init: function(args)    {
		            var app = nlsApp;
		            //var cm = nlsCommon;
		            this.win = new Window({
		                app  : this,
		                title: app.title,
		                iconClass: "icon-16-apps-internet-web-browser",
		                onClose: dojo.hitch(this, "kill")
		            });

		            var player = this.player =  new CubeVideo();
		            this.win.addChild(player);
		            this.win.show();
		            this.win.startup();
		            
		            player.play("BigBuckBunny_640x360.mp4");
		            
		            if (args.paused) {
		            	player.pause();
		            }
		            
		            var self = this;
		            topic.subscribe("/openstar/desktop2/hide",function(scene){
		            	if (self.scene == scene) {
		            		self.player.pause();
		            	}	
		            });
		            
		            topic.subscribe("/openstar/desktop2/show",function(scene){
		            	if (self.scene == scene) {
		            		self.player.play();
		            	}	
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
});
