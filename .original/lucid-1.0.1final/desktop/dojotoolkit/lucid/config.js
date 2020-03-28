dojo.provide("lucid.version");
dojo.provide("lucid.config");
lucid.version = {
    major: 0,
    minor: 0,
    patch: 0,
    flag: "dev",
    toString: function(){
	    return this.major+"."+this.minor+"."+this.patch+"."+this.flag;
    }
};
dojo.xhrGet({
    url: dojo.moduleUrl("lucid.resources", "version.json"),
    sync: true, //so that we have the version ready before doing anything else
    load: function(data){
        dojo.mixin(lucid.version, data);
    },
    handleAs: "json"
})

lucid.config = {
	//	summary:
	//		Contains configuraton for the lucid.
	init: function(cback){
		lucid.config.load(cback);
		setInterval(dojo.hitch(lucid.config, "save"), 1000*60);
		dojo.subscribe("desktoplogout", dojo.hitch(lucid.config, "save"));
	},
	load: function(cback){
		//	summary:
		//		Loads the configuration from the server
		lucid.xhr({
	        backend: "core.config.stream.load",
	        load: function(data, ioArgs){
				if(data == ""){
					lucid.config.apply();
					if(cback) cback();
					return;
				}
				data = dojo.fromJson(data);
				if(data.save) data.save = lucid.config.save;
				if(data.load) data.load = lucid.config.load;
				lucid.config = dojo.mixin(lucid.config, data);
				lucid.config.apply();
				
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
		var config = {}
		for(var key in lucid.config){
			if(dojo.isFunction(lucid.config[key])) continue;
			config[key] = dojo.clone(lucid.config[key]);
		}
		lucid.xhr({
            backend: "core.config.stream.save",
			sync: sync,
            content: {logged: sendlogged, value: dojo.toJson(config)}
        });
	},
	apply: function()
	{
		//	summary:
		//		Applies the current configuration settings
		dojo.publish("configApply", [lucid.config]);
	},
	//	fx: Integer
	//		Intensity of desktop effects (3 = insane, 0 = none)
	fx: 2,
	//	debug: Boolean
	//		Whether or not the desktop should output information involving debugging
	debug: true,
	//	crosstalkPing: Integer
	//		Crosstalk ping interval (in miliseconds)
	crosstalkPing: 1500,
	//	panels:	Array
	//		an array of each panel's settings and applets
	panels: [
		{
			thickness: 24,
			span: 1,
			locked: true,
			orientation: "horizontal",
			placement: "TC",
			opacity: 0.95,
			applets: [
				{"settings": {}, "pos": 0.00, "declaredClass": "lucid.ui.applets.Menubar"},
				{"settings": {}, "pos": 0.85, "declaredClass": "lucid.ui.applets.Netmonitor"},
				{"settings": {}, "pos": 0.71, "declaredClass": "lucid.ui.applets.User"},
				{"settings": {}, "pos": 0.88, "declaredClass": "lucid.ui.applets.Clock"}
			]
		},
                {
                        thickness: 24,
                        span: 1,
                        locked: true,
                        orientation: "horizontal",
                        placement: "BC",
                        opacity: 0.95,
                        applets: [
                                {"settings": {}, "pos": 0.00, "declaredClass": "lucid.ui.applets.Taskbar"}
                        ]
                }
	],
	//	locale: String
	//		The locale of the user
	//		more details here: http://dojotoolkit.org/book/dojo-book-0-9/part-3-programmatic-dijit-and-dojo/i18n/specifying-locale
	locale: dojo.locale,
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
		image: dojo.moduleUrl("lucid.resources.themes.Minuit", "wallpaper.png").path,
		color: "#696969",
		style: "centered",
		storedList: []
	},
	//	theme: String
	//		The user's preferred theme
	theme: "Minuit",
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
}
