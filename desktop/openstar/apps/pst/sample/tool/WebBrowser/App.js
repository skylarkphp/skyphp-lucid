define([
     "qscript/lang/Class",
     "openstar/desktop2/Application",
     "openstar/desktop2/Window",
     "./MainForm",
     "dojo/i18n!./nls/app"
     
],function(Class,Application,Window,MainForm,nlsApp) {

	return Class.declare({
		"-parent-"		:	Application,
		
		"-interfaces-"	:	[],
		
		"-protected-"	:	{
			"-fields-"	:	{
			
				"$$title"	:	nlsApp.title,
				"$$title"	:	nlsApp.title
			
			},
			
			"-methods-"	:	{
			
			}
		},
		
		"-public-"	:	{
			"-fields-"	:	{
			
			},
			"-attributes-"	:	{
			},
			"-methods-"	:	{
		        init: function(args) {
		        	var win = this.window;
		        	win.show();
		        	var form = new MainForm({
		        		owner : win,
		        		title : nlsApp.title,
		        	});
		        	form.showFull();
		        
/*		        
		            var app = nlsApp;//i18n.getLocalization("scene", "apps",this.lang);
		            //var cm = nlsCommon;//i18n.getLocalization("scene", "common",this.lang);
		            this.win = new Window({
		                app  : this,
		                title: app.title,
		                
		                onClose: dojo.hitch(this, "kill")
		            });
		            this.Iframe = document.createElement("iframe");
		            dojo.style(this.Iframe, "width", "100%");
		            dojo.style(this.Iframe, "height", "100%");
		            dojo.style(this.Iframe, "border", "0px");
		            this.urlbox = new TextBox({style: "width: 80%;"});
		            var form = new Toolbar({region: "top"});
		            form.addChild(this.urlbox);
		            form.addChild(new Button({iconClass: "icon-22-actions-go-jump", label: app.go, onClick: dojo.hitch(this, this.go), style: "width: 10%;"}));
		            form.startup();
		            this.win.addChild(form);
		            var client = new ContentPane({region: "center"}, document.createElement("div"));
		            client.setContent(this.Iframe);
		            this.win.addChild(client);
		            this.win.show();
		            if(args.url) this.go(args.url);
		            else this.go("http://www.yahoo.co.jp/");
		            this.win.startup();
		        },
		        
*/			
				}
			},
			"-constructor-"	:	{
				"initialize"	:	[
					function(info){
						info.iconClass = "icon-16-apps-internet-web-browser";
						this.overrided(info);
					}				
				]
			}
		}
	});	
});
