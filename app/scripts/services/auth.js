'use strict';

angular.module('vnbidding.github.ioApp')
  .factory('auth', function ($rootScope, safeApply) {
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


    //Bid login auth
    $rootScope.$on("login", function (event, user) {
      $rootScope.user = user;
      if(user.provider == 'password') {
        user.username = user.name = user.email;
      }
      safeApply($rootScope);
    });

    $rootScope.$on("logout", function(event) {
      delete $rootScope.user;
      safeApply($rootScope);
    });

    return $rootScope.auth = {
      login: function (provider, data) {
        auth.login(provider, data);
      },
      logout: function() {
        auth.logout();
      },
      loginError: function(error) {
        alert(error);
      }
    }
  });
