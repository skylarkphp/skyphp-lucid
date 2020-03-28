var canvas;
var context;

var fisheye;
var mousemove;

var App = {
	initApp: function(){	
		canvas = document.getElementById("fisheye");
		context = canvas.getContext("2d");
		
		fisheye = new Fisheye(canvas);
		fisheye.init();
		
		App.addAppListener();
	
		var currTime = new Date().getTime();
		var elapsedTime = 0;
		
		setInterval( function sliderLoop(){
	    	elapsedTime = new Date().getTime() - currTime;
	    	currTime += elapsedTime;
	    	App.update(elapsedTime);
	    	App.render();
		}, Math.round(1000/60));
	},
	addAppListener: function(){
		canvas.addEventListener("mouseover", App.mouseOverHandler);
		canvas.addEventListener("mouseout", App.mouseOutHandler);
	},
	mouseOverHandler: function(e){
		fisheye.mousemove = true;
		document.onmousemove = App.mouseMoveHandler;
	},
	mouseMoveHandler: function(e){
		fisheye.currentX = e.offsetX;
		fisheye.currentY = e.offsetX;
	},
	mouseOutHandler: function(e){
		fisheye.mousemove = false;
		document.onmousemove = false;
		fisheye.resetParam();
	},	
	update: function(elapsedTime){
		if(fisheye.mousemove){
			fisheye.update();
		}
	},
	render: function(){
		context.clearRect(0, 0, canvas.width, canvas.height);
		fisheye.draw();
	}
}
	