$(function() {
  var connected = false;
  var accessToken = null;

  function connect() {
    connected = true;
    $('#ogreddit')
      .children('.disconnected')
      .switchClass('disconnected', 'connected');
  }

  function disconnect() {
    accessToken = null;
    connected = false;
    $('#ogreddit')
      .children('.connected')
      .switchClass('connected', 'disconnected');
  }

  function setStatusOnResponse(response) {
    switch (response.status) {
      case 'connected':
        accessToken = response.authResponse.accessToken;
        connect();
        break;
      default:
        disconnect();
    }
  }

  function shouldPublish() {
    return localStorage['settings.publish'] != 'false';
  }

  function setupSettings(settings) {
    // Publish
    publish = settings.find('input#publish');
    publish.attr('checked', shouldPublish());

    publish.change(function (event) {
      localStorage['settings.publish'] = (publish.attr('checked') != undefined);
    });
  }

  var MAX_RETRIES = 5;
  function postActionWithRetry(action, obj, retry_count) {
    if (retry_count === MAX_RETRIES) {
      return;
    }

    var url = obj.getObjectURL();
    var post_data = {access_token: accessToken};
    post_data[obj.getObjectType()] = url;
    console.log('Try ' + (retry_count + 1) + ': ' + url);
    $.post(
      'https://graph.facebook.com/me/fbreddit:' + action, post_data
    ).error(function(xhr, text) {
      if (text == 'parsererror') {
        return;
      }

      console.error('Fail: ' + text);
      setTimeout(function() {
        postActionWithRetry(action, obj, retry_count + 1);
      }, 1000 * Math.pow(2, retry_count));
    }).success(function(xhr, text) {

    });
  }

  function postAction(action, obj) {
    postActionWithRetry(action, obj, 0);
  }

  function upvote(button) {
    if (!connected || !shouldPublish()) {
      return;
    }

    if (button.parents('.comment').size() < 1) {
      postAction('upvote', RedditPost.fromUpvoteButton(button));
    } else {
      postAction('upvote', RedditComment.fromUpvoteButton(button));
    }
  }

  function unupvote(button) {
    console.log('unupvote');
  }

  $('body').append(
    '<div id="ogreddit" class="closed">' +
      '<div id="fb-root" />' +
    '</div>'
  );

  $('#ogreddit').load(chrome.extension.getURL('settings.html'), function() {
    var settings = $('#ogreddit .settings');
    setupSettings(settings);
    $('#ogreddit .settingsNib').click(function() {
      settings.toggleClass('closed');
    });
  });

  $('.arrow').click(function() {
    var button = $(this);
    if (button.parent().hasClass('likes')) {
      upvote(button);
    } else if (button.parent().hasClass('dislikes')) {
      // downvote();
    } else {
      if (button.hasClass('up')) {
        unupvote(button);
      } else {
        // undownvote();
      }
    }
  });

  FB.init({
    appId      : '288106721255039',
    status     : true,
    cookie     : true,
    xfbml      : true,
    oauth      : true,
  });

  FB.Event.subscribe('auth.statusChange', setStatusOnResponse);
});
