define([
	"dojo/json",
	"dojo/_base/lang",
	"dojo/_base/connect",
	"dojo/_base/kernel",
	"dojo/request/xhr",
	"dojo/text!openstar/config.json",
	"./general"
],function(json,lang,connect,kernel,xhr,txtConfig,srvGeneral) {

	xhr(require.toUrl("openstar/resources/version.json"),{
    sync: true, //so that we have the version ready before doing anything else
    handleAs: "json"
	}).then(function(data){
		lang.mixin(openstar.version, data);
	},function(err){
  	console.error(err);
		err;
	});

	var config = lang.getObject("openstar.services.config",true);
	lang.mixin(config,{
		//	summary:
		//		Contains configuraton for the desktop.
		init: function(cback){
			config.load(cback);
			setInterval(lang.hitch(config, "save"), 1000*60);
			connect.subscribe("desktoplogout", lang.hitch(config, "save"));
		},
		load: function(cback){
			//	summary:
			//		Loads the configuration from the server
			srvGeneral.xhr({
		       backend: "core.config.stream.load",
		        load: function(data, ioArgs){
							if(data == ""){
								config.apply();
								if(cback) cback();
								return;
							}
							data = json.parse(data);
							// mixin config.json data and add initStatus
							if(!data.initStatus){
								lang.mixin(data,json.parse(txtConfig));
							  data.initStatus = "not first";
							}
							if(data.save) data.save = config.save;
							if(data.load) data.load = config.load;
							config = lang.mixin(config, data);
							config.apply();

							if(cback) cback();
						}
			    });
			},

		save: function(/*Boolean?*/sync, /*Boolean*/sendlogged){
			//	summary:
			//		Saves the current configuration to the server
			//	sync:
			//		Should the call be synchronous? defaults to false
			//	sendlogged:
			//		Should the call update the 'logged' property in the database? defaults to true
			if(typeof sync == "undefined") sync=false;
			if(typeof sendlogged == "undefined") sendlogged=true;
			var configTmp = {};
			for(var key in config){
				if(lang.isFunction(config[key])) continue;
				configTmp[key] = lang.clone(config[key]);
			}
			srvGeneral.xhr({
        backend: "core.config.stream.save",
				sync: sync,
        content: {logged: sendlogged, value: json.stringify(configTmp)}
      });
		},

		apply: function()
		{
			//	summary:
			//		Applies the current configuration settings
			connect.publish("configApply", [config]);
		},
		fix: 1,
		theme :"soria",
		debug: true,
		//	crosstalkPing: Integer
		//		Crosstalk ping interval (in miliseconds)
		crosstalkPing: 1500,
		//	locale: String
		//		The locale of the user
		//		more details here: http://dojotoolkit.org/book/dojo-book-0-9/part-3-programmatic-dijit-and-dojo/i18n/specifying-locale
		locale: kernel.locale,
		//	toasterPos: String
		//		Position the toaster popup will appear
		//		Can be one of: ["br-up", "br-left", "bl-up", "bl-right", "tr-down", "tr-left", "tl-down", "tl-right"]
		//TODO: this needs a configuration tool
		toasterPos: "tr-down",
		//	wallpaper: Object
		//		Wallpaper information
		//		image - the image to display
		//		color - the background color of the wallpaper
		//		style - can be "centered", "tiled", or "fillscreen"
		//		storedList - an array of wallpapers that the user can pick from in the wallpaper dialog
		wallpaper: {
			image: "/desktop/qface/resources/themes/Tsunami/wallpaper.png",
			color: "#696969",
			style: "centered",
			storedList: []
		},
		//	startupApps: Array
		//		An array of app sysnames to launch at startup
		startupApps: [
      {name: "UpdateManager", arguments: {background: true}}
    ],
		//	window: Object
		//		window settings
		//		constrain - should the window be constrained to the screen's edge?
		//		animSpeed - how fast the fade/maximize/minimize animations should be in miliseconds
		window: {
			constrain: false,
			animSpeed: 275
		},

		//	filesystem: Object
		//		Some filesystem options (primarily for filearea)
		//		hideExt - should the file extentions be hidden?
		//		icons - a json object containing icons for each file extention
		//		places - array of bookmarked places on the filesystem
		filesystem: {
			places: [
				{name: "Home", path: "file://", icon: "icon-16-places-user-home"},
				{name: "Desktop", path: "file://Desktop/", icon: "icon-16-places-user-desktop"},
				{name: "Documents", path: "file://Documents/"},
				{name: "Public", icon: "icon-16-places-folder-remote", path: "public://"}
			],
			hideExt: false,
			//TODO: use mimetypes, not extentions!
			icons: {
				txt: "icon-32-mimetypes-text-x-generic",
				desktop: "icon-32-mimetypes-application-x-executable",
				mp3: "icon-32-mimetypes-audio-x-generic",
				wav: "icon-32-mimetypes-audio-x-generic",
				wma: "icon-32-mimetypes-audio-x-generic",
				jpg: "icon-32-mimetypes-image-x-generic",
				png: "icon-32-mimetypes-image-x-generic",
				gif: "icon-32-mimetypes-image-x-generic",
				xcf: "icon-32-mimetypes-image-x-generic",
				zip: "icon-32-mimetypes-package-x-generic",
				gz: "icon-32-mimetypes-package-x-generic",
				tar: "icon-32-mimetypes-package-x-generic",
				rar: "icon-32-mimetypes-package-x-generic",
				sh: "icon-32-mimetypes-text-x-script",
				js: "icon-32-mimetypes-text-x-script",
				bin: "icon-32-mimetypes-text-x-script",
				mpg: "icon-32-mimetypes-video-x-generic",
				wmv: "icon-32-mimetypes-video-x-generic",
				mpeg: "icon-32-mimetypes-video-x-generic",
				avi: "icon-32-mimetypes-video-x-generic",
				mpg: "icon-32-mimetypes-video-x-generic"
			}
		}
	});

	return config;
});

