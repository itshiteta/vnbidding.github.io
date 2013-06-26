'use strict';

angular.module('vnbidding.github.ioApp')
  .controller('MainCtrl', function ($scope, auth, $rootScope, safeApply, angularFireCollection) {
    $scope.bids = angularFireCollection('https://bidding.firebaseio.com/bids');

    $rootScope.$on("login", function(event, user) {
      $scope.user = user;
      safeApply($scope);
    });
  });
