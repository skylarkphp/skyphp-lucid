/**
 *
 * Copyright (c) 2013 psteam Inc.(http://www.psteam.co.jp)
 * http://www.psteam.co.jp/qface/license
 *
 * @Author: liwenfeng
 * @Date: 2013/02/28
 */
define([
	"qscript/lang/Array",
	"qscript/lang/Class",
	"qscript/lang/Enum",
    "qscript/store/ArrayStore",
	"openstar/system0/Runtime",
	"utilhub/osgi/IServiceRegistry",
	"utilhub/osgi/IBundleRegistry",
	"ucenter/CenterRegistry",
	"openstar/desktop/Desktop"
],function(array,Class,Enum,ArrayStore,QfaceRuntime,IServiceRegistry,IBundleRegistry,CenterRegistry,OpenStarDesktop){

	var Runtime = Class.declare({
		"-parent-"		:	QfaceRuntime,

		"-interfaces-"	:   [IServiceRegistry,IBundleRegistry],

		"-protected-"	:	{
			"-fields-"	:	{
				"_"			:	{
				}
			},

			"-methods-"	:	{
			}
		},

		"-public-"	:	{
			"-attributes-"	:	{
			},
			"-methods-"	:	{
				startup	: function() {
                   var deferred = new Deferred();
					try {
						var self = this,
							_ = this._,
							centerUrl = _.centerUrl,
							centerRegistry = _.centerRegistry,
							registryUrl =  centerUrl + "/registry.js",
							productsUrl =  centerUrl + "/products.js";


						var linkNode = array.filter(dojo.doc.getElementsByTagName("link"), function(link) {
							return link.href.match(/dbootstrap/);
						});


						centerRegistry.connect(registryUrl).then(function(){
							var config = centerRegistry.findDesktopDesc(801);
							 desktop = _.desktop = new OpenStarDesktop({
							 	"config" : config
							 });
							//desktop.cssMemory.put({
							//	name: "resource/themes/dbootstrap/theme/dbootstrap/dbootstrap.css",
							//	linkNode: linkNode,
							//	type: "theme"
							//});
							desktop.init().then(function(){
								deferred.resolve();
							});

						})
					} catch (error) {
						console.log(error);
						throw error;
					}
                    return deferred.promise;
				},

				run : function() {
					var _ = this._,
						desktop = _.desktop;
					desktop.start();
					desktop.resize();
				},

			    addDojoCss : function(/*String*/path){
		 			var _ = this._,
		 				desktop = _.desktop;
			     	desktop.addDojoCss(path);
			    },

				addDojoJs : function(/*String*/path){
		 			var _ = this._,
		 				desktop = _.desktop;
		     		desktop.addDojoCss(path);
		    	},
				getTheme : function(scene) {
		 			var _ = this._,
		 				desktop = _.desktop;
					return desktop.getTheme(scene);
				},

				changeTheme: function(scene,/*String*/theme)	{
		 			var _ = this._,
		 				desktop = _.desktop;
					desktop.changeTheme(scene,theme);
				},


				enableTheme: function(/*String*/theme)	{
		 			var _ = this._,
		 				desktop = _.desktop;
					return desktop.enableTheme(theme);
				},

				disableTheme: function(/*String*/theme)	{
		 			var _ = this._,
		 				desktop = _.desktop;
					desktop.disableTheme(theme);
				},

				listThemes : function() {
		 			var _ = this._,
		 				desktop = _.desktop;
					return desktop.listThemes();
				},

                findAppDesc: function(appId) {
                    var _ = this._,
                        registry = _.centerRegistry;
                    return registry.findAppDesc(appId);
                },
                                /*
                 * Finds the given name's server
                 * @param {ApplicationDesc} the description of an application
                 * appInfo:{
                 *	""
                 * }
                 */
                lauchApplication: function(desc) {
                    var serverName = this.createServerName(desc),
                        srgtry = this,
                        server = srgtry.getService(serverName);
                    var deferred = new Deferred();
                    if (!server) {
                        var url = desc.componentUri; //test
                        this.loadBundle({
                            "url": url,
                            "srgtry": srgtry,
                            "autoStart": true
                        }).then(function(sc) {
                            server = srgtry.getService(serverName);
                            if (server) {
                                deferred.resolve(server.createInstance(args));
                            } else {
                                throw new Error("invalid serivce:" + serverName);
                            }
                        });
                    } else {
                        deferred.resolve(server.createInstance(args));
                    }
                    return deferred;
                },
                /*
                 * creates the application instance.
                 * @param {appInfo} the metadata of an application
                 * appDesc:{
                 *	""
                 * }
                 */
                createAppInst: function(appDesc, args) {
                    var deferred = new Deferred();
                    if (appDesc.module) {
                        //create the application instance from module
                        require([appDesc.module], function(AppClass) {
                            deferred.resolve(new AppClass(args));
                        });

                    } else if (appDesc.serviceSymbolic) {
                        //create the application instance from  factory service of the application
                        var srgtry = this,
                            fullSymbolic = "app:" + appDesc.serviceSymbolic,
                            server = srgtry.getService(fullSymbolic);
                        if (!server) {
                            var url = appDesc.componentUrl;
                            if (!url) {
                                url = this._resolveComponentUrl(appDesc.componentSymbolic);
                            }
                            if (!url) {
                                throw new Error("can not resolve the component url for the appliction!");
                            }
                            this.loadBundle({
                                "url": url,
                                "srgtry": srgtry,
                                "autoStart": true
                            }).then(function(sc) {
                                server = srgtry.getService(fullSymbolic);
                                if (server) {
                                    deferred.resolve(server.createInstance(args));
                                } else {
                                    throw new Error("invalid application serivce symbolic:" + fullSymbolic);
                                }
                            });
                        } else {
                            deferred.resolve(server.createInstance(args));
                        }
                    } else if (appDesc.sysname) {
                        var path = appDesc.sysname.replace(/[.]/g, "/");
                        require([path], function(AppClass) {
                            deferred.resolve(new AppClass(args));
                        });
                    } else {
                        throw new Error("invalid application desc!");
                    }

                    return deferred.promise;
                }

			}
		},
        "-constructor-": {
            initialize: function( /*Object*/ params) {
                this.overrided(params);
                this._.centerUrl = params.centerUrl;
                this._.centerRegistry = new CenterRegistry();
            }
        }
	});

	Runtime.TermMode = QfaceRuntime.TermMode;

	return Runtime;
});
