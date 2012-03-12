//
// Base OG Object
//

BASE_URI = 'http://ogproxy.herokuapp.com';

function OGObject(type) {
	this.type = type;
}

//
// Post
//

var RedditPost = extend(function() {
  super_class(RedditPost).constructor.call(this, 'fbreddit:post');
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
