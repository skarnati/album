var app = angular.module('AlbumBuilder', ['ui.router', 'ui.bootstrap', 'ngRoute', 'ngCookies']);

app.service('authInterceptor', function ($q) {
  var service = this;
  service.responseError = function (response) {
    if (response.status == 401) {
      window.location = '/#/login';
    }
    return $q.reject(response);
  };
});

app.config(['$stateProvider', '$urlRouterProvider', '$httpProvider', function ($stateProvider, $urlRouterProvider, $httpProvider) {
  $httpProvider.interceptors.push('authInterceptor');
  $urlRouterProvider.otherwise('/albums');

  $stateProvider
    .state('login', {
      url: '/login',
      templateUrl: 'partials/login.html',
      controller: 'loginController',
      controllerAs: 'lc'
    })
    .state('logout', {
      url: '/logout',
      controller: 'logoutController'
    })
    .state('register', {
      url: '/register',
      templateUrl: 'partials/register.html',
      controller: 'registerController',
      controllerAs: 'rc'
    })
    .state('albums', {
      url: '/albums',
      templateUrl: 'partials/albums.html',
      controller: 'albumController',
      controllerAs: 'ac'
    })
    .state('photos', {
      url: '/albums/:albumId/:show/:slide',
      templateUrl: 'partials/photos.html',
      controller: 'photosController',
      controllerAs: 'pc'
    })
}]);

