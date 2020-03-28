dojo.provide("lucid.apps.AdminPanel.shares");

dojo.extend(lucid.apps.AdminPanel, {
	shares: function(){
		var sys = dojo.i18n.getLocalization("lucid", "system");
		var cmn = dojo.i18n.getLocalization("lucid", "common");
		this.toolbar.destroyDescendants();
		var button = new dijit.form.DropDownButton({
			label: sys.createNewShare,
			dropDown: this.createShareDialog()
		});
		this.toolbar.addChild(button);
		lucid.admin.shares.list(dojo.hitch(this, function(data){
			for(var i=0;i<data.length;i++){
				data[i].groups = dojo.toJson(data[i].groups);
			};
			//make headers (need to do it manually unfortunatly)
			var layout = [{
				cells: [[
					{name: sys.name, field: "name"},
					{name: sys.description, field: "description", editable: true, type: dojox.grid.cells.Cell},
					{name: sys.groups, field: "groups"}
				]]
			}];
			this._groupStore = new dojo.data.ItemFileWriteStore({
				data: {
					identifier: "id",
					items: data
				}
			});
			var grid = this._groupGrid = new dojox.grid.DataGrid({
				structure: layout,
                store: this._groupStore,
                query: {id: "*"}
			});
			if(this._con) dojo.disconnect(this._con);
			this._con = dojo.connect(this.main, "resize", grid, "resize");
			dojo.connect(this._groupStore, "onDelete", this, function(a){
				lucid.admin.shares.remove(a.name[0]); //that feels really hackish
			})
			dojo.connect(this._groupStore, "onSet", this, function(item, attribute, oldVal, newVal){
				if(attribute == "permissions") return;
				var id = this._groupStore.getValue(item, "id");
				if(id == false) return;
				var args = {id: id};
				args[attribute] = newVal;
				lucid.admin.shares.set(args);
			})
			this.main.setContent(this._groupGrid.domNode);
			this._groupGrid.render();
			var menu = this._groupMenu = new dijit.Menu({});
			dojo.forEach([
				{
					label: cmn["delete"],
					onClick: dojo.hitch(this, function(e){
						var row = this._groupGrid.getItem(this.__rowIndex);
						lucid.dialog.yesno({
							title: sys.groupDelConfirm,
							message: sys.delFromSys.replace("%s", row.name),
							onComplete: dojo.hitch(this, function(a){
								this._groupStore.deleteItem(row);
							})
						})
					})
				},
				{
					label: sys.addRemoveGroup,
					onClick: dojo.hitch(this, "shareMemberDialog")
				},
			], function(item){
				var menuItem = new dijit.MenuItem(item);
				menu.addChild(menuItem);
			});
			this._groupGrid.onRowContextMenu = dojo.hitch(this, function(e){
				this.__rowIndex = e.rowIndex;
				this._groupMenu._contextMouse();
				this._groupMenu._openMyself(e);
			});
			document.body.appendChild(menu.domNode);
			this.win.layout();
		}));
	},
	
	createShareDialog: function(){
		var sys = dojo.i18n.getLocalization("lucid", "system");
		var cmn = dojo.i18n.getLocalization("lucid", "common");
		
		var dialog = new dijit.TooltipDialog({});
		var errBox = document.createElement("div");
		dialog.containerNode.appendChild(errBox);
		
		var line = document.createElement("div");
	    var p = document.createElement("span");
	    p.innerHTML = sys.name+": ";
	    line.appendChild(p);
		var name = new dijit.form.TextBox({});
		line.appendChild(name.domNode);
		dialog.containerNode.appendChild(line);
		
		var line = document.createElement("div");
	    var p = document.createElement("span");
	    p.innerHTML = sys.description+": ";
	    line.appendChild(p);
		var description = new dijit.form.TextBox({});
		line.appendChild(description.domNode);
		dialog.containerNode.appendChild(line);
		
		var line = document.createElement("div");
	    var p = document.createElement("span");
		var button = new dijit.form.Button({
			label: cmn.create,
			onClick: dojo.hitch(this, function(){
				var n = name.getValue();
				var d = description.getValue();
				this._groupStore.fetch({
					query: {name: n},
					onComplete: dojo.hitch(this, function(list){
						if(list.length != 0){
							errBox.textContent = sys.groupAlreadyExists;
							return;
						}
						errBox.textContent = "";
						lucid.admin.shares.add({
							name: n,
							description: d,
							onComplete: dojo.hitch(this, function(id){
								name.setValue("");
								description.setValue("");
								this._groupStore.newItem({
									id: id,
									name: n,
									description: d,
									groups: "[]",
								})
							})
						})
					})
				})
			})
		});
		line.appendChild(button.domNode);
		dialog.containerNode.appendChild(line);
		
		return dialog;
	},
	shareMemberDialog: function(group){
		var sys = dojo.i18n.getLocalization("lucid", "system");
		var cmn = dojo.i18n.getLocalization("lucid", "common");
		var row = this._groupGrid.getItem(this.__rowIndex);
		var rowID = this._groupStore.getValue(row, "id");
		var window = new lucid.widget.Window({
			title: sys.manageGroupMembers.replace("%s", this._groupStore.getValue(row, "name")),
			width: "100px",
			height: "80px"
		})
		this.windows.push(window);
		var add = function(name) {
			lucid.dialog.input({title: this.win.title, message: sys.enterGroup, onComplete: dojo.hitch(this, function(name) {
				if(name == "") return;
				lucid.xhr({
					backend: "core.administration.shares.addGroup",
					content: {
						shareid: rowID,
						groupname: name
					},
					load: dojo.hitch(this, "shares")
				});
				window.close();
			})});
		}
		var remove = function(name) {
			lucid.dialog.input({title: this.win.title, message: sys.enterGroup, onComplete: dojo.hitch(this, function(name) {
				if(name == "") return;
				lucid.xhr({
					backend: "core.administration.shares.removeGroup",
					content: {
						shareid: rowID,
						groupname: name
					},
					load: dojo.hitch(this, "shares")
				});
				window.close();
			})});
		}
		var b = new dijit.form.Button({
			label: cmn.add,
			onClick: dojo.hitch(this, add)
		})
		var c = new dijit.form.Button({
			label: cmn.remove,
			onClick: dojo.hitch(this, remove)
		})
		window.addChild(b);
		window.addChild(c);
		window.show();
		window.startup();
	}
})
