dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.StackContainer");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.CheckBox");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.Form");
dojo.require("dijit.ProgressBar");
install = new function() {
	this.typeWasChecked = false;
	this.textContent = function(/*DomNode|String*/node, /*String?*/text) {
		//	summary:
		//		sets the textContent of a domNode if text is provided
		//		gets the textContent if a domNode if text is not provided
		//		if dojo adds this in the future, grep though
		//		the js code and replace it with dojo's method
		//	node:
		//		the node to set/get the text of
		//	text:
		//		the text to use
		node = dojo.byId(node);
		var attr = typeof node.textContent == "string" ? "textContent" : "innerText";
		if(arguments.length == 1)
			return node[attr];
		else
			node[attr] = text;
	}
	this.selected = function(page) {
		dijit.byId("previous").setDisabled(page.isFirstChild);
		if(page.isLastChild)
		{
			dijit.byId("previous").setDisabled(true);
			dijit.byId("next").setDisabled(false);
			dijit.byId("next").onClick = function() {
				window.location = "../";
			}
		}
		install.currentPage = page;
		if(page.title == "Pre-Install" && install.type == "reset") {
			dijit.byId("previous").setDisabled(false);
			dijit.byId("previous").onClick = function(e) {
				dijit.byId("wizard").selectChild("installtype-choose");
				this.onClick = function(e) { dijit.byId('wizard').back(); }
			};
		}
		if(page.title == "Permissions" || 
		   page.title == "Installation Type" ||
		   page.title == "Database" ||
		   page.title == "Admin Setup" ||
		   page.title == "Installing" ||
		   page.title == "Pre-Install" )
		{
			dijit.byId("next").setDisabled(true);
		}
		if(page.title == "Installing")
		{
			dijit.byId("previous").setDisabled(true);
			install.doInstall();
		}
		if(page.title == "Installation Type") {
			if(install.type == "reset") {
				 dijit.byId("next").setDisabled(false);
				 dijit.byId("next").onClick = function(e) {
					dijit.byId("wizard").selectChild("config-check");
					this.onClick = function(e) { dijit.byId('wizard').forward(); }
				};
				install.typeWasChecked = true;
			}
			if(install.typeWasChecked == true)  dijit.byId("next").setDisabled(false);
		}
		if(page.title == "Admin Setup") {
			install.checkAdmin();
		}
		if(page.title == "Pre-Install") {
			install.checkEnvironment();
		}
	}
	this.checkAdmin = function() {
		var form = dijit.byId("form").getValues();
			if(form.admin_user != ""
			&& form.admin_pass != ""
			&& form.admin_email != "")
				dijit.byId("next").setDisabled(false);
			else
				dijit.byId("next").setDisabled(true);
	}
	this.onPasswordChange = function() {
		var form = dijit.byId("form").getValues();
		if(form.admin_pass != form.admin_confpass) {
			install.textContent("admin_passbox", "Two passwords don't match")
			dijit.byId("next").setDisabled(true);
		}
		else {
			install.textContent("admin_passbox", "");
			dijit.byId("next").setDisabled(false);
		}
	}
	this.onLoad = function() {
		dojo.subscribe("wizard-selectChild", install.selected);
		install.selected(dijit.byId("start"));
		//dijit.byId("next").setDisabled(install.currentPage);
		install.getPerms();
		setInterval(install.getPerms, 2000);
		setInterval(install.checkDbInput, 1000);
		dojo.forEach(['installtype-new', 'installtype-cms'], function(e)
		{
			dijit.byId(e)._clicked = install.onTypeRadioClick;
		});
		dijit.byId("installtype-reset")._clicked = install.onResetRadioClick;
		setTimeout(function() {dijit.byId("wizard").resize();}, 100);
	}
	this.checkDbInput = function() {
		if (install.currentPage.title == "Database") {
			var form = dijit.byId("form").getValues();
			if(form.db_type != "" &&
			   form.db_name != "" &&
			   form.db_username != "" &&
			   form.db_password != "")
			{
				dijit.byId("next").setDisabled(false);
			}
			else if(form.db_url != "")
				dijit.byId("next").setDisabled(false);
			else
				dijit.byId("next").setDisabled(true);
		}
	}
	this.fixurlStr = function(e)
	{
		if(typeof e != "object") var e = {target: {id: ""}};
		if (e.target.id != "urlstr") {
			var p = dijit.byId("form").getValues();
			dijit.byId("urlstr").setValue(
				p.db_type+"://"+(p.db_type == "sqlite" ? "/" : "")+(p.db_username ? p.db_username+(p.db_password ? ":"+p.db_password : "")+"@" : "") + p.db_host + (p.db_type == "sqlite" ? "?mode=666" : "") + (p.db_name ? "/" + p.db_name : "")
			);
		}
	}
	this.getPerms = function()
	{
		if (install.currentPage.title == "Permissions") {
			dojo.xhrGet({
				url: "./backend.php?action=checkpermissions",
				load: function(data, args){
					if(dojo.isString(data)) {
						dojo.byId("perms").innerHTML = "<span style='color: red'>An error occurred:</span><br />"+data;
						return;
					}
					var html = "<ul>";
					var ready = true;
					for (key in data) {
						html += "<li>" + key.replace("../", "") + ": ";
						if (data[key] == "ok") 
							html += "<span style='color: green'>";
						else {
							html += "<span style='color: red'>";
							ready = false;
						}
						html += data[key] + "</span></li>";
					}
					html += "</ul>";
					dojo.byId("perms").innerHTML = html;
					dijit.byId("next").setDisabled(!ready);
				},
				handleAs: "json"
			});
		}
	}
	this.checkEnvironment = function()
	{
		if (install.currentPage.title == "Pre-Install") {
			dojo.xhrGet({
				url: "./backend.php?action=checkenvironment",
				load: function(data, args){
					if(dojo.isString(data)) {
						dojo.byId("configcheck").innerHTML = "<span style='color: red'>An error occurred:</span><br />"+data;
						return;
					}
					var html = "<ul>";
					var ready = true;
					for (key in data) {
						html += "<li>" + key.replace("../", "") + ": ";
						if (data[key].substr(0,2) == "ok") 
							html += "<span style='color: green'>";
						else if(data[key].substr(0,4) == "warn")
							html += "<span style='color: orange'>";
						else {
							html += "<span style='color: red'>";
							ready = false;
						}
						html += data[key] + "</span></li>";
					}
					html += "</ul>";
					dojo.byId("configcheck").innerHTML = html;
					if(ready)
						dojo.byId("pinstall").innerHTML = "Everything OK!<br>Everything looks okay so far, hit next to start the installation process!";
					else
						dojo.byId("pinstall").innerHTML = "Something is wrong!<br>Please look above and rectify the pending issues.";			
					dijit.byId("next").setDisabled(!ready);
				},
				handleAs: "json"
			});
		}
	}
	this.onTypeRadioClick = function(e) {
		if(!this.checked) {
			this.setChecked(true);
			dijit.byId("next").setDisabled(false);
			dijit.byId("next").onClick = function(e) {
				dijit.byId('wizard').forward();
			};
		}
		install.typeWasChecked = true;
		install.type = "clean";
	}
	this.onResetRadioClick = function(e) {
		if(!this.checked) {
			this.setChecked(true);
			dijit.byId("next").setDisabled(false);
			dijit.byId("next").onClick = function(e) {
				dijit.byId("wizard").selectChild("config-check");
				this.onClick = function(e) { dijit.byId('wizard').forward(); }
			};
		}
		install.type = "reset";
	}
	this.doInstall = function()
	{
		dojo.byId("taskList").innerHTML = "";
		var form = dijit.byId("form").getValues();
		if (form.type == "reset") {
			this.tasks.apps(dojo.hitch(this, function(umm){
				if(umm) {
					install.updateBar(50);
					this.tasks.permissions(function(comp) {
						if(comp) {
							dijit.byId("next").setDisabled(false);
							install.updateBar(100);
						}
						else {
							dijit.byId("next").setDisabled(true);
							dijit.byId("previous").setDisabled(false);
							install.updateBar(0);
						}
					});
				}
				else {
				dijit.byId("next").setDisabled(true);
				dijit.byId("previous").setDisabled(false);
				install.updateBar(0);
				}
			}));
		}
		else {
			this.tasks.database(form, function(nodberr){
				if (nodberr) {
					install.updateBar(25);
					install.tasks.apps(function(noerr){
						if (noerr) {
							install.updateBar(50);
							install.tasks.permissions(function(umm) {
								if (umm) {
										install.updateBar(75);
										install.tasks.admin(form, function(asdfumm){
											if (asdfumm) {
												install.updateBar(100);
												dijit.byId("next").setDisabled(false);
											}
											else {
												install.Err();
											}
										});
								}
								else {
									install.Err();
								}
							});
						}
						else {
							install.Err();
						}
					});
				} else {
					install.Err();
				}
			});
		}
	},
	this.Err = function() {
		dijit.byId("next").setDisabled(true);
		dijit.byId("previous").setDisabled(false);
		install.updateBar(0);
	}
	this.updateBar = function(percent)
	{
		dijit.byId("progressBar").update({
			indeterminate: false,
			maximum: 100,
			progress: percent
		});
		if(percent == 100) {
			dojo.byId("taskList").innerHTML += "<div class='installComplete'>*** Installation Complete ***</div>";
		}
		dojo.byId("taskList").scrollTop = dojo.byId("taskList").scrollHeight;
	}
	this.writeError = function(data) {
		var num = data.charAt(data.length-1);
		var text = "Unknown error";
		if(num == "6") text = "Database query error";
		if(num == "4") text = "Database connection error";
		dojo.byId("taskList").innerHTML += "<div class='installError'>***Installation Error***</div>"
		+ "<div class='installError'>"+text+"</div>"
        + "<a href='javascript:install.toggleDebugBox();'>Full Details</a>";
        var textarea = document.createElement("textarea");
        textarea.innerHTML = data;
        textarea.id="debugBox";
        dojo.style(textarea, {
            width: "450px",
            height: "150px",
            display: "none",
            opacity: 0
        });
        dojo.byId("taskList").appendChild(textarea);
	}
    this.toggleDebugBox = function() {
        var node = dojo.byId("debugBox")
        if(dojo.style(node, "display") == "none") {
            dojo.style(node, "display", "block");
            dojo.fadeIn({node: node}).play();
        }
        else {
            dojo.fadeOut({
                node: node,
                onEnd: function() {
                    dojo.style(node, "display", "none");
                }
            }).play();
        }
    }
	this.tasks = {
		permissions: function(callback) {
			dojo.xhrPost({
				url: "./backend.php?action=installpermissions",
				load: function(data, args){
					try{
						data = dojo.fromJson(data);
					}catch(e){}
					if (dojo.isObject(data)) {
						var html = "<ul>";
						var ready = true;
						for (key in data) {
							html += "<li>" + key.replace("../", "") + ": ";
							if (data[key] == "...done") 
								html += "<span style='color: green'>";
							else {
								html += "<span style='color: red'>";
								ready = false;
							}
							html += data[key] + "</span></li>";
						}
						html += "</ul>";
						dojo.byId("taskList").innerHTML += html;
						callback(ready);
					}
					else {
						install.writeError(data);
						callback(false);
						//TODO: once the output framework is used tell the user what went wrong.
					}
				},
				callback: callback
			});
		},
		apps: function(callback)
		{
			dojo.xhrPost({
				url: "./backend.php?action=installprograms",
				load: function(data, args){
					try{
						data = dojo.fromJson(data);
					}catch(e){}
					if (dojo.isObject(data)) {
						var html = "<ul>";
						var ready = true;
						for (key in data) {
							html += "<li>" + key.replace("../", "") + ": ";
							if (data[key] == "...done") 
								html += "<span style='color: green'>";
							else {
								html += "<span style='color: red'>";
								ready = false;
							}
							html += data[key] + "</span></li>";
						}
						html += "</ul>";
						dojo.byId("taskList").innerHTML += html;
						callback(ready);
					}
					else {
						install.writeError(data);
						callback(false);
						//TODO: once the output framework is used tell the user what went wrong.
					}
				},
				callback: callback
			});
		},
		admin: function(form, callback) {
			dojo.xhrPost({
				url: "./backend.php?action=installadmin",
				content: {
					username: form.admin_user,
					password: form.admin_pass,
					email: form.admin_email
				},
				load: function(data, args){
					try{
						data = dojo.fromJson(data);
					}catch(e){}
					if (dojo.isObject(data)) {
						var html = "<ul>";
						var ready = true;
						for (key in data) {
							html += "<li>" + key.replace("../", "") + ": ";
							if (data[key] == "...done") 
								html += "<span style='color: green'>";
							else {
								html += "<span style='color: red'>";
								ready = false;
							}
							html += data[key] + "</span></li>";
						}
						html += "</ul>";
						dojo.byId("taskList").innerHTML += html;
						callback(ready);
					}
					else {
						install.writeError(data);
						callback(false);
						//TODO: once the output framework is used tell the user what went wrong.
					}
				},
				callback: callback
			});
		},
		database: function(form, callback) {
		dojo.xhrPost({
				url: "./backend.php?action=installdatabase",
				content: {
					db_url: form.db_url,
					db_prefix: form.db_prefix,
					conf_public: form.conf_public,
					conf_throttle: form.conf_throttle
				},
				load: function(data, args){
					try{
						data = dojo.fromJson(data);
					}catch(e){}
					if (dojo.isObject(data)) {
						var html = "<ul>";
						var ready = true;
						for (key in data) {
							html += "<li>" + key.replace("../", "") + ": ";
							if (data[key] == "...done") 
								html += "<span style='color: green'>";
							else {
								html += "<span style='color: red'>";
								ready = false;
							}
							html += data[key] + "</span></li>";
						}
						html += "</ul>";
						dojo.byId("taskList").innerHTML += html;
						callback(ready);
					}
					else {
						install.writeError(data);
						callback(false);
						//TODO: once the output framework is used tell the user what went wrong.
					}
				},
				callback: callback
			});
		}
	}
}
dojo.addOnLoad(install.onLoad);
