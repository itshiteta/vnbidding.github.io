'use strict';

angular.module('vnbidding.github.ioApp')
  .factory('safeApply', function ($rootScope) {
    return function ($scope, fn) {
      if(angular.isFunction($scope)) {
        fn = $scope;
        $scope = $rootScope;
      }
      $scope = $scope || $rootScope;

      $scope.$debouncedApply = _.debounce(function (fn) {
        if (fn) {
          $scope.$apply(fn);
        } else {
          $scope.$apply();
        }
      }, 0);

      var phase = $scope.$root.$$phase;
      if (phase == '$apply' || phase == '$digest') {
        if (fn) {
          $scope.$eval(fn);
        }
      } else {
        $scope.$debouncedApply(fn);
      }
    }
  });
