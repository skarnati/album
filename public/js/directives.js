var albumBuilder = angular.module('AlbumBuilder');
albumBuilder.directive('carouselControls', function() {
  return {
    restrict: 'A',
    controller: ['$scope', '$element', '$attrs','$state', '$stateParams', function (scope, element, attrs, $state, $stateParams) {
      scope.goNext = function() {
        if(element.isolateScope().slides.length === element.isolateScope().active+1) {
            element.isolateScope().active = 0;    
        }
        else {
            element.isolateScope().active = element.isolateScope().active+1;
        }
        $state.transitionTo('photos', {albumId:$stateParams.albumId, show:$stateParams.show, slide: element.isolateScope().active+1}, { notify: false });
      };
      scope.goPrev = function() {
        if(element.isolateScope().active === 0) {
            element.isolateScope().active = element.isolateScope().slides.length-1;
        }
        else {
            element.isolateScope().active = element.isolateScope().active-1;
        }
        $state.transitionTo('photos', {albumId:$stateParams.albumId, show:$stateParams.show, slide: element.isolateScope().active+1}, { notify: false });
      };
    }]
  };
});