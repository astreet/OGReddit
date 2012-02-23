$(function() {
  var connected = false;
  var accessToken = null;

  function connect() {
    connected = true;
    $('#ogreddit')
      .children('.disconnected')
      .switchClass('disconnected', 'connected', 500);
  }

  function disconnect() {
    accessToken = null;
    connected = false;
    $('#ogreddit')
      .children('.connected')
      .switchClass('connected', 'disconnected', 500);
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
    });
  }

  function postAction(action, object) {
    postActionWithRetry(action, object, 0);
  }

  function upvote(button) {
    if (!connected) {
      return;
    }

    postAction('upvote', RedditPost.fromUpvoteButton(button));
  }

  function unupvote(button) {
    console.log('unupvote');
  }

  $('body').append(
    '<div id="ogreddit">' +
      '<div id="fb-root" />' +
      '<img class="fbPopupNib disconnected" height="25" width="30" />' +
      '<div class="fbPopup disconnected">' +
        '<div ' +
          'class="fb-add-to-timeline" ' +
          'data-show-faces="true" ' +
          'data-mode="button" />' +
      '</div>' +
    '</div>'
  );

  var popup = $('.fbPopup');
  popup.hide();
  $('.fbPopupNib').click(function() { popup.toggle(); })
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
