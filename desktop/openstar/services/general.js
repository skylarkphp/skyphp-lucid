define([
	"dojo/has",
  "dojo/_base/lang",
  "dojo/request/xhr",
  "dojo/json",
  "dojo/Deferred"
],function(has,lang,baseXhr,json,Deferred) {
	var general = lang.getObject("openstar.services.general",true);
	
  // some internal sysem vars for XHR security
  var token = null;
  var systemActive = true;
  var appActive = false;
  var currentApp = false;
  var _registeredModules = {};
  
  // make sure XMLHttpRequest can't be accessed directly
  if(typeof XMLHttpRequest != "undefined"){
    var xhr = XMLHttpRequest;
		//  window.XMLHttpRequest = null;
  }
  if(has("ie")){
    var AXO = ActiveXObject;
			//  window.ActiveXObject = null;
  }
  // redeclare the function in this scope
  var d = dojo;
  if (dojo._xhrObj) {
	  var dxhr = eval("({xhr:"+dojo._xhrObj.toString()+"})").xhr; //stupid workaround for IE
	  dojo._xhrObj = function(){
	      if(!(systemActive == true && appActive === false)){
	          console.log(arguments.callee.caller.toString());
	          throw new Error("Access denied: App or outside script attempted to get an XHR object directly");
	          return;
	      }
	      if(xhr)
	          window.XMLHttpRequest = xhr;
	      if(has("ie"))
	          window.ActiveXObject = AXO;
	      var ret = dxhr.call(dojo, arguments);
				//   if(xhr)
				//     window.XMLHttpRequest = null;
				//   if(dojo.isIE)
				//     window.ActiveXObject = null;
	      return ret;
	  };
  }

	var backend = function(str){
    var mod=str.split(".");
	  //TODO: put in something so we can switch to python backends when desired
		var url = "../backend";
    for(var i=0; i <= mod.length-3; i++){
    	url += "/"+mod[i];
    }
	  url += ".php?section="+escape(mod[mod.length-2]);
		url += "&action="+escape(mod[mod.length-1]);

    // WORKAROUND, see #159 for more info
    if(str == "api.fs.io.upload")
      return "../backend/api/fs_uploader_workaround.php?vars="+dojo.cookie("desktop_session");

		return url;
	};
	
	lang.mixin(general, {
		xhr: function(/*dojo.__ioArgs|String*/args){
		  //	summary:
			//		an extention of dojo's XHR utilities, but with some extra params to make life easy
		  //	
			//	args:
			//		When you give a string such as "api.fs.io.read", you will get the backend's url returned.
		  //		You can also give an object as you would in dojo's XHR methods. However there are two extra params.
			//		backend - a backend string as described above
		  //		xsite - when true, it makes the call using the server-side proxy (so you can make cross-domain reques
	    if(lang.isString(args)){
		    //if we just need to get a module url, pass a string
				return backend(args);
	    }
			if(args.xsite){
	    	if(!lang.isObject(args.content)) args.content = {};
		    var xsiteArgs = {
					url: args.url
	    	}
		    if(args.auth){
			    xsiteArgs.authinfo = lang.clone(args.auth);
					if(!args.appid){
	    			xsiteArgs.appid=0;
		    	}
			    else {
				    xsiteArgs.appid=args.appid;
						delete args.appid;
	    		}
		    }
	    	args.content["DESKTOP_XSITE_PARAMS"] = json.stringify(xsiteArgs);
				delete args.auth;
	    	args.url = "../backend/api/xsite.php";
			} else if(args.backend){
				args.url = backend(args.backend);
		  } else if(args.app){
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
	});
	
//  dojo.xhrPost({
//    url: "../backend/core/bootstrap.php?section=check&action=getToken",
//    sync: true,
//    load: function(data){
//      token = data.token;
//    },
//    handleAs: "json"
//  });

	baseXhr.post("../backend/core/bootstrap.php?section=check&action=getToken",{
	    sync: true,
	    handleAs: "json"
	}).then(function(data){
      token = data.token;
    });
		

  return general;
});



