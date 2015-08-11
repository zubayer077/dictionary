(function(){
 	if (!document.querySelectorAll("base")[0] &&
			new RegExp("http\:\/\/stackoverflow\.com\/questions\/([0-9]+)\/.*").test(window.location+"")){
		var d = document.createElement('base');
		d.target = "_blank";
		var head = document.querySelectorAll("head")[0];
		head.appendChild(d);
		d = document.createElement('style');
		d.appendChild(document.createTextNode(".post-text code { font-size: 14px;} pre code{ white-space: pre-wrap; }"));
		head.appendChild(d);
	}
	[].forEach.call(document.querySelectorAll("code"),
			function(c){
				var val = c.textContent || c.innerText;
		  		val = val.slice(val.match(/^\s*/)[0].length, val.length - val.match(/\s*$/)[0].length);
				c = c.parentNode;
				if (val.split(/\r\n|\r|\n/).length>1){					
					CodeMirror(function(elt) {
							var parentDiv = document.createElement("div");
							
							parentDiv.setAttribute('style', "width:"+c.offsetWidth+"px;height:"+c.offsetHeight+"px; overflow-y: auto; position:relative");
							parentDiv.appendChild(elt);
							c.parentNode.replaceChild(parentDiv, c);
						}, {
							value: val,
							theme: "night",
							mode: {name: "javascript", globalVars: true},
							highlightSelectionMatches: {showToken: /\w/},
							matchBrackets: true,
							viewportMargin: Infinity,
							lineNumbers: false,
							lineWrapping: true,
							extraKeys: {
								"Ctrl-Space": "autocomplete",
								"F11": function(cm) {
								  cm.setOption("fullScreen", !cm.getOption("fullScreen"));
								}
							}
						});
				}
			});
})();