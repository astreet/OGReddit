chrome.extension.onRequest.addListener(function(request, sender, resp) {
	if (request.fun === 'show_subreddit_settings') {
	    chrome.windows.create({
	      'url': chrome.extension.getURL('subreddit_settings.html'),
	      'type': 'popup',
	      'width': 300,
	      'height': 400
	    });
	}
});