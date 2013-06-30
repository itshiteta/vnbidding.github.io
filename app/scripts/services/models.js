'use strict';

angular.module('vnbidding.github.ioApp')
  .factory('models', function (angularFire, angularFireCollection, safeApply, $timeout) {
    var config = {
        refUrls: {
          clockSkew: 'https://bidding.firebaseio.com/.info/serverTimeOffset',
          auctions: 'https://bidding.firebaseio.com/auctions',
          users: 'https://bidding.firebaseio.com/users',
          products: 'https://bidding.firebaseio.com/products'
        },
        serverValues: {}
      }
      , AuctionRef = angularFireCollection(new Firebase(config.refUrls.auctions))
      , UserRef = angularFireCollection(new Firebase(config.refUrls.users))
      , ProductRef = angularFireCollection(new Firebase(config.refUrls.products));

    function findByRef(ref, collectionRef) {
      return _.find(collectionRef, function (item) {
        return item.$id == ref.name()
      });
    }

    function Auction(auction) {
      _.extend(this, auction);
    }

    Auction.prototype = {
      create: function () {
        var auction = this
          , product = auction.product;

        if (!product) {
          throw 'Product should not be NULL';
        }

        auction.createdTime = Firebase.ServerValue.TIMESTAMP;
        auction.endTime = new Date(auction.endTime).getTime();
        if(auction.startTime) {
          auction.startTime = new Date(auction.startTime).getTime();
        }

        var aRef = AuctionRef.add(auction, function () {
          aRef.once('value', function (snapshot) {
            var item = snapshot.val();

            aRef.setPriority(item.createdTime * (-1));
          });

          safeApply();
        });
        ProductRef.add(product);
      }
    };

    Auction.get = function () {
      return AuctionRef;
    };

    var clock = new Firebase(config.refUrls.clockSkew);
    clock.on('value', function (snapshot) {
      var offset = snapshot.val();
      config.serverValues.timeOffset = offset;
      safeApply();
    });

    function checkClock() {
      config.serverValues.timestamp = Date.now() + (config.serverValues.timeOffset);
      safeApply();
      $timeout(checkClock, 1000);
    }

    checkClock();


    return  {
      config: config,
      Auction: Auction
    }
  });
