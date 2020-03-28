/**
 * openstar/desktop2/scenes/icons/Scene
 *
 * Copyright (c) 2013 psteam Inc.(http://www.psteam.co.jp)
 * http://www.psteam.co.jp/qface/license
 *
 * @Author: liwenfeng
 * @Date: 2013/02/28
 */
define([
    "dojo",
    "dojo/_base/lang",
	"dojo/dom-style",
	"dojo/_base/array",
	"dojo/data/ItemFileWriteStore",
	"qfacex/dijit/container/deprecated/Window",
	"openstar/desktop2/_SceneBase",
	"openstar/system2/Runtime",
	"openstar/desktop2/scenes/icons/Area",
	"openstar/desktop2/scenes/icons/Panel"
],function(dojo,lang,domStyle,array,ItemFileWriteStore,Window,_SceneBase,qface,Area,Panel) {
	var Scene = Class.declare({
		"-parent-"		:	_SceneBase,

		"-interfaces-"	:	[],

		"--mixins--"	:	[],

		"-protected-"	:	{
			"-fields-"	:	{
				//	_windowList: dojo.data.ItemFileWriteStore
				//		A dojo.data.ItemFileWriteStore containing a list of windows
				_windowList: null,
				//	_drawn: Boolean
				//		true after the UI has been drawn

				_drawn: false

			},

			"-methods-"	:	{

			}
		},

		"-public-"	:	{
			"-attributes-"	:	{

			},
			"-methods-"	:	{
				init: function(config){
					//	summary:
					//		creates a openstar.scene.Area widget and places it on the screen
					//		waits for the config to load so we can get the locale set right
					if(this._drawn === true) return;
					this._drawn = true;
					this._config = config;

					this.makeArea();
					this.makePanels();
				},

				makeArea : function() {
		            var appDescs = [],
		            	desktop = this.desktop;
		            this._config.apps.forEach(function(appId) {
		            // appStartInfo: [appId,autoStart]
		                var appDesc = runtime.findAppDesc(appId);
		                appDescs.push(appDesc);
		            }, this);

					this._area = new Area({
						style:"width:100%;height:100%",
						name :this.name,
						items : appDescs,
						scene:this
					});
					this.addChild(this._area);
					this._area.updateWallpaper(this._config.wallpaper);
				},

				//	drawn: Boolean
				//		have the panels been drawn yet?
				makePanels: function(){
					//	summary:
					//		the first time it is called it draws each panel based on what's stored in the configuration,
					//		after that it cycles through each panel and calls it's _place(); method
			        if(this.drawn){
				        dojo.query(".scenePanel",this._area.domNode).forEach(function(panel){
					       var p = dijit.byNode(panel);
					       p._place();
				        }, this);
			            return;
			        }
			        this.drawn = true;
			        var panels = this._config.panels;
					dojo.forEach(panels, dojo.hitch(this,function(panel){
						var args = {
							thickness: panel.thickness,
							span: panel.span,
							placement: panel.placement,
							opacity: panel.opacity,
							scene: this
						}
						var p = new Panel(args);
						if(panel.locked) p.lock();
						else p.unlock();
						p.restore(panel.applets);
						this._area.addChild(p);
						// p.startup();
					}));
					this._area.resize();
					// domStyle.set(this._area.containerNode,"overflow","auto"); // new panel
				},

				save: function(){
					//	summary:
					//		Cylces through each panel and stores each panel's information in srvConfig
					//		so it can be restored during the next login
					var panels = this._config.panels = [];
					dojo.query(".scenePanel",this._area.domNode).forEach(function(panel, i){
						var wid = dijit.byNode(panel);
						panels[i] = {
							thickness: wid.thickness,
							span: wid.span,
							locked: wid.locked,
							placement: wid.placement,
							opacity: wid.opacity,
							applets: wid.dump()
						};
					});
				},

				// modified by LWF 20140718
				resize : function(newSize, currentSize) {
					this.overrided(newSize,currentSize);
					if (this._area) {
						this._area.resize(newSize, currentSize);
					}
				},

		        launch: function(appDesc,initParams) {
		            var self = this,
		                args = Object.mixin({
		                    scene: self
		                },appDesc); // will be changed

		            console.log("launching app " + appDesc.name);
		            runtime.createAppInst(appDesc,args).then(function(instance) {
		                try {
//		                    var m_config = lang.clone(appDesc);
//		                    lang.mixin(m_config, {
//		                        winId: instance.win && instance.win.id,
//		                        sceneId: self.sceneId,
//		                        areaId:  self.currentArea && self.currentArea.areaId,
//		                        status: "init",
//		                        type: self._config && self._config.username
//		                    });
//		                    // use taskContainerId to publish action for task Item
//		                    // (Fisheye.js: topic.subscribe(this.id+":addItem")
//		                    if (self.taskPanel) m_config["taskContainerId"] = self.taskPanel.taskContainer.id;
//		                    // load app's css
//		                    if (instance._.cssLinks) m_config["cssLinks"] = instance._.cssLinks;
//		                    self.desktop.newInstance(m_config);

		                    instance.init(initParams || {});
		                } catch (e) {
		                    topic.publish("/openstar/desktop0/launchAppEnd", [this, appDesc.sysname, appDesc.name, false]);
		                    console.error(e);
		                    d.errback(e);
		                    throw e;
		                }
		            }, function(err) {
		                throw err;
		            });
		        },

		        launchDel: function(appConfig, args) {
		            var path, deferred = new Deferred();
		            var sysname = appConfig.sysname;
		            path = sysname.replace(/[.]/g, "/");
		            if (sysname.match(/tools/)) path = sysname.replace(/[.]/g, "/");
		            console.log("launching app " + appConfig.name);
		            try {
		                require([path], lang.hitch(this, function(App) {
		                    try {
		                        var config = lang.clone(appConfig);
		                        lang.mixin(config, {
		                            scene: this
		                        });
		                        var instance = new App(config);
		                        var m_config = lang.clone(appConfig);
		                        lang.mixin(m_config, {
		                            winId: instance.win.id,
		                            sceneId: this.sceneId,
		                            areaId: this.currentArea.areaId,
		                            status: "init",
		                            type: this._config.username
		                        });
		                        // use taskContainerId to publish action for task Item
		                        // (Fisheye.js: topic.subscribe(this.id+":addItem")
		                        if (this.taskPanel) m_config["taskContainerId"] = this.taskPanel.taskContainer.id;
		                        // load app's css
		                        if (instance._.cssLinks) m_config["cssLinks"] = instance._.cssLinks;
		                        this.desktop.newInstance(m_config);
		                        instance.init(args);
		                        // use to fix app icon dbClick bug, called in listviewItem on item click
		                        deferred.resolve(instance);
		                    } catch (error) {
		                        deferred.reject(error);
		                        throw error;
		                    }
		                }));
		            } catch (error) {
		                deferred.reject(error);
		                throw error;
		            }
		            return deferred.promise;
		        },

				addWindow : function(win){
					this._area.addChild(win);
					var args = {
						label: win.title,
						icon: win.iconClass,
						id: win.id
					};

					this.restrictWindow(this);
					return win._taskbarItem = this._windowList.newItem(args);
				},

				removeWindow : function(win){
					var item = win._taskbarItem;
					this._area.removeChild(win);
					this._windowList.deleteItem(item)
				},

				updateWindowTitle : function(item,title){
					this._windowList.setValue(item, "label", title);
				},

				getBox : function(){
					return this._area.getBox();
				},

				launchHandler: function(/*String?*/file, /*Object?*/args, /*String?*/format){
					//	summary:
					//		Launches an app to open a certain file
					//		You must specify either the file *or* it's format
					//		You must also manually pass the app the file's path through the arguments if you want it to actually open it.
					//	file:
					//		the full path to the file
					//	args:
					//		arguments to pass to the app
					//	format:
					//		the mimetype of the file to save bandwidth checking it on the server
					if(!args) args = {};
					if(file){
						var l = file.lastIndexOf(".");
						var ext = file.substring(l + 1, file.length);
						if (ext == "scene"){
							srvFilesystem.readFileContents(file, dojo.hitch(this, function(content){
								var c = content.split("\n");
								this.launch(c[0], dojo.fromJson(c[1]));
							}));
							return;
						}
					}
					if(!format){
						srvFilesystem.info(file, dojo.hitch(this, function(f){
							var type = f.type;
							this._launchHandler(file, type, args);
						}));
					}
					else {
						this._launchHandler(file, format, args);
					}
				},

				_launchHandler: function(/*String*/file, /*String*/type, /*Object?*/args){
					//	summary:
					//		Internal method that is used by the main launchHandler method.
					//		This is what actually launches the app.
					//	file:
					//		the full path to the file
					//	type:
					//		the file's mimetype
					//	args:
					//		arguments to pass to the app
					if (type == "text/directory"){
						for (app in srvApp.appList){
							for (key in srvApp.appList[app].filetypes){
								if (srvApp.appList[app].filetypes[key] == "text/directory"){
									if(file) args.path = file;
									this.launch(srvApp.appList[app].sysname, args);
									return;
								}
							}
						}
					}
					else {
						var typeParts = type.split("/");
						for (app in srvApp.appList){
							for (key in srvApp.appList[app].filetypes){
								var parts = srvApp.appList[app].filetypes[key].split("/");
								if (parts[0] == typeParts[0] && (parts[1] == typeParts[1])){
									if(file) args.file = file;
									this.launch(srvApp.appList[app].sysname, args);
									return;
								}
							}
						}
						var typeParts = type.split("/");
						for (app in srvApp.appList){
							for (key in srvApp.appList[app].filetypes){
								var parts = srvApp.appList[app].filetypes[key].split("/");
								if (parts[0] == typeParts[0] && (parts[1] == "*" || parts[1] == typeParts[1])){
									if(file) args.file = file;
									this.launch(srvApp.appList[app].sysname, args);
									return;
								}
							}
						}
					}
					dialog.alert({
						title: "Error",
						message: "Cannot open " + file + ", no app associated with " + type
					});
				},

				addApp: function(app,appConfig){
					var apps = appConfig.scenes[this.name].apps
					this.appList = apps;
					var item = array.filter(apps,function(item){return item.sysname === app.sysname});
					if(item.length>0) return;
					var item = {
						"sysname":app.sysname,
						"name":app.name,
						"category":app.category,
						"icon":app.icon.replace(/-16-/,"-32-"),
						"version":app.version
					}
					this._area.listarea.addItem(item)

					this.appList.push(item);
					return appConfig;
				},

				removeApp: function(app,appConfig){
					var apps = appConfig.scenes[this.name].apps
					var app = array.filter(apps,function(item){return item.sysname === app.sysname})[0];
					if(item){
						var index = array.indexOf(apps,item);
						apps.splice(index,1)
						this.appList = apps;
					}
					return appConfig;
				}

			}
		},
		"-constructor-"	:	{
			instantiate	:	function(){

			},
            initialize: function( /*Object*/ params, /*DomNode|String?*/ srcNodeRef) {
                this.overrided(params, srcNodeRef);
	            // args include scene config and desktop ({deskotp:desktop}) object
	            this.name = params.name;
	            this.theme = params.theme;
	            this.desktop = params.desktop;
				this._windowList = new ItemFileWriteStore({
							data: {identifer: "id", items: []}
				});
			}
		}

	});

	return Scene;

});

