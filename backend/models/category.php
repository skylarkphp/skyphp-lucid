<?php 
	class Category extends Base
	{
		var $name = array('type' => "text");
		var $useage = array('type' => 'integer','default' => 0);
		var $parent_id = array('type' => 'integer');
	}
	global $Category;
	$Category= new Category();
