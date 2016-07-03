var albumBuilder = angular.module('AlbumBuilder');
var controllers = {};
controllers.photosController = ['$state', '$stateParams', 'albumService', 'photosService', '$q', '$cookies', '$filter', '$document', function ($state, $stateParams, albumService, photosService, $q, $cookies, $filter, $document) {
    var pc = this;
    if (photosService.allPhotos.length === 0) {
        var photosPromise = albumService.getPhotosInAlbum($stateParams.albumId);
        var likesPromise = albumService.getLikedPhotos($stateParams.albumId);

        $q.all([photosPromise, likesPromise]).then(function (data) {
            var photos = data[0].data.photoset.photo;
            pc.albumTitle = data[0].data.photoset.title;
            var likedPhotos = data[1].data;
            if(likedPhotos.length > 0) {
                for (var i = 0; i < photos.length; i++) {
                    for (var j = 0; j < likedPhotos.length; j++) {
                        if (photos[i].id === likedPhotos[j].photoId) {
                            photos[i].likes = likedPhotos[j].userIds;
                            break; // only one match is possible, so break the inner loop
                        }
                    }
                }
            }
            pc.slides = photos;
            //keep a full unfiltered copy
            photosService.allPhotos = photos;
            setActiveSlide(photosService.allPhotos);
            checkFilter();
        })
        .catch(function (err) {
            console.log('failed: ' + err);
        });
    }
    else {
        // must be a filtered case here, as photos are already avaiable
        setActiveSlide(photosService.allPhotos);
        checkFilter();
    }
    pc.toggleLike = function (photoId, index) {
        if (!pc.slides[index].likes) {
            pc.slides[index].likes = [];
        }
        var username = $cookies.get('username');
        var likeIndex = pc.slides[index].likes.indexOf(username);
        if (likeIndex > -1) {
            albumService.unlike(photoId, $stateParams.albumId).then(function (data) {
                pc.slides[index].likes.splice(likeIndex, 1);
            })
            .catch(function(err) {
                console.log("Failed to unlike photo " + photoId + " err: "+ err);
            });
        }
        else {
            albumService.like(photoId, $stateParams.albumId).then(function (data) {
                pc.slides[index].likes.push(username);
            })
            .catch(function(err) {
                console.log("Failed to like photo " + photoId + " err: "+ err);
            });
        }
    };
    function setActiveSlide(photos) {
        if ($stateParams.slide > 0 && $stateParams.slide <= photos.length) {
            pc.active = $stateParams.slide - 1;
        }
        else {
            $state.go('.', { slide: 1 });
        }
    }

    function checkFilter() {
        if ($stateParams.show === 'byme' || $stateParams.show === 'byany') {
            pc.slides = photosService.allPhotos.filter(filterPhotos);
            if(pc.slides.length === 0){
                pc.showMessage = true;
            }
        }
        else {
            pc.slides = photosService.allPhotos;
            pc.showMessage = false;
        }
    };

    // method only called if the filter is either byme or byany
    function filterPhotos(photo) {
        if (photo.likes) {
            if ($stateParams.show === 'byme') {
                return photo.likes.length > 0 && photo.likes.indexOf($cookies.get('username')) >= 0;
            }
            else if ($stateParams.show === 'byany') {
                return photo.likes.length > 0;
            }
        }
    };
}];

controllers.albumController = ['albumService','photosService', function (albumService, photosService) {
    var ac = this;
    photosService.allPhotos = [];
    albumService.getAlbums().then(function (data) {
        if (data.data) {
            ac.albums = data.data;
        }
    })
    .catch(function (err) {
        console.log("failed: " + err);
    });
}];

controllers.topbarController = ['$cookies', 'AuthService', '$state', '$stateParams', function ($cookies, AuthService, $state, $stateParams) {
    var tc = this;
    tc.user = $cookies.get('username');
    tc.showFilter = $stateParams.albumId;
    if ($stateParams.show === 'byme') {
        tc.filter = 'Liked by me';
    }
    else if ($stateParams.show === 'byany') {
        tc.filter = 'Liked by anyone';
    }
    else {
        tc.filter = 'Show all';
    }
    tc.logout = function () {
        // call logout from service
        AuthService.logout()
            // handle success
            .then(function (data) {
                $state.go('login');
            })
            // handle error
            .catch(function () {
                $state.go('login');
            });
    };
    tc.changeView = function (filter) {
        $stateParams.show = filter;
        $stateParams.slide = 1;
        $state.go('photos');
    }
}];

controllers.loginController = ['AuthService', '$state', '$filter',
    function (AuthService, $state, $filter) {
        var lc = this;
        lc.login = function () {
            // initial values
            lc.error = false;

            // call login from service
            AuthService.login($filter('lowercase')(lc.loginForm.username), lc.loginForm.password)
                // handle success
                .then(function (data) {
                    $state.go('albums');
                })
                // handle error
                .catch(function () {
                    lc.error = true;
                    lc.errorMessage = 'Invalid username and/or password';
                    lc.loginForm = {};
                });
        };
    }];

controllers.registerController = ['AuthService', '$state',
    function (AuthService, $state) {
        var rc = this;
        rc.error = false;
        rc.register = function () {
            // call login from service
            AuthService.register(rc.registerForm.username, rc.registerForm.password)
                // handle success
                .then(function (a, b, c) {
                    $state.go('albums');
                    rc.disabled = false;
                    rc.registerForm = {};
                })
                // handle error
                .catch(function (d, e, f) {
                    rc.error = true;
                    rc.errorMessage = 'Invalid username and/or password';
                    rc.disabled = false;
                    rc.registerForm = {};
                });
        };
    }];

albumBuilder.controller(controllers);