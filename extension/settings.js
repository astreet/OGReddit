/**
 * Selector => localStorage name
 */
var SELECTOR_TO_SETTINGS_MAP = {
  '#publish_killswitch': 'settings.publish.killswitch',
  '#publish_upvote': 'settings.publish.upvote',
  '#publish_subscribe': 'settings.publish.subscribe',
  '#publish_comment': 'settings.publish.comment',
  '#publish_post': 'settings.publish.post'
}

function shouldPublish(action_name, subreddit_name) {
  return localStorage['settings.publish.killswitch'] != 'false'
    && localStorage['settings.publish.' + action_name] != 'false'
    && localStorage['settings.subreddit.' + subreddit_name.toLowerCase()] == 'enabled';
}

function setupSettings(settings) {
  $.each(SELECTOR_TO_SETTINGS_MAP, function(selector, setting_name) {
    setupSettingsCheckbox(settings.find('input' + selector), setting_name);
  });

  var killswitch = settings.find('input#publish_killswitch');
  killswitch.change(function(e) {
    reloadPublishKillswitch();
  });

  settings.find('a.subredditSettingsLink').click(function() {
    chrome.extension.sendRequest({fun: 'show_subreddit_settings'});
  });
}

function reloadPublishKillswitch() {
  var settings = $('#ogreddit .settings');
  var children = settings.find('.publishSubsettings input');
  if (localStorage[SELECTOR_TO_SETTINGS_MAP['#publish_killswitch']] == 'false') {
    children.attr('disabled', 'disabled');
  } else {
    children.removeAttr('disabled');
  }
}

function reloadSettings() {
  reloadPublishKillswitch();
  $.each(SELECTOR_TO_SETTINGS_MAP, function(selector, setting_name) {
    reloadSettingsCheckbox(settings.find('input' + selector), setting_name);
  });
}

function reloadSettingsCheckbox(checkbox, setting_name) {
  checkbox.attr('checked', localStorage[setting_name] != 'false');
}

function setupSettingsCheckbox(checkbox, setting_name) {
  reloadSettingsCheckbox(checkbox, setting_name);

  checkbox.change(function (event) {
    localStorage[setting_name] = (checkbox.attr('checked') != undefined);
  });
}