(function(){
	var elem, paragraphArray = [], 
		body = document.querySelectorAll("body")[0],
		regex = /(<([^>]+)>)/ig,
		thirdClicked = undefined;

body.addEventListener("click", function(event){
	if (event){
		if(event.detail == 2){
			setTimeout( function(){
				var selObj = window.getSelection();
				if ((""+selObj).length>0 && !thirdClicked){
					// var selRange = "http://www.dictionary.reference.com/browse/"+selObj.getRangeAt(0);
					var selRange = "http://www.google.com/search?q="+selObj.getRangeAt(0);
					self.port.emit("new-tab", selRange);
					selObj.removeAllRanges();
				} else
					thirdClicked = undefined;
			}, 500);
		} else if (event.detail == 3){
			thirdClicked = true;
			var selObj = window.getSelection(),
				selTxt = ""+selObj.getRangeAt(0);
			if (selTxt.length>0){
				selTxt = selTxt.replace(regex, "");
				self.postMessage(foldToASCII(selTxt));
			}
			selObj.removeAllRanges();
		}
	}
});

document.oncontextmenu = function(e){
	if(e.ctrlKey)
		return;
    if (e && e.stopPropagation)
        e.stopPropagation();
      return false;
}
body.addEventListener("mouseup", function(event){
	if(event.ctrlKey)
		return;
	if (event.which == 3){
		elem = event.target;
		var interimArr = [];
		while (elem && elem.nodeName!="P"){
			elem = elem.parentNode;
		}
		
		if (!elem){
			var tag = event.target,
				reg = new RegExp("li|tr|dd|span");
			while (tag && !reg.test(tag.nodeName.toLowerCase())){
				tag = tag.parentNode;
			}
			
			if (tag){
				elem = tag; paragraphArray = [];
				var tagName = tag.nodeName;
				while(tag.nextSibling){
					tag = tag.nextSibling;
					if(tag.nodeName == tagName && !new RegExp("span").test(tag.nodeName.toLowerCase())){
						interimArr.push(tag);
					}
				}
			} else return;
		} else paragraphArray = [];
		
		readAloud(elem);
		(function searchParent(searchCh){
			if (searchCh.nextSibling)
				searchChild(searchCh.nextSibling);
			if (searchCh && searchCh.parentElement)
				searchParent(searchCh.parentElement);
		})(elem);
		
		if(interimArr.length>0)
			paragraphArray = interimArr.concat(paragraphArray);
	}
	return;
});
function searchChild(searchCh){
	if (searchCh.nodeName == "P" && (""+searchCh.textContent).length>3)
		paragraphArray.push(searchCh);
	if(searchCh.hasChildNodes())
		searchChild(searchCh.firstChild);
	if(searchCh.nextSibling)
		searchChild(searchCh.nextSibling);
	else return;
}

function readAloud(elem){
	var text = elem.textContent;
   	text = text.replace(regex, "");
   	self.postMessage(foldToASCII(text));
	return;
}

function isInput(focusedEl) {
	if (focusedEl) {
		var focusedElLn = focusedEl.nodeName.toLowerCase();
		if (focusedElLn === "input"
		  ||  focusedElLn === "textarea"
		  ||  focusedElLn === "select"
		  ||  focusedElLn === "button"
		  ||  focusedElLn === "isindex") {
		return true;
		} else if (focusedElLn === "div" && focusedEl.isContentEditable) {
			  return true;
		}
	}
	return false;
};
function stopPropagation(event){
	event.preventDefault();
	event.stopImmediatePropagation();
	event.stopPropagation();
	return true;
}

body.addEventListener("keydown", function(event){
	var key = event.keyCode,
		node = event.target;
	if(key == 39){
		if(event.ctrlKey || event.altKey || isInput(node))
			return;
		stopPropagation(event);
		var paragraph, elementTop, inner = window.innerHeight;
		while(paragraphArray.length>0 && 
			(!elementTop || (elementTop.top<Math.floor(inner/3) && !(elementTop.bottom>Math.floor(inner/3))))){
			try{
				paragraph = paragraphArray.shift();
				elementTop = paragraph.getBoundingClientRect();
			} catch (err){}
		}
		
		if (paragraph){
			readAloud(paragraph);
			var windowHeight = inner/2;
			if (elementTop.top > windowHeight && elementTop.bottom > inner){
				window.scrollBy(0, Math.floor(elementTop.top - windowHeight));
			}
		} else {
			window.scrollBy(0, Math.floor((2*inner)/3));
		}
		return false;
	}
	
	if(key == 46||key == 88){
		if(event.ctrlKey || isInput(node))
			return;
		stopPropagation(event);
		self.port.emit("close-tab", "newMessage");
		return false;
	}
	if (key == 90){
		if (history.length>1 && !isInput(node)){
			stopPropagation(event);
			history.go(-1);
			return false;
		}
	}
	if (key == 45){
		self.port.emit("new-tab", "about:newtab");
		return;
	}
	
	if (key == 192){
		if(event.ctrlKey){
			var selObj = undefined;
			if (isInput(event.target)){
				var selectedTextArea = document.activeElement;
				selObj = selectedTextArea.value.substring(selectedTextArea.selectionStart, selectedTextArea.selectionEnd);
			} else
				selObj = window.getSelection();
				
			if ((""+selObj).length>0){
				var selTxt = Object.prototype.toString.call(selObj) == '[object String]'? selObj:(""+selObj.getRangeAt(0));
				self.postMessage(foldToASCII(selTxt.replace(regex, "")));
			}
			selObj.removeAllRanges();
		}
		return;
	}
});

	[].forEach.call(
		document.querySelectorAll("p"),
		function(el){
			paragraphArray.push(el);
		}
	);
	
if (new RegExp("/*.reference.com|dictionary.com/").test((""+window.location))){
	[].forEach.call(
		document.querySelectorAll(".nmre, span.qc"), 
		function(el){
			if ((el.hasAttribute && (""+el.getAttribute("id")).indexOf("more")==0) || (el.parentNode && el.parentNode.nodeName == "DIV"))
				el.style?el.style.display = "none":"";
		});
	[].forEach.call(
		document.querySelectorAll(".txt"),
		function(elem){
			if (elem.hasAttribute && (""+elem.getAttribute("id")).indexOf("dots")==0)
				elem.parentNode.removeChild(elem);
			else{
				textElem = elem;
				while (elem.nextSibling){
					elem = elem.nextSibling;
					if (elem.hasAttribute && elem.getAttribute("class") == "gtxt"){
						textElem.innerHTML = ""+textElem.innerHTML + elem.innerHTML;
						break;
					}
				}
			}
		});
	
	setTimeout(function(){document.querySelectorAll("input#q")[0].blur();},500);
	if (document.querySelectorAll("#exsntBlock>a.more")[0])
		document.querySelectorAll("#exsntBlock>a.more")[0].click();
	if (document.querySelectorAll("#exsntBlock>a.less")[0])
		document.querySelectorAll("#exsntBlock>a.less")[0].style.display="none";
}

})();