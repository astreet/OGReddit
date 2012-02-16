$(function() {
  var connected = false;
  var accessToken = null;

  function connect() {
    connected = true;
  }

  function disconnect() {
    connected = false;
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

  var MAX_RETRIES = 3;
  function retryActionWithParams(action, params, retry_count) {
    if (retry_count === MAX_RETRIES) {
      return;
    }

    var url = 'http://ogreddit.herokuapp.com/?' + $.param(params, true) + '&type=fbreddit:post';
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
        retryActionWithParams(action, params, retry_count + 1);
      }, 1000);
    });
  }

  function doActionWithParams(action, params) {
    retryActionWithParams(action, params, 0);
  }

  function upvote(button) {
    if (!connected) {
      return;
    }

    var entry = button.parents('.thing');
    var titleElem =
      entry
        .children('.entry').first()
        .children('p.title').first()
        .children('a.title').first();

    var title = titleElem.text();
    var link = titleElem.attr('href');
    if (link && link[0] === '/') {
      link = 'http://reddit.com' + link;
    }
    var author =
      entry
        .children('.entry').first()
        .children('.tagline').first()
        .children('.author').first()
        .text();

    var image = 'http://www.redditstatic.com/over18.png';
    var thumb = entry.children('.thumbnail');
    if (thumb.length > 0) {
      image = thumb.children('img').attr('src');
    }

    doActionWithParams('upvote', {
      title: title,
      link: link,
      image: image,
      author: author,
      //type: 'fbreddit:post'
    });
  }

  function unupvote(button) {
    console.log('unupvote');
  }

  $('body').append(
    '<div id="fb-root" />' +
    '<img class="fbPopupNib" />' +
    '<div class="fbPopup">' +
      '<div class="fb-add-to-timeline" data-show-faces="true" data-mode="button"></div>' +
    '</div>'
  );

  FB.init({
    appId      : '288106721255039',
    status     : true,
    cookie     : true,
    xfbml      : true,
    oauth      : true,
  });

  FB.Event.subscribe('auth.statusChange', setStatusOnResponse);

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
});
