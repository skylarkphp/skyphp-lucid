define([
	"qscript/lang/Class", // declare
	 "require",
	 "dojo/fx",
     "dijit/_Widget",
     "dijit/_Templated",
     "dijit/_Contained", 
	 "dijit/form/_FormValueWidget",
	 "qfacex/dijit/button/Button",
	 "qfacex/dijit/input/TextBox",
	 "dijit/form/Form",
	 "qfacex/dijit/toolbar/Toolbar",
     "dijit/tree/ForestStoreModel",
     "qfacex/dijit/tree/Tree",
     "qfacex/dijit/container/ContentPane",
 	 "dojox/fx", 
	 "dojox/validate",
	 "dojox/validate/web",
	 "dojox/grid/DataGrid",
	 "openstar/desktop2/Application",
	 "qfacex/dijit/container/deprecated/Window",
	 "qfacex/dijit/infomation/StatusBar",
	 "qscript/util/html",
	 "openstar/media/Sound",
	 "openstar/services/user",
	 "openstar/services/crosstalk",
	 "openstar/services/Registry",
	 "openstar/ui/dialog",
	 "dojo/i18n!openstar/nls/common",
	 "dojo/i18n!./nls/apps",
	 "dojo/i18n!openstar/nls/messages"
	 
],function(Class,require,dojofx,_Widget,_Templated,_Contained,_FormValueWidget,Button,TextBox,Form,Toolbar,ForestStoreModel,Tree,ContentPane,dojoxfx,validate,validate,DataGrid,_App,Window,StatusBar,utilHtml,Sound,srvUser,srvCrosstalk,SrvRegistry,dialog,nlsCommon,nlsApps,nlsMessages) {

	var Messenger = Class.declare({
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
				init: function(args){
			        this.windows = [];
			    	var win = this.makeBuddyListWin(); //OH YA WE ARE DRAW UI
			        this.setListener();
			        this.initSounds();
			        this.timer = setInterval(dojo.hitch(this, "updateStatus"), 10000);
			        this.updateStatus();
			        win.show();
			    },
			    kill: function(stright){
			        dojo.forEach(this.windows, function(win){
			            if(!win.closed)
					        win.close();
					});
			        this.cleanupSounds();
					this.removeListener(); //Tell crosstalk we are no longer intrested in recieving events.
			        clearInterval(this.timer);
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


	Class.extend(Messenger, {
		"-public-"	:	{
			"-fields-"	:	{
			    buddyStore: null,
			
			},
			"-attributes-"	:	{
			},
			"-methods-"	:	{
			    makeBuddyStore: function(){
			        if(this.buddyStore) return this.buddyStore;
			        var store = this.buddyStore = new SrvRegistry({
			            name: "buddyList",
			            appname: this.sysname,
			            data: {
			                identifier: "id",
			                label: "username",
			                items: [
			                    //sample item:
			                    //{id: 0, userid: 1, username: "admin"}
			                ]
			            }
			        });
			        return store;
			    },
			    addBuddy: function(info){
			        if(!info.exists){
			            return dialog.notify({type: "error", message: "User specified does not exist!",scene:this.scene});
			        }
			        this.buddyStore.newItem({
			            id: info.id,
			            username: info.username,
			            logged: info.logged
			        });
			        this.buddyStore.save();
			    },
			    updateStatus: function(){
			        var store = this.buddyStore;
			        store.fetch({
			            query: {id: "*"},
			            onComplete: function(items){
			                var params = [];
			                dojo.forEach(items, function(item){
			                    params.push({
			                        id: store.getValue(item, "id")
			                    });
			                }, this);
			                srvUser.get({
			                    users: params,
			                    onComplete: function(users){
			                        dojo.forEach(users, function(user){
			                            store.fetch({
			                                query: {id: user.id},
			                                onItem: function(item){
			                                    store.setValue(item, "logged", !!parseInt(user.logged));
			                                }
			                            });
			                        }, this);
			                    }
			                });
			            }
			        });
			    }
			}
		},
	});


	var AddBuddyForm = dojo.declare(Form, {
	    widgetsInTemplate: true,
	    templateString: null,
	    templateString:"<form dojoAttachPoint='containerNode' dojoAttachEvent='onreset:_onReset,onsubmit:_onSubmit'>\n   <label for=\"${id}_username\">Buddy's Username:</label>\n   <input dojoType=\"dijit.form.TextBox\" name=\"username\" />\n   <div style=\"text-align: right; margin-top: 5px;\">\n      <div dojoType=\"dijit.form.Button\" class=\"dijitInline\" label=\"Cancel\" dojoAttachEvent=\"onClick:onCancel\"></div>\n      <div dojoType=\"dijit.form.Button\" class=\"dijitInline\" iconClass=\"icon-22-actions-list-add\" label=\"Add\" dojoAttachEvent=\"onClick:onSubmit\"></div>\n   </div>\n</form> \n",
	    onSubmit: function(){
	    },
	    onCancel: function(){
	    }
	});

	var MessageBox = dojo.declare([_Widget, _Templated, _Contained], {
	    templateString:"<div style=\"height: 20px;\">\n    <!--<div dojoType=\"dijit.layout.BorderContainer\" gutters=\"false\" style=\"position: absolute; top: 0px; left: 0px; width: 100%; height: 20px;\">\n        <div dojoType=\"dijit.layout.ContentPane\" region=\"center\">-->\n            <input dojoType=\"dijit.form.TextBox\" dojoAttachPoint=\"inputBox\" style=\"width: 100%\" /> \n        <!--</div>\n        <div dojoType=\"dijit.layout.ContentPane\" region=\"right\" style=\"width: 80px\">\n            <div dojoType=\"dijit.form.Button\" dojoAttachPoint=\"sendButton\" label=\"Send\" dojoAttachEvent=\"onClick:_onClick\"></div>\n        </div>\n    </div>-->\n</div>\n\n",
	    widgetsInTemplate: true,
	    postCreate: function(){
	        this.inherited(arguments);
	        dojo.connect(this.inputBox.domNode, "onkeyup", this, "_onKey");
	    },
	    onSend: function(value){
	        
	    },
	    _onSend: function(value){
	        if(value != "")
	            this.onSend(value);
	        this.inputBox.attr("value", "");
	    },
	    _onKey: function(e){
	        if(e.keyCode == dojo.keys.ENTER)
	            this._onSend(this.inputBox.attr("value"));
	    },
	    _onClick: function(){
	        this._onSend(this.inputBox.attr("value"));
	    }
	});


	Class.extend(Messenger, {
		"-public-"	:	{
			"-fields-"	:	{
			    buddyListWin: null,
			    selectedBuddy: null,
			    removeBuddyButton: null,
			    unameUi: {}
			
			},
			"-attributes-"	:	{
			},
			"-methods-"	:	{
			    makeBuddyListWin: function(){
			        if(this.buddyListWin && !this.buddyListWin.closed) return this.BuddyListWin;
			        var win = this.buddyListWin = new Window({
			        	app  : this,
			            title: "Contact List",
			            iconClass: this.iconClass,
			            width: "220px",
			            height: "400px",
			            onClose: dojo.hitch(this, "kill")
			        });
			        this.windows.push(win);
			        this.unameUi = {};

			        var store = this.makeBuddyStore();
			        
			        var toolbar = new Toolbar({
			            region: "top"
			        });
			        
			        var addButton = new Button({
			            label: "Add User",
			            iconClass: "icon-16-actions-list-add",
			            onClick: dojo.hitch(this, "drawAddBuddyDialog"),
			            getIconClass: function(item, opened){
			                return "icon-16-apps-system-users";
			            }
			        });
			        toolbar.addChild(addButton);
			        
			        var removeButton = this.removeBuddyButton = new Button({
			            label: "Remove User",
			            iconClass: "icon-16-actions-list-remove",
			            disabled: true,
			            onClick: dojo.hitch(this, function(){
			                if(!this.selectedBuddy) return;
			                store.deleteItem(this.selectedBuddy);
			                store.save();
			                this.selectedBuddy = null;
			            })
			        });

			        toolbar.addChild(removeButton);

			        win.addChild(toolbar);

			        var model = new ForestStoreModel({
			            store: store,
			            rootLabel: "Contacts"
			        });

			        var tree = new Tree({
			            model: model,
			            region: "center",
			            getIconClass: function(item, opened){
			                var iconClass = "";
			                if(store.isItem(item) && store.hasAttribute(item, "logged")){
			                    iconClass = store.getValue(item, "logged") ? "icon-16-apps-system-users" : "icon-16-actions-system-log-out";
			                    return iconClass;
			                }
			                return (!item || this.model.mayHaveChildren(item)) ? (opened ? "dijitFolderOpened" : "dijitFolderClosed") : iconClass;
			            },

			            onClick: dojo.hitch(this, function(item){
			                if(this.selectedBuddy == item){
			                    var imWin = this.makeImWindow(item);
			                    if(imWin.shown) imWin.bringToFront();
			                    else imWin.show();
			                    return;
			                }
			                this.selectedBuddy = item;
			                this.removeBuddyButton.attr("disabled", false);
			            })
			        });

			        win.addChild(tree);
			        tree.startup();
			        return win;
			    },
			    makeImWindow: function(item){
			        var store = this.buddyStore;
			        var uiSlot = this.unameUi[store.getValue(item, "id")];
			        if(uiSlot && !uiSlot.win.closed)
			            return uiSlot.win.bringToFront();
			        var win = new Window({
			        	app  : this,
			            title: store.getValue(item, "username"),
			            width: "250px",
			            height: "250px"
			        });
			        
			        var messagePane = new ContentPane({
			            region: "center"
			        });

			        win.addChild(messagePane);

			        var inputBox = new MessageBox({
			            region: "bottom",
			            onSend: dojo.hitch(this, function(msg){
			                this.sendMessage(store.getValue(item, "id"), msg);
			            })
			        }); 
			        
			        win.addChild(inputBox);
			        
			        this.unameUi[store.getValue(item, "id")] = {
			            msgPane: messagePane,
			            win: win,
			            username: store.getValue(item, "username")
			        };
			        this.windows.push(win);
			        return win;
			    },
			    pushMsg: function(uid, msg, local){
			        var uiSlot = this.unameUi[uid];
			        if(uiSlot && uiSlot.win && !uiSlot.win.closed){
			            var node = uiSlot.msgPane.domNode;
			            var line = this.msgToNode(uiSlot.username, msg, local);
			            node.appendChild(line);
			            dojoxfx.smoothScroll({
							node: line,
							win: node,
							duration: 500,
							easing:dojofx.easing.easeOut,
			                onEnd: function(){
			                    node.scrollTop = node.scrollHeight+node.offsetHeight;
			                    node.scrollLeft = 0;
			                }
						}).play();
			        }
			        else {
			            var store = this.buddyStore;
			            store.fetch({
			                query: {id: uid},
			                onComplete: dojo.hitch(this, function(items){
			                    if(items.length == 0){
			                        //add the user who sent this to the buddy list
			                        srvUser.get({
			                            id: uid,
			                            onComplete: dojo.hitch(this, function(info){
			                                var item = this.addBuddy(info);
			                                var win = this.makeImWindow(item);
			                                this.pushMsg(uid, msg);
			                                win.show();
			                            })
			                        });
			                    }else{
			                        var win = this.makeImWindow(items[0]);
			                        this.pushMsg(uid, msg);
			                        win.show();
			                    }
			                })
			            });
			        }
			    },
			    msgToNode: function(username, message, local){
			        var div = document.createElement("div");
			        
			        var timeSpan = document.createElement("span");
			        var timestamp = dojo.date.locale.format(new Date());
			        timeSpan.innerHTML = "("+timestamp+") ";
			        dojo.style(timeSpan, {
			            color: local ? "blue" : "red"
			        });
			        div.appendChild(timeSpan);

			        
			        var nameSpan = document.createElement("span");
			        div.appendChild(nameSpan);

			        dojo.style(nameSpan, {
			            fontWeight: "bold",
			            color: local ? "blue" : "red"
			        });

			        var msgSpan = document.createElement("span");
			        utilHtml.textContent(msgSpan, message);
			        var message = msgSpan.innerHTML.split(" ");
			        var fixedMessage = [];
			        dojo.forEach(message, function(word){
			            if(validate.isUrl(word) && word.indexOf("://") != -1)
			                fixedMessage.push("<a href=\""+word.replace("\"", "\\\"")+"\">"+word+"</a>");
			            else
			                fixedMessage.push(word);
			        });
			        msgSpan.innerHTML = fixedMessage.join(" ");

			        dojo.query("a", msgSpan).forEach(function(node){
						dojo.connect(node, "onclick", node,dojo.hitch(this, function(e){
							if(!e.shiftKey
							&& !e.ctrlKey){
								this.scene.launchHandler(null, {url: this.href}, "text/x-uri");
								e.preventDefault();
							}
			            }))
					});

			        div.appendChild(msgSpan);
			        
			        if(local){
			            this.getCurrentUsername(function(name){
			                utilHtml.textContent(nameSpan, name+": ");
			            });
			        }else{
			            utilHtml.textContent(nameSpan, username+": ");
			        }
			        return div;
			    },
			    drawAddBuddyDialog: function(){
			        var win = new Window({
			        	app  : this,
			            title: "Add Buddy",
			            width: "350px",
			            height: "200px"
			        });
			        
			        var form = new AddBuddyForm({
			            onSubmit: dojo.hitch(this, function(){
			                var values = form.getValues();
			                srvUser.get({
			                    username: values.username,
			                    onComplete: dojo.hitch(this, "addBuddy")
			                });
			                win.close();
			                return false;
			            }),
			            onCancel: dojo.hitch(win, "close"),
			            region: "center"
			        });
			        win.addChild(form);
			        this.windows.push(win);
			        win.show();
			    },
			    wrapWid: function(widget){
			        var div = document.createElement("div");
			        div.appendChild(widget.domNode);
			        return div;
			    }
			
			}
		}
	});


	Class.extend(Messenger, {
		"-public-"	:	{
			"-fields-"	:	{
			    listener: null,
			    currentUsername: null
			
			},
			"-attributes-"	:	{
			},
			"-methods-"	:	{
			    setListener: function(){
			        this.listener = srvCrosstalk.subscribe("IM", dojo.hitch(this, "recieveMessage"), this.instance); 
			    },
			    removeListener: function(){
			        srvCrosstalk.unsubscribe(this.listener);
			    },
			    sendMessage: function(uid, msg){
			        this.pushMsg(uid, msg, true);
			        srvCrosstalk.publish("IM", {text: msg}, uid, this.sysname, null, dojo.hitch(this, function(messageID){
			            var kd = setTimeout(dojo.hitch(this, function(){
			                this.checkSent(messageID, uid);
			            }), 2000);
			        }));
			        this.playSend();
			    },
			    checkSent: function(id, uid){
				    srvCrosstalk.exists(id, dojo.hitch(this, function(notsent){
					    if(notsent){
						    this.pushMsg(uid, "System: User is offline or is experiencing network difficulites. Message will be sent when user is back online.");
			    		}
				    }));
			    },
			    recieveMessage: function(msg){
			        var uid = msg._crosstalk.sender;        
			        this.pushMsg(uid, msg.text, false);
			        this.playReceive();
			    },
			    getCurrentUsername: function(cback){
			        if(this.currentUsername) cback(this.currentUsername);
			        srvUser.get({onComplete: dojo.hitch(this, function(data){
			            this.currentUsername = data.username;
			            cback(this.currentUsername);
			        })});
			    }
			}
		}
	});


	Class.extend(Messenger, {
		"-public-"	:	{
			"-fields-"	:	{
			    sounds: {
			        send: null,
			        receive: null
			    }
			
			},
			"-attributes-"	:	{
			},
			"-methods-"	:	{
			    initSounds: function(){
			        var s = this.sounds = {};
			        s.send = new Sound({
//			            src: dojo.moduleUrl("openstar.apps.Messenger.resources", "send.mp3")
			            src: require.toUrl("openstar/apps/Messenger/resources/send.mp3")
			        });
			        s.receive = new Sound({
//			            src: dojo.moduleUrl("openstar.apps.Messenger.resources", "receive.mp3")
			            src: require.toUrl("openstar/apps/Messenger/resources/receive.mp3")
			        });
			        s.send.stop();
			        s.receive.stop();
			        
			    },
			    cleanupSounds: function(){
			        for(var s in this.sounds){
			            this.sounds[s].destroy();
			        }
			    },
			    playSend: function(){
			        var s = this.sounds.send;
			        s.stop();
			        s.play();
			    },
			    playReceive: function(){
			        var s = this.sounds.receive;
			        s.stop();
			        s.play();
			    }
			}
		}
	});

	return Messenger;

});
