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

  function guardedPublish(action_name, subreddit_name, publish_function) {
    settings_get_all(function(settings) {
      if (settings['settings.publish.killswitch'] != 'false'
          && settings['settings.publish.' + action_name] != 'false'
          && settings['settings.subreddit.' + subreddit_name.toLowerCase()] != 'disabled') {
        if (settings['settings.subreddit.' + subreddit_name.toLowerCase()] == 'enabled') {
          // change back to publish
          showPublishPrompt(subreddit_name, publish_function);
        } else {
          showPublishPrompt(subreddit_name, publish_function);
        }
      } else {
        console.log('Not publishing because:');
        settings['settings.publish.killswitch'] == 'false' && console.log(' - Killswitch engaged');
        settings['settings.publish.' + action_name] == 'false' && console.log(' - Publishing turned off for ' + action_name);
        settings['settings.subreddit.' + subreddit_name.toLowerCase()] == 'disabled' && console.log(' - Publishing turned off for /r/' + subreddit_name);
      }
    });
  }

  function showPublishPrompt(subreddit_name, publish_function) {
    var prompt = $('#ogreddit .publishPrompt');
    prompt.find('.promptText').text("Publish actions for /r/" + subreddit_name + " to your timeline?");
    prompt.find('button').off('click').click(function() { hidePublishPrompt(); });

    prompt.find('.yesButton').click(function() {
      publish_function();
    });

    prompt.find('.alwaysButton').click(function() {
      settings_set('settings.subreddit.' + subreddit_name.toLowerCase(), 'enabled');
      publish_function();
    });

    prompt.find('.neverButton').click(function() {
      settings_set('settings.subreddit.' + subreddit_name.toLowerCase(), 'disabled');
    });

    $(document.body).addClass('hasOGPublishPrompt');
  }

  function hidePublishPrompt() {
    $(document.body).removeClass('hasOGPublishPrompt');
  }

  var MAX_RETRIES = 5;
  function postActionWithRetry(action, obj, retry_count) {
    if (!connected) {
      console.error('Not connected!');
      return;
    }

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
    guardedPublish(action, obj.getSubreddit(), function() {
      postActionWithRetry(action, obj, 0);
    });
  }

  function upvote(button) {
    if (button.parents('.comment').size() < 1) {
      postAction('upvote', RedditPost.fromUpvoteButton(button));
    } else {
      postAction('upvote', RedditComment.fromUpvoteButton(button));
    }
  }

  function unupvote(button) {
    console.log('unupvote');
  }

  function firstRun() {
    console.log('first hasRunBefore');
    var DEFAULT_SUBREDDITS = [
      "pics",
      "gaming",
      "worldnews",
      "videos",
      "todayilearned",
      "iama",
      "funny",
      "atheism",
      "politics",
      "science",
      "askreddit",
      "technology",
      "wtf",
      "blog",
      "announcements",
      "bestof",
      "adviceanimals",
      "music",
      "aww",
      "askscience",
      "movies",
    ];

    $.each(DEFAULT_SUBREDDITS, function(_, subreddit) {
      settings_set('settings.subreddit.' + subreddit.toLowerCase(), 'enabled');
    })

    settings_set('settings.hasRunBefore', true);
  }

  var prompt = $(
    '<div class="publishPrompt">' +
      '<div class="publishStrip" />' +
      '<div class="promptText" />' +
      '<div class="buttonGroup">' +
        '<button class="alwaysButton">Always</button>' +
        '<button class="yesButton">This once</button>' +
        '<button class="neverButton">Never</button>' +
        '<span class="noButton" />' +
      '</div>' +
    '</div>'
  );

  $('body').append(
    '<div id="ogreddit" class="closed">' +
      '<div id="fb-root" />' +
      '<div class="publishPrompt">' +
        '<div class="publishStrip" />' +
        '<div class="promptText" />' +
        '<div class="buttonGroup">' +
          '<button class="alwaysButton">Always</button>' +
          '<button class="yesButton">This once</button>' +
          '<button class="neverButton">Never</button>' +
          '<span class="noButton" />' +
        '</div>' +
      '</div>' +
      '<div id="settings_content" />' +
    '</div>'
  );

  settings_get('settings.hasRunBefore', function(value) {
    !value && firstRun();
  });

  $('#ogreddit #settings_content').load(chrome.extension.getURL('settings.html'), function() {
    var settings = $('#ogreddit .settings');
    setupSettings(settings);
    $('#ogreddit .settingsNib').click(function() {
      settings.toggleClass('closed');
    });
  });

  $('#ogreddit').append(prompt);

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
