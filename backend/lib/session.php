<?php

import("models.session");
class session_manager {
    var $session_id;
    var $session;
    function _makeSession($session_id){
        $Session = $this->session;
        
        $p = new $Session(array(
            "session_id" => $session_id,
            "date_created" => time(),
            "last_updated" => time(),
        ));
        $p->save();
        return $p;
    }
    function open($save_path, $session_name){
        //do nothing
        return true;
    }
    function close(){
        if (!empty($this->fieldarray)) {
            // perform garbage collection
            $result = $this->gc(ini_get('session.gc_maxlifetime'));
            return $result;
        } // if
        
        return FALSE;
    }
    function __construct(){
        //make our own session object so that it's available while destroying ourselves
        $this->session = new Session();
    }
    function __destruct(){
        @session_write_close();
    }
    function read($session_id){
        $Session = $this->session;
        $p=$Session->filter("session_id", $session_id);
        if($p != false){
            return $p[0]->session_data;
        }
        else{
            return '';
        }
    }
    function write($session_id, $session_data){
        $Session = $this->session;
        $p=$Session->filter("session_id", $session_id);
        if($p != false){
            $p = $p[0];
            $p->last_updated = time();
        }else{
            $p = $this->_makeSession($session_id);
        }
        $p->session_data = $session_data;
        $p->save();
        return true;
    }
    function destroy($session_id){
        $Session = $this->session;
        $p=$Session->filter("session_id", $session_id);
        if($p != false){
            $p = $p[0];
            $p->delete();
            return true;
        }
        return false;
    }
    function gc($max_lifetime){
        $Session = $this->session;
        $real_now = date('Y-m-d H:i:s');
        $dt1 = strtotime("$real_now -2 hours");
        $dt2 = date('YmdHis', $dt1);
        
        $count = $Session->filter(array("last_updated__lte" => $dt2));
        return TRUE;
    }
}
