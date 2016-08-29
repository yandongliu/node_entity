function normalize_entity_name(name) {
  return name.trim().replace(/ /g,'_').toLowerCase();
}

function escape_string(str) {
  //return escape(str.trim());
  return str.trim();
}

function unescape_string(str) {
  //return unescape(str.trim());
  return str.trim();
}
function include(arr,obj) {
    return (arr.indexOf(obj) != -1);
}

exports.normalize_entity_name = normalize_entity_name;
exports.escape_string = escape_string;
exports.unescape_string = unescape_string;
exports.include = include;
