'use strict'; 

/* exported ModelModule */
/* The above comment disables the JSHint warning of ModelModule being defined but not used. */

var ModelModule = (function() {
  var AbstractModel = function() {
    this.listeners = [];
  };


  _.extend(AbstractModel.prototype, {
    addListener: function(listener) {
      this.listeners.push(listener);
    },

    removeListener: function(listener) {
      var index = this.listeners.indexOf(listener);
      if (index > -1){
          this.listeners.splice(index,1);
      }
    },

    notify: function() {
      _.each(this.listeners, function(listener) {
          listener.update();
      });
    },

    update: function() {

    }
  });



  var BuildingModel = function(name, id, code, coord, alt) {
    AbstractModel.apply(this, arguments);
    this.name = name;
    this.id = id;
    this.code = code;
    this.coord = coord;
    this.marker = null;
    this.alt = alt;
  };

  _.extend(BuildingModel.prototype, AbstractModel.prototype, {

  });




  var BuildingListModel = function() {
    AbstractModel.apply(this, arguments);
    this.buildingModels = [];
  };

  _.extend(BuildingListModel.prototype, AbstractModel.prototype, {

    getBuildingModels: function(){
      return this.buildingModels;
    }

  });

  return {
    BuildingModel: BuildingModel,
    BuildingListModel: BuildingListModel
  };
})();