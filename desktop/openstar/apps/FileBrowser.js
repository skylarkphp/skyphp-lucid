define([
	"qscript/lang/Class", // declare
	 "dijit/form/_FormValueWidget",
	 "qfacex/dijit/button/Button",
	 "qfacex/dijit/input/TextBox",
	 "qfacex/dijit/toolbar/Toolbar",
	 "qfacex/dijit/menu/Menu",
	 "qfacex/dijit/menu/MenuItem",
	 "qfacex/dijit/container/ContentPane",
	 "qfacex/dijit/container/BorderContainer",
	 "dojox/embed/Flash",
	 "dojox/form/Uploader",
	 "openstar/system2/Runtime",
	 "openstar/desktop2/Application",
	 "qfacex/dijit/container/deprecated/Window",
	 "qfacex/dijit/infomation/StatusBar",
	 "openstar/ui/widget/FileArea",
	 "openstar/services/general",
	 "openstar/services/filesystem",
	 "openstar/services/config",
	 "openstar/ui/dialog",
	 "dojox/form/uploader/plugins/IFrame",
 	 "dojo/i18n!openstar/nls/common",
 	 "dojo/i18n!openstar/nls/system",
 	 "dojo/i18n!openstar/nls/places",
	 "dojo/i18n!openstar/nls/messages",
	 "dojo/i18n!./nls/apps",
	 "dojo/i18n!openstar/ui/widget/nls/filearea"
	 
],function(Class,_FormValueWidget,Button,TextBox,Toolbar,Menu,MenuItem,ContentPane,BorderContainer,Flash,Uploader,Runtime,_App,Window,StatusBar,FileArea,srvGeneral,srvFilesystem,srvConfig,dialog,IFrame,nlsCommon,nlsSystem,nlsPlaces,nlsMessages,nlsApps,nlsFileArea) {
	

	runtime.addDojoCss("dojox/form/resources/FileInput.css");

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
				windows: [],
			
			},
			"-attributes-"	:	{
			},
			"-methods-"	:	{
				init: function(args)
				{
					var cm = nlsCommon;//i18n.getLocalization("desktop", "common",this.lang);
					var app = nlsApps;//i18n.getLocalization("desktop", "apps",this.lang);
					var places = nlsPlaces;//i18n.getLocalization("desktop", "places",this.lang);
					var sys = nlsSystem;//i18n.getLocalization("desktop", "system",this.lang);
					this.win = new Window({
			        	app  : this,
						title: app["File Browser"],
						iconClass: this.iconClass,
						onClose: dojo.hitch(this, "kill")
					});
					this.fileArea = new FileArea({path: (args.path || "file://"), region: "center",scene:this.scene});
			        this.updateTitle(this.fileArea.path);
			        this.fileArea.refresh();
					this.pane = new ContentPane({region: "left", splitter: true, minSize: 120, style: "width: 120px;"});
					var menu = new Menu({
						style: "width: 100%;"
					});
					dojo.forEach(srvConfig.filesystem.places, function(item){
						var item = new MenuItem({label: places[item.name] || item.name,
							iconClass: item.icon || "icon-16-places-folder",
							onClick: dojo.hitch(this.fileArea, "setPath", item.path)
						});
						menu.addChild(item);
					}, this);
					this.pane.setContent(menu.domNode);
					this.win.addChild(this.pane);
					this.win.addChild(this.fileArea);
					
					this.pathbar = new Toolbar({region: "center"});
					this.pathbox = new TextBox({
						style: "width: 90%;",
						value: args.path || "file://"
					});
					dojo.connect(this.fileArea, "onPathChange", this, function(){
						this.pathbox.setValue(this.fileArea.path);
						this.fixUploadPath(this.fileArea.path);
						this.statusbar.attr("label", "&nbsp;");
			            this.updateTitle(this.fileArea.path);
					});
					this.pathbar.addChild(this.pathbox);
					this.goButton = new dijit.form.Button({
						label: cm.go,
						onClick: dojo.hitch(this, function(){
							this.fileArea.setPath(this.pathbox.getValue());
						})
					});
					this.pathbar.addChild(this.goButton);
					
					
					this.toolbar = new Toolbar({region: "top"});
						var button = new Button({
							onClick: dojo.hitch(this.fileArea, function(){
								this.setPath("file://");
							}),
							iconClass: "icon-16-places-user-home",
							label: places.Home
						});
						this.toolbar.addChild(button);
						var button = new Button({
							onClick: dojo.hitch(this.fileArea, this.fileArea.up),
							iconClass: "icon-16-actions-go-up",
							label: cm.up
						});
						this.toolbar.addChild(button);
						var button = new Button({
							onClick: dojo.hitch(this.fileArea, this.fileArea.refresh),
							iconClass: "icon-16-actions-view-refresh",
							label: cm.refresh
						});
						this.toolbar.addChild(button);
						this.quotabutton = new Button({
							onClick: dojo.hitch(this, "quotaNotice"),
							iconClass: "icon-16-devices-drive-harddisk",
							label: sys.quota
						});
						this.toolbar.addChild(this.quotabutton);
			            this.makeUploadButton();
						var load = this.loadNode = document.createElement("div");
						dojo.addClass(load, "icon-loading-indicator");
						dojo.style(load, {
							display: "none",
							position: "absolute",
							top: "0px",
							right: "0px",
							margin: "7px"
						});
						this.toolbar.domNode.appendChild(load);
						
						dojo.connect(this.fileArea, "_loadStart", this, function(){
							dojo.style(load, "display", "block");
						});
						dojo.connect(this.fileArea, "_loadEnd", this, function(){
							dojo.style(load, "display", "none");
						});
					
					var bCont = new BorderContainer({
						region: "top",
						gutters: false,
						style: "height: 42px;"	//This is really fucked up, since themes may use different heights for toolbars.
												//If BorderContainer ever supports more then one widget in one slot, please fix this.
					})
					bCont.addChild(this.toolbar);
					bCont.addChild(this.pathbar);
					this.win.addChild(bCont);
					// Status bar
					this.statusbar = new StatusBar({region: "bottom"});
					this.win.addChild(this.statusbar);
					this.win.show();
					bCont.startup();
			        this.win.resize();
					setTimeout(dojo.hitch(this, "makeUploader"), 1000);
				},
			    updateTitle: function(path){
			        var folders = path.split("/");
			        var text = folders[folders.length-1] || folders[folders.length-2] || path;
			        var app = nlsApps;//i18n.getLocalization("desktop", "apps",this.lang);
			        this.win.attr("title", text + " - "+app["File Browser"]);
			    },
				quotaNotice: function(){
					var cm = nlsCommon;//i18n.getLocalization("desktop", "common",this.lang);
					var sys = nlsSystem;//i18n.getLocalization("desktop", "system",this.lang);
					if(typeof(this.quotaWin) != "undefined"){ if(!this.quotaWin.closed){ return; } }
					srvFilesystem.getQuota(this.fileArea.path, dojo.hitch(this, function(values){
						values.total = Math.round(values.total / 1024); values.remaining = Math.round(values.remaining / 1024); values.used = Math.round(values.used / 1024); 
						this.quotaWin = new Window({
				        	app  : this,
							title: sys.quota,
							resizable: false,
							height: "75px",
							width: "175px"
						});
						this.windows.push(this.quotaWin);
						var content = new ContentPane({});
						var central = document.createElement("div");
						central.innerHTML = cm.total+": "+values.total+"kb<br>";
						central.innerHTML += cm.used+": "+values.used+"kb<br>";
						central.innerHTML += cm.remaining+": "+values.remaining+"kb";
			            // TODO: get a progress bar in here?
						content.setContent(central);
						this.quotaWin.addChild(content);
						this.quotaWin.show();
						this.quotaWin.startup();
					}));
				},
				makeUploader: function(){
				  return;
				    this.uploader = new dojox.form.Uploader({
					    button: this.upbutton,
					    force : "html",
					    degradable: true,
					    //uploadUrl: desktop.xhr("api.fs.io.upload")+"&path="+encodeURIComponent(this.fileArea.path),
			            uploadUrl: srvGeneral.xhr("api.fs.io.upload")+"?path="+encodeURIComponent(this.fileArea.path),
					    uploadOnChange: true,
			            selectMultipleFiles: true
					});
			       if(Flash.available > 9){
			            //fix button (workaround)
			           this.fixButton();
			           dojo.connect(this.uploader, "_connectInput", this, "fixButton");
			        }
			        this.doUploaderConnects();
				},
				
			    fixButton: function(){
			        var node = this.uploader.fileInputs[0];
			        console.log(node);
			        setTimeout(dojo.hitch(this, function(){
			//---            var butNode = this.upbutton.domNode;
			            var butNode = this.uploader.insideNode;
			            var upNode = this.uploader._formNode;
			            butNode.appendChild(upNode);
			            dojo.style(butNode, "position", "relative");
			            var right = node.offsetWidth-butNode.offsetWidth
			            dojo.style(node, {
			                top: "0px",
			                left: "-"+right+"px",
			                clip: "rect(0px, "+right-butNode.offsetWidth+"px, "+butNode.offsetHeight+"px, "+right+"px)"
			            });
			            dojo.style(node.parentNode, {position: "absolute", top: "0px", left: "0px"});
			//---            dojo.query("span.dijitReset.dijitRight.dijitInline", this.upbutton.domNode).style("position", "relative");
			            dojo.query("span.dijitReset.dijitRight.dijitInline", butNode).style("position", "relative");
			        }), 500);
			    },

			    makeUploadButton: function(){
			        if(this.upbutton)
			            this.upbutton.destroy();
			        var cm = nlsCommon;//i18n.getLocalization("desktop", "common",this.lang);
			//        this.upbutton = new Button({
			//			iconClass: "icon-16-actions-mail-send-receive",
			//			label: cm.upload
			//		});

			 		this.upbutton = this.uploader =  new dojox.form.Uploader({
						iconClass: "icon-16-actions-mail-send-receive",
						label: cm.upload,
			            url: srvGeneral.xhr("api.fs.io.upload")+"?path="+encodeURIComponent(this.fileArea.path),
					    uploadOnSelect:false,
			            flashFieldName: "uploadedfile"
					});		
					this.toolbar.addChild(this.upbutton);
			        this.doUploaderConnects();
			    },

				fixUploadPath: function(path){
				    var loc = window.location.href.split("/");
					loc.pop();
					loc = loc.join("/")+"/";
			        //var newUrl = loc+srvGeneral.xhr("api.fs.io.upload")+"&path="+encodeURIComponent(this.fileArea.path);
			        var newUrl = loc+srvGeneral.xhr("api.fs.io.upload")+"?path="+encodeURIComponent(this.fileArea.path);
					this.uploader.url = newUrl;
			//		if(this.uploader.flashObject){
			//            this.uploader.destroy();
			//            this.makeUploadButton();
			//            this.makeUploader();
			//        }
				},
				
				doUploaderConnects: function(){
					var nls = nlsFileArea;//i18n.getLocalization("desktop.widget", "filearea",this.lang);
				    var uploader = this.uploader;
				    dojo.connect(uploader, "onChange", this, function(dataArray){
				    var loc = window.location.href.split("/");
					loc.pop();
					loc = loc.join("/")+"/";
			        //var newUrl = loc+srvGeneral.xhr("api.fs.io.upload")+"&path="+encodeURIComponent(this.fileArea.path);
			        var newUrl = loc+srvGeneral.xhr("api.fs.io.upload")+"?path="+encodeURIComponent(this.fileArea.path);
					this.uploader.url = newUrl;
				       this.uploader.upload(dataArray[0]);
				       this.statusbar.attr({
				            label: nls.uploading.replace("%s", dataArray.length),
				            showProgress: true
				       });
				       this.statusbar.update({
				            indeterminate: true
				       });
				    });
				    dojo.connect(uploader, "onProgress", this, function(dataArray){
				        var progress = 0;
				        var total = 0;
				        dojo.forEach(dataArray, function(file){
				            progress += file.bytesLoaded;
				            total += file.bytesTotal;
				        });
				        this.statusbar.update({
				            indeterminate: false,
				            progress: progress,
				            maximum: total
				        });
			            //workaround
			            if(progress >= total) uploader.onComplete([{status: "success"}]);
				    });
				    uploader.onComplete = dojo.hitch(this, function(data){
				        if((data.status || data[data.length-1].status )== "success"){
				           this.statusbar.attr({
				                label: nls.uploadingComplete,
				                showProgress: false
				           });
				           this.fileArea.refresh();
				        }else{
				           this.statusbar.attr({
				                label: "Error: "+data.details,
				                showProgress: false
				           });
				        }
				        this.uploader.reset();
				    });
			        dojo.connect(uploader, "onError", this, function(data){
			            this.statusbar.attr({
			                label: "Error",
			                showProgress: false
			            });
			        });
				},
				
				kill: function(){
					if(!this.win.closed){ this.win.close(); }
					dojo.forEach(this.windows, function(win){
						if(!win.closed) win.close();
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


return dojo.declare("openstar.apps.FileBrowser", _App, {
});

});
