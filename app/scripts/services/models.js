'use strict';

angular.module('vnbidding.github.ioApp')
  .factory('models', function (safeApply, biddingConfig, Collection, $rootScope) {
    var Auctions = Collection(biddingConfig.refUrls.auctions, Auction)
      , Products = Collection(biddingConfig.refUrls.products);



    function Auction(auction) {
      _.extend(this, auction);
    }

    Auction.prototype = {
      toObject: function () {
        var copy = {};

        angular.forEach(this, function (value, key) {
          if (key.indexOf("$") !== 0 && key !=='.priority' && !value._collection) {
            copy[key] = value;
          }
        });

        // remove all method from prototype
        return angular.fromJson(angular.toJson(copy));
      },
      _getBidCollection: function () {
        return Collection(biddingConfig.refUrls.auctions + '/' + this.$id + '/bids');
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

        auction.endTime = new Date(auction.endTime).getTime();
        auction.creator = {
          id: $rootScope.user.id,
          email: $rootScope.user.email,
          username: $rootScope.user.username
        };
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

        Products.add(product);
      },

      bid: function (inc) {
        var auction = this
          , bidData;

        if (!inc) {
          inc = auction.minStep;
        }

        bidData = {
          inc: inc,
          //price: auction.currentPrice,
          createdTime: Date.now() + (biddingConfig.serverValues.timeOffset),
          user: {
            id: $rootScope.user.id,
            username: $rootScope.user.username,
            name: $rootScope.user.name
          }
        };

        auction.addBid(bidData);
      },

      getCurrentPrice: function () {
        var bids = this.getBids();

        return _.reduce(bids, function (sum, bid) {
          return sum += bid.inc;
        }, 0) + this.initPrice;

      },

      getTopBidder: function () {
        var bids =  this.getBids()
          , top = _.sortBy(bids, function (bid) {
            return bid.createdTime * -1;
          });

        if(top[0]) {
          return top[0].user;
        }
        return {};
      },

      getTimeLeft: function () {
        var timestamp = Date.now() + (biddingConfig.serverValues.timeOffset)
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
        var timestamp = Date.now() + (biddingConfig.serverValues.timeOffset)
          , endTime = this.endTime;

        return endTime < timestamp;
      }
    };

    Auction.get = function () {
      return Auctions;
    };



    return  {
      Auction: Auction
    }
  });
