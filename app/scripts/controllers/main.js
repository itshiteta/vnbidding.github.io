'use strict';

angular.module('vnbidding.github.ioApp')
  .controller('MainCtrl', function ($scope, auth, models) {

    $scope.auctions = models.Auction.get();

    var connectedRef = new Firebase("https://bidding.firebaseio.com/.info/serverTimeOffset");
    connectedRef.on("value", function (snap) {
      // The value may be null if the client is still connecting.
      var offset = snap.val() || 0;
      $scope.estimatedServerTimeMs = new Date().getTime() + offset;
    });


    $scope.createAuction = function () {
      var auction = new models.Auction($scope.newAuction);
      auction.create();
      $scope.newAuction = null;
    };


  });
