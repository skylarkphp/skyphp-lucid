define([
	"qscript/lang/Class", // declare
	"dijit/form/_FormValueWidget",
	"qfacex/dijit/button/Button",
	"qfacex/dijit/input/TextBox",
	"qfacex/dijit/toolbar/Toolbar",
	"dijit/Editor",
	"qfacex/dijit/container/ContentPane",	 
	"openstar/desktop2/Application",
	"qfacex/dijit/container/deprecated/Window",
	"qfacex/dijit/infomation/StatusBar",
	"openstar/services/filesystem",
	"openstar/ui/dialog",
	"dojo/i18n!openstar/nls/common",
	"dojo/i18n!./nls/apps",
	"dojo/i18n!openstar/nls/messages",
	//	 "dijit/_editor/plugins/AlwaysShowToolbar",
	//	 "dijit/_editor/plugins/EnterKeyHandling",
	//	 "dijit/_editor/plugins/FontChoice",
	"dijit/_editor/plugins/FullScreen",
	//	 "dijit/_editor/plugins/LinkDialog",
	"dijit/_editor/plugins/NewPage",
	"dijit/_editor/plugins/Print",
	"dijit/_editor/plugins/TabIndent",
	"dijit/_editor/plugins/TextColor",
	//	 "dijit/_editor/plugins/ToggleDir",
	"dijit/_editor/plugins/ViewSource"

],function(Class,_FormValueWidget,Button,TextBox,Toolbar,Editor,ContentPane,_App,Window,StatusBar,srvFilesystem,dialog,nlsCommon,nlsApps,nlsMessages) {

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
				newAs: false,
				editing: false,
				fileEditing: "",
			
			},
			"-attributes-"	:	{
			},
			"-methods-"	:	{
				kill: function(){
				    if (!this.window.closed)
				        this.window.close();
				},
				init: function(args){
					var cm = nlsCommon;//i18n.getLocalization("desktop", "common",this.lang);
					var app = nlsApps;//i18n.getLocalization("desktop", "apps",this.lang);
					var msg = nlsMessages;//i18n.getLocalization("desktop", "messages",this.lang);
					
				    this.window = new Window({
			        	app  : this,
						title: app["Word Processor"],
						iconClass: this.iconClass,
				        onClose: dojo.hitch(this, this.kill)
				    });
				    var toolbar = new Toolbar({
				        region: "top"
				    });
				    toolbar.addChild(new Button({
				        label: cm["new"],
				        onClick: dojo.hitch(this, this.processNew),
				        iconClass: "icon-16-actions-document-open"
				    }));
				    toolbar.addChild(new Button({
				        label: cm.open,
				        onClick: dojo.hitch(this, this.processOpen),
				        iconClass: "icon-16-actions-document-open"
				    }));
				    toolbar.addChild(new Button({
				        label: cm.save,
				        onClick: dojo.hitch(this, this.processSave),
				        iconClass: "icon-16-actions-document-save"
				    }));
				    toolbar.addChild(new Button({
				        label: cm.saveAs,
				        onClick: dojo.hitch(this, this.processSaveAs),
				        iconClass: "icon-16-actions-document-save-as"
				    }));
				    toolbar.addChild(new Button({
				        label: cm.close,
				        onClick: dojo.hitch(this, this.processClose),
				        iconClass: "icon-16-actions-process-stop"
				    }));
				    this.window.addChild(toolbar);
				    var box = new ContentPane({
				        region: "center"
				    },
				    document.createElement("div"));
				    this.statusbar = new StatusBar({
				        region: "bottom"
				    });
				    this.statusbar.attr("label", msg.noFileOpen);
				    this.window.addChild(this.statusbar);
				    var editor = this.editor = new Editor({
				    	region: "center",
				    	extraPlugins: [
				    	    "|",
				    	    "fullScreen",
				    	    "print",
				    	    "viewSource",
				    	    "|",
				    	    "newPage",
				    	    "|",
			                "createLink",
			                "insertImage",
			                "|",
			                "fontName",
			                "fontSize",
			                "formatBlock",
			                "foreColor",
			                "|",
			                'tabIndent'
				    	],
			            isTabIndent: true
				    }, document.body.appendChild(document.createElement("div")));
					editor.startup();
					this.window.addChild(editor);
				    this.window.show();
				    this._new = false;
				    this.window.startup();
				    this.window.onClose = dojo.hitch(this, this.kill);
				
					setTimeout(dojo.hitch(this, function(){
						editor = dijit.byId(editor.id);
						editor.extraPlugins = [];
						delete editor.toolbar;
						editor.postCreate();
						if(args.file) 
							this._processOpen(args.file);
						else {
							this.processNew();
						}
					}), 500);
				
				},
			    updateTitle: function(path){
			        var app = nlsApps;//i18n.getLocalization("desktop", "apps",this.lang);
			        if(!path) return this.window.attr("title", app["Text Editor"]);
			        var files = path.split("/");
			        this.window.attr("title", files[files.length-1]+" - "+app["Text Editor"]);
			    },
				processNew: function(){
					var msg = nlsMessages;//i18n.getLocalization("desktop", "messages",this.lang);
					var cmn = nlsCommon;//i18n.getLocalization("desktop", "common",this.lang);
				    this.editor.setDisabled(false);
				    this.editor.replaceValue("");
				    this.editing = false;
				    this.fileEditing = "";
				    this.newAs = true;
				    this.statusbar.attr("label", msg.editingFile.replace("%s", cmn.untitled));
				    this.updateTitle(cmn.untitled);
				},
				processClose: function(){
					var msg = nlsMessages;//i18n.getLocalization("desktop", "messages",this.lang);
				    this.editor.replaceValue("");
				    this.editor.setDisabled(true);
				    this.newAs = false;
				    this.editing = false;
				    this.fileEditing = "";
				    this.statusbar.attr("label", msg.noFileOpen);
				    this.updateTitle(false);
				},
				processOpen: function(){
					var msg = nlsMessages;//i18n.getLocalization("desktop", "messages",this.lang);
				    dialog.file({
				        title: msg.chooseFileOpen,
				        scene:this.scene,
						types: [{type: ".html"}],
				        onComplete: dojo.hitch(this, this._processOpen)
				    });
				
				},
				
				_processOpen: function(path){
					var msg = nlsMessages;//i18n.getLocalization("desktop", "messages",this.lang);
				    if (path == false){
				        return false;
				    }
			        this.updateTitle(path);
				    this.statusbar.attr("label", msg.openingFile.replace("%s", path));
				    this.newAs = true;
				    this.editor.setDisabled(true);
				    srvFilesystem.readFileContents(path, dojo.hitch(this, function(content){
				            this.editor.setDisabled(false);
				            this.editor.replaceValue(content);
				            this.editing = true;
				            this.newAs = true;
				            this.fileEditing = path;
				            this.statusbar.attr("label", msg.editingFile.replace("%s", path));
			        }));
				
				},
				
				processSave: function(){
					var msg = nlsMessages;//i18n.getLocalization("desktop", "messages",this.lang);
				    if (this.editing){
			            srvFilesystem.writeFileContents(this.fileEditing, "<html>"+this.editor.getValue()+"</html>");
			            var p = dojo.date.locale.format(new Date());
			            this.statusbar.attr("label", msg.fileSaved+" ("+p+")");
				    }
				    else {
				        this.processSaveAs();
				
				    }
				
				},
				processSaveAs: function(){
					var msg = nlsMessages;//i18n.getLocalization("desktop", "messages",this.lang);
				    if (this.newAs){
				        dialog.file({
				            title: msg.chooseFileSave,
				            scene:this.scene,
				            onComplete: dojo.hitch(this, 
				            function(path){
				                if (path == false){
				                    return false;
				                }
				                this.editing = true;
				                this.fileEditing = path;
				                this.newAs = true;
				                this.processSave();
			                    this.updateTitle(path);
				            })
				        });
				
				    }
				
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
