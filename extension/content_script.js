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
    console.log('asdasdasdasdasdasdasdas');
    switch (response.status) {
      case 'connected':
        accessToken = response.authResponse.accessToken;
        connect();
        break;
      default:
        disconnect();
    }
  }

  var MAX_RETRIES = 5;
  function postActionWithRetry(action, obj, retry_count) {
    if (!connected || !shouldPublish(action, obj.getSubreddit())) {
      console.log(obj.getSubreddit());
      console.log(connected);
      console.error('Not publishing');
      return;
    }

    console.error('Publishing');
    return;

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
      localStorage['settings.subreddit.' + subreddit.toLowerCase()] = 'enabled';
    })

    localStorage['settings.hasRunBefore'] = true;
  }

  $('body').append(
    '<div id="ogreddit" class="closed">' +
      '<div id="fb-root" />' +
    '</div>'
  );

  if (!localStorage['settings.hasRunBefore']) {
    firstRun();
  }

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

  FB.Event.subscribe('auth.statusChange', setStatusOnResponse);
  FB.init({
    appId      : '288106721255039',
    status     : true,
    cookie     : true,
    xfbml      : true,
    oauth      : true,
  });
  FB.getLoginStatus(function() {alert('asda');});
  console.log('done');
});
