'use strict';

angular.module('vnbidding.github.ioApp')
  .controller('MainCtrl', function ($scope, auth, models) {

  

    $scope.auctions = models.Auction.get();

    $scope.done = function () {
      return _.filter($scope.auctions, $scope.checkDone);
    };

    $scope.ongoing = function () {
      return _.reject($scope.auctions, $scope.checkDone);
    };



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

      return 'Còn lại: ' + [hours,min,second].join(':');
    };

    $scope.timeLeftString = function (auction) {
      var serverTimestamp = models.config.serverValues.timestamp
        , endTime = auction.endTime
        , diff = endTime - serverTimestamp
        , hours = ~~(diff / (1000 * 60 * 60))
        , date = new Date(diff)
        , min = date.getMinutes()
        , second = date.getSeconds();

      if(hours < 0) {
        return 'deal done';
      }

      min = min < 10 ? ('0' + min) : min;
      second = second < 10 ? ('0' + second) : second;

      return 'Còn lại: ' + [hours,min,second].join(':');
    };

    $scope.checkDone = function (auction) {
      console.log(auction.endTime);
      var serverTimestamp = models.config.serverValues.timestamp
        , endTime = auction.endTime;

      return endTime < serverTimestamp;
    };

  });
