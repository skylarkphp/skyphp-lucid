dojo.provide("lucid.apps.Messenger.store");

dojo.extend(lucid.apps.Messenger, {
    buddyStore: null,
    makeBuddyStore: function(){
        if(this.buddyStore) return this.buddyStore;
        var store = this.buddyStore = new lucid.Registry({
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
		var strings = dojo.i18n.getLocalization("lucid.apps.Messenger", "messenger");
        if(!info.exists){
            return lucid.dialog.notify({type: "error", message: strings.noUser});
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
                lucid.user.get({
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
});
