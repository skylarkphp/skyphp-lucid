define([
	"dojo", // dojo
	"dojo/io/script",
	"dojo/_base/array",
	"dojo/_base/declare", 
	"dijit/_Templated",
	"openstar/desktop2/Application",
	"qfacex/dijit/container/deprecated/Window",
	"openstar/system2/Runtime",
 ],function(dojo,ioScript,array,declare,_Templated,_App,Window,qface) {
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
			
			},
			"-attributes-"	:	{
			},
			"-methods-"	:	{
		 		init: function(args){
		 			var app = 'PDFViewer';
		 			this.windows = [];
		 			var win = new Window({
		 				app:this,
		 				title: app,
		 				onClose: dojo.hitch(this, "kill")
		 			});

		 			this.windows.push(win);

		 			var cpane = new dijit.layout.ContentPane({
			    		title: 'open pdf in here' +this.instance,
			    		href:"openstar/apps/PDFViewer/templates/pdf_page.html",
			    		style: "background-color: #404040;",
			    		region: "center"
			    	});
			    	win.addChild(cpane);
	        
		 			win.show();

		 			qface.addDojoCss("openstar/apps/PDFViewer/templates/stylesheets/viewer.css");

					var locale = document.createElement('link');
					locale.rel = 'openstar/apps/PDFViewer/templates/locale.properties';
					locale.type = "application/l10n";
					document.getElementsByTagName("head")[0].appendChild(locale);

					qface.addDojoJs("openstar/apps/PDFViewer/templates/javascripts/build/pdf.js");
				

					setTimeout(function(){
						var jsFile = [
							'openstar/apps/PDFViewer/templates/javascripts/compatibility.js',
							'openstar/apps/PDFViewer/templates/javascripts/l10n.js',
							'openstar/apps/PDFViewer/templates/javascripts/debugger.js',
							'openstar/apps/PDFViewer/templates/javascripts/viewer.js'
						];
						array.forEach(jsFile,function(js){
							qface.addDojoJs(js);
						});
					},1000);
				},

		 		kill: function(args){
					dojo.forEach(this.windows, function(win){
		    		    if(!win.closed)
		            		win.close();
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

	 	return declare(_App, {
		});
});
