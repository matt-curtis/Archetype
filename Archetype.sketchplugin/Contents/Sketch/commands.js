@import 'main.js'

//	--------------
//	INITIALIZATION
//	--------------

var global = this;

var createCommand = function(commandName, func){
	var dynFunc = function(ctx){
		setup(ctx); func(ctx);
	};

	global["command_"+commandName] = dynFunc;

	return dynFunc;
};


//	--------
//	COMMANDS
//	--------

createCommand("demo", function(ctx){
	var template = buildDOMTemplateFromCurrentArtboard();

	var artboardFrame = getSelectedArtboard().frame();
	var size = NSMakeSize(artboardFrame.width(), artboardFrame.height());

	[[MCArchetypePlugin plugin] demo:template artboardSize:size showWebDebugWindow:false callback:function(frames){
		adjustCurrentArtboardUsingFrames(frames);
	}];
});