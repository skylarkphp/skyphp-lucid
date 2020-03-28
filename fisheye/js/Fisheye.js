function Fisheye(){
	
	var canvasWidth = 900;
	var canvasHeight = 200;
	var iconArray = new Array();
	
	this.currentX;
	this.currentY;	
	
	this.mouseover = false; 
		
	this.barWidth = 500;
	this.barHeight = 60;

	this.icon = new Array("img/Firefox-Dock.png", "img/HP-Pictures-Folder-Dock.png", "img/HP-iTunes-Dock.png", "img/Network.png", "img/iMac-Dock.png");
		
	this.iconWidth= Math.round(this.barWidth/(this.icon.length*2));
	this.iconHeight = this.iconWidth;		
	
	this.iconMargin = this.iconWidth;
	
	this.init = function(){
		canvas.setAttribute("width", canvasWidth);
		canvas.setAttribute("height", canvasHeight);
		
		for(var row = 0; row<this.icon.length; row++){
		
			startx = (canvasWidth-this.barWidth)/2 ;
			x = startx + row*(this.iconWidth + this.iconMargin);
			//randomImg = Math.floor(Math.random() * this.icon.length);
			var ic = new Icon(this.icon[row], this.iconWidth, this.iconHeight, x, canvasHeight-(this.barHeight+this.iconHeight/2));
			iconArray.push(ic);
		}
	};
	
	this.update = function(){
		//calculate 
		for(var i=0;i<iconArray.length;i++){
			
			iconArray[i].dx = Math.abs(this.currentX - (iconArray[i].x + (iconArray[i].width/2)));
			iconArray[i].dy = Math.abs(this.currentY -  (iconArray[i].y + (iconArray[i].height/2)));
			iconArray[i].linear = this.linear(iconArray[i].dx,iconArray[i].maxWidth*3, 0, 100, 250);
		}
	};
	
	this.draw = function(){
		//draw rectanble bar in the middle
		context.fillStyle = "#dddddd";		
		//context.strokeRect(this.x, this.y, this.width, this.height);
		context.fillRect( (canvasWidth-this.barWidth)/2, canvasHeight-this.barHeight, this.barWidth, this.barHeight);
		
		
		for(var i=0; i<iconArray.length; i++){
			iconArray[i].draw();
		}
	};
	
	this.linear = function(distance, d_min, d_max, value1, value2){
		result = value1 + ((distance - d_min)/(d_max - d_min))*(value2 - value1);
		result = Math.min(Math.max(result, value1), value2);

		
		return result;
	};
	
	this.resetParam = function(){
		for(var i=0;i<iconArray.length;i++){	
			iconArray[i].dx = iconArray[i].maxWidth*3;
			iconArray[i].dy = iconArray[i].maxWidth*3;
			iconArray[i].linear = this.linear(iconArray[i].dx,iconArray[i].maxWidth*3, 0, 100, 250);
		}
	}
}



function Icon(src, width, height, x, y){
	this.x =x;
	this.y =y;
	
	this.maxWidth= width;
	this.maxHeight = height;
	
	this.width= width;
	this.height = height;
	this.dx=0;
	this.dy=0;
	this.linear=100;	
	
	this.image = new Image();
	this.image.src = src;
	
	this.draw = function(){
		context.fillStyle = "#ffffff";
		
		this.width = this.maxWidth * this.linear/100;
		this.height = this.maxHeight * this.linear/100;
		
		this.x = x + (this.maxWidth - this.width)/2;
		this.y = y +(this.maxHeight - this.height)/2;		
		
//		context.fillRect( this.x, this.y, this.width, this.height);			
		context.drawImage(this.image, this.x, this.y, this.width, this.height);
	}

}