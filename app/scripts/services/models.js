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

    var Auctions = new Collection(config.refUrls.auctions, Auction);

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
          if (key.indexOf("$") !== 0) {
            copy[key] = value;
          }
        });

        // remove all method from prototype
        return angular.fromJson(angular.toJson(copy));
      },
      create: function () {
        var auction = this
          , product = auction.product;

        if (!product) {
          throw 'Product should not be NULL';
        }

        auction.currentPrice = auction.initPrice;
        auction.currentBidder = $rootScope.user.name;
        auction.$bids = new Collection(config.refUrls.auctions + '/' + auction.$id + '/bids');
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

        auction.currentPrice += inc;
        auction.currentBidder = $rootScope.user.name;

        bidData = {
          price: auction.currentPrice,
          createTime: Date.now() + (config.serverValues.timeOffset),
          user: {
            id: $rootScope.user.id,
            username: $rootScope.user.username,
            name: $rootScope.user.name
          }
        };

        auction.$ref.child('bids')
          .push(bidData)
          .setPriority(auction.currentPrice * -1);

        Auctions.update(auction.$id);
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
          return '00:' + min + ':' + second;
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
  })


  .factory('Collection', function ($timeout, $q) {
    function Collection(ref, model) {
      var collection = this;
      this._collection = [];
      this._ctor = model;

      if (typeof ref == "string") {
        ref = new Firebase(ref);
      }

      this._ref = ref;

      function sort() {
        var sorted = _.sortBy(collection._collection, function (model) {
          return model['.priority'];
        });
        collection._collection = sorted;
      }

      function findById(id) {
        return _.find(collection._collection, function (model) {
          return model.$id == id;
        });
      }

      this.findById = findById;

      ref.on('child_added', function (data) {
        $timeout(function () {

          var item = data.val()
            , priority = data.getPriority()
            , id = data.name()
            , ref = data.ref();

          var model = findById(id);
          if (!model) {
            model = new collection._ctor(item);
            collection._collection.push(model);
          }

          model['.priority'] = priority;
          model.$id = id;
          model.$ref = ref;


          sort();
        });
      });

      ref.on('child_changed', function (data) {
        $timeout(function () {

          var id = data.name()
            , priority = data.getPriority()
            , model = findById(id);

//          if(!model) {
//            model = new collection._ctor(item);
//            collection._collection.push(model);
//          }

          _.extend(model, data.val());
          model['.priority'] = priority;
        });
      });

      ref.on('child_moved', function (data) {
        $timeout(function () {
          var id = data.name()
            , priority = data.getPriority()
            , model = findById(id)
            , item = data.val();

//          if(!model) {
//            model = new collection._ctor(item);
//            collection._collection.push(model);
//          }

          model['.priority'] = priority;
          sort();
        });
      });

      ref.on('child_removed', function (data) {
        $timeout(function () {
          var id = data.name()
            , without = _.without(collection._collection, findById(id));
          collection._collection = without;
        })
      });
    }

    Collection.prototype = {
      add: function (model, serverValues, priority) {

        var collectionRef = this._ref
          , collection = this
          , defer = $q.defer()
          , promise = defer.promise;

        if (!isNaN(serverValues)) {
          priority = serverValues;
          serverValues = {};
        }

        var pushing = angular.fromJson(angular.toJson(model));

        angular.forEach(serverValues, function (value, key) {
          pushing[key] = Firebase.ServerValue[value];
        });

        var ref = collectionRef.push(pushing);
        model.$id = ref.name();
        collection._collection.push(model);

        if (!isNaN(priority)) {
          ref.setPriority(priority);
        }

        ref.once('value', function (data) {
          angular.extend(model, data.val());
          defer.resolve({snapshot: data, ref: ref});
        });


        return promise;
      },

      update: function (idOrModel) {
        var id = (typeof idOrModel == 'string') ? idOrModel : idOrModel.$id
          , model = this.findById(id)
          , copy = model.toObject()
          , defer = $q.defer()
          , promise = defer.promise;

        model.$ref.set(copy);
        model.$ref.once('value', function (data) {
          defer.resolve({
            snapshot: data,
            ref: model.$ref
          });
        });

        return promise;
      },

      all: function () {
        return this._collection;
      }
    };


    return Collection;
  });
