/**
 *
 * Copyright (c) 2014 psteam Inc.(http://www.psteam.co.jp)
 * http://www.psteam.co.jp/qface/license
 *
 * @Author: liwenfeng
 * @Date: 2014/02/28
 */
define([
	"qscript/lang/Interface",
	"qscript/lang/Function",
	"openstar/desktop2/Window"
],function(Interface,Function,Window) {

	var IApplication = Interface.declare( {
		"-parent-"		:	Interface,

		"-interfaces-"	:	[],

		"-protected-"	:	{
			"-fields-"	:	{
			},

			"-methods-"	:	{

			}
		},

		"-public-"	:	{
			"-attributes-"	:	{
				/*
				 *
				 *@attribute active
				 *@type Boolean
				 *@writable false
				 */
				"active"	:	{
					"type"	:	Boolean
				},

				/*
				 *
				 *@attribute name
				 *@type String
				 *@writable false
				 */
				"name"	:	{
					"type"	:	String
				},

				/*
				 *
				 *@attribute sysname
				 *@type String
				 *@writable false
				 */
				"sysname"	:	{
					"type"	:	String
				},

				/*
				 *
				 *@attribute version
				 *@type String
				 *@writable false
				 */
				"version"	:	{
					"type"	:	String
				},

				"instance"	:	{
					"type"	:	Number
				},

				"status"	:	{
					"type"	:	String,
					"writable"	:	true
				},

				"iconClass"	:	{
					"type"	:	String
				},

				/*
				 *
				 *@attribute title
				 *@type String
				 *@writable false
				 */
				"title"	:	{
					"type"	:	String
				},

				"compatible"	:	{
					"type"	:	String
				},

				"scene"	:	{
					"type"	:	Object
				},

				"window"	:	{
					"type"		:	Window,
					"getter"	:	function(){
						var _ = this._;
						if (!_.window) {
							_.window = new Window({
								app  : this,
								title: this.title,
								iconClass: this.iconClass,
								left : "100",
								top  : "100",
								width: "200",
								height: "270",
								onClose: Function.hitch(this, "kill")
							});
						}
						return _.window;
					}

				}
			},
			"-methods-"	:	{

				init: function(args){
					//	summary:
					//		start the app

					//since this is a base class for an app, we'll just kill ourselves
					//to prevent it from showing up on the task manager if it is
					//accidentally launched
					//this.kill();
				},

				kill: function(){
					//	summary:
					//		cleanup ui, disconnect events, etc.

					var _ = this._,
						window = _.window;

					if (window && !window.closed) {
						window.close();
					}
		            _.status = "killed";
					var pid = this.instance;
					//allow the garbage collector to free up memory
					setTimeout(Function.hitch(this,function(){
						this.scene.instances[pid]=undefined;
					}),10000);
				},

				start: function(args){
					//	summary:
					//		start the app

				},

				stop: function(args){
					//	summary:
					//		stop the app

				}

			}

		},
		"-constructor-"	:	{
			"initialize"	:	[
				function(/*Object*/args){
					this._setupAttributeValues({
						"status"	:	"init",
						"name"		: 	args.name || "",
						"sysname"	: 	args.sysname || "",
						"instance"	:	args.instance,
						"compatible":	args.compatible || "",
						"scene"		:	args.scene,
						"iconClass"	:	args.iconClass || ""
					});
				},
				function(/*Object*/args,/*Scene*/scene){
					this._setupAttributeValues({
						"status"	:	"init",
						"name"		: 	args.name || "",
						"sysname"	: 	args.sysname || "",
						"instance"	:	args.instance,
						"compatible":	args.compatible || "",
						"scene"		:	scene,
						"iconClass"	:	args.iconClass || ""
					});
				}
			]
		}
	});

  return IApplication;
});
