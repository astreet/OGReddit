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

function settings_get(key, callback) {
  settings_multiget([key], function(values) {
    callback(values[key]);
  });
}

function settings_multiget(keys, callback) {
  chrome.extension.sendRequest({fun: 'settings_multiget', keys: keys}, function(resp) {
    callback(resp.values);
  });
}

function settings_set(key, value) {
  chrome.extension.sendRequest({fun: 'settings_set', key: key, value: value});
}

function settings_get_all(callback) {
  chrome.extension.sendRequest({fun: 'settings_get_all'}, function(resp) {
    callback(resp.settings);
  });
}

function setupSettings(settings) {
  $.each(SELECTOR_TO_SETTINGS_MAP, function(selector, setting_name) {
    setupSettingsCheckbox(settings.find('input' + selector), setting_name);
  });

  var killswitch = settings.find('input#publish_killswitch');
  killswitch.change(function(e) {
    reloadPublishKillswitch();
  });
  reloadPublishKillswitch();

  settings.find('a.subredditSettingsLink').click(function() {
    chrome.extension.sendRequest({fun: 'show_subreddit_settings'});
  });
}

function reloadPublishKillswitch() {
  var settings = $('#ogreddit .settings');
  var children = settings.find('.publishSubsettings input');
  settings_get(SELECTOR_TO_SETTINGS_MAP['#publish_killswitch'], function(value) {
    if (value == 'false') {
      children.attr('disabled', 'disabled');
    } else {
      children.removeAttr('disabled');
    }
  });
}

function reloadSettings() {
  reloadPublishKillswitch();
  $.each(SELECTOR_TO_SETTINGS_MAP, function(selector, setting_name) {
    reloadSettingsCheckbox(settings.find('input' + selector), setting_name);
  });
}

function reloadSettingsCheckbox(checkbox, setting_name) {
  settings_get(setting_name, function(value) {
    checkbox.attr('checked', value != 'false');
  });
}

function setupSettingsCheckbox(checkbox, setting_name) {
  reloadSettingsCheckbox(checkbox, setting_name);

  checkbox.change(function (event) {
    settings_set(setting_name, checkbox.attr('checked') != undefined);
  });
}