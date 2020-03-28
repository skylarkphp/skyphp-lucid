define([
	"dojo/_base/declare",
	"./MySpace"
], function(declare, MySpace) {

	var _instances = [];
	var _resources = [];
	
	var _myspace;

	var Factory = {
		getMySpace : function() {
			if (!_myspace) {
				_myspace =MySpace;
			}
			return 	_myspace;
		
		}

	};

	return Factory;

});