var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var LikedPhotos = require('../models/likedPhotos');
var AlbumRights = require('../models/AlbumRights');
var router = express.Router();
var https = require('https');
//middleware
function loggedIn(req, res, next) {
    if (req.user) {
        next();
    } else {
        return res.status(401).send('not authenticated');
    }
}

router.post('/register', function (req, res, next) {
    Account.register(new Account({ username: req.body.username }), req.body.password, function (err, account) {
        if (err) {
            return res.status(500).json({
                err: err
            });
        }
        passport.authenticate('local')(req, res, function () {
            return res.status(200).json({
                status: 'Registration successful!'
            });
        });
    });
});

router.post('/login', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(200).json({
                err: info
            });
        }
        req.logIn(user, function (err) {
            if (err) {
                return res.status(500).json({
                    err: 'Could not log in user'
                });
            }
            res.cookie('username', req.user.username);
            res.status(200).json({
                status: 'Login successful!'
            });
        });
    })(req, res, next);
});

router.get('/logout', function (req, res) {
    req.logout();
    res.cookie("username", "", { expires: new Date() });
    res.status(200).json({
        status: 'Logged out'
    });
});


router.get('/albums', loggedIn, function (req, res) {
    AlbumRights.find({ 'userId': req.user.username }, function (err, model) {
        if (err) throw err;

        if (model.length) {
            var url = "https://api.flickr.com/services/rest?api_key=" + process.env.API_KEY + "&format=json&method=flickr.photosets.getList&nojsoncallback=1&oauth_consumer_key=" + process.env.OAUTH_CONSUMER_KEY + "&oauth_nonce=" + process.env.OAUTH_NONCE + "&oauth_signature_method=HMAC-SHA1&oauth_timestamp=" + process.env.OAUTH_TIMESTAMP + "&oauth_token=" + process.env.OAUTH_TOKEN + "&oauth_version=1.0&user_id=" + process.env.USER_ID + "&oauth_signature=" + process.env.OAUTH_SIGNATURE;

            https.get(url, function (result) {
                var str = '';
                result.on('data', function (chunk) {
                    str += chunk;
                });
                result.on('end', function () {
                    console.log("data back for album photos " + req.params.albumId);
                    str = JSON.parse(str);
                    var albums = str.photosets.photoset.filter(function (set) {
                        return ~this[0].albumIds.indexOf(set.id);
                    }, model);
                    res.json(albums);
                });
            }).on('error', function (err) {
                console.log("Error getting albums from flickr: ", err);
            });
        }
        else {
            res.json(model);
        }
    });


});

router.get('/albums/:albumId', loggedIn, function (req, res) {

    var url = "https://api.flickr.com/services/rest?api_key=" + process.env.API_KEY + "&format=json&method=flickr.photosets.getPhotos&nojsoncallback=1&oauth_consumer_key=" + process.env.OAUTH_CONSUMER_KEY + "&oauth_nonce=" + process.env.OAUTH_NONCE + "&oauth_signature_method=HMAC-SHA1&oauth_timestamp=" + process.env.OAUTH_TIMESTAMP + "&oauth_token=" + process.env.OAUTH_TOKEN + "&oauth_version=1.0&photoset_id=" + req.params.albumId + "&user_id=" + process.env.USER_ID + "&oauth_signature=" + process.env.OAUTH_SIGNATURE;
    
    
    var callbackFtn = function (param, result) {
        var str = '';
        result.on('data', function (chunk) {
            str += chunk;
        });
        //the whole response has been recieved, so we just print it out here
        result.on('end', function () {
            console.log("data back for album photos ");
            var set1 = JSON.parse(str);
            //handling only upto 1000 photos per album, 2 pages for now. switch to for loop
            if(set1.photoset.pages > 1) {
                var url = param+"&page=2"; 
                https.get(url, function (result) {
                    var str1 = '';
                    result.on('data', function (chunk) {
                        str1 += chunk;
                    });
                    result.on('end', function () {
                        var set2 = JSON.parse(str1);
                        Array.prototype.push.apply(set1.photoset.photo, set2.photoset.photo);
                        res.json(set1);    
                    });
                });
            }
            else {
                res.json(set1);
            }
        });
    };
    
    var boundCallback = callbackFtn.bind(null, url);
    
    // get photos and send it in res
    https.get(url, boundCallback).on('error', function (err) {
        console.log("Error: ", err);
    });
});

router.get('/albums/:albumId/likes', loggedIn, function (req, res) {
    LikedPhotos.find({ 'albumId': req.params.albumId }, function (err, model) {
        if (err) throw err;
        res.json(model);
    });
});

router.post('/albums/:albumId/likes', loggedIn, function (req, res) {
    LikedPhotos.update({ 'photoId': req.body.photoId, 'albumId': req.params.albumId }, { $addToSet: { userIds: req.user.username } }, { upsert: true }, function (err, model) {
        if (err) throw err;
        res.send(req.body.photoId + ' liked');
    })
});

router.post('/albums/:albumId/unlike', loggedIn, function (req, res) {
    LikedPhotos.update({ 'photoId': req.body.photoId, 'albumId': req.params.albumId }, { $pull: { userIds: req.user.username } }, { upsert: true }, function (err, model) {
        if (err) throw err;
        res.send(req.body.photoId + ' unliked');
    })
});

module.exports = router;