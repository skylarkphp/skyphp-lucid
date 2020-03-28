/**
 *
 * Copyright (c) 2013 psteam Inc.(http://www.psteam.co.jp)
 * http://www.psteam.co.jp/qface/license
 * 
 * @Author: liwenfeng
 * @Date: 2013/02/28
 */
define([
	"qscript/lang/Class", // declare
	"qscript/lang/Function", // hitch
	"qfacex/dijit/Control",
	"qfacex/dijit/container/FloatingPane",
	"qfacex/dijit/form/Form",
	"qfacex/dijit/form/IFormOwner",
	"qfacex/dijit/form/FormShowMode",
	"qfacex/dijit/menu/Menu",
	"qfacex/dijit/menu/MenuItem",
	"qfacex/dijit/menu/CheckedMenuItem",
	"qfacex/dijit/menu/MenuSeparator",
	"openstar/desktop2/primitives/Area",
  	"dojo/i18n!qfacex/dijit/nls/common",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom-geometry",
	"dojo/dom-class",
    "dijit/_Widget",
	"dijit/_TemplatedMixin",
    "dijit/Dialog",
	"dijit/focus"
],function(Class,Function,Control,FloatingPane,Form,IFormOwner,FormShowMode,Menu,MenuItem,CheckedMenuItem,MenuSeparator,Area,nls,declare,lang,domGeom,domClass,_Widget,_TemplatedMixin,Dialog,focus) {

	var Window = Class.declare({
		"-parent-"		:	FloatingPane,
		
		"-interfaces-"	:	[IFormOwner],

		"-protected-"	:	{
			"-fields-"	:	{

				"_onResize"		:	function(){
				
				},
				
				"$$resizable"	:	true,
				"$$maxable"	:	true
			
			},
			 
			"-methods-"	:	{
				/*
				 *Makes the form area for the window.
				 */
				"_makeArea" : function() {
					this.content = this._.area;
				
				},
				/*
				 *Makes the context menu for the window title
				 */
			    "_makeMenu"	: function(){
			        var menu = this._menu = new Menu();
			        this._menuItems = {};
			        menu.addChild(this._menuItems.min = new MenuItem({
			            label: nls.minimize,
			            onClick: Function.hitch(this, "minimize"),
			            disabled: !this.showMinimize
			        }));

			        menu.addChild(new MenuSeparator({}));
			        menu.addChild(this._menuItems.max = new MenuItem({
			            label: nls.maximize,
			            onClick: Function.hitch(this, "maximize"),
			            disabled: !this.maxable
			        }));

//			        menu.addChild(new MenuSeparator({}));
//			        menu.addChild(this._menuItems.full = new MenuItem({
//			            label: nls.full,
//			            onClick: Function.hitch(this, "full"),
//			            disabled: !this.fullable
//			        }));

			        menu.addChild(new MenuSeparator({}));
			        menu.addChild(new CheckedMenuItem({
			            label: nls.alwaysOnTop,
			            onChange: Function.hitch(this, function(val){
			                this.alwaysOnTop = val;
			                this.bringToTop();
			            })
			        }));
			        menu.addChild(new MenuSeparator({}));
			        menu.addChild(new MenuItem({
			            label: nls.close,
			            onClick: Function.hitch(this, "close"),
			            disabled: !this.closable
			        }));
			        menu.bindDomNode(this.titleNode);
			        this._fixMenu();
			    },
			    
			    "_fixMenu"	: function(){
			        var items = this._menuItems;
//			        if(this.fulled){
//			        	items.full.attr("label", nls.unfull);
//			          items.full.onClick = Function.hitch(this, "unfull");
//			        }else{
//			        	items.full.attr("label", nls.full);
//			        	items.full.onClick = Function.hitch(this,"full");
//			        }

			        if(this.maximized){
			            items.max.attr("label", nls.unmaximize);
			            items.max.onClick = Function.hitch(this, "unmaximize");
			        }else{
			            items.max.attr("label", nls.maximize);
			            items.max.onClick = Function.hitch(this, "maximize");
			        }
			        if(this.minimized){
			            items.min.attr("label", nls.restore);
			            items.min.onClick = Function.hitch(this, "restore");
			        }else{
			            items.min.attr("label", nls.minimize);
			            items.min.onClick = Function.hitch(this, "minimize");
			        }
			    },
				_onTaskClick: function(){
					//	summary:
					//		Called when the task button on a panel is clicked on
					//		Minimizes/restores the window
					var s = this.domNode.style.display;
					if(s == "none")	{
						//this._restore();
						this.show();
						this.bringToTop();
					}	else	{
						//if(!this.bringToTop()) this.minimize();
						this.hide();
					}
				}
			
			}
		},
		
		"-public-"	:	{
			"-attributes-"	:	{
				"main"	:	{
					"type"	:	Control
				}
			},
			"-methods-"	:	{
				/*
				 *Shows the window.
				 */
				"show": function(){

			        if (!this._winListItem){
				        this._winListItem = this.scene.addWindow(this,{
							label: this.title,
							icon: this.iconClass,
							id: this.id
						});
						
						this.scene.restrictWindow(this);
					}	

					this.overrided();
				},
				
				/*
				 *Closes the window.
				 */
				"close"		:	function(){
					this.overrided();
					this.scene.removeWindow(this,this._winListItem);
				}
			
			}
		},
		"-constructor-"	:	{
			"initialize"	:	function(/*Object*/params,/*DomNode|String?*/srcNodeRef){
				this.overrided(params,srcNodeRef);
				if (!params.scene && params.app) {
					this.scene = params.app.scene;
				}
				domClass.add(this.domNode,"win");
				this._makeMenu();
				this._makeArea();
			}
			
		}
	
	});

	return Window;
	
});	
