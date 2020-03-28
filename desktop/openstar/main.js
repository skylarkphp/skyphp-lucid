define([
	"dojo",
	"dojo/dom-style",
	"dojo/dom-construct", // domConstruct.create
	"dojo/dom-geometry",
	"dojo/_base/fx", // fx.Animation
	"dojo/dnd/Source",
	"dojo/has",
	"dijit/_Widget",
    "dijit/_Templated",
    "dijit/_Container",
	"qfacex/dijit/container/BorderContainer",
	"dijit/layout/StackController",
	"dijit/layout/StackContainer",
	"openstar/desktop2/_MuliDesktopNaviApplet",
	"openstar/desktop2/_MultiDesktopContainer",
	"qfacex/dijit/applet/Panel",
	"./desktop/PersonalDesktop",
	"./desktop/applets/Menubar",
	"./desktop/applets/Netmonitor",
	"./desktop/applets/FullScreen",
	"./desktop/applets/User",
	"./desktop/applets/Clock",
	"./services/general",
	"./services/crosstalk",
	"./services/filesystem",
    "./services/admin",
    "./services/app",
    "./services/config",
    "./services/theme",
    "./services/user"	
], function(dojo,domStyle,domConstruct,domGeom,dojoFx,dndSource,has,_Widget,_Templated,_Container,BorderContainer,StackController,StackContainer,_MuliDesktopNaviApplet,_MultiDesktopContainer,QPanel,PersonalDesktop,AppletMenubar,AppletNetmonitor,AppletFullScreen,AppletUser,AppletClock,srvGeneral,srvCrosstalk,srvFilesystem,srvAdmin,srvApp,srvConfig,srvTheme,srvUser){
	var openstar = dojo.getObject("openstar",true);
	// module:
	//		openstar
	// summary:
	//		The openstar package main module

	var DesktopNaviBar = _MuliDesktopNaviApplet;

 	var	sysApplets = [
		{"settings": {}, "pos": 0.00, "declaredClass": "openstar.desktop.applets.Menubar"},
		{"settings": {}, "pos": 0.00, "declaredClass": DesktopNaviBar},
		{"settings": {}, "pos": 0.71, "declaredClass": "openstar.desktop.applets.User"},
		{"settings": {}, "pos": 0.78, "declaredClass": "openstar.desktop.applets.FullScreen"},
		{"settings": {}, "pos": 0.85, "declaredClass": "openstar.desktop.applets.Netmonitor"},
		{"settings": {}, "pos": 0.88, "declaredClass": "openstar.desktop.applets.Clock"}
	];

	var SystemToolBar = dojo.declare([QPanel],{
		//	summary:
		//		A customizable toolbar that you can reposition and add/remove/reposition applets on
		templateString: "<div class=\"systemPanel\" dojoAttachEvent=\"onmousedown:_onClick, oncontextmenu:_onRightClick\" style=\"width:100%;height:24px\"><div class=\"systemPanel systemPanelContainer\" style=\"width:100%;height:100%\" dojoAttachPoint=\"containerNode\"></div></div>",
	
		opacity: 0.95,
				
		_onClick : function() {
		},
		
		_onRightClick : function() {
		}
		
	});
	
	
	var DesktopStackContainer = _MultiDesktopContainer;
	
	var desktops = ["life","study","work"];

	var menubar,desktopNaviBar,netmonitor,user,clock;
	
		
	//	_drawn: Boolean
	//		true after the UI has been drawn
	var _drawn = false,mbc,stb,dsc;
	
	function resize () {
		if (mbc) {
			mbc.resize();
		}	
	}

	
	function _draw(){
		//	summary:
		//		creates a openstar.desktop.Area widget and places it on the screen
		//		waits for the config to load so we can get the locale set right
		if(_drawn === true) return;
		_drawn = true;
		dojo.locale = srvConfig.locale;
		
		mbc = new BorderContainer({
			design: "headline",
			gutters: false,
			liveSplitters: false,
			style:"width:100%;height:100%"
		});
		
		stb  = new SystemToolBar({
			region: "top",
			layoutPriority:1
		});
		
		mbc.addChild(stb);

		dsc = new DesktopStackContainer({
				region:'center',
				controllerWidget: "dijit.layout.StackController"
		});
		
		
		mbc.addChild(dsc);

		menubar = new AppletMenubar({settings:{},pos:0.00});
		stb.addChild(menubar);
		
		dojo.connect(menubar,"onLaunchApp",function(name){
			var desktop = desktopNaviBar.currentDesktop();
			if (desktop) {
				desktop.launch(name);
			}	
		});
		
		dojo.connect(menubar,"onLaunchHandler",function(file,args,format){
			var desktop = desktopNaviBar.currentDesktop();
			if (desktop) {
				desktop.launchHandler(file,args,format);
			}	
		});
		
		desktopNaviBar = new DesktopNaviBar({settings:{},pos:0.50,desktopContainer:dsc});
		stb.addChild(desktopNaviBar);

		netmonitor = new AppletNetmonitor({settings:{},pos:0.85});
		stb.addChild(netmonitor);

		fullScreen = new AppletFullScreen({settings:{},pos:0.80});
		stb.addChild(fullScreen);
		
		user = new AppletUser({settings:{},pos:0.71});
		stb.addChild(user);
		
		dojo.connect(user,"onLaunchApp",function(name){
			var desktop = desktopNaviBar.currentDesktop();
			if (desktop) {
				desktop.launch(name);
			}	
		});

		clock = new AppletClock({settings:{},pos:0.88});
		stb.addChild(clock);
				
		for (var i=0;i<desktops.length;i++){
			var pd = new PersonalDesktop({name:desktops[i]});
			dsc.addChild(pd);
			pd.init();
			desktopNaviBar.addDesktop(desktops[i],pd);
			
		}
		
		
		dojo.dnd.autoScroll = function(e){} //in order to prevent autoscrolling of the window
		dojo.connect(window,"onresize",resize);
		
		document.body.appendChild(mbc.domNode);
		
		mbc.startup();

		desktopNaviBar.selectDesktop(desktops[0]);

	}
	
	
	function init() {
		var modules = [
			srvCrosstalk,
			srvFilesystem,
		    srvAdmin,
		    srvApp,
		    srvConfig,
		    srvTheme,
		    srvUser
		];
		var callIfExists = function(object, method){
			if(dojo.isFunction(object[method])){
				object[method]();
			}
			else if(object.prototype && dojo.isFunction(object.prototype.draw)){
				object.prototype[method]();
			}
		};
		srvGeneral.xhr({
				backend: "core.bootstrap.check.loggedin",
				load: dojo.hitch(this,function(data, ioArgs){
					if(data == "0")	{
						dojo.forEach(modules, function(module){
							callIfExists(module, "draw");
						});
						dojo.forEach(modules, function(module){
							callIfExists(module, "init");
						});
						_draw();
					}else{
						history.back();
						window.close();
						document.body.innerHTML = "Not Logged In";
					}
				})
		});
		
	}
	
	dojo.mixin(openstar,{

		run  : function() {
			init();
		},
		
		startupApps: function(){
			//	summary:
			//		Launches the apps specified in desktop.config to launch on startup
			var g = srvConfig.startupApps;
	        dojo.forEach(srvConfig.startupApps, function(app){
	            if(typeof app == "object"){
			app.arguments._startup = true;
	                this.launch(app.name, app.arguments);
		    }
	            else
	                this.launch(app, {_startup: true});
	        });
		}

	});

	return openstar;
});
