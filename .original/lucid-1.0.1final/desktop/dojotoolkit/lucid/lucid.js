dojo.provide("lucid._base");
dojo.require("lucid.admin");
dojo.require("lucid.app");
dojo.require("lucid.config");
dojo.require("lucid.theme");
dojo.require("lucid.ui");
dojo.require("lucid.user");
dojo.require("lucid.crosstalk");
dojo.require("lucid.filesystem");
dojo.require("lucid.Registry");
dojo.require("lucid.Sound");
dojo.require("lucid.dialog");
dojo.require("lucid.widget.Window");
dojo.require("lucid.widget.StatusBar");
dojo.require("lucid.widget.Console");
dojo.require("lucid.widget.FileArea");
dojo.require("lucid.flash.flash");

dojo.require("dojox.uuid");
dojo.require("dojox.uuid.generateTimeBasedUuid");

(function(){
	var modules = [
		"lucid.crosstalk",
		"lucid.filesystem",
		"lucid.Sound",
	    'lucid.admin',
	    'lucid.app',
	    'lucid.config',
	    'lucid.theme',
		'lucid.ui',
	    'lucid.user',
        'lucid.dialog'
	]
	var callIfExists = function(object, method){
		object = dojo.getObject(object);
		if(dojo.isFunction(object[method]))
		{
			object[method]();
		}
		else if(object.prototype && dojo.isFunction(object.prototype.draw)){
			object.prototype[method]();
		}
	}
	dojo.addOnLoad(function(){
		lucid.xhr({
			backend: "core.bootstrap.check.loggedin",
			load: function(data, ioArgs){
				if(data == "0")
				{
					dojo.forEach(modules, function(module){
						callIfExists(module, "draw");
					});
					dojo.forEach(modules, function(module){
						callIfExists(module, "init");
					});
				}
				else
				{
					history.back();
					window.close();
					document.body.innerHTML = "Not Logged In";
				}
			}
		});
		//if debugging, put console in a window
		if(dojo.config.isDebug){
			var console = dojo.byId("firebugToolbar")
		}
	});
})();



