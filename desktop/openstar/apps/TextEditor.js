define([
	 "dojo/_base/array", // array.forEach
	 "dojo/_base/declare", // declare
	 "dojo/_base/lang", // lang.extend lang.isArray
	 "dojo/_base/kernel", // kernel.deprecated
	 "dojo/i18n", // i18n.getLocalization
	 "dijit/form/_FormValueWidget",
	 "qfacex/dijit/button/Button",
	 "qfacex/dijit/input/TextBox",
	 "qfacex/dijit/toolbar/Toolbar",
	 "openstar/desktop2/Application",
	 "qfacex/dijit/container/deprecated/Window",
	 "qfacex/dijit/infomation/StatusBar",
	 "openstar/services/filesystem",
	 "openstar/ui/dialog",
	 "dojo/i18n!openstar/nls/common",
	 "dojo/i18n!./nls/apps",
	 "dojo/i18n!openstar/nls/messages"
	 
],function(array, declare, lang, dojo,i18n,_FormValueWidget,Button,TextBox,Toolbar,_App,Window,StatusBar,filesystem,dialog,nlsCommon,nlsApps,nlsMessages) {
	
	var SimpleTextarea = declare(TextBox,{
		// summary:
		//		A simple textarea that degrades, and responds to
		// 		minimal LayoutContainer usage, and works with dijit.form.Form.
		//		Doesn't automatically size according to input, like Textarea.
		//
		// example:
		//	|	<textarea dojoType="dijit.form.SimpleTextarea" name="foo" value="bar" rows=30 cols=40/>
		//
	
		baseClass: "dijitTextArea",
	
		attributeMap: dojo.mixin(lang.clone(_FormValueWidget.prototype.attributeMap),
			{rows:"textbox", cols: "textbox"}),
	
		// rows: Number
		//		The number of rows of text.
		rows: "",
	
		// rows: Number
		//		The number of characters per line.
		cols: "",
	
		templatePath: null,
		templateString: "<textarea name='${name}' dojoAttachPoint='focusNode,containerNode,textbox' autocomplete='off'></textarea>",
	
		postMixInProperties: function(){
			if(this.srcNodeRef){
				this.value = this.srcNodeRef.value;
			}
		},
	
		filter: function(/*String*/ value){
			if(value){
				value = value.replace(/\r/g,"");
			}
			return this.inherited(arguments);
		}
	});
	
	
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
				fileEditing: ""
			},
			"-attributes-"	:	{
			},
			"-methods-"	:	{
				kill: function(){
				    if(!this.window.closed)
				        this.window.close();
				},
				
				init: function(args){
				    
					var cm = nlsCommon;//i18n.getLocalization("desktop", "common",this.lang);
					var app = nlsApps;// i18n.getLocalization("desktop", "apps",this.lang);
					var msg = nlsMessages;//i18n.getLocalization("desktop", "messages",this.lang);
					
				    this.window = new Window({
		        		app  : this,
						title: app["Text Editor"],
						iconClass: this.iconClass,
				        onClose: lang.hitch(this, "kill")
				    });
				    var toolbar = new Toolbar({
				        region: "top"
				    });
				    toolbar.addChild(new Button({
				        label: cm["new"],
				        onClick: lang.hitch(this, this.processNew),
				        iconClass: "icon-16-actions-document-open"
				    }));
				    toolbar.addChild(new Button({
				        label: cm.open,
				        onClick: lang.hitch(this, this.processOpen),
				        iconClass: "icon-16-actions-document-open"
				    }));
				    toolbar.addChild(new Button({
				        label: cm.save,
				        onClick: lang.hitch(this, this.processSave),
				        iconClass: "icon-16-actions-document-save"
				    }));
				    toolbar.addChild(new Button({
				        label: cm.saveAs,
				        onClick: lang.hitch(this, this.processSaveAs),
				        iconClass: "icon-16-actions-document-save-as"
				    }));
				    toolbar.addChild(new Button({
				        label: cm.close,
				        onClick: lang.hitch(this, this.processClose),
				        iconClass: "icon-16-actions-process-stop"
				    }));
				    this.window.addChild(toolbar);
				    this.statusbar = new StatusBar({
				        region: "bottom"
				    });
					this.editor = new SimpleTextarea({
						region: "center"
					});
				    this.statusbar.attr("label", msg.noFileOpen);
				    this.window.addChild(this.editor);
				    this.window.addChild(this.statusbar);
				    this.editor.setDisabled(true);
				    this.window.show();
				    this.window.startup();
					if(args.file) this._processOpen(args.file);
					else this.processNew();
				},
			    updateTitle: function(path){
			        var app = nlsApps;//i18n.getLocalization("desktop", "apps",this.lang);
			        if(!path) return this.window.attr("title", app["Text Editor"]);
			        var files = path.split("/");
			        this.window.attr("title", files[files.length-1]+" - "+app["Text Editor"]);
			    },
				processNew: function(){
					var msg = nlsMessages;//i18n.getLocalization("desktop", "messages",this.lang);
					var cm = nlsCommon;//i18n.getLocalization("desktop", "common",this.lang);
				    this.editor.setDisabled(false);
				    this.editor.setValue("");
				    this.editing = false;
				    this.fileEditing = "";
				    this.newAs = true;
				    this.statusbar.attr("label", msg.editingFile.replace("%s", cm.untitled));
			        this.updateTitle(cm.untitled);
				},
				processClose: function(){
					var msg = nlsMessages;//i18n.getLocalization("desktop", "messages",this.lang);
				    this.editor.setDisabled(true);
					this.editor.setValue("");
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
				        onComplete: lang.hitch(this, "_processOpen")
				    });
				
				},
				
				_processOpen: function(path){
				    if (path == false){
				        return false;
				    }
			        this.updateTitle(path);
					var msg = nlsMessages;//i18n.getLocalization("desktop", "messages",this.lang);
				    this.statusbar.attr("label", msg.openingFile.replace("%s", path));
				    this.newAs = true;
				    this.editor.setDisabled(true);
				    filesystem.readFileContents(path, lang.hitch(this, function(content){
						this.editor.setValue(content);
			            this.editing = true;
			            this.newAs = true;
			            this.editor.setDisabled(false);
			            this.fileEditing = path;
			            this.statusbar.attr("label", msg.editingFile.replace("%s", path));
			        }));
				
				},
				
				processSave: function(){
					var msg = nlsMessages;//i18n.getLocalization("desktop", "messages",this.lang);
				    if (this.editing){
				        filesystem.writeFileContents(this.fileEditing, this.editor.getValue());
				        this.statusbar.attr("label", msg.fileSaved);
			            	
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
				            onComplete: lang.hitch(this, 
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

