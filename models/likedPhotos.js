var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LikedPhotos = new Schema({
    photoId: String,
    albumId: String,
    userIds: [String]
});

module.exports = mongoose.model('LikedPhotos', LikedPhotos);