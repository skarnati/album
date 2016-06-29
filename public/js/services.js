angular.module('AlbumBuilder')
    .service('albumService', ['$http', function ($http) {
        this.getAlbums = function () {
            return $http.get('/albums');
        };
        this.getPhotosInAlbum = function (albumId) {
            return $http.get('/albums/' + albumId);
        };
        this.like = function (photoId, albumId) {
            return $http.post('/albums/' + albumId + '/likes', {
                'photoId': photoId
            });
        };
        this.unlike = function (photoId, albumId) {
            return $http.post('/albums/' + albumId + '/unlike', {
                'photoId': photoId
            });
        };
        this.getLikedPhotos = function (albumId) {
            return $http.get('/albums/' + albumId + '/likes');
        };
    }])
    .service('photosService', ['$http', function ($http) {
        this.allPhotos = [];
    }])
    .factory('AuthService', ['$q', '$timeout', '$http',
        function ($q, $timeout, $http) {
            // return available functions for use in the controllers
            return ({
                login: login,
                logout: logout,
                register: register
            });

            function login(username, password) {
                // create a new instance of deferred
                var deferred = $q.defer();
                // send a post request to the server
                $http.post('/login', {
                    username: username,
                    password: password
                })
                    // handle success
                    .success(function (data, status) {
                        if (status === 200 && data.status) {
                            deferred.resolve();
                        } else {
                            deferred.reject();
                        }
                    })
                    // handle error
                    .error(function (data) {
                        deferred.reject();
                    });
                // return promise object
                return deferred.promise;
            }

            function logout() {
                // create a new instance of deferred
                var deferred = $q.defer();
                // send a get request to the server
                $http.get('/logout')
                    // handle success
                    .success(function (data) {
                        deferred.resolve();
                    })
                    // handle error
                    .error(function (data) {
                        deferred.reject();
                    });
                // return promise object
                return deferred.promise;
            }

            function register(username, password) {
                // create a new instance of deferred
                var deferred = $q.defer();
                // send a post request to the server
                $http.post('/register', {
                    username: username,
                    password: password
                })
                    // handle success
                    .success(function (data, status) {
                        if (status === 200 && data.status) {
                            deferred.resolve();
                        } else {
                            deferred.reject();
                        }
                    })
                    // handle error
                    .error(function (data) {
                        deferred.reject();
                    });
                // return promise object
                return deferred.promise;
            }
        }
    ]);