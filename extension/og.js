//
// Base OG Object
//

function OGObject(type) {
	this.type = type;
}

copy_into(OGObject.prototype, {
  _baseUrl: 'http://ogreddit.herokuapp.com/',
  toParamArray: function() {
    return {type: this.type};
  },
  _verifyParams: function(params) {
    for (var i in params) {
      if (params.hasOwnProperty(i) &&
          (params[i] === undefined || params[i] === null)) {
          console.error(
            i + ' is not defined for object of type ' + this.type
          );
          return false;
      }
    }

    return true;
  },
  getObjectURL: function() {
    var params = this.toParamArray();
    if (!this._verifyParams(params)) {
      return null;
    }
    console.log(this.type + ': ' + this._baseUrl + '?' + $.param(params, true));
    return this._baseUrl + '?' + $.param(params, true);
  }
});

//
// Post
//

var RedditPost = extend(function() {
  super_class(RedditPost).constructor.call(this, 'fbreddit:post');
}, OGObject);

copy_into(RedditPost, {
  fromUpvoteButton: function(button) {
    var post = new RedditPost();

    var entry = button.parents('.thing');
    var titleElem = entry.find('a.title').first();

    post.link = entry.find('a.comments').first().attr('href');

    post.title = titleElem.text();

    var content_url = titleElem.attr('href');
    if (content_url && content_url[0] === '/') {
      content_url = 'http://reddit.com' + post.link;
      post.link = content_url;
    }
    post.content_url = content_url;

    post.author = RedditUser.fromAuthorLink(
      entry.find('a.author').first()
    ).getObjectURL();

    var image = 'http://www.redditstatic.com/over18.png';
    var thumb = entry.children('.thumbnail');
    if (thumb.length > 0) {
      image = thumb.children('img').attr('src');
    } else if (is_image(content_url)) {
      image = content_url;
    }
    post.image = image;

    var subreddit_link = entry.find('a.subreddit').first();
    if (subreddit_link.length) {
      post.subreddit =
        RedditSubreddit.fromSubredditLink(subreddit_link).getObjectURL();
    } else {
      post.subreddit = RedditSubreddit.fromCurrentURL().getObjectURL();
    }

    var upvotes = parseInt(entry.find('.score.unvoted').first().text());
    if (!!upvotes) {
      post.upvotes = upvotes;
    }

    return post;
  }
});

copy_into(RedditPost.prototype, {
  toParamArray: function () {
    var params = super_class(RedditPost).toParamArray.call(this);
    params = copy_into(params, {
      author: this.author,
      content_url: this.content_url,
      image: this.image,
      link: this.link,
      subreddit: this.subreddit,
      title: this.title
    });
    if (this.upvotes) {
      params.upvotes = this.upvotes;
    }
    return params;
  }
});

//
// Author
//

var RedditUser = extend(function() {
  super_class(RedditUser).constructor.call(this, 'fbreddit:user');
}, OGObject);

RedditUser.fromAuthorLink = function(button) {
  var author = new RedditUser();
  author.title = button.text();
  author.link = button.attr('href');
  author.image = 'http://redditstatic.s3.amazonaws.com/sobrave.png';

  return author;
}

copy_into(RedditUser.prototype, {
  toParamArray: function() {
    var params = super_class(RedditUser).toParamArray.call(this);
    return copy_into(params, {
      image: this.image,
      link: this.link,
      title: this.title
    })
  }
});

//
// Comment
//

//
// Subreddit
//

var RedditSubreddit = extend(function() {
  super_class(RedditSubreddit).constructor.call(this, 'fbreddit:subreddit');
}, OGObject);

copy_into(RedditSubreddit, {
  _imageFromLink: function(link) {
    var image = null;
    // TOOO: cache this
    $.ajax({
      url: link,
      async: false,
      success: function(result) {
        image = $(result).find('#header-img').attr('src');
      }.bind(image)
    });
    return image;
  },
  fromSubredditLink: function(button) {
    var subreddit = new RedditSubreddit();
    subreddit.title = '/r/' + button.text();
    subreddit.link = 'http://www.reddit.com' + subreddit.title;
    subreddit.image = 'http://e.thumbs.redditmedia.com/Z8kgqRVNcFP6wiAF.png';

    return subreddit;
  },
  fromCurrentURL: function() {
    var subreddit = new RedditSubreddit();
    match = window.location.href.match("/r/([^/]+)");
    if (!match || !match[1]) {
      return null;
    }

    subreddit.title = '/r/' + match[1];
    subreddit.link = 'http://www.reddit.com/r/' + subreddit.title;
    subreddit.image = 'http://e.thumbs.redditmedia.com/Z8kgqRVNcFP6wiAF.png';

    return subreddit;
  }
});

copy_into(RedditSubreddit.prototype, {
  toParamArray: function() {
    var params = super_class(RedditSubreddit).toParamArray.call(this);
    return copy_into(params, {
      image: this.image,
      link: this.link,
      title: this.title
    })
  }
});
