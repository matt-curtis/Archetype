@import 'main.js'

//	--------------
//	INITIALIZATION
//	--------------

var global = this;

var createCommand = function(commandName, functionToCall){
	var dynFunc = function(ctx){
		$.context = ctx;

		functionToCall(ctx);
	};

	global["command_"+commandName] = dynFunc;

	return dynFunc;
};


//	--------
//	COMMANDS
//	--------

createCommand("demo", function(ctx){
	var template = buildDOMTemplateFromCurrentArtboard();

	var artboardFrame = $.artboard.frame();
	var size = NSMakeSize(artboardFrame.width(), artboardFrame.height());

	[[MCArchetypePlugin plugin] demo:template artboardSize:size showWebDebugWindow:false callback:function(frames){
		adjustCurrentArtboardUsingFrames(frames);
	}];
});