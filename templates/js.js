var JWT_PAYLOAD_INDEX = 1;
var VGS = {};

VGS.process = function(input, ctx) {
  try {
    var authHeader = input.headers().get('Authorization');
    if (authHeader.startsWith('Bearer')) {
      authHeader = authHeader.replace('Bearer', '').trim();
    }
    var token = authHeader.split('.');
    var payload = token[JWT_PAYLOAD_INDEX];

    var jwt = util.codecs.b64Decode(payload);
    var userId = JSON.parse(jwt).sub;

    var userTag = 'user-id=' + userId;
    ctx.get('classifiers').addTags(userTag);

    return input;
  } catch (e) {
    return input;
  }
};