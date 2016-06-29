var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AlbumRights = new Schema({
    userId: String,
    albumIds: [String]
});

module.exports = mongoose.model('AlbumRights', AlbumRights);