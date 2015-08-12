var tabs = require("sdk/tabs");
var utils = require("sdk/tabs/utils");
var clipboard = require("sdk/clipboard");
tabs.on("ready", runScript);
var data = require("sdk/self").data, currentTab, pageMod = require("sdk/page-mod");


var {Cc, Ci, Cu} = require("chrome");
Cu.import('resource://gre/modules/Services.jsm');
var {FileUtils} = Cu.import("resource://gre/modules/FileUtils.jsm");
var file = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsILocalFile);
file.initWithPath('C:\\Hotkey Scripts\\temp.txt');


let windows = Services.wm.getEnumerator("navigator:browser"), domWindow = undefined, tabId = 0;
while (windows.hasMoreElements()) {
	domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
}

domWindow.gBrowser.visibleTabs.forEach(function(currTab){
	currTab.setAttribute("tabId", ++tabId);
});

Cu.import("resource://jid1-wznkey5f6vwebq-at-jetpack/dictionary/data/opentabsnexttocurrent.jsm");
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
		// utils.openTab(window, message);
		tabs.open(message);
		if (message == "about:newtab"){
			var window = utils.getOwnerWindow(utils.getTabs()[0]);
			var bar = window.document.getElementById('urlbar')
			bar.select()
		}
	});
}

pageMod.PageMod({
	  include: "*.githubusercontent.com",
	  contentScriptFile: [data.url("codemirror.js"), data.url("javascript.js"), data.url("show-hint.js"), data.url("javascript-hint.js"), data.url("anyword-hint.js"), 
	                      data.url("searchcursor.js"), data.url("match-highlighter.js"), data.url("matchbrackets.js"), data.url("github.js")],
	  contentStyleFile: [data.url("codemirror.css"), data.url("show-hint.css"), data.url("night.css")]
	});

pageMod.PageMod({
	  include: "*.stackoverflow.com",
	  contentScriptFile: [data.url("codemirror.js"), data.url("javascript.js"), data.url("show-hint.js"), data.url("javascript-hint.js"), data.url("anyword-hint.js"), data.url("fullscreen.js"), 
	                      data.url("searchcursor.js"), data.url("match-highlighter.js"), data.url("matchbrackets.js"), data.url("stackoverflow.js")],
	  contentStyleFile: [data.url("codemirror.css"), data.url("show-hint.css"), data.url("fullscreen.css"), data.url("night.css")]
	});