//
// Base OG Object
//

BASE_URI = 'http://ogproxy.herokuapp.com';

function OGObject(type) {
	this.type = type;
}

copy_into(OGObject, {
  getObjectType: function() {
    return this.type;
  }
});

//
// Post
//

var RedditPost = extend(function() {
  super_class(RedditPost).constructor.call(this, 'post');
}, OGObject);

copy_into(RedditPost, {
  fromUpvoteButton: function(button) {
    var post = new RedditPost();
    post._id = $(button).parents('.thing').attr('data-fullname');
    return post;
  }
});

copy_into(RedditPost.prototype, {
  _id: null,
  getObjectURL: function() {
    return BASE_URI + '/reddit/post/' + this._id;
  }
});

//
// Comment
//

var RedditComment = extend(function() {
  super_class(RedditComment).constructor.call(this, 'comment');
}, OGObject);

copy_into(RedditComment, {
  fromUpvoteButton: function(button) {
    var comment = new RedditComment();
    // Strip t1_
    comment._comment_id = $(button).parents('.thing').attr('data-fullname').substring(3);
    // Hacky :p
    short_url = $('head').children('link[rel="shorturl"]').attr('href');
    comment._post_id = short_url.substring(short_url.lastIndexOf('/') + 1);
    return comment;
  }
});

copy_into(RedditComment.prototype, {
  _post_id: null,
  _comment_id: null,
  getObjectURL: function() {
    return BASE_URI + '/reddit/comment/' + this._post_id + '/' + this._comment_id;
  }
});
