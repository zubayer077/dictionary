var tabs = require("sdk/tabs"),
	clipboard = require("sdk/clipboard"),
	data = require("sdk/self").data, 
	currentTab, 
	pageMod = require("sdk/page-mod"),
	{ setTimeout } = require("sdk/timers");
tabs.on("ready", runScript);

var {Cc, Ci, Cu} = require("chrome");
	Cu.import('resource://gre/modules/Services.jsm');

var file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile),
	process = Cc["@mozilla.org/process/util;1"].createInstance(Ci.nsIProcess);
	
file.initWithPath("c:\\Hotkey Scripts\\sender.exe");
process.init(file);


let windows = Services.wm.getEnumerator("navigator:browser"), domWindow = undefined, tabId = 0;
while (windows.hasMoreElements()) {
	domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
}

domWindow.gBrowser.visibleTabs.forEach(function(currTab){
	currTab.setAttribute("tabId", ++tabId);
});

Cu.import(data.url("opentabsnexttocurrent.jsm"));
new OpenTabsNextToCurrent().initialize(domWindow);


function writeToFile(message){
	// process.run(false, [message], 1);
	process.runAsync([message], 1);
}


function runScript(tab) {
	currentTab = tab;
	var worker = tab.attach({
		contentScriptFile: [data.url("fold-to-ascii.min.js"), data.url("dictionary.js")],
		onMessage:function(message){
			//clipboard.set(message);
			writeToFile(message);
		}
	});
	worker.port.on("close-tab", function() {
		if (currentTab.id == tabs.activeTab.id)
	  		currentTab.close();
		else
			tabs.activeTab.close();
	});
	
	worker.port.on("new-tab", function(message) {
		tabs.open(message);
		if (message.indexOf("about:newtab")>-1)
			setTimeout(function(){
				var bar = domWindow.document.getElementById('urlbar');
				bar.select();
			}, 10);
	});
}

var contentScripts = [data.url("codemirror.js"), data.url("javascript.js"), data.url("show-hint.js"), data.url("javascript-hint.js"), data.url("anyword-hint.js"), data.url("searchcursor.js"), data.url("match-highlighter.js"), data.url("matchbrackets.js")],
	cssScripts = [data.url("codemirror.css"), data.url("show-hint.css"), data.url("night.css")];
pageMod.PageMod({
	  include: "*.githubusercontent.com",
	  contentScriptFile: contentScripts.concat([data.url("github.js")]),
	  contentStyleFile: cssScripts
	});

pageMod.PageMod({
	  include: "*.stackoverflow.com",
	  contentScriptFile: contentScripts.concat([data.url("fullscreen.js"), data.url("stackoverflow.js")]),
	  contentStyleFile: cssScripts.concat([data.url("fullscreen.css")])
	});