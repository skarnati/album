var albumBuilder = angular.module('AlbumBuilder');
albumBuilder.filter('isSameUser', ['$cookies', function ($cookies) {
    return function (user) {
        if (user === $cookies.get('username')) return 'you';
        return user;
    };
}]);