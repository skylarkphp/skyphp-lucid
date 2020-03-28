dependencies ={
    layers:  [
		//CORE
        {
        	name: "../lucid/lucid.js",
        	dependencies: ["lucid.lucid"]
        },
        {
        	name: "../lucid/login/Form.js",
        	dependencies: ["lucid.login.Form"]
        },
		//APPS
		{
			name: "../lucid/apps/AccountInfo.js",
			dependencies: ["lucid.apps.AccountInfo"],
            layerDependencies: ["../lucid/lucid.js"]
		},
		{
			name: "../lucid/apps/AdminPanel.js",
			dependencies: ["lucid.apps.AdminPanel"],
            layerDependencies: ["../lucid/lucid.js"]
		},
		{
			name: "../lucid/apps/AppearanceConfig.js",
			dependencies: ["lucid.apps.AppearanceConfig"],
            layerDependencies: ["../lucid/lucid.js"]
		},
		{
			name: "../lucid/apps/Calculator.js",
			dependencies: ["lucid.apps.Calculator"],
            layerDependencies: ["../lucid/lucid.js"]
		},
		{
			name: "../lucid/apps/Checkers.js",
			dependencies: ["lucid.apps.Checkers"],
            layerDependencies: ["../lucid/lucid.js"]
		},
		{
			name: "../lucid/apps/Contacts.js",
			dependencies: ["lucid.apps.Contacts"],
            layerDependencies: ["../lucid/lucid.js"]
		},
		{
			name: "../lucid/apps/FeedReader.js",
			dependencies: ["lucid.apps.FeedReader"],
            layerDependencies: ["../lucid/lucid.js"]
		},
		{
			name: "../lucid/apps/FileBrowser.js",
			dependencies: ["lucid.apps.FileBrowser"],
            layerDependencies: ["../lucid/lucid.js"]
		},
		{
			name: "../lucid/apps/ImageViewer.js",
			dependencies: ["lucid.apps.ImageViewer"]
		},
		{
			name: "../lucid/apps/KatanaIDE.js",
			dependencies: ["lucid.apps.KatanaIDE"],
            layerDependencies: ["../lucid/lucid.js"]
		},
		{
			name: "../lucid/apps/Messenger.js",
			dependencies: ["lucid.apps.Messenger"],
            layerDependencies: ["../lucid/lucid.js"]
		},
		{
			name: "../lucid/apps/MineSweep.js",
			dependencies: ["lucid.apps.MineSweep"],
            layerDependencies: ["../lucid/lucid.js"]
		},
		{
			name: "../lucid/apps/MusicPlayer.js",
			dependencies: ["lucid.apps.MusicPlayer"],
            layerDependencies: ["../lucid/lucid.js"]
		},
		{
			name: "../lucid/apps/StartupConfig.js",
			dependencies: ["lucid.apps.StartupConfig"],
            layerDependencies: ["../lucid/lucid.js"]
		},
		{
			name: "../lucid/apps/TaskManager.js",
			dependencies: ["lucid.apps.TaskManager"],
            layerDependencies: ["../lucid/lucid.js"]
		},
		{
			name: "../lucid/apps/Terminal.js",
			dependencies: ["lucid.apps.Terminal"],
            layerDependencies: ["../lucid/lucid.js"]
		},
		{
			name: "../lucid/apps/TextEditor.js",
			dependencies: ["lucid.apps.TextEditor"],
            layerDependencies: ["../lucid/lucid.js"]
		},
		{
			name: "../lucid/apps/Todo.js",
			dependencies: ["lucid.apps.Todo"],
            layerDependencies: ["../lucid/lucid.js"]
		},
		{
			name: "../lucid/apps/UpdateManager.js",
			dependencies: ["lucid.apps.UpdateManager"],
            layerDependencies: ["../lucid/lucid.js"]
		},
		{
			name: "../lucid/apps/WebBrowser.js",
			dependencies: ["lucid.apps.WebBrowser"],
            layerDependencies: ["../lucid/lucid.js"]
		},
		{
			name: "../lucid/apps/WordProcessor.js",
			dependencies: ["lucid.apps.WordProcessor"],
            layerDependencies: ["../lucid/lucid.js"]
		}
    ],
    prefixes: [
        [ "lucid", "../lucid" ],
        [ "dijit", "../dijit" ],
        [ "dojox", "../dojox" ]
    ]
};
