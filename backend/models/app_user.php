<?php 
	class App_User extends Base
	{
		var $app_id = array('type' => "integer");
		var $user_id = array('type' => 'integer');
	}
	global $App_User;
	$App_User= new App_User();
