var davinciLibPath  = "qstudio/ide";


define([
	"qscript/lang/Class", // declare
	"dojo", // dojo
	"require",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
	"openstar/system2/Runtime",
	"openstar/desktop2/Application",
	"qfacex/dijit/container/deprecated/Window",
	"qfacex/studio/Workbench",
	"openstar/services/filesystem",
	"dojo/i18n!openstar/nls/common",
	"dojo/i18n!openstar/apps/nls/apps",
	"dojo/i18n!openstar/nls/messages",
	"dojo/text!./templates/QfaceIDE.html",
	"qfacex/studio/plugins/ide/Registry",
	"dojo/i18n!qfacex/studio/plugins/ide/nls/webContent"
	
],function(
	Class,
	dojo,
	require,
	_WidgetBase,
	_TemplatedMixin,
	_WidgetsInTemplateMixin,
	Runtime,
	_App,
	Window,
	Workbench,
	filesystem,
	nlsCommon,
	nlsApps,
	nlsMessages,
	tplQfaceIDE,
	DvRegistry,
	nlsQfaceIDE) {

    //var davinciLibPath = require.toUrl("./QfaceIDE");
    
	var  _WorkbenchWidget = dojo.declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin],{
		templateString: tplQfaceIDE,
		
		resize: function() {
			this.appContainer.resize();
		}
//		resize : function() {
//			if (windowResized) {
//				windowResized();
//			}
//		}
	});	
   
    var windowResized;
  	var runWorkbench = function(workbench) {
		/*
			var userInfo;
			
			var result = DvRegistry.getUser();
			
	        if (result) {
	            DvRegistry.userName=result.userId;
	            DvRegistry.userEmail=result.email;
			} else {
				//do nothing
			}
			if (!result || result.userId=='maqettaUser') {
				DvRegistry.isLocalInstall=true;
			}
			
			// set up for review and commenting...
			var designerName  = dojo.cookie("davinci_designer");
			var reviewVersion = dojo.cookie("davinci_version");
			dojo.cookie("davinci_designer", null, {expires: -1, path:"/"});
			dojo.cookie("davinci_version", null, {expires: -1, path:"/"});
		*/
			
			var dvRegistry = new DvRegistry();
			var ex;
			dvRegistry.init().then(function(){
				try {
					workbench.run(dvRegistry);
				} catch (e) {
					console.error(e.stack || e);
				}	
			},function(e){
				ex = e;
			});
			if (ex) {
				throw ex;
			}
	};

    runtime.addDojoCss("qfacex/studio/plugins/ide/workbench.css");
		

	var _instance;

	var  QfaceIDE = Class.declare({
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
			"-attributes-"	:	{
			
			},
			"-methods-"	:	{
				kill: function(){
					if(!this.win.closed){ this.win.close(); }
		//			_instance = null;


					//moved from Runtime by LWF
					/*
					var message = null;
					
					//Loop through all of the editor containers and give them a chance to tell us
					//the user should be warned before leaving the page.
					var editorContainers = this.workbench.editorTabs.getChildren();
					var editorsWithWarningsCount = 0;
					for (var i = 0; i < editorContainers.length; i++) {
						var editorContainer = editorContainers[i];
						if (editorContainer.editor) {
							var editorResponse = editorContainer.editor.getOnUnloadWarningMessage();

							if (editorResponse) {
								//Let's keep track of the first message. If we end up finding multiple messages, we'll
								//augment what the user will see shortly.
								if (!message) {
									message = editorResponse;
								}
								editorsWithWarningsCount++;
							}
						}
					}
					//If multiple warnings, augment message user will see
					if (editorsWithWarningsCount > 1) {
						message = dojo.string.substitute(webContent.multipleFilesUnsaved, [message, editorsWithWarningsCount]);
					}
					
					if (!message) {
						//No warnings so far, let's see if use maybe accidentally hit backspace
						var shouldDisplayForBackspace = Date.now() - window.davinciBackspaceKeyTime < 100;
						if (shouldDisplayForBackspace) {
							message = webContent.careful;
						}
					}
					
					if (message) {
						// We've found warnings, so we want to warn the user they run the risk of 
						// losing data if they leave the page.
						
						// For Mozilla/IE, we need to see the return value directly on the 
						// event. But, note in FF 4 and later that the browser ignores our
						// message and uses a default message of its own.
						if (e = e || window.event) {
							e.returnValue = message;
						}
						
						// For other browsers (like Chrome), the message returned by the
						// handler is honored.
						return message;
					}
					*/
				},
				
				init: function(args){
					if (!this._inited) {
						var app = nlsApps;//i18n.getLocalization("desktop", "apps",this.lang);
						var cm = nlsCommon;//i18n.getLocalization("desktop", "common",this.lang);
						this.win = new Window({
			        		app  : this,
							title: "QfaceIDE",
							iconClass: this.iconClass,
							onClose: dojo.hitch(this, "kill")
		//					onResize: windowResized
						});
						
						//this.win.containerNode.innerHTML = tplQfaceIDE;
						var workbench = this.workbench = new Workbench({
							region: "center",
							initialPerspective:"davinci.ve.pageDesign"
						});
						workbench.startup();

						this.win.addChild(workbench);

						this.win.startup();
						
						runWorkbench(this.workbench);
					}
					
					this._inited = true;	

					this.win.show();
					
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
		

	return QfaceIDE;

});

