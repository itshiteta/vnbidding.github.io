'use strict';

angular.module('vnbidding.github.ioApp')
  .controller('UserCtrl', function ($scope, auth, $rootScope) {
    $scope.login = function (provider, data) {
      auth.login(provider, data)
    };

    $rootScope.$on("login", function(event, user) {
      $scope.user = user;
      $scope.$apply();
    })
  });
