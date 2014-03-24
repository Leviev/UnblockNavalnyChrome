var mirror_url = makeFallbackUrl();

function makeFallbackUrl() {
	var text = "";
	var possible = "abcdefghijklmnopqrstuvwxyz0123456789";

	for( var i=0; i < 5; i++ )
		text += possible.charAt(Math.floor(Math.random() * possible.length));

	return text+'.fuckrkn.me';
}
function setMirror(callback) {
	var req = new XMLHttpRequest();
	req.open('GET','http://api.navalny.us',false);
	req.send(null);
	req.onload = function() {
		callback(this.getResponseHeader('Mirror-Url'));
	}; 
}
function getMirror(callback) {
	chrome.cookies.get({url:'http://api.navalny.us',name:'mirror'}, function(cook) {
		if ( ! cook)
			return setMirror(callback);
		else
			return callback(cook.value);
	});
}
getMirror(function(mirror){
	mirror_url = mirror; 
	return mirror;
});
chrome.webRequest.onBeforeRequest.addListener(
	function(info) {
		if(info.url.indexOf('api.navalny.us') != -1)
			return {cancel:false};
		
		getMirror(function(mirror){
			mirror_url = mirror;
			return mirror;
		});
		
		return {redirectUrl:info.url.replace(/navalny.livejournal.com/i, mirror_url)};
	},
	// filters
	{
		urls: [
			"*://navalny.livejournal.com/*",
			"*://api.navalny.us/*"
		]
	},
	// extraInfoSpec
	["blocking"]
);
function focusOrCreateTab(url) {
	chrome.windows.getAll({"populate":true}, function(windows) {
		var existing_tab = null;
		for (var i in windows) {
			var tabs = windows[i].tabs;
			for (var j in tabs) {
				var tab = tabs[j];
				if (tab.url == url) {
					existing_tab = tab;
					break;
				}
			}
		}

		if (existing_tab) {
			chrome.tabs.update(existing_tab.id, {"selected":true});
		} else {
			chrome.tabs.create({"url":url, "selected":true});
		}
	});
}

chrome.browserAction.onClicked.addListener(function(tab) {
	var popup_url = chrome.extension.getURL("popup.html");
	focusOrCreateTab(popup_url);
});
