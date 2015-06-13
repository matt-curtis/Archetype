@import 'shared.js'

//	------------
//	INITIALIZERS
//	------------

coscript.shouldKeepAround = true;

(function loadFrameworkAndBundle(){
	var scriptPath = coscript.env().scriptURL.path();
	var resourcesPath = scriptPath.stringByDeletingLastPathComponent().stringByDeletingLastPathComponent()+"/Resources";

	var mocha = Mocha.sharedRuntime();

	if(NSClassFromString("MCArchetypeLoader") == null){
		//	Load our loader framework

		[mocha loadFrameworkWithName:"ArchetypeLoader" inDirectory:resourcesPath];
	}

	//	Load our bundle

	var bundlePath = resourcesPath+"/Archetype.bundle";

	[MCArchetypeLoader load:bundlePath];
})();

var make$ = function(ctx){
	var doc = ctx.document;

	$ = function(layer){
		var className = layer.class()+"";
		var layerFrame = layer.frame();

		var isGroup = (className == "MSLayerGroup");
		var isArtboard = (className == "MSArtboardGroup");
		var isText = (className == "MSTextLayer");

		var canHaveLayers = (layer.layers != null);

		var setFrame = function(){
			var args = arguments;

			if(args.length == 1 && typeof args[0] == "object"){
				var frame = args[0];

				for(var prop in frame){
					layerFrame[prop] = frame[prop];
				}
			} else if(args.length > 0){
				var order = ["x", "y", "width", "height"];

				for(var i in args){
					var prop = order[i];
					layerFrame[prop] = Number(args[i]);
				}
			}
		};

		var obj = {
			className: className,
			layer: layer,
			frame: layerFrame,
			setFrame: setFrame,

			isGroup: isGroup,
			isArtboard: isArtboard,
			isText: isText,

			canHaveLayers: canHaveLayers
		};

		return obj;
	};

	$.pluginName = "Archetype";

	$.scriptPath = ctx.scriptPath;
	$.scriptFolderPath = $.scriptPath.toNSString().stringByDeletingLastPathComponent()+"";
	$.resourcesPath = $.scriptFolderPath.toNSString().stringByDeletingLastPathComponent()+"/Resources";
	
	$.doc = doc;
	$.page = doc.currentPage();
	$.artboards = $.page.artboards();
	$.selection = ctx.selection;
	$.command = ctx.command;

	$.artboard = getSelectedArtboard();

	return $;
};

var setup = function(ctx){
	make$(ctx);
};


//	--------------------
//	PLUGIN FUNCTIONALITY
//	--------------------

var buildTemplateFromLayers = function(layers){
	var template = [];

	for(var i = 0, len = layers.count(); i<len; i++){
		var layer = layers.objectAtIndex(i), $layer = $(layer);
		
		var frame = layer.frame();
		var subLayers = $layer.isGroup ?
			buildTemplateFromLayers(layer.layers()) : [];

		template.push({
			isVisible: layer.isVisible(),
			isText: $layer.isText,
			name: layer.name(),
			layers: subLayers,

			width: frame.width(),
			height: frame.height()
		});
	}

	return template;
};

var buildDOMTemplateFromArtboard = function(artboard){
	return buildTemplateFromLayers(artboard.layers());
};

var buildDOMTemplateFromCurrentArtboard = function(){
	var artboard = getSelectedArtboard();

	if(artboard) return buildDOMTemplateFromArtboard(artboard);

	return false;
};


var adjustCurrentArtboardUsingFrames = function(frames){
	var adjustFrames = function(layers, frames, relativeFrame){
		for(var i = 0, len = frames.length; i<len; i++){
			var layer = layers.objectAtIndex(i), $layer = $(layer);
			var frame = frames[i];

			$layer.setFrame(
				frame.x-relativeFrame.x,
				frame.y-relativeFrame.y,
				frame.width,
				frame.height
			);

			if($layer.isGroup){
				adjustFrames(layer.layers(), frame.childFrames, frame);
			}
		}
	};

	adjustFrames($.artboard.layers(), frames, { x: 0, y: 0 });

	refresh();
};