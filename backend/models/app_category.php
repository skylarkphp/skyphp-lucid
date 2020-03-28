<?php 
	class App_Category extends Base
	{
		var $app_id = array('type' => "integer");
		var $category_id = array('type' => 'integer');
	}
	global $App_Category;
	$App_Category= new App_Category();
