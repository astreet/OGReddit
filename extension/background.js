$(function() {
  var connected = false;
  var accessToken = null;

  function connect() {
    connected = true;
    $('#ogreddit')
      .children('.disconnected')
      .switchClass('disconnected', 'connected', getAnimationTime());
  }

  function disconnect() {
    accessToken = null;
    connected = false;
    $('#ogreddit')
      .children('.connected')
      .switchClass('connected', 'disconnected', getAnimationTime());
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

  function getAnimationTime() {
    return $('#ogreddit').hasClass('closed') ? 0 : 500;
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
  function postActionWithRetry(action, object, retry_count) {
    if (retry_count === MAX_RETRIES) {
      return;
    }

    var url = object.getObjectURL();
    console.log('Try ' + (retry_count + 1) + ': ' + url);
    $.post(
      'https://graph.facebook.com/me/fbreddit:' + action,
      {post: url, access_token: accessToken}
    ).error(function(xhr, text) {
      if (text == 'parsererror') {
        return;
      }

      console.error('Fail: ' + text);
      setTimeout(function() {
        postActionWithRetry(action, object, retry_count + 1);
      }, 1000 * Math.pow(2, retry_count));
    }).success(function(xhr, text) {

    });
  }

  function postAction(action, object) {
    postActionWithRetry(action, object, 0);
  }

  function upvote(button) {
    if (!connected || !shouldPublish()) {
      return;
    }

    postAction('upvote', RedditPost.fromUpvoteButton(button));
  }

  function unupvote(button) {
    console.log('unupvote');
  }

  $('body').append(
    '<div id="ogreddit" class="closed">' +
      '<div id="fb-root" />' +
      '<img class="fbPopupNib disconnected" height="25" width="30" />' +
      '<div class="fbPopup disconnected">' +
        '<div ' +
          'class="fb-add-to-timeline" ' +
          'data-show-faces="true" ' +
          'data-mode="button" />' +
        '<div id="settings">' +
          '<input type="checkbox" id="publish" checked />' +
          '<label for="publish">Publish to Facebook</label>' +
        '</div>' +
      '</div>' +
    '</div>'
  );

  setupSettings($('#settings'));

  $('.fbPopupNib')
    .click(function() { $('#ogreddit').toggleClass('closed'); })
    .attr('src', chrome.extension.getURL('nib-icon.png'));

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
