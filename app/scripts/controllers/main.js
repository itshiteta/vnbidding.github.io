'use strict';

angular.module('vnbidding.github.ioApp')
  .controller('MainCtrl', function ($scope, auth, models) {

    /*var bidsUrl = 'https://bidding.firebaseio.com/bids';

    //Get top 10 bids
    $scope.bids = angularFireCollection(new Firebase(bidsUrl).limit(5));

    //Get current auction
    $scope.auction = {
      id: 1,
      name: 'HTC One X+',
      image: 'http://images.anandtech.com/doci/6348/HTC%20One%20X%20Global%20Front%20and%20Back2_575px.jpg',
      description: 'Đấu giá điện thoại của NguyenNB',
      topPrice: 1000,
      startTime: new Date(2013, 6, 26).getTime(),
      endTime: new Date(2013, 7, 1).getTime()
    };

    $scope.price = Math.floor(Math.random() * 1500);

    //Action bid
    $scope.bid = function () {

      var user = {userId: $rootScope.user.id, name: $rootScope.user.name, username: $rootScope.user.username},
        price = $scope.price,
        auctionId = $scope.auction.id;

      //Add bid to Firebase
      var item = $scope.bids.add({
        user: user,
        auction: {auctionId: auctionId},
        bidPrice: price,
        bidTime: Firebase.ServerValue.TIMESTAMP,
        ".priority": price * -1
      });


    };*/

    $scope.auctions = models.Auction.get();


    $scope.createAuction = function () {
      var auction = new models.Auction($scope.newAuction);
      auction.create();
      $scope.newAuction = null;
    };


  });
