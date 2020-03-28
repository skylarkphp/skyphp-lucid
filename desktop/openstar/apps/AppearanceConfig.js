define([
	"qscript/lang/Class", // declare
	"dojo/data/ItemFileReadStore",
	"dijit/form/Form",
	"qfacex/dijit/selection/FilteringSelect",
	"dijit/form/_FormValueWidget",
	"qfacex/dijit/button/Button",
	"qfacex/dijit/selection/RadioButton",
	"qfacex/dijit/input/TextBox",
	"qfacex/dijit/button/DropDownButton",
	"dijit/ColorPalette",
	"qfacex/dijit/toolbar/Toolbar",
	"qfacex/dijit/container/ContentPane",
	"qfacex/dijit/container/TabContainer",
	"qfacex/dijit/container/BorderContainer",	
	"openstar/desktop2/Application",
	"qfacex/dijit/container/deprecated/Window",
	"qfacex/dijit/infomation/StatusBar",
	"qscript/util/html",
	"openstar/services/filesystem",
	"openstar/services/config",
	"openstar/services/theme",
	"openstar/ui/dialog",
	"dojo/i18n!openstar/nls/common",
	"dojo/i18n!./nls/apps",
	"dojo/i18n!openstar/nls/messages",
	"dojo/i18n!./nls/appearance"
	
],function(Class,ItemFileReadStore,Form,FilteringSelect,_FormValueWidget,Button,RadioButton,TextBox,DropDownButton,ColorPalette,
	Toolbar,ContentPane,TabContainer,BorderContainer,_App,Window,StatusBar,utilHtml,srvFilesystem,srvConfig,srvTheme,dialog,
	nlsCommon,nlsApps,nlsMessages,nlsAppearance)	{

	return	Class.declare({
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
				init:	function(args){
					//summary:
					//								Shows	the	appearance	configuration	dialog
					var	l	=	nlsAppearance;//dojo.i18n.getLocalization("desktop.ui",	"appearance");
					var	win	=	this.wallWin	=	new	Window({
			        	app  : this,
						title:	l.appearancePrefs,
						iconClass:	this.iconClass,
						onClose:	dojo.hitch(this,	"kill")
					});
					var	tabs	=	new	TabContainer({region:	"center"});
					var	themes	=	this._themes();	//so	we	can	get	any	theme	wallpaper	first
					tabs.addChild(this._wallpaper());
					tabs.addChild(themes);
					tabs.addChild(this._effects());
					win.addChild(tabs);
					win.show();
					win.startup();
				},
				kill:	function(){
					if(!this.wallWin.closed)	this.wallWin.close();
					srvConfig.save();
				},
				_wallpaper:	function(){
					//				summary:
					//								Creates	a	BorderContainer	with	wallpaper	configuration	UI	and	returns	it
					var	l	=	nlsAppearance;//i18n.getLocalization("desktop.ui",	"appearance",this.lang);
					var	wallpaper	=	new	BorderContainer({title:	l.wallpaper});
					var	c	=	new	ContentPane({region:	"center"});
					var	cbody	=	document.createElement("div");
					dojo.style(cbody,	"width",	"100%");
					dojo.style(cbody,	"height",	"100%");
					dojo.style(cbody,	"overflow",	"auto");
					
					var	makeThumb	=	function(item){
						if(item	==	"")	return;
						if(item	===	true)	item	=	"";
						var	p	=	document.createElement("div");
						dojo.addClass(p,	"floatLeft");
						dojo.style(p,	"width",	"150px");
						dojo.style(p,	"height",	"112px");
						dojo.style(p,	"margin",	"5px");
						dojo.style(p,	"padding",	"5px");
						if	(item	!=	""){
							var	img	=	document.createElement("img");
							dojo.style(img,	"width",	"100%");
							dojo.style(img,	"height",	"100%");
							img.src	=	item;	//todo:	thumbnails?
							img.name	=	item;	//so	we	can	look	it	up	later,	src	resolves	a	local	path	to	a	hostname
							p.appendChild(img);
						}
						if(srvConfig.wallpaper.image	==	item)	dojo.addClass(p,	"selectedItem");
						dojo.connect(p,	"onclick",	null,	function(){
							if(srvConfig.wallpaper.image	!=	item){
								dojo.query(".selectedItem",	c.domNode).removeClass("selectedItem");
								dojo.addClass(p,	"selectedItem");
								srvConfig.wallpaper.image	=	item;
								srvConfig.apply();
							}
						})
						cbody.appendChild(p);
					}
					makeThumb(true);
					dojo.forEach(srvConfig.wallpaper.storedList,	makeThumb);
					c.setContent(cbody);
					wallpaper.addChild(c);
					
					var	nc	=	nlsCommon;//i18n.getLocalization("desktop",	"common",this.lang);
					//botom	part	-------------
					var	color	=	new	ColorPalette({value:srvConfig.wallpaper.color,	onChange:	dojo.hitch(this,function(value){
						srvConfig.wallpaper.color	=	value;
						srvConfig.apply();
					})});
					var	colorButton	=	new	DropDownButton({
									dropDown:	color,
									label:	l.bgColor
					});
					var	styleLabel	=	document.createElement("span");
					styleLabel.innerHTML	=	"	Style:";
					var	styleButton	=	new	FilteringSelect({
						autoComplete:	true,
						searchAttr:	"label",
						style:	"width:	120px;",
						store:	new	ItemFileReadStore({
							data:	{
								identifier:	"value",
								items:	[
									{label:	l.centered,	value:	"centered"},
									{label:	l.fillScreen,	value:	"fillscreen"},
									{label:	l.tiled,	value:	"tiled"}
								]
							}
						}),
						onChange:	function(val){
							if(typeof	val	==	"undefined")	return;
							srvConfig.wallpaper.style=val;
							srvConfig.apply();
						}
					});
					styleButton.setValue(srvConfig.wallpaper.style);
					var	addButton	=	new	Button({
						label:	nc.add,
						iconClass:	"icon-22-actions-list-add",
						onClick:	function(){
							dialog.file({
								title:	nc.chooseWall,
								desktop:this.desktop,
								onComplete:	function(path){
									if(path){
										var	p	=	srvFilesystem.embed(path);
										for(var	key	in	srvConfig.wallpaper.storedList){
											var	val	=	srvConfig.wallpaper.storedList[key];
											if(val	==	p)	return;
										}
										makeThumb(p);
										srvConfig.wallpaper.storedList.push(p);
									}
								}
							});
						}
					});
					var	removeButton	=	new	Button({
						label:	nc.remove,
						iconClass:	"icon-22-actions-list-remove",
						onClick:	function(){
							var	q	=	dojo.query("div.selectedItem	img",	c.domNode)
							if(q[0]){
								dojo.forEach(srvConfig.wallpaper.storedList,	function(url,	i){
									if(url	==	q[0].name)	srvConfig.wallpaper.storedList.splice(i,	1);
								});
								q[0].parentNode.parentNode.removeChild(q[0].parentNode);
							}
						}
					});
					/*var	closeButton	=	new	dijit.form.Button({
						label:	"Close",
						style:	"position:	absolute;	right:	0px;	top:	0px;",
						onClick:	function(){
							win.close();
						}
					});*/
					var	p	=	new	ContentPane({region:	"bottom"});
					var	body	=	document.createElement("div");
					dojo.forEach([colorButton.domNode,	styleLabel,	styleButton.domNode,	addButton.domNode,	removeButton.domNode/*,	closeButton.domNode*/],	function(c){
						dojo.addClass(c,	"dijitInline");
						body.appendChild(c);
					});
					p.setContent(body);
					wallpaper.addChild(p);
					color.startup();
					return	wallpaper;
				},
				_themes:	function(){
					//				summary:
					//								generates	a	theme	configuration	pane	and	returns	it
					var	l	=	nlsAppearance;//i18n.getLocalization("desktop.ui",	"appearance",this.lang);
					var	p	=	new	BorderContainer({title:	l.theme});
					var	m	=	new	ContentPane({region:	"center"});
					var	area	=	document.createElement("div");
					var	makeThumb	=	function(item){
						var	p	=	document.createElement("div");
						dojo.addClass(p,	"floatLeft");
						dojo.style(p,	"width",	"150px");
						dojo.style(p,	"height",	"130px");
						dojo.style(p,	"margin",	"5px");
						dojo.style(p,	"padding",	"5px");
						var	img	=	document.createElement("img");
						dojo.style(img,	"width",	"100%");
						dojo.style(img,	"height",	"100%");
						//img.src	=	dojo.moduleUrl("res.qface.themes."+item.sysname,	item.preview);
						img.src	=	require.toUrl("res/qface/themes/"+item.sysname+"/"+item.preview);
						img.name	=	item.name;
						img.title	=	item.name;
						p.appendChild(img);
						var	subtitle	=	document.createElement("div");
						utilHtml.textContent(subtitle,	item.name);
						dojo.style(subtitle,	"textAlign",	"center");
						p.appendChild(subtitle);
						if(srvConfig.theme	==	item.sysname)	dojo.addClass(p,	"selectedItem");
						dojo.connect(p,	"onclick",	null,	function(){
							if(srvConfig.theme	!=	item.sysname){
								dojo.query(".selectedItem",	m.domNode).removeClass("selectedItem");
								dojo.addClass(p,	"selectedItem");
								srvConfig.theme	=	item.sysname;
								srvConfig.apply();
							}
						});
						area.appendChild(p);
						
						if(!item.wallpaper)	return;
						var	wallimg	=	dojo.moduleUrl("res.qface.themes."+item.sysname,	item.wallpaper);
						for(var	i	in	srvConfig.wallpaper.storedList){
										var	litem	=	srvConfig.wallpaper.storedList[i];
										if(litem	==	wallimg.path)	return;
						}
						srvConfig.wallpaper.storedList.push(wallimg.path);
					}
					srvTheme.list(function(list){
									dojo.forEach(list,	makeThumb);
					},	null,	true);
					m.setContent(area);
					p.addChild(m);
					return	p;
				},
				_effects:	function(){
					//				summary:
					//								generates	an	effects	configuration	pane	and	returns	it
					var	l	=	nlsAppearance;//i18n.getLocalization("desktop.ui",	"appearance",this.lang);
					var	p	=	new	ContentPane({title:	l.effects});
					var	rows	=	{
						none:	{
							desc:	"Provides	a	desktop	environment	without	any	effects.	Good	for	older	computers	or	browsers.",
							params:	{
								checked:	srvConfig.fx	==	0,
								onClick:	function(){
									srvConfig.fx	=	0;
								}
							}
						},
						basic:	{
							desc:	"Provides	basic	transitional	effects	that	don't	require	a	fast	computer.",
							params:	{
								checked:	srvConfig.fx	==	1,
								onClick:	function(){
									srvConfig.fx	=	1;
								}
							}
						},
						extra:	{
							desc:	"Provides	a	desktop	environment	with	extra	transitional	effects	that	require	a	faster	computer.",
							params:	{
								checked:	srvConfig.fx	==	2,
								onClick:	function(){
									srvConfig.fx	=	2;
								}
							}
						},
						insane:	{
							desc:	"Provides	a	desktop	environment	with	full	transitional	effects.	Requires	a	fast-rendering	browser	and	a	fast	computer.",
							params:	{
								checked:	srvConfig.fx	==	3,
								onClick:	function(){
									srvConfig.fx	=	3;
								}
							}
						}
					}
					var	div	=	document.createElement("div");
					dojo.style(div,	"padding",	"20px");
					for(var	key	in	rows){
						var	row	=	document.createElement("div");
						dojo.style(row,	"margin",	"10px");
						rows[key].params.name	=	"visualeffects_picker";
						row.appendChild(new	RadioButton(rows[key].params).domNode);
						var	desc	=	document.createElement("span");
						desc.innerHTML	=	"<b>&nbsp;&nbsp;"	+	(l[key]	||	key)	+	":&nbsp;</b>"	+	(l[key+"Desc"]	||	rows[key].desc);
						dojo.style(desc,	"padding-left",	"10px");
						row.appendChild(desc);
						div.appendChild(row);
					};
					p.setContent(new	Form({},	div).domNode);
					return	p;
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
