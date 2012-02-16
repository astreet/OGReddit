$(function() {
  function load_fbjs() {
    (function(d){
      var js, id = 'facebook-jssdk'; if (d.getElementById(id)) {return;}
      js = d.createElement('script'); js.id = id; js.async = true;
      js.src = "//connect.facebook.net/en_US/all.js";
      d.getElementsByTagName('head')[0].appendChild(js);
    }(document));
  }

  $.append(
    '<div class="fbPopupNib">' +
      '<div class="fbPopup">' +
        '<div class="fb-login-button">Login with Facebook</div>' +
      '</div>' +
    '</div>'
  );

  var popup = $('fbPopup');
  popup.hide();
  $('fbPopupNib').click(function() { popup.toggle(); });

  load_fbjs();
});
