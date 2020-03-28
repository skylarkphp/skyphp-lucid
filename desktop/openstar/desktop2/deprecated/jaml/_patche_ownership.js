define([
	"dojo/_base/lang",
	"dojo/_base/html",
	 "dojo/_base/window", 
	"dojo/aspect",
	"dojo/parser",
	"dojo/html",
	"dojo/_base/array",
	"dijit/_WidgetBase",
	"openstar/desktop2/deprecated/jam/_ComponentMixin"
], function(lang,dhtml,dwindow,aspect,parser,html,array,_WidgetBase,_ComponentMixin){

	return;
	
	lang.extend(_WidgetBase, _ComponentMixin.prototype);
	
	aspect.before(_WidgetBase.prototype, "postscript", function(/*Object?*/ params, /*DomNode|String*/ srcNodeRef){
		if (this.isOwner && this.isOwner()) {
			this._components = {};
		}
	});
		// Monkey patch dijit._WidgetBase.startup to get data binds set up
	aspect.before(_WidgetBase.prototype, "startup", function(){

		var name = this.getName(),owner = this.getOwner();
		if (name && owner) {
			owner.addComponent(name,this);
		}
	});

	// Monkey patch dijit._WidgetBase.destroy to remove watches setup in _DataBindingMixin
	aspect.before(_WidgetBase.prototype, "destroy", function(){
		var name = this.getName(),owner = this.getOwner();
		if (name && owner) {
			owner.removeComponent(name);
		}
		if (this.isOwner && this.isOwner()) {
			this._components = null;
		}
	});

	aspect.around(_WidgetBase.prototype, "getOwner", function(oldComponentGetOwner){
		return function(){
			var parent = this.getParent();
			while (parent) {
				if (parent.isOwner && parent.isOwner()) {
					return parent;
				}
				parent = parent.getParent();	
			}
		};
	});
	
	
	aspect.around(_WidgetBase.prototype, "getName", function(oldComponentGetName){
		return function(){
			return this.name;
		};
	});
	
	html._ContentSetter.prototype._parse = function() {
		// summary:
		//		runs the dojo parser over the node contents, storing any results in this.parseResults
		//		and the parse promise in this.parseDeferred
		//		Any errors resulting from parsing are passed to _onError for handling

		var rootNode = this.node;
		var propsThis = this.propsThis;
		try{
			// store the results (widgets, whatever) for potential retrieval
			var inherited = {};
			array.forEach(["dir", "lang", "textDir"], function(name){
				if(this[name]){
					inherited[name] = this[name];
				}
			}, this);
			var self = this;
			this.parseDeferred = parser.parse({
				rootNode: rootNode,
				noStart: !this.startup,
				inherited: inherited,
				propsThis : propsThis,
				scope: this.parserScope
			}).then(function(results){
				return self.parseResults = results;
			});
		}catch(e){
			this._onError('Content', e, "Error parsing in _ContentSetter#"+this.id);
		}
	};
	
	parser.parse = function(rootNode, options){
		// summary:
		//		Scan the DOM for class instances, and instantiate them.
		// description:
		//		Search specified node (or root node) recursively for class instances,
		//		and instantiate them. Searches for either data-dojo-type="Class" or
		//		dojoType="Class" where "Class" is a a fully qualified class name,
		//		like `dijit/form/Button`
		//
		//		Using `data-dojo-type`:
		//		Attributes using can be mixed into the parameters used to instantiate the
		//		Class by using a `data-dojo-props` attribute on the node being converted.
		//		`data-dojo-props` should be a string attribute to be converted from JSON.
		//
		//		Using `dojoType`:
		//		Attributes are read from the original domNode and converted to appropriate
		//		types by looking up the Class prototype values. This is the default behavior
		//		from Dojo 1.0 to Dojo 1.5. `dojoType` support is deprecated, and will
		//		go away in Dojo 2.0.
		// rootNode: DomNode?
		//		A default starting root node from which to start the parsing. Can be
		//		omitted, defaulting to the entire document. If omitted, the `options`
		//		object can be passed in this place. If the `options` object has a
		//		`rootNode` member, that is used.
		// options: Object?
		//		A hash of options.
		//
		//		- noStart: Boolean?:
		//			when set will prevent the parser from calling .startup()
		//			when locating the nodes.
		//		- rootNode: DomNode?:
		//			identical to the function's `rootNode` argument, though
		//			allowed to be passed in via this `options object.
		//		- template: Boolean:
		//			If true, ignores ContentPane's stopParser flag and parses contents inside of
		//			a ContentPane inside of a template.   This allows dojoAttachPoint on widgets/nodes
		//			nested inside the ContentPane to work.
		//		- inherited: Object:
		//			Hash possibly containing dir and lang settings to be applied to
		//			parsed widgets, unless there's another setting on a sub-node that overrides
		//		- scope: String:
		//			Root for attribute names to search for.   If scopeName is dojo,
		//			will search for data-dojo-type (or dojoType).   For backwards compatibility
		//			reasons defaults to dojo._scopeName (which is "dojo" except when
		//			multi-version support is used, when it will be something like dojo16, dojo20, etc.)
		//		- propsThis: Object:
		//			If specified, "this" referenced from data-dojo-props will refer to propsThis.
		//			Intended for use from the widgets-in-template feature of `dijit._WidgetsInTemplateMixin`
		// returns: Mixed
		//		Returns a blended object that is an array of the instantiated objects, but also can include
		//		a promise that is resolved with the instantiated objects.  This is done for backwards
		//		compatibility.  If the parser auto-requires modules, it will always behave in a promise
		//		fashion and `parser.parse().then(function(instances){...})` should be used.
		// example:
		//		Parse all widgets on a page:
		//	|		parser.parse();
		// example:
		//		Parse all classes within the node with id="foo"
		//	|		parser.parse(dojo.byId('foo'));
		// example:
		//		Parse all classes in a page, but do not call .startup() on any
		//		child
		//	|		parser.parse({ noStart: true })
		// example:
		//		Parse all classes in a node, but do not call .startup()
		//	|		parser.parse(someNode, { noStart:true });
		//	|		// or
		//	|		parser.parse({ noStart:true, rootNode: someNode });

		// determine the root node and options based on the passed arguments.
		var root;
		if(!options && rootNode && rootNode.rootNode){
			options = rootNode;
			root = options.rootNode;
		}else if(rootNode && lang.isObject(rootNode) && !("nodeType" in rootNode)){
			options = rootNode;
		}else{
			root = rootNode;
		}
		root = root ? dhtml.byId(root) : dwindow.body();

		options = options || {};

		var mixin = options.template ? { template: true } : {},
			instances = [],
			self = this;

		// First scan for any <script type=dojo/require> nodes, and execute.
		// Then scan for all nodes with data-dojo-type, and load any unloaded modules.
		// Then build the object instances.  Add instances to already existing (but empty) instances[] array,
		// which may already have been returned to caller.  Also, use otherwise to collect and throw any errors
		// that occur during the parse().
		var p =
			this._scanAmd(root, options).then(function(){
				return self.scan(root, options);
			}).then(function(parsedNodes){
				return instances = instances.concat(self._instantiate(parsedNodes, mixin, options));
			}).otherwise(function(e){
				// TODO Modify to follow better pattern for promise error managment when available
				console.error("dojo/parser::parse() error", e);
				console.error(e.stack || e);
				throw e;
			});
		// Blend the array with the promise
		lang.mixin(instances, p);
		return instances;
	};

});
