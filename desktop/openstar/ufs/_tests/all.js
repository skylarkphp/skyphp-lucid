define([ 
	"doh/main", 
	"../FileSystem",
	"../Folder",
	"../File",
], function(doh){

doh.register("qscriptx.store.openfs._tests.all",
	[
		function test_1(t){
			t.is("white","white");
		}
	]
);

});