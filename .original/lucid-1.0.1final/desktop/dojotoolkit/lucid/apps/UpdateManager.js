dojo.provide("lucid.apps.UpdateManager");
dojo.require("dijit.layout.ContentPane");
dojo.requireLocalization("lucid", "apps");
dojo.requireLocalization("lucid", "common");
dojo.requireLocalization("lucid.apps.UpdateManager", "messages");

dojo.declare("lucid.apps.UpdateManager", lucid.apps._App, {
    drawUi: true,
    init: function(args){
	if(!args.background && args._startup)
		args.background = args._startup;
        this.drawUi = !args.background;
        if(lucid.admin.isAdmin){
            lucid.xhr({
                xsite: true,
                url: "http://www.lucid-desktop.org/download/version.json",
                load: dojo.hitch(this, "checkVersion"),
                error: dojo.hitch(this, "handleError"),
                handleAs: "json"
            });
            //debugging
            /*setTimeout(dojo.hitch(this, "checkVersion", {
                stable: null,
                unstable: "1.0.1.stable"
            }), 2000);*/
            if(this.drawUi){
                var app = dojo.i18n.getLocalization("lucid", "apps");
                var cmn = dojo.i18n.getLocalization("lucid", "common");
                var nls = dojo.i18n.getLocalization("lucid.apps.UpdateManager", "messages");
                var win = this.window = new lucid.widget.Window({
                    title: app["Update Manager"],
                    width: "400px",
                    height: "300px",
                    iconClass: this.iconClass
                });
                var top = this.header = new dijit.layout.ContentPane({
                    region: "top",
                    style: "padding: 5px;"
                });
                top.setContent("<h1>"+nls.checking+"</h1>");
                win.addChild(top);

                var bottom = new dijit.layout.ContentPane({
                    region: "bottom",
                    style: "text-align: right;"
                });
                var closeButton = new dijit.form.Button({
                    label: cmn.close,
                    onClick: dojo.hitch(this, "kill")
                });
                bottom.setContent(closeButton);
                win.addChild(bottom);
                
                var center = this.center = new dijit.layout.ContentPane({
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
                return lucid.version.toString.apply(this, arguments);
            }
        };
    },
    isNewer: function(current, latest){
      if(current.flag == "dev")
	current.flag = latest.flag;
       return (current.major < latest.major
            || current.minor < latest.minor
            || (current.patch < latest.patch || (current.patch == latest.patch && current.flag != latest.flag)));
    },
    checkVersion: function(versions){
        var v = lucid.version;
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
        this.header.setContent("<h1>"+nls.comError+"</h1>");
        this.center.setContent(nls.comDesc);
    },
    notify: function(version, isNewer){
        if(this.drawUi)
            this.notifyWindow(version, isNewer);
        else if(isNewer)
            this.notifyPopup(version);
    },
    notifyWindow: function(version, isNewer){
        var nls = dojo.i18n.getLocalization("lucid.apps.UpdateManager", "messages");
        if(isNewer){
            this.header.setContent("<h1>"+nls.updatesFound.replace("%s", version)+"</h1>");
            this.center.setContent(nls.instructions
                                   +"<br /><a href=\"%s\">%s</a>".replace(/\%s/g, "http://www.lucid-desktop.org/download/"+version+"/")
                                   +"<br /><br />"+nls.currentVersion.replace("%s", lucid.version));
            dojo.query("a", this.center.domNode).forEach(function(node){
    			dojo.connect(node, "onclick", node, function(e){
	        		if(!e.shiftKey && !e.ctrlKey){
				    	lucid.app.launchHandler(null, {url: this.href}, "text/x-uri");
			    		e.preventDefault();
		    		}
	    		})
    		});
        }
        else
            this.header.setContent("<h1>"+nls.noUpdates+"</h1>");
    },
    notifyPopup: function(version){
        var nls = dojo.i18n.getLocalization("lucid.apps.UpdateManager", "messages");
        lucid.dialog.notify({
            message: nls.updatesFound.replace("%s", version)
                    +"<br /><a href=\"javascript://\" onClick=\"lucid.app.launch('"+this.sysname+"');\">"+nls.moreDetails+"</a>",
            duration: 10000
        });
        this.kill();
    },
    kill: function(){
        if(this.window && !this.window.closed)
            this.window.close();
    }
});
