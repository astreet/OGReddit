var proto = Object.getPrototypeOf;

function extend(new_class, base_class) {
  new_class.prototype = Object.create(base_class.prototype);
  new_class.prototype.constructor = new_class;
  return new_class;
}

function super_class(clz) {
  return proto(clz.prototype);
}

function copy_into(obj, properties) {
  var props = Object.keys(properties);
  for (var i = 0; i < props.length; i++) {
    var key = props[i];
    obj[key] = properties[key];
  };
  return obj;
}

function is_image(uri) {
  return uri.match('(gif|png|jpg|bmp)$'); 
}