Components.utils.import("resource://gre/modules/devtools/Console.jsm");
Components.utils.import("resource://gre/modules/Services.jsm");
 
EXPORTED_SYMBOLS = ["OpenTabsNextToCurrent"];
 
function OpenTabsNextToCurrent() {
    this.busy = false;
	this.currentTab = [];
	this.tabId = 100;
    this.initialize = function(domWindow) {
        if (!domWindow ||
            !domWindow.gBrowser ||
            !domWindow.gBrowser.tabContainer) {
            return;
        }
        this.domWindow = domWindow;
        this.gBrowser = domWindow.gBrowser;
        this.tabContainer = domWindow.gBrowser.tabContainer;
 
        this.domWindow.addEventListener("SSWindowStateBusy", this.onBusy);
        this.domWindow.addEventListener("SSWindowStateReady", this.onReady);
        this.tabContainer.addEventListener("TabOpen", this.onTabOpen);
		this.tabContainer.addEventListener("TabClose", this.onTabClose);
		this.tabContainer.addEventListener("TabSelect", this.onTabSelect);
    };
    this.destroy = function() {
        if (!this.domWindow ||
            !this.domWindow.gBrowser ||
            !this.domWindow.gBrowser.tabContainer) {
            return;
        }
        this.domWindow.removeEventListener("SSWindowStateBusy", this.onBusy);
        this.domWindow.removeEventListener("SSWindowStateReady", this.onReady);
        this.tabContainer.removeEventListener("TabOpen", this.onTabOpen);
		this.tabContainer.removeEventListener("TabClose", this.onTabClose);
		this.tabContainer.removeEventListener("TabSelect", this.onTabSelect);
    };
    this.onBusy = function(anEvent) {
        this.busy = true;
    }.bind(this);
    this.onReady = function(anEvent) {
        this.busy = false;
    }.bind(this);
    this.onTabOpen = function(anEvent) {
        if (!this.busy) {
            var openingTab = anEvent.target;
			this.gBrowser.moveTabTo(openingTab, this.gBrowser.mCurrentTab.nextSibling._tPos);
        }
    }.bind(this);
	
	this.onTabClose = function(anEvent) {
		if (!this.busy){
			this.deleteFromStack(anEvent.target);
			this.gBrowser.selectedTab = this.currentTab.pop();
		}
    }.bind(this);
	
	this.onTabSelect = function(anEvent){
		if (!this.busy){
			var currTab = anEvent.target;
			this.deleteFromStack(currTab);
			if (!currTab.hasAttribute("tabId")){
				currTab.setAttribute("tabId", ++this.tabId);
			}
			
			this.currentTab.push(this.gBrowser.mCurrentTab);
		}
	}.bind(this);
	
	this.deleteFromStack = function(target){
		for (var i= 0; i< this.currentTab.length; ++i){
			var currTab = this.currentTab[i];
			if( currTab.hasAttribute("tabId") && (currTab.getAttribute("tabId") == target.getAttribute("tabId"))){
				this.currentTab.splice(i,1);
			}
		}
	};
}