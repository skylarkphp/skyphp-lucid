dojo.provide("lucid.apps.AdminPanel.permissions");

dojo.extend(lucid.apps.AdminPanel, {
	permissions: function(){
		this.toolbar.destroyDescendants();
		var sys = dojo.i18n.getLocalization("lucid", "system");
		var cmn = dojo.i18n.getLocalization("lucid", "common");
		var permNls = dojo.i18n.getLocalization("lucid", "permissions");
		
		lucid.admin.permissions.list(dojo.hitch(this, function(data){
			var layout = [{
				cells: [[]]
			}];
			for(var key in data){
				var item = data[key];
				item.description = permNls[item.name] || item.description;
			}
			//make headers
			for(var field in data[0]){
				var args = {
					name: sys[field],
					field: field
				};
				if(field == "initial"){
					args.type = dojox.grid.cells.Bool;
                    args.editable = true;
				}
				layout[0].cells[0].push(args);
			}
			
			this._permStore = new dojo.data.ItemFileWriteStore({
				data: {
					identifier: "id",
					items: data
				}
			});
			dojo.connect(this._permStore, "onSet", this, function(item, attribute, oldVal, newVal){
				var id = this._permStore.getValue(item, "id");
				if(id == false || attribute != "initial") return;
				lucid.admin.permissions.setDefault(id, newVal);
			})
			var grid = this._permGrid = new dojox.grid.DataGrid({
				structure: layout,
                store: this._permStore,
                query: {id: "*"}
			});
			if(this._con) dojo.disconnect(this._con);
			this._con = dojo.connect(this.main, "resize", grid, "resize");
			this.main.setContent(this._permGrid.domNode);
			this._permGrid.render();
			this.win.layout();
		}));
	}
})
