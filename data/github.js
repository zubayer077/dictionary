(function(){
	var c = document.getElementsByTagName("body")[0], val = c.textContent || c.innerText;
		val = val.slice(val.match(/^\s*/)[0].length, val.length - val.match(/\s*$/)[0].length);
	
	var cm = CodeMirror(function(elt) {
		c.style.border = 0;
		c.style.margin = 0;
		c.style.padding = 0;
		
		var d = document.createElement('div'),
			cLine = c.innerHTML.split(/\r\n|\r|\n/).length;
		d.style.height = (cLine*1.5)+"em"; 
		d.appendChild(elt);
		c.innerHTML = "";
		c.appendChild(d);
	}, {
	  value: val,
        lineNumbers: true,
		theme: "night",
        extraKeys: {"Ctrl-Space": "autocomplete"},
        mode: {name: "javascript", globalVars: true},
		highlightSelectionMatches: {showToken: /\w/},
		matchBrackets: true,
		viewportMargin: Infinity
	});
})();