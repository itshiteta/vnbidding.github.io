'use strict';

angular.module('vnbidding.github.ioApp')
  .factory('safeApply', function ($rootScope) {
    return function ($scope, fn) {
      $scope = $scope || $rootScope;
      var phase = $scope.$root.$$phase;
      if (phase == '$apply' || phase == '$digest') {
        if (fn) {
          $scope.$eval(fn);
        }
      } else {
        if (fn) {
          $scope.$apply(fn);
        } else {
          $scope.$apply();
        }
      }
    }
  });
