/*
	alert, confirm, prompt
*/

var alert = function(text, title){
	var alert = [NSAlert new];
	
	alert.messageText = title || "Archetype Alert";
	alert.informativeText = text;
		
	alert.runModal();
};

/*
	Sketch
*/

var getSelectedArtboard = function(){
	var artboards = $.artboards, numberOfBoards = artboards.count();

	if(numberOfBoards == 0) return;
	if(numberOfBoards == 1) return artboards.firstObject();

	var selection = $.selection, firstLayer = selection.firstObject();

	if(!firstLayer) return null;
	if(firstLayer.class()+"" == "MSArtboardGroup") return firstLayer;

	var artboard, layer = firstLayer;

	while(layer){
		if(layer.class()+"" == "MSArtboardGroup"){
			return layer;
		}

		layer = layer.parentGroup();
	}
};

var refresh = function(){
	$.doc.currentView().refresh();
};

/*
	Extensions
*/

String.prototype.toNSString = function(){
	return NSString.alloc().initWithString(this+"");
};