'use strict';

angular.module('vnbidding.github.ioApp')
  .controller('UserCtrl', function ($scope, auth, $rootScope, safeApply, angularFireCollection) {

    //Login function
    $scope.login = function (provider, data) {
      auth.login(provider, data)
    };

    //Logout function
    $scope.logout = function () {
      auth.logout();
      safeApply($scope);
    };

    //Bid function
    $scope.bid = function() {
      var price = $scope.item.price
        , name = $scope.item.name;

      $scope.bids.add({
        user: $scope.user.username,
        price: price,
        name: name
      })

    };
  });
