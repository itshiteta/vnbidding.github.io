'use strict';

angular.module('vnbidding.github.ioApp')
  .factory('Collection', function (safeApply, $q) {
    var cached = {};

    function Collection(ref, model) {
      var collection = this;
      this._collection = [];
      this._ctor = model || function Model(params) {angular.extend(this, params)};

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
        safeApply(function () {

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
        safeApply(function () {

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
        safeApply(function () {
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
        safeApply(function () {
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

        model.$ref.update(copy);
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
      },

      filter: function (fn, reject) {
        if(reject === true) {
          return _.reject(this._collection, fn);
        }

        return _.filter(this._collection, fn);
      }
    };


    return function (url, model) {
      if(cached[url]) {
        return cached[url];
      }

      return cached[url] = new Collection(url, model);
    };
  });