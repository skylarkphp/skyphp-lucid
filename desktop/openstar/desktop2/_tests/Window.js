define([ "doh/main", "../Window"], function(doh,Window){

	doh.register("qface.desktop._tests.Window",[
		function testCtor(t){
			var s=new Window({});
			t.assertEqual(true,!!s );
		}
	]);

});