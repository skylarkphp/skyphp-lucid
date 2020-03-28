<?php 
	class App_Tag extends Base
	{
		var $app_id = array('type' => "integer");
		var $tag_id = array('type' => 'integer');
	}
	global $App_Tag;
	$App_Tag= new App_Tag();
