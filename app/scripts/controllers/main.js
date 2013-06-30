'use strict';

angular.module('vnbidding.github.ioApp')
  .controller('MainCtrl', function ($scope, auth, models) {

  

    $scope.auctions = models.Auction.get();


    $scope.createAuction = function () {
      var auction = new models.Auction($scope.newAuction);
      auction.create();
      $scope.newAuction = null;
      $scope.page = 0;
    };

    $scope.serverValues = models.config.serverValues;

    $scope.nextPage = function () {
      $scope.page++;
    };

    $scope.goBack = function () {
      $scope.page--;
      if ($scope.page < 0) {
        $scope.page = 0;
      }
    };

  });
