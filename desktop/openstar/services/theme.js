define("openstar/services/theme",[
  "dojo",
  "openstar/system2/Runtime",
  "./general",
  "./config"
],function(dojo,Runtime,srvGeneral,srvConfig) {
                  
	var theme = dojo.getObject("openstar.services.theme",true);
	dojo.mixin(theme,{
		//	summary:
		//		Theme manager
		draw: function(desktop)
		{
			if(dojo.isIE) document.execCommand('BackgroundImageCache', false, true);
			dojo.subscribe("configApply", this, function(conf){
				theme.set(desktop,conf.theme);
			});
		},

		set: function(/*object*/desktop,/*String*/theme)	{
			//	summary:
			//		Sets the theme
			//	theme:
			//		the theme to use
			srvConfig.theme = theme;
			desktop;
			runtime.changeTheme(theme);
		},
		
		/*=====
		_listArgs: {
			//	sysname: String
			//		the system name of the string (it's directory's name in /desktop/themes/)
			sysname: "green",
			//	name: String
			//		the displayable name of the theme
			name:"Green",
			//	author: String
			//		the author of the theme
			author:"pst",
			//	email: String
			//		the email address of the author
			email:"admin@psteam.co.jp",
			//	version: String
			//		The version of the theme
			version:"1.0",
			//	wallpaper: String
			//		the wallpaper for the theme (file located in the theme's dir)
			wallpaper:"wallpaper.png",
			//	preivew: String
			//		a screenshot of the theme (file located in the theme's dir)
			preview:"screenshot.png"
		}
		=====*/
		list: function(/*Function*/onComplete, /*Function?*/onError, /*Boolean?*/sync)
		{
			//	summary:
			//		Pases a list of the themes to the callback provided
			//	callback:
			//		a callback function. First arg is an array of desktop.theme._listArgs objects.
			//	sync:
			//		Should the call be synchronous? defaults to false.
	        var d = new dojo.Deferred();
	        if(onComplete) d.addCallback(onComplete);
	        if(onError) d.addErrback(onError);
			srvGeneral.xhr({
				backend: "core.theme.get.list",
				load: dojo.hitch(d, "callback"),
	            error: dojo.hitch(d, "errback"),
				sync: sync || false,
				handleAs: "json"
			});
	        return d; // dojo.Deferred
		},
		remove: function(/*String*/name, /*String?*/onComplete, /*String?*/onError){
			//	summary:
			//		removes a theme from the system
			//		must be an administrator to use this
			//	name:
			//		the name of the theme to remove
			//	onComplete:
			//		a callback once the action has been completed
			//	onError:
			//		a callback if there's an error
			var df = srvGeneral.xhr({
				backend: "core.theme.package.remove",
				content: {
					themename: name
				}
			});
			if(onCallback) df.addCallback(onComplete);
			if(onError) df.addErrback(onError);
			return df; // dojo.Deferred
		}
	});
	
	return theme;

});


