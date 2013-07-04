'use strict';

angular.module('vnbidding.github.ioApp')
  .controller('MainCtrl', function ($scope, auth, models, Collection) {


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

    $scope.setToHours = function (ms) {
      var hours = ~~(ms / (1000 * 60 * 60))
        , date = new Date(ms)
        , min = date.getMinutes()
        , second = date.getSeconds();

      if(hours < 0) {
        return 'deal done';
      }

      min = min < 10 ? ('0' + min) : min;
      second = second < 10 ? ('0' + second) : second;

      return [hours,min,second].join(':');
    };

    $scope.checkDone = function (auction) {
      return auction.isDone();
    };

  });
