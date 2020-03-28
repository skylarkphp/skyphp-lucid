 define([
	"dojo/_base/declare"
], function(declare) {

	var Drive = declare(null, {

		/**  
		* @class openstar/ufs/_Drive
		* @constructor 
		*/
		constructor: function(name) {
			this.name = name;
		},
		

		remove : function(path,sync) {
		},

		move : function(oldPath,newPath,sync) {
		},
		
		writeFile : function(path,contents,sync) {
		},
		
		readFile: function(path,sync) {
		},
		
		create : function(path,isFolder,sync) {
		},
		
		list:function(path,sync) {
		},
		
		find:function(path,sync){
		},
		
		getName : function() {
			return this.name;
		}

	});
	
	
	return Drive;
});

