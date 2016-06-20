'use strict'; 

/* exported ServiceModule */
/* The above comment disables the JSHint warning of ServiceModule being defined but not used. */

var ServiceModule = (function() {

  var UWaterlooService = function() {
    this.key = 'ac2001d34fa22cc26aff9feaf8e50628';
    this.urlPrefix = 'https://api.uwaterloo.ca/v2';
    this.waterlooLatsq = [43.49250,43.45538];
    this.waterlooLngsq = [-80.58796,-80.51105];
  };


  _.extend(UWaterlooService.prototype, {
    queryBuildings: function() {
        var deferred = Q.defer();
        var self = this;
        $.get(this.urlPrefix+'/buildings/list.json?key='+this.key)
        .success(function(response) {
            response.data = _.filter(response.data, function(r){
              var lat = r.latitude;
              var lng = r.longitude;
              return ((lat < self.waterlooLatsq[0] && lat > self.waterlooLatsq[1]) &&
                     (lng > self.waterlooLngsq[0] && lng < self.waterlooLngsq[1]) &&
                     (lat !== null && lng !== null));
            });
            deferred.resolve(response.data);
        })
        .fail(function() {
            deferred.reject();
        });
        return deferred.promise;
    },

    getBuilding: function(buildingCode) {
      var deferred = Q.defer();
      $.get(this.urlPrefix+'/buildings/'+buildingCode+'.json?key='+this.key)
      .success(function(response) {
          deferred.resolve(response.data);
      })
      .fail(function() {
          deferred.reject();
      });
      return deferred.promise;
    }
  });


  return {
    UWaterlooService: UWaterlooService,
  };

})();




