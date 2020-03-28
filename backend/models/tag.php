<?php 
	class Tag extends Base
	{
		var $name = array('type' => "text");
		var $useage = array('type' => 'integer','default' => 0);
	}
	global $Tag;
	$Tag= new Tag();
