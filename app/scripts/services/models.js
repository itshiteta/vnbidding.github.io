'use strict';

angular.module('vnbidding.github.ioApp')
  .factory('models', function (angularFire, angularFireCollection, safeApply, $timeout, Collection, $rootScope) {
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

    var Auctions = Collection(config.refUrls.auctions, Auction);

    function findByRef(ref, collectionRef) {
      return _.find(collectionRef, function (item) {
        return item.$id == ref.name()
      });
    }

    function Auction(auction) {
      _.extend(this, auction);
    }

    Auction.prototype = {
      toObject: function () {
        var copy = {};

        angular.forEach(this, function (value, key) {
          if (key.indexOf("$") !== 0 && key !=='.priority' && value._collection) {
            copy[key] = value;
          }
        });

        // remove all method from prototype
        return angular.fromJson(angular.toJson(copy));
      },
      _getBidCollection: function () {
        return Collection(config.refUrls.auctions + '/' + this.$id + '/bids');
      },
      addBid: function (bid) {
        var bids = this._getBidCollection();
        return bids.add(bid);
      },

      getBids: function () {
        var bids = this._getBidCollection();
        return bids._collection;
      },

      create: function () {
        var auction = this
          , product = auction.product;

        if (!product) {
          throw 'Product should not be NULL';
        }

        auction.currentPrice = auction.initPrice;
        auction.currentBidder = $rootScope.user.name;
        auction.endTime = new Date(auction.endTime).getTime();
        if (auction.startTime) {
          auction.startTime = new Date(auction.startTime).getTime();
        }

        Auctions
          .add(auction, {createdTime: 'TIMESTAMP'})
          .then(function (data) {
            if (!auction.startTime) {
              auction.startTime = auction.createdTime;
            }

            data.ref.setWithPriority(auction.toObject(), auction.createdTime * -1);
          });

        ProductRef.add(product);
      },

      bid: function (inc) {
        var auction = this
          , bidData;

        if (!inc) {
          inc = auction.minStep;
        }

        //auction.currentPrice += inc;
        //auction.currentBidder = $rootScope.user.name;

        bidData = {
          inc: inc,
          //price: auction.currentPrice,
          createdTime: Date.now() + (config.serverValues.timeOffset),
          user: {
            id: $rootScope.user.id,
            username: $rootScope.user.username,
            name: $rootScope.user.name
          }
        };

        auction.addBid(bidData);
        //Auctions.update(auction.$id);
      },

      getCurrentPrice: function () {
        var bids = this.bids;

        return _.reduce(bids, function (sum, bid) {
          return sum += bid.inc;
        }, 0) + this.initPrice;

      },

      getTopBidder: function () {
        var bids = this.bids
          , top = _.sortBy(bids, function (bid) {
            return bid.createdTime * -1;
          });

        if(top[0]) {
          return top[0].user;
        }
        return {};
      },

      getTimeLeft: function () {
        var timestamp = Date.now() + (config.serverValues.timeOffset)
          , endTime = this.endTime
          , diff = endTime - timestamp
          , date = new Date(diff)
          , hours = ~~(diff / (1000 * 60 * 60))
          , min = date.getMinutes()
          , second = date.getSeconds();

        if (diff < 15000) {
          return 'Đã xong';
        }

        if (diff < 0) {
          return 'Vửa xong';
        }

        if (hours > 36) {
          setTimeout(safeApply, 60 * 60 * 1000); // 1 tiếng update 1 lần
          return ~~(hours / 24) + ' ngày';
        }

        if (hours > 1) {
          setTimeout(safeApply, 60 * 1000); // 1 phút update 1 lần
          return hours + ' tiếng';
        }

        if (min >= 10) {
          setTimeout(safeApply, 1000); // 30 giây update 1 lần
          return '0:' + min + ':' + second;
        }

        second = second < 10 ? ('0' + second) : second;
        setTimeout(safeApply, 1000); // 1 giây update 1 lần
        return '0:0' + min + ':' + second;

      },
      isDone: function () {
        var timestamp = Date.now() + (config.serverValues.timeOffset)
          , endTime = this.endTime;

        return endTime < timestamp;
      }
    };

    Auction.get = function () {
      return Auctions;
    };

    var clock = new Firebase(config.refUrls.clockSkew);
    clock.on('value', function (snapshot) {
      var offset = snapshot.val();
      config.serverValues.timeOffset = offset;
      safeApply();
    });


    return  {
      config: config,
      Auction: Auction
    }
  });
