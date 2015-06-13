var generateClassesForLayer = function(layer){
	var classNames = [];

	if(layer.isText) classNames.push("sketch-text"); // <--- not working?

	var regexResult = /\[(.*)\]/g.exec(layer.name);

	if(regexResult && regexResult.length >= 2){
		var c = regexResult[1].split(",");

		for(var i = 0, len = c.length; i<len; i++) classNames.push(c[i].trim());
	}

	return classNames.join(" ");
};

var generateSizeCSSForLayer = function(layer, id){
	var css = [
		"#"+id+".keep-size { width: [width]px; height: [height]px; }",
		"#"+id+".use-width { width: [width]px; }",
		"#"+id+".use-height { height: [height]px;  }",
	];

	for(var i in css){
		var declaration = css[i];
		css[i] = declaration.replace("[width]", layer.width).replace("[height]", layer.height);
	}

	return css.join("\n");
};

var renderTemplate = function(templateLayers, css){
	var fragment = document.createDocumentFragment();

	var generatedSizeCSSArray = [];

	//	DOM Tree

	var idCount = 0;

	var buildDOMTreeWithLayers = function(layers, parentElement){
		//	We're starting from the end because Sketch returns layers, depth/z-index wise,
		//	from back to front. We need the inverse for the DOM construction

		for(var i = layers.length-1; i>=0; i--){
			var layer = layers[i], subLayers = layer.layers;
			var el = document.createElement("div");
			var elementId = "layerId"+idCount;

			idCount++;

			el.setAttribute("class", generateClassesForLayer(layer));
			el.setAttribute("data-name", layer.name);
			el.setAttribute("data-width", layer.width);
			el.setAttribute("data-height", layer.height);
			el.setAttribute("id", elementId);

			generatedSizeCSSArray.push(generateSizeCSSForLayer(layer, elementId));

			if(layer.isText){
				el.style.width = layer.width+"px";
				el.style.height = layer.height+"px";
			}

			if(!el.classList.contains("ignore-layers") && subLayers.length > 0){
				buildDOMTreeWithLayers(subLayers, el);
			}

			parentElement.appendChild(el);
		}
	};

	buildDOMTreeWithLayers(templateLayers, fragment);

	//	CSS

	var style = document.createElement("style");
	
	style.innerHTML = (generatedSizeCSSArray.join("\n\n")+"\n\n")+css;

	//	Add to DOM

	document.head.appendChild(style);
	document.body.appendChild(fragment);
};

var retrieveFrames = function(el){
	if(!el) el = document.body;

	var frames = [];
	var nodes = el.childNodes;

	//	Reverse again - see above

	for(var i = nodes.length-1; i>=0; i--){
		var node = nodes[i];

		if(node.nodeType != 1) continue;

		var boundingRect = node.getBoundingClientRect();
		var childFrames = retrieveFrames(node);

		frames.push({
			x: boundingRect.left, y: boundingRect.top,
			width: boundingRect.width, height: boundingRect.height,
			childFrames: childFrames
		});
	}

	return frames;
};

document.addEventListener("DOMContentLoaded", function(){
	$.DOMContentLoaded();
}, false);