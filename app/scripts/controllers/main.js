'use strict';

angular.module('vnbidding.github.ioApp')
  .controller('MainCtrl', function ($scope, auth, models) {


    $scope.auctions = models.Auction.get();

    $scope.done = function () {
      return _.filter($scope.auctions.all(), $scope.checkDone);
    };

    $scope.ongoing = function () {
      return _.reject($scope.auctions.all(), $scope.checkDone);
    };



    $scope.createAuction = function () {
      var auction = new models.Auction($scope.newAuction);
      auction.create();
      $scope.newAuction = null;
      $scope.page = 0;
    };

    $scope.nextPage = function () {
      $scope.page++;
    };

    $scope.goBack = function () {
      $scope.page--;
      if ($scope.page < 0) {
        $scope.page = 0;
      }
    };


    $scope.checkDone = function (auction) {
      return auction.isDone();
    };

  });
