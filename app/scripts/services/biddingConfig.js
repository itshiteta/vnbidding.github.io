'use strict';

angular.module('vnbidding.github.ioApp')
  .factory('biddingConfig', function (safeApply) {
    var config = {
        refUrls: {
          clockSkew: 'https://bidding.firebaseio.com/.info/serverTimeOffset',
          auctions: 'https://bidding.firebaseio.com/auctions',
          users: 'https://bidding.firebaseio.com/users',
          products: 'https://bidding.firebaseio.com/products'
        },
        serverValues: {}
      }
      , clock = new Firebase(config.refUrls.clockSkew);

    clock.on('value', function (snapshot) {
      var offset = snapshot.val();
      config.serverValues.timeOffset = offset;
      safeApply();
    });


    return config;
  });
