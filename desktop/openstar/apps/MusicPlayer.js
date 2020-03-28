define([
	"qscript/lang/Class", // declare
	 "dijit/form/_FormValueWidget",
	 "qfacex/dijit/button/Button",
	 "qfacex/dijit/input/TextBox",
	 "dijit/form/HorizontalSlider",
	 "dijit/form/VerticalSlider",
	 "qfacex/dijit/button/DropDownButton",
	 "qfacex/dijit/toolbar/Toolbar",
	 "qfacex/dijit/container/ContentPane",
	 "dojox/gfx",
	 "dojox/gfx/Moveable",
	 "openstar/desktop2/Application",
	 "qfacex/dijit/container/deprecated/Window",
	 "qfacex/dijit/infomation/StatusBar",
	 "openstar/services/filesystem",
	 "openstar/ui/dialog",
	 "openstar/media/Sound",
	 "dojo/i18n!openstar/nls/common",
	 "dojo/i18n!./nls/apps",
	 "dojo/i18n!openstar/nls/messages"
	 
],function(Class,_FormValueWidget,Button,TextBox,HorizontalSlider,VerticalSlider,DropDownButton,Toolbar,ContentPane,gfx,Moveable,_App,Window,StatusBar,filesystem,dialog,Sound,nlsCommon,nlsApps,nlsMessages) {

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
				sound: false
			},
			"-attributes-"	:	{
			},
			"-methods-"	:	{
				init: function(args){
					var nls = this.nls = nlsCommon;//i18n.getLocalization("desktop", "common",this.lang);
					var app = nlsApps;//i18n.getLocalization("desktop", "apps",this.lang);
					this.win = new Window({
			        	app  : this,
						title: app["Music Player"],
						width: "500px",
						height: "150px",
						iconClass: this.iconClass,
						onClose: dojo.hitch(this, "kill")
					});
					var toolbar = new Toolbar({region: "top"});
					dojo.forEach([
						{
							label: nls.openFile,
							iconClass: "icon-16-actions-document-open",
							onClick: dojo.hitch(this, this.openFileDialog)
						},
						{
							label: nls.openUrl,
							iconClass: "icon-16-actions-document-open",
							onClick: dojo.hitch(this, this.openURLDialog)
						}
					], function(item){
						toolbar.addChild(new Button(item));
					});
					this.win.addChild(toolbar);
					var volume = new VerticalSlider({
						onChange: dojo.hitch(this, function(val){
							this.sound.volume(val);
							dojo.removeClass(this.ui.volume.iconNode, "icon-32-status-audio-volume-high");
							dojo.removeClass(this.ui.volume.iconNode, "icon-32-status-audio-volume-medium");
							dojo.removeClass(this.ui.volume.iconNode, "icon-32-status-audio-volume-low");
							dojo.removeClass(this.ui.volume.iconNode, "icon-32-status-audio-volume-muted");
							if(val == 0){
								dojo.addClass(this.ui.volume.iconNode, "icon-32-status-audio-volume-muted");
							}
							else if(val > 0 && val < 33){
								dojo.addClass(this.ui.volume.iconNode, "icon-32-status-audio-volume-low");
							}
							else if(val >= 33 && val <= 66){
								dojo.addClass(this.ui.volume.iconNode, "icon-32-status-audio-volume-medium");
							}
							else {
								dojo.addClass(this.ui.volume.iconNode, "icon-32-status-audio-volume-high");
							}
						}),
						value: 100,
						style: "height: 100px; background-color: white;"
					});
					this.ui = {
						play: new Button({
							iconClass: "icon-32-actions-media-playback-start",
							onClick: dojo.hitch(this, this.play),
							showLabel: false,
							label: nls.play
						}),
						stop: new Button({
							iconClass: "icon-32-actions-media-playback-stop",
							onClick: dojo.hitch(this, this.stop),
							showLabel: false,
							label: nls.stop
						}),
						ticker: document.createElement("div"),
						volume: new DropDownButton({
							dropDown: volume,
							label: nls.volume,
							iconClass: "icon-32-status-audio-volume-high",
							showLabel: false
						}),
						slider: new HorizontalSlider({
							showButtons: false,
							style: "width: 100%;",
							onChange: dojo.hitch(this, this.skip)
						})
					};
					dojo.connect(this.ui.slider.domNode, "onmousedown", this, function(){
						this.stopTicker();
					});
					var ticker = this.ui.ticker;
					dojo.style(ticker, {
						border: "1px solid gray",
						backgroundColor: "black",
						color: "gray",
						width: "60%",
						position: "relative"
					})
					ticker.innerHTML = "&nbsp;0:00/00:00&nbsp;";
					var client = new Toolbar({region: "center"});
					for(var name in this.ui){
						var item = this.ui[name];
						if(item.declaredClass == "dijit.form.Button"){
							dojo.style(item.domNode, "width", "40px");
						}
						if (item.declaredClass){
							client.addChild(item);
						}
						else {
							var box = this.box = new ContentPane({}, item);
							client.addChild(box);
							dojo.removeClass(box.domNode, "dijitContentPane");
							dojo.addClass(box.domNode, "dijitInline");
						}
					}
					this.win.addChild(client);
					this.win.show();
					this.win.startup();
					if(args.file) this.openFile(args.file);
					else if(args.url) this.openURL(args.url);
				},
			    updateTitle: function(text){
			        var app = i18n.getLocalization("desktop", "apps",this.lang);
			        if(!text) return this.win.attr("title", app["Music Player"]);
			        this.win.attr("title", text+" - "+app["Music Player"]);
			    },
				play: function(){
					if(this.sound){
						this.is_playing=true;
						this.sound.play();
						if(this.sound.capabilities.pause){
							dojo.removeClass(this.ui.play.iconNode, "icon-32-actions-media-playback-start");
							dojo.addClass(this.ui.play.iconNode, "icon-32-actions-media-playback-pause");
							this.ui.play.setLabel(this.nls.pause);
							this.ui.play.onClick = dojo.hitch(this, this.pause);
						}
						this.ui.play.startup();
						this.startTicker();
					}
				},
				pause: function(){
					if(this.sound && this.sound.capabilities.pause){
						this.is_playing = false;
						this.sound.pause();
						dojo.removeClass(this.ui.play.iconNode, "icon-32-actions-media-playback-pause");
						dojo.addClass(this.ui.play.iconNode, "icon-32-actions-media-playback-start");
						this.ui.play.setLabel(this.nls.play);
						this.ui.play.onClick = dojo.hitch(this, this.play);
						this.stopTicker();
					}
				},
				skip: function(value){
					if (!this.ignoreOnChange){
						var d = this.sound.duration();
						this.sound.position((value / 100) * d);
						if(this.is_playing){
							this.sound.play();
							this.startTicker();
						}
					}
				},
				stop: function(){
					if(this.sound){
						this.is_playing = false;
						dojo.removeClass(this.ui.play.iconNode, "icon-32-actions-media-playback-pause");
						dojo.addClass(this.ui.play.iconNode, "icon-32-actions-media-playback-start");
						this.ui.play.setLabel(this.nls.play);
						this.ui.play.onClick = dojo.hitch(this, this.play);
						this.sound.stop();
						this.stopTicker();
						this.ui.slider.setValue(0);
					}
				},
				openURLDialog: function(){
					dialog.input({
						title: this.nls.openUrl,
						desktop:this.desktop,
						onComplete: dojo.hitch(this, this.openURL)
					});
				},
				openURL: function(fileurl){
					if ( fileurl){
						this.sound = new Sound({
							src: fileurl
						});
						this.play();
						fileurl = fileurl.split("/");
						this.filename = fileurl.pop();
					}
				},
				openFileDialog: function(){
					dialog.file({
						title: "Select audio file to open",
						scene:this.scene,
						onComplete: dojo.hitch(this, this.openFile)
					});
				},
				openFile: function(file){
					if (file){
						this.sound = new Sound({
							src: srvFilesystem.embed(file)
						});
						this.play();
						file = file.split("/");
						this.filename = file.pop();
					}
				},
				startTicker: function(){
					if(!this.__ticker) this.__ticker = setInterval(dojo.hitch(this, "updateTicker"), 1000);
				},
				stopTicker: function(){
					clearInterval(this.__ticker);
					this.__ticker = false;
				},
				updateTicker: function(){
					var c = this.sound.capabilities;
					if(c.id3)
						var i = this.sound.id3();
					if(c.id3 && i){
						var output = "<div>"+i.songname+"</div><div>"+i.artist+" - "+i.album+"</div>";
			            this.updateTitle(i.songname+" by "+i.artist); //TODO: translate?
					}
					else {
						var output = this.filename;
			            this.updateTitle(this.filename);
			        }
					if(!(c.position && c.duration)){
						this.box.domNode.innerHTML = output + "<div style='position: absolute; top:25%; right: 0px;'>" + "?:??/?:??" + "</div>";
						return;
					}
					var p = this.sound.position();
					var d = this.sound.duration();
					if(d==0) d = p+1;
					if(p == d) this.stop();
					this.ignoreOnChange=true;
					this.ui.slider.setValue(Math.floor((p/d)*100));
					this.ignoreOnChange=false;
					var pos = this.formatTime(p);
					var dur = this.formatTime(d);
					this.box.domNode.innerHTML = output + "<div style='position: absolute; top:25%; right: 0px;'>" + pos + "/" + dur + "</div>";
				},
				formatTime: function(ms){
					var ts = ms/1000;
					var m = Math.floor((ts/60));
					var s = Math.floor(ts % 60);
					
					if (s == 60){ m++; s = 0; }
					return m+":"+(s < 10 ? "0"+s : s );
				},
				kill: function(){
					this.stopTicker();
					if(this.sound) this.sound.destroy();
					if(!this.win.closed) this.win.close();
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

});
