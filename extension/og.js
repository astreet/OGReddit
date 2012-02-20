//
// Base OG Object
//

function OGObject(type) {
	this.type = type;
}

OGObject.prototype = {
  _baseUrl = 'http://ogreddit.herokuapp.com/';
  toParamArray: function() {
    return {type: this.type};
  },
  _verifyParams: function(params) {
    for (var i in params) {
      if (params.hasOwnProperty(i) &&
          params[i] === undefined || params[i] === null) {
          console.error(
            params[i] + ' is not defined for object of type' + this.type
          );
          return false;
      }
    }

    return true;
  }
  getObjectURL: function() {
    var params = this.toParamArray();
    if (!this._verifyParams(params)) {
      return null;
    }
    return this._baseUrl + '?' + $.params(params, true);
  }
}

//
// Post
//

var RedditPost = extend(function() {
  super_class(RedditPost).constructor.call(this, 'fbreddit:post');
}, OGObject);

RedditPost.fromUpvoteButton = function(button) {
  var post = new RedditPost();

  var entry = button.parents('.thing');
  var titleElem = entry.find('a.title').first();

  post.link = entry.find('a.comments').first().attr('href');

  post.title = titleElem.text();

  var content_url = titleElem.attr('href');
  if (content_url && content_url[0] === '/') {
    content_url = 'http://reddit.com' + link;
  }
  post.content_url = content_url;

  post.author = RedditAuthor.fromAuthorLink(
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
  if (subreddit_link) {
    post.subreddit = 
      RedditSubreddit.fromSubredditLink(subreddit_link).getObjectURL();
  } else {
    post.subreddit = RedditSubreddit.fromCurrentURL().getObjectURL();
  }
  
  if (!subreddit) {
    
  }
  post.subreddit = subreddit;

  return post;
}

copy_into(RedditPost.prototype, {
  toParamArray: function () {
    var params = super_class(RedditPost).toParamArray.call(this);
    return copy_into(params, {
      author: this.author,
      content_url: this.content_url,
      image: this.image,
      link: this.link,
      subreddit: this.subreddit,
      title: this.title
    })
  }
});

//
// Author
//

var RedditAuthor = extend(function() {
  super_class(RedditAuthor).constructor.call(this, 'fbreddit:author');
});

RedditAuthor.fromAuthorLink = function(button) {
  var author = new RedditAuthor();
  author.title = button.text();
  author.link = button.attr('href');
  author.image = 'http://redditstatic.s3.amazonaws.com/sobrave.png';

  return author;
}

copy_into(RedditAuthor.prototype, {
  toParamArray: function() {
    var params = super_class(RedditAuthor).toParamArray.call(this);
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
  super_class(Subreddit).constructor.call(this, 'fbreddit:subreddit');
});

copy_into(RedditSubreddit, {
  _imageFromLink: function(link) {
    var image = null;
    // TOOO: cache this
    $.ajax({
      url: link,
      async: false,
      success: function(result) {
        image = $(result).find('#header-img').attr('src');
      }
    });
    return image;
  },
  fromSubredditLink: function(button) {
    var subreddit = new RedditSubreddit();
    subreddit.title = '/r/' + button.text();
    subreddit.link = button.attr('href');
    subreddit.image = RedditSubreddit._imageFromLink(this.link);

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
    subreddit.image = RedditSubreddit._imageFromLink(subreddit.link);

    return subreddit;
  }
});

copy_into(Subreddit.prototype, {
  toParamArray: function() {
    var params = super_class(Subreddit).toParamArray.call(this);
    return copy_into(params, {
      image: this.image,
      link: this.link,
      title: this.title
    })
  }
});