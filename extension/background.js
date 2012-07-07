chrome.extension.onRequest.addListener(function(request, sender, respond) {
	switch (request.fun) {
		case 'show_subreddit_settings':
		    chrome.windows.create({
		      'url': chrome.extension.getURL('subreddit_settings.html'),
		      'type': 'popup',
		      'width': 300,
		      'height': 400
		    });
		    break;
		case 'settings_set':
			localStorage[request.key] = request.value;
			break;
		case 'settings_multiget':
			response = {};
			$.each(request.keys, function(_, key) {
				response[key] = localStorage[key];
			})
			respond({'values': response});
			break;
		case 'settings_get_all':
			all = {};
			$.each(Object.keys(localStorage), function(_, key) {
				all[key] = localStorage[key];
			})
			respond({settings: all});
			break;
		default:
			console.log('Received unknown message function: ' + request.fun);
	}
});