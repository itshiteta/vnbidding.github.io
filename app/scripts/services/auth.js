'use strict';

angular.module('vnbidding.github.ioApp')
  .factory('auth', function ($rootScope) {
    var self = this
      , ref = new Firebase("https://bidding.firebaseio.com")
      , auth = new FirebaseAuthClient(ref, function (error, user) {
        if (user) {
          $rootScope.$emit("login", user);
        }
        else if (error) {
          $rootScope.$emit("loginError", error);
        }
        else {
          $rootScope.$emit("logout");
        }
      });
    return {
      login: function (provider, data) {
        auth.login(provider, data);
      },
      logout: function() {
        auth.logout();
      }
    }
  });
