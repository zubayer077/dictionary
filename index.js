var tabs = require("sdk/tabs"),
	clipboard = require("sdk/clipboard"),
	data = require("sdk/self").data, 
	currentTab, 
	pageMod = require("sdk/page-mod"),
	{ setTimeout } = require("sdk/timers");
tabs.on("ready", runScript);

var {Cc, Ci, Cu} = require("chrome");
	Cu.import('resource://gre/modules/Services.jsm');
var {FileUtils} = Cu.import("resource://gre/modules/FileUtils.jsm"),
	file = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsILocalFile);
	file.initWithPath('C:\\Hotkey Scripts\\temp.txt');


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
	if(!file.exists()){
		file.create(file.NORMAL_FILE_TYPE, 0666);
	}

	var charset = 'UTF-8';
	var fileStream = Cc['@mozilla.org/network/file-output-stream;1'].createInstance(Ci.nsIFileOutputStream);
	fileStream.init(file, FileUtils.MODE_WRONLY | FileUtils.MODE_CREATE | FileUtils.MODE_APPEND, 0x200, false);

	var converterStream = Cc['@mozilla.org/intl/converter-output-stream;1'].createInstance(Ci.nsIConverterOutputStream);

	converterStream.init(fileStream, charset, message.length, Ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);
	converterStream.writeString(message);
	converterStream.close();
	fileStream.close();
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