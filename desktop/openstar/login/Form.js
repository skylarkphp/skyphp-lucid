define("openstar/login/Form" ,[
     "dojo",
     "dojo/cookie",
     "dijit/_Templated",
   	 "dijit/form/Form",
   	 "dijit/Dialog",
   	 "qfacex/dijit/input/TextBox",
   	 "qfacex/dijit/selection/RadioButton",
   	 "dojox/validate",
     "dojo/text!./Form.html",
     "dojo/text!./RegisterDialog.html",
     "dojo/text!./ResetPassDialog.html",
   	 "dojox/validate/web"
     
],function(dojo,cookie,_Templated,Form,Dialog,TextBox,RadioButton,validate,templateForm,templateRegisterDialog,templateResetPassDialog) {
	
	var LoginForm = dojo.declare("openstar.login.Form", [Form, _Templated], {
		templateString:templateForm,
		_popup: null,
		widgetsInTemplate: true,
		preload: true,
		autoRedirect: false,
	  focusOnLoad: false,
		label: "Desktop Login",
		
		// attach points
		mainNode: null,
		errorNode: null,
		usernameField: null,
		newRadioNode: null,
		currentRadioNode: null,
		rememberNode: null,
		submitNode: null,
	
		postCreate: function(){
			this.inherited(arguments);
			if(this.preloadDesktop){
				var ontype = dojo.connect(this.domNode, "onkeydown", this, function(){
					dojo.disconnect(ontype);
					// pre-fetch the desktop.js file
					// in built versions, this should have everything we need
					dojo.xhrGet({
//						url: dojo.moduleUrl("desktop", "desktop.js")
						url: require.toUrl("desktop/desktop.js")
					});
				})
			}
      if(this.focusOnLoad)
        this.usernameField.focus();
			this.checkForLogin();
			this.setRadioButton();
		},
		checkForLogin: function(winClosed){
			dojo.xhrGet({
				url: "/backend/core/bootstrap.php?section=check&action=loggedin",
				load: dojo.hitch(this, function(data){
					if(data == 0){
						if(this.autoRedirect){
							if(cookie("desktopWindowPref") == "current"){
								this.errorNode.innerHTML = "You are already logged in. Redirecting to desktop...";
								this.submitNode.setDisabled(true);
								window.location = "/desktop/index.html";
							}
							else if(winClosed){
								this.errorNode.innerHTML = "You are already logged in. <a href='" + "/desktop/index.html'>Click here</a> to open the desktop.";
								dojo.query("a", this.errorNode).forEach(function(elem){
									elem.href="javascript:void(0);";
									dojo.connect(elem, "onclick", this, "onLinkClick");
								}, this);
							}
							else {
								if (this._popUp()){
									this.errorNode.innerHTML = "You are already logged in. Window opened.";
									this.submitNode.setDisabled(true);
									this._winCheck();
								}
								else {
									this.errorNode.innerHTML = "Your popup blocker is blocking the window. <a href='" +"/desktop/index.html'>Click here</a> to try again.";
									dojo.query("a", this.errorNode).forEach(function(elem){
										elem.href="javascript:void(0);";
										dojo.connect(elem, "onclick", this, "onLinkClick");
									}, this);
								}
							}
						}
						else 
							this.errorNode.innerHTML = "You are already logged in. <a href='" + "/desktop/index.html'>Click here</a> to continue to the desktop.";
							dojo.query("a", this.errorNode).forEach(function(elem){
								elem.href="javascript:void(0);";
								dojo.connect(elem, "onclick", this, "onLinkClick");
							}, this);
					}
				})
			})
		},
		setRadioButton: function(){
			if(!cookie("desktopWindowPref") || cookie("desktopWindowPref") == "current")
				this.currentRadioNode.attr("checked", true);
			else
				this.newRadioNode.attr("checked", true);
		},
		onLinkClick: function(){
			if(cookie("desktopWindowPref") == "current"){
				window.location = "/desktop/index.html";
			}
			else {
				if (this._popUp()){
				}
				else {
					this.errorNode.innerHTML = "Your popup blocker is blocking the window. <a href='" +  "/desktop/index.html'>Click here</a> to try again.";
					dojo.query("a", this.errorNode).forEach(function(elem){
						elem.href="javascript:void(0);";
						dojo.connect(elem, "onclick", this, "onLinkClick");
					}, this);
				}
			}
		},
		_winCheck: function(){
			if(this._popup.closed === false){setTimeout(dojo.hitch(this, "_winCheck"), 500);}
			else {
				this.submitNode.setDisabled(false);
				this.errorNode.innerHTML = "";
				this.checkForLogin(true);
			}
		},
		_popUp: function()
		{
			var URL="/desktop/index.html";
			var day=new Date();
			var id=day.getTime();
			this._popup=window.open(URL,id,"toolbar=0,scrollbars=0,location=0,statusbar=0,menubar=0,resizable=1,width=1024,height=786,left = 0,top = 0");
			if(!this._popup)
				return false;
			else
				return true;
		},
		onSubmit: function(e){
			dojo.stopEvent(e);
			if(this.submitNode.disabled == true) return;
			var contents = this.getValues();
			cookie("desktopWindowPref", contents.windowAct, {
				expires: 365,
				path: window.location.pathname
			});
			this.errorNode.innerHTML = "";
			this.submitNode.disabled=true;
			if(contents.username && contents.password)
			{
			this.errorNode.innerHTML = "Logging in...";
				dojo.xhrPost({
					url: "/backend/core/user.php?section=auth&action=login",
					content: contents,
					load: dojo.hitch(this, function(data)
					{
						if(data == "0")
						{
							if(contents.windowAct == "current"){
								this.errorNode.innerHTML = "Logged in. Redirecting to desktop...";
								window.location = "/desktop/index.html";
							}
							else {
								if (this._popUp()){
									this._winCheck();
									this.domNode.username.value = "";
									this.domNode.password.value = "";
									this.errorNode.innerHTML = "Logged in. Window open.";
								}
								else {
									this.errorNode.innerHTML = "Your popup blocker is blocking the Lucid Desktop window.";
									this.submitNode.setDisabled(false);
								}
							}
						}
						else if(data == "1")
						{
							this.errorNode.innerHTML = "Incorrect username or password.";
							this.submitNode.setDisabled(false);
						}
						else if(data == "4" || data == "5" || data == "6")
						{
							this.errorNode.innerHTML = "A database error occured. Check Lucid Desktop is installed correctly or contact the Administrator.";
							this.submitNode.setDisabled(false);
						}
						else if(data == "7")
						{
							this.errorNode.innerHTML = "You do not have permission to login. Contact the Administrator.";
							this.submitNode.setDisabled(false);
						}
						else
						{
							this.errorNode.innerHTML = "Unknown Error occured. Check your installation.";
							this.submitNode.setDisabled(false);
						}
					})
				});
			}
			else
			{
				this.errorNode.innerHTML = "Please provide both a username and a password";
				this.submitNode.setDisabled(false);
			}
			return false;
		},
		_showRegister: function(){
			var form = new openstar.login._RegisterDialog({
				parentForm: this
			});
			form.show();
		},
		_showResetPass: function(){
			console.log("test");
			var form = new openstar.login._ResetPassDialog({
				parentForm: this
			});
			form.show();
		}
	});

	dojo.declare("openstar.login._RegisterDialog",  [Dialog, _Templated], {
		title: "Register",
		templateString:templateRegisterDialog,
		parentForm: null,
		postCreate: function(){
			this.inherited(arguments);
			new dijit.form.TextBox({name: "username"}, this.usernameInputNode);
			new dijit.form.TextBox({name: "email"}, this.emailInputNode);
			new dijit.form.TextBox({name: "password", type: "password"}, this.passwordInputNode);
			new dijit.form.TextBox({name: "confPassword", type: "password"}, this.confPasswordInputNode);
		},
		onSubmit: function(e){
			dojo.stopEvent(e);
			var contents = this.getValues();
			this.submitNode.disabled=true;
			this.errorNode.innerHTML = "";
			if(contents.username && contents.email && contents.password && contents.confPassword)
			{
				if(contents.username.indexOf("..") != -1){
					this.errorNode.innerHTML = "Username cannot contain two consecutive '.'s";
					this.submitNode.disabled=false;
					return;
				}
				if(contents.username.indexOf("/") != -1){
					this.errorNode.innerHTML = "Username cannot contain any slashes";
					this.submitNode.disabled=false;
					return;
				}
				if(contents.username.indexOf("\\") != -1){
					this.errorNode.innerHTML = "Username cannot contain any slashes";
					this.submitNode.disabled=false;
					return;
				}
				if(contents.password == contents.confPassword)
				{
					if(validate.isEmailAddress(contents.email))
					{
						dojo.xhrPost({
							url: "/backend/core/user.php?section=auth&action=register",
							content: contents,
							load: dojo.hitch(this, function(data, ioArgs)
							{
								if(data == "User registration disabled")
								{
									this.hide();
									this.parentForm.errorNode.innerHTML = "Public registations are disabled";
								}
								if(data == "1")
								{
									this.errorNode.innerHTML = "Username already exists";
									this.submitNode.disabled=false;
								}
								else if(data == "0")
								{
									this.hide();
									this.parentForm.errorNode.innerHTML = "You may now log in";
								}
							})
						});
					}
					else
					{
						this.errorNode.innerHTML = "Please enter a valid email";
						this.submitNode.disabled=false;
					}
				}
				else
				{
					this.errorNode.innerHTML = "Two passwords don't match";
					this.submitNode.disabled=false;
				}
			}
			else
			{
				this.errorNode.innerHTML = "Please fill in all fields";
				this.submitNode.disabled=false;
			}
			return false;
		}
	});
	
	dojo.declare("openstar.login._ResetPassDialog",  [Dialog, _Templated], {
		title: "Reset Password",
		templateString:templateResetPassDialog,
		parentForm: null,
		postCreate: function(){
			this.inherited(arguments);
			new TextBox({name: "username"}, this.userInputNode);
			new TextBox({name: "email"}, this.emailInputNode);
		},
		onSubmit: function(e){
			dojo.stopEvent(e);
			var contents = this.getValues();
			this.submitNode.disabled=true;
			this.errorNode.innerHTML = "";
			if(contents.email && contents.username)
			{
				if(validate.isEmailAddress(contents.email))
				{
					dojo.xhrPost({
						url: "/backend/core/user.php?section=auth&action=resetpass",
						content: contents,
						load: dojo.hitch(this, function(data, ioArgs){
							if(data == "2")
							{
								this.errorNode.innerHTML = "Email on file and username don't match";
								this.submitNode.disabled=false;
							}
							else if(data == "1")
							{
								this.errorNode.innerHTML = "No such user";
								this.submitNode.disabled=false;
							}
							else if(data == "0")
							{
								this.hide();
								this.parentForm.errorNode.innerHTML = "A new password has been sent"
							}
						})
					});
				}
				else
				{
					this.errorNode.innerHTML = "Please enter a valid email";
					this.submitNode.disabled=false;
				}
			}
			else
			{
				this.errorNode.innerHTML = "Please fill out all fields";
				this.submitNode.disabled=false;
			}
			return false;
		}
	});
	
	return LoginForm;
});

