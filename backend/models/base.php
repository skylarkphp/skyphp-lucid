<?php
/*
	Copyright (c) 2004-2008, The Dojo Foundation & Lucid Contributors
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above.
*/


	// the Item class seems pointless, but it's really so that we don't have to
	// have 5,000 database connections at once unless we need them
	class Item {
		var $_parentModel = null;
		var $_parentInstance = false;
		function __call($method, $arguments)
		{
			//map this to the parent model
			$p = $this->_make_parent();
			$r = call_user_func_array(array($p, $method), $arguments);
			foreach($p as $key => $value) {
				$this->$key = $value;
			}
			return $r;
		}
		function _make_parent()
		{
			if(!$this->_parentInstance)
			{
				$parent = $this->_parentModel;
				$this->_parentInstance = new $parent;
			}
			foreach($this as $prop => $val)
			{
				$this->_parentInstance->$prop = $val;
			}
			return $this->_parentInstance;
		}
		function save()
		{
			$p = $this->_make_parent();
			$p->save();
			if(!is_numeric($this->id)) {
				$this->id = $p->_link->lastInsertID($p->_get_tablename());
			}
		}
	}
	
	class Base
	{
		var $id = array(
			'type' => "integer",
			'notnull' => 1,
			'unsigned' => 1
			);
		var $_parentItem = null;
		var $_result = false;
		var $_link;
		var $_modified = false;
		var $_schema = false;
		function __construct($values=array(), $preserveSchema=false) {
			if(!$preserveSchema) {
				foreach($this as $key => $value) {
					if($key{0} != "_"){
						$p = $this->$key;
						$this->$key = (isset($p['default']) ? $p['default'] : 
							($p['type'] == "array" ? array() : null)
							);
					}
				}
				foreach($values as $key => $value) {
					$this->$key = $value;
				}
			} else $this->_schema = true;
		}
		function _connect() {
			if(!$this->_link) {
				$this->_link = MDB2::factory($GLOBALS['db']['database']);
				if(PEAR::isError($this->_link)){
					internal_error("db_connect_err");
				}
			}
		}
		function _getNewId() {
			$id = $this->_link->nextID($this->_get_tablename());
			if (PEAR::isError($id)) {
				internal_error("db_query_err", $id->getMessage());
			}
			return $id;
		}
		function _query($sql, $values=array()) {
			$this->_connect();
			$this->_result = array();
			if(sizeof($values) > 0) {
				$statement = $this->_link->prepare($sql, TRUE, MDB2_PREPARE_RESULT);
				$resultset = $statement->execute($values);
				$statement->free();
			}
			else {
				$resultset= $this->_link->query($sql);
			}
			if(PEAR::isError($resultset)) {
				internal_error("db_query_err");
			}
			
			while($row = $resultset->fetchRow(MDB2_FETCHMODE_ASSOC)) {
				$this->_result[] = $row;
			}
			return $this->_result;
		}
		
		function __destruct()
		{
			if(is_object($this->_result)) $this->_result->free();
			$this->_link = null;
		}
		
		function __set($var, $value) {
			$this->_modified = true;
			return $this->$var = $value;
		}
		
		function __get($var) {
			if($this->_modified == true) //needed to prevent infinite recursion
			{
				$me = get_class($this);
				$parent = new $me(array(), true);
				$type = $parent->$var['type'];
				if($type == "foreignkey") {
					$p = $this->_make_parent();
					$return = $p->get($this->$var);
				}
				elseif($type == "array") {
					import("lib.Json.Json");
					if(!is_array($this->$var)) $val = Zend_Json::decode($this->$var);
					if(is_array($val)) $return = $val;
				}
				else {
					$return = $this->$var;
				}
				if(is_null($return)) {
					$return = $parent->$var['default'] or ($type == "array" ? array() : null);
				}
				return $return;
			}
			else {
				return $this->$var;
			}
		}
		
		function save()
		{
			$this->_connect();
			$table = $this->_link->quoteIdentifier($this->_get_tablename());
			$arr = array();
			if(!is_numeric($this->id)) {
				$arr['id'] = $this->_getNewId();
			}
			$me = get_class($this);
			$parent = new $me(array(), true);
			foreach($this as $key => $value)
			{
				if($key{0} != "_" && $key != "id")
				{
					$info = $parent->$key;
					if(isset($info['type'])) {
						if($info['type'] == "array") {
							if(is_null($value)) $value = array();
							import("lib.Json.Json");
							$value = Zend_Json::encode($value);
						}
						
						if($info['type'] == "foreignkey") {
							$value = ($value->id ? $value->id : null);
						}
					}
					
					$arr[$key] = $value;
				}
			}
			$this->_link->loadModule('Extended');
			$this->_link->autoExecute($this->_link->quoteIdentifier($this->_get_tablename()), $arr,
				(is_numeric($this->id) ? MDB2_AUTOQUERY_UPDATE : MDB2_AUTOQUERY_INSERT),
				(is_numeric($this->id) ? "id = ".$this->id : null));
			if(!is_numeric($this->id)) $this->id = $arr['id'];
		}
		
		function get($id)
		{
			$this->_connect();
			$tablename = $this->_link->quoteIdentifier($this->_get_tablename());
			if(!is_numeric($id))
			{
				$id = "'" . $this->_escape($id) . "'"; 
			}
			$this->_query("SELECT * FROM ${tablename} WHERE id=${id}");
			if(array_key_exists(0, $this->_result))
			{
				$p = $this->_makeModel($this->_result[0]);
				return $p;
			}
			else
			{
				return false;
			}
		}
		function _escape($str)
		{
			$this->_connect();
			return $this->_link->escape($str);
		}
		function _getFilter($name) {
			foreach(array(
				"__not" => "!=",
				"__gte" => ">=",
				"__lte" => "<=",
				) as $search=>$act) {
				$p=explode($search, $name);
			if($p[0] != $name) {
				return array($p[0], $act);
			}
		}
		return array($name, "=");
	}
	function filter($field, $value=false)
	{
		$this->_connect();
		$tablename = $this->_link->quoteIdentifier($this->_get_tablename());
		if(is_array($field))
		{
			$query = "SELECT * FROM ${tablename} WHERE ";
			$list = array();
			foreach($field as $key => $value)
			{
				$act = $this->_getFilter($key);
				if(is_array($value)) {
					foreach($value as $val) {
						array_push($list, $this->_escape($act[0]) . $act[1] . $this->_link->quote($val) . "");
					}
				}
				else
					array_push($list, $this->_escape($act[0]) . $act[1] . $this->_link->quote($value) . "");
			}
			$query .= implode(" AND ", $list);
		}
		else {
			$act = $this->_getFilter($field);
			$field = $this->_link->quoteIdentifier($act[0]);
			if(is_array($value)) {
				$arr = array();
				foreach($value as $val) {
					array_push($arr, $field . $act[1] . $val);
				}
				$query = "SELECT * FROM ${tablename} WHERE";
				$query .= implode(" AND ". $arr);
			}
			else {
				$value = $this->_link->quote($value);
				$query = "SELECT * FROM ${tablename} WHERE " . $field . $act[1] . $value;
			}
		}
		$this->_query($query); 
		$list = array();
		$results = false;
		foreach($this->_result as $line)
		{
			array_push($list, $this->_makeModel($line));
			$results = true;
		}
		return $results ? $list : false;
	}
	function all()
	{
		$this->_connect();
		$tablename = $this->_link->quoteIdentifier($this->_get_tablename());
		$this->_query("SELECT * FROM ${tablename}");
		$list = Array();
		foreach($this->_result as $line)
		{
			array_push($list, $this->_makeModel($line));
		}
		return $list;
	}		
	function _get_tablename()
	{
		$tablename=strtolower(get_class($this));
		$db_prefix = $GLOBALS['db']['prefix'];
		return $db_prefix . $tablename;
	}
	function _makeModel($line)
	{
		$p = new Item;
		$me = get_class($this);
		$parent = new $me(array(), true);
		foreach ($line as $key => $value)
			{ $dec = $parent->$key;
				if($dec["type"] == "array") {
					import("lib.Json.Json");
					if(is_null($value)) $value = array();
					else $value = Zend_Json::decode($value);
				}
				$p->$key = $value;
			}
			$p->_parentModel = $me;
			return $p;
		}
		function truncate() {
			$this->_connect();
			$table = $this->_link->quoteIdentifier($this->_get_tablename());
			$this->_query("DELETE FROM ".$table);
			$this->_link->loadModule('Manager');
			$this->_link->dropSequence($this->_get_tablename());
			$this->_link->createSequence($this->_get_tablename());
		}
		function make_json($columns=false)
		{
			$list = array();
			$filter = is_array($columns);
			foreach($this as $key => $value)
			{
				if($key{0} != "_")
				{
					$continue = true;
					if($filter)
					{
						if(array_search($key, $columns)===false) $continue = false;
					}
					if($continue)
					{
						$list[$key] = $value;
					}
				}
			}
			import("lib.Json.Json");
			return Zend_Json::encode($list);
		}
		function delete()
		{
			if(is_numeric($this->id))
			{
				$this->_connect();
				$this->cleanup();
				$this->_query("DELETE FROM " . $this->_link->quoteIdentifier($this->_get_tablename()) . " WHERE id=" . $this->id);
			}
		}
		function cleanup() {
			//this is for cleaning up any associations with other models
			//don't call this directly in your code.
		}
		function _create_table()
		{
			$this->_connect();
			$this->_link->mgDropTable($this->_link->quoteIdentifier($this->_get_tablename()));
			$list = array();
			$constraints = array();
			foreach($this as $key => $v)
			{
				if($key{0} != "_" && is_array($v)) {
					if($v['type'] == "foreignkey") {
						$v['type'] = "integer";
					}
					if($v['type'] == "array") {
						$v['type'] = "text";
					}
					$list[$key] = $v;
					if(isset($v['unique']) && $v['unique']){
						$constraints[] = $key;
						unset($v['unique']);
					}
				}
			}
			$p = $this->_link->mgCreateTable($this->_link->quoteIdentifier($this->_get_tablename()), $list);
			if (PEAR::isError($p)) {
				if($p->getMessage() == "MDB2 Error: connect failed")
					internal_error("db_connect_err", 'Creation of table failed: "'.$p->getMessage().'"'.' '
						. $p->getDebugInfo());
				else
					internal_error("db_query_err", 'Creation of table failed: "'.$p->getMessage().'"'.' '
						. $p->getDebugInfo());
			}
			$this->_link->mgCreateIndex($this->_link->quoteIdentifier($this->_get_tablename()), "id_key", array(
				'fields' => array(
					'id' => array()
					)
				));
			$this->_link->createSequence($this->_get_tablename());
			foreach($constraints as $row){
				$definition = array(
					'unique' => true,
					'fields' => array(
						$row => array()
						)
					);
				$this->_link->createConstraint($this->_link->quoteIdentifier($this->_get_tablename()), 'unique_'.$row, $definition);
			}
		}
	}
