
define([ "doh/main", "../_Desktop"], function(doh,_Desktop){

	doh.register("qface.desktop._tests._Desktop",[
		function testCtor(t){
			var s=new _Desktop({});
			t.assertEqual(true,!!s );
		}
	]);
});