(function(){
    // some internal sysem vars for XHR security
    var token = null;
    var systemActive = true;
    var appActive = false;
    var currentApp = false;
    var _registeredModules = {};
    
    // make sure XMLHttpRequest can't be accessed directly
    if(typeof XMLHttpRequest != "undefined"){
        var xhr = XMLHttpRequest;
        window.XMLHttpRequest = null;
    }
    if(dojo.isIE){
        var AXO = ActiveXObject;
        window.ActiveXObject = null;
    }
    // redeclare the function in this scope
    var d = dojo;
    var dxhr = eval("({xhr:"+dojo._xhrObj.toString()+"})").xhr; //stupid workaround for IE
    dojo._xhrObj = function(){
        if(!(systemActive == true && appActive === false)){
            console.log(arguments.callee.caller.toString());
            throw new Error("Access denied: App or outside script attempted to get an XHR object directly");
            return;
        }
        if(xhr)
            window.XMLHttpRequest = xhr;
        if(dojo.isIE)
            window.ActiveXObject = AXO;
        var ret = dxhr.call(dojo, arguments);
        if(xhr)
            window.XMLHttpRequest = null;
        if(dojo.isIE)
            window.ActiveXObject = null;
        return ret;
    }

    lucid.xhr = function(/*dojo.__ioArgs|String*/args){
	    //	summary:
    	//		an extention of dojo's XHR utilities, but with some extra params to make life easy
	    //	
    	//	args:
    	//		When you give a string such as "api.fs.io.read", you will get the backend's url returned.
	    //		You can also give an object as you would in dojo's XHR methods. However there are two extra params.
    	//		backend - a backend string as described above
	    //		xsite - when true, it makes the call using the server-side proxy (so you can make cross-domain reques
    	var backend = function(str){
	    	var mod=str.split(".");
		    //TODO: put in something so we can switch to python backends when desired
    		var url = "../backend";
	    	for(var i=0; i <= mod.length-3; i++)
		    {
    			url += "/"+mod[i];
	    	}
		    url += ".php?section="+escape(mod[mod.length-2]);
    		url += "&action="+escape(mod[mod.length-1]);
    
            // WORKAROUND, see #159 for more info
            if(str == "api.fs.io.upload")
                return "../backend/api/fs_uploader_workaround.php?vars="+dojo.cookie("desktop_session");
    
	    	return url;
    	}
	    if(dojo.isString(args)){
		    //if we just need to get a module url, pass a string
    		return backend(args);
	    }
    	if(args.xsite){
	    	if(!dojo.isObject(args.content)) args.content = {};
		    var xsiteArgs = {
    			url: args.url
	    	}
		    if(args.auth){
			    xsiteArgs.authinfo = dojo.clone(args.auth);
    			if(!args.appid){
	    			xsiteArgs.appid=0;
		    	}
			    else {
				    xsiteArgs.appid=args.appid;
    				delete args.appid;
	    		}
		    }
	    	args.content["DESKTOP_XSITE_PARAMS"] = dojo.toJson(xsiteArgs);
    		delete args.auth;
	    	args.url = "../backend/api/xsite.php";
    	}
	    else if(args.backend){
    		args.url = backend(args.backend);
	    }
    	else if(args.app){
	    	args.url = "../apps/"+args.app+"/"+args.url;
	    }
    	var df = new dojo.Deferred();
	    if(args.load) df.addCallback(args.load);
    	if(args.error) df.addErrback(args.error);
        if(!args.content) args.content = {};
	    args.content["DESKTOP_TOKEN"] = token;
    	var xhr = dojo.xhr("POST", dojo.mixin(args, {
	    	load: function(data){
		    	if(typeof parseInt(data) == "number" && parseInt(data) > 0 && !args.number){
			    	console.error(data); //TODO: we should alert the user in some cases, or possibly retry the request. OR FUCKTARD, RETURN AN ERROR, NE?
				    df.errback(data);
    			}
	    		else
		    		df.callback(data);
    		},
	    	error: function(err){
		    	console.error(err);
			    df.errback(err);
    		}
	    }), true);
    	df.canceler = dojo.hitch(xhr, "cancel");
	    return df;
    }
    dojo.xhrPost({
        url: "../backend/core/bootstrap.php?section=check&action=getToken",
        sync: true,
        load: function(data){
            token = data.token;
        },
        handleAs: "json"
    });
    

    var getCurrentApp = function(){
        return (currentApp ? currentApp.match(/lucid\.apps\.([^\.]+).+/)[1] : false);
    }
    
    var idsForOwners = {};
    var alterConstructedObject = function(obj){
        var id = obj.__desktop_id = dojox.uuid.generateTimeBasedUuid();
        if(typeof idsForOwners[id] != "undefined"){
            throw Error("Constructor id conflict, possible security intrusion");
        }
        idsForOwners[id] = getCurrentApp();
    }

    var registerSystemFunc = function(module, context, funcname){
        var oldFunc = context[funcname];
        context[funcname] = function(){
            //this is so that someone can't override this property and pose as any app they choose
            lucid.app.currentApp = getCurrentApp();
            //make sure we don't get in the way of the original call
            var firstCall = false;
            var appWasActive = false;
            if(systemActive == false)
                firstCall = true;
            if(appActive){
                appWasActive = appActive;
                appActive = false;
            }
            systemActive = true;
            
            if(this.__desktop_id){
                this.__desktop_owner = idsForOwners[this.__desktop_id];
            }

            var ret = oldFunc.apply(this, arguments);
            
            if(funcname == "_construct" && context.declaredClass){
                alterConstructedObject(this);
            }

            if(firstCall){
                systemActive = false;
                if(appWasActive)
                    appActive = appWasActive;
            }

            return ret;
        }
    }
    var registerAppFunc = function(module, context, funcname){
        var oldFunc = context[funcname];

        context[funcname] = function(){
            //this is so that someone can't override this property and pose as any app they choose
            lucid.app.currentApp = getCurrentApp();
            
            var appWasActive = false;
            if(appActive){
                appWasActive = true;
            }
            appActive = true;
            currentApp = module;
            
            var ret = oldFunc.apply(this, arguments);
            
            if(!appWasActive){
                appActive = false;
                currentApp = false;
                lucid.app.currentApp = "";
            }

            return ret;
        }
    }

    var registerModule = lucid.registerModule = function(name, obj){
        if(!systemActive){
            throw new Error("Access Denied: Attempted to register a module while the system wasn't active");
            return;
        }
        // recursively registers a module
        if(_registeredModules[name] == true) return; //already registered
        _registeredModules[name] = true;
        if(!obj)
            obj = dojo.getObject(name);
        var isApp = (name.indexOf("lucid.apps.") == 0);
        for(var prop in obj){
            var d = obj[prop];
            var t = typeof d;
            if(!obj[prop] || prop == "constructor")
                continue;
            if(d.prototype && d.prototype.declaredClass){
                registerModule(name+"."+prop+".prototype", d.prototype);
            }
            else if(t == "object"){
                registerModule(name+"."+prop, d);
            } 
            else if(t == "function"){
                (isApp ? registerAppFunc : registerSystemFunc)(name, obj, prop);
            }
        }
    }
    //register dojo's xhr methods as system functions
    dojo.forEach([
        "xhrGet",
        "xhrPost",
        "rawXhrPost",
        "xhrPut",
        "rawXhrPut",
        "xhrDelete",
        "_getText"
    ], function(method){
        registerSystemFunc("dojo", dojo, method);
    });
    dojo.addOnLoad(dojo.hitch(this, registerModule, "lucid"));
})();

