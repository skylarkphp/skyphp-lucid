<?php

	require("../lib/includes.php");


function upload_output($data) {
    if( isset($_FILES['Filedata'])){
        // flash
        $out = new flashOutput($data);
    }else{
        // html
        //$out = new textareaOutput($data);
        $out = new jsonOutput($data);
    }
    //mlog(serialize($data));
}

function handle_upload($file) {
    global $module;
    global $sentpath;
    $file['name']=str_replace("..", "", $file['name']);
	$content = file_get_contents($file['tmp_name']);
	return ($content !== false && $module->write($sentpath . "/" . $file['name'], $content));
}

function handle_uploadHTML5($files,$i) {
    global $module;
    global $sentpath;
    $files['name'][$i]=str_replace("..", "", $files['name'][$i]);
	$content = file_get_contents($files['tmp_name'][$i]);
	return ($content !== false && $module->write($sentpath . "/" . $files['name'][$i], $content));
}

import("models.user");
global $User;
$user = $User->get_current();

if(!$user || !$user->has_permission("api.filesystem.upload")) { 
	upload_output(array(
		status => "failed",
		details => "Contact administrator; Your account lacks uploading permissions."
	));
	die();
}
if(isset($_FILES['Filedata']) || isset($_FILES['uploadedfile'])){
    $file = (isset($_FILES['Filedata']) ? $_FILES['Filedata'] : $_FILES['uploadedfile']);
    if(handle_upload($file)){
        upload_output(array(
			status => "success",
			details => $_FILES['uploadedfile']['name']
		));
    }else{
        upload_output(array(
			status => "failed",
			details => "Contact administrator; could not write to disk"
		));
    }
}elseif(isset($_FILES['uploadedfile0'])){
    $cnt = 0;
	$ar = array();
	$res = true;
	while(isset($_FILES['uploadedfile'.$cnt]) && $res){
	    $res = handle_upload($_FILES['uploadedfile'.$cnt]);
	    $cnt++;
	}
	if($res){
	    upload_output(array(
			status => "success",
			details => "Uploaded ".$cnt." files"
		));
	}else{
	    upload_output(array(
			status => "failed",
			details => "Contact administrator; could not write to disk"
		));
	}
	
}elseif( isset($_FILES['uploadedfiles']) ){
	//
	// 	If the data passed has 'uploadedfiles' (plural), then it's an HTML5 multi file input.
	//
	mlog("HTML5 multi file input");
    $cnt = 0;
	$len = count($_FILES['uploadedfiles']['name']);
	$res = true;
	for($i=0;$i<$len;$i++){
	mlog($_FILES['uploadedfiles']['name'][$i]);
	    $res = handle_uploadHTML5($_FILES['uploadedfiles'],$i);
	    $cnt++;
	}
	mlog($res);
	if($res){
	    upload_output(array(
			status => "success",
			details => "Uploaded ".$cnt." files"
		));
	}else{
	    upload_output(array(
			status => "failed",
			details => "Contact administrator; could not write to disk"
		));
	}
  	
}else{
	upload_output(array(
		status => "failed",
		details => "No file uploaded"
	));
}