lucid._loadApp = function(app){
    //declared outside of security scope so apps can't access security variables
    dojo["require"]("lucid.apps."+app);
    lucid.registerModule("lucid.apps."+app);
}

lucid.addDojoCss = function(/*String*/path)
{
	//	summary:
	//		Adds an additional dojo CSS file (useful for the dojox modules)
	//
	//	path:
	//		the path to the css file (the path to dojo is placed in front)
	//	
	//	example:
	//	|	api.addDojoCss("/dojox/widget/somewidget/foo.css");
	var element = document.createElement("link");
	element.rel = "stylesheet";
	element.type = "text/css";
	element.media = "screen";
	element.href = "./dojotoolkit/"+path;
	document.getElementsByTagName("head")[0].appendChild(element);
}

lucid.log = function(/*String*/str){
	//	summary:
	//		logs a string onto any console that is open
	//	
	//	str:
	//		the string to log onto the consoles
	str = dojo.toJson(str);
	dojo.query(".consoleoutput").forEach(function(elem){
		elem.innerHTML += "<div>"+str+"</div>";
	});
	console.log(str);
}

lucid.textContent= function(/*DomNode|String*/node, /*String?*/text){
	//	summary:
	//		sets the textContent of a domNode if text is provided
	//		gets the textContent if a domNode if text is not provided
	//		if dojo adds this in the future, grep though
	//		the js code and replace it with dojo's method
	//	node:
	//		the node to set/get the text of
	//	text:
	//		the text to use
	node = dojo.byId(node);
	var attr = typeof node.textContent == "string" ? "textContent" : "innerText";
	if(arguments.length == 1)
		return node[attr];
	else
		node[attr] = text;
}

lucid._errorCodes = [
	"ok",
	"generic_err",
	"not_authed",
	"not_found",
	"db_connect_err",
	"db_select_err",
	"db_query_err",
	"permission_denied",
	"mail_connect_err",
	"feature_not_available",
	"object_not_found",
	"already_installed",
	"quota_exceeded",
	"remote_authentication_failed",
	"remote_connection_failed",
    "token_mismatch"
];

// FOR BACKWARDS COMPATIBILITY
desktop = lucid;
