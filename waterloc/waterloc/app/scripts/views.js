'use strict';

/* exported ViewModule */
/* The above comment disables the JSHint warning of ViewModule being defined but not used. */

var ViewModule = (function(BuildingModel) {

  var AbstractView = function(model) {
    this.model = model;
    if (model !== null) { this.model.addListener(this); }
  };

  _.extend(AbstractView.prototype, {
    init: function() {

    }, 

    update: function() {
      var val = $('.search').val().toLowerCase();
      _.each(this.model.buildingModels, function(bm){
        var matchesAlternateName = false;
        _.each(bm.alt, function(a){
            if (a.toLowerCase().indexOf(val) >= 0){
              matchesAlternateName = true;
            }
        });
          if (bm.code.toLowerCase().indexOf(val) < 0 && 
              bm.name.toLowerCase().indexOf(val) < 0 &&
              !matchesAlternateName &&
              val !== ''){
            $('#'+bm.id).hide();
          } else {
            $('#'+bm.id).show();
          }
      });
    },


  });

  var BuildingListView = function(model, UWaterlooService, mapView) {
    AbstractView.apply(this, arguments); 
    this.UWaterlooService = UWaterlooService;
    this.mapView = mapView;
    this.init();
  };

  _.extend(BuildingListView.prototype, AbstractView.prototype, {
    init: function() {
      var buildings;
      var self = this;

      this.searchBar = $(document.createElement('input')).attr({type:'text', value:'Search buildings'}).addClass('search form-control');
      this.searchList = $(document.createElement('div')).addClass('searchList form-control').hide();
      this.view = $(document.createElement('div')).addClass('view');
      this.clear = $(document.createElement('button')).attr({type:'button'}).addClass('clearall mybutton btn btn-default btn-xs').hide();
      this.select = $(document.createElement('button')).attr({type:'button'}).addClass('selectall mybutton btn btn-default btn-xs').hide();

      this.view.append(this.searchBar);
      this.view.append(this.searchList);
      this.view.append(this.select.html('Select all buildings'));
      this.view.append(this.clear.html('Clear all selected buildings'));

      $('#container').append(this.view);
      this.UWaterlooService.queryBuildings()
      .then(function(query) {
        buildings = query;
        _.each(buildings, function(b){
          var altNames = b.alternate_names;
          if (b.building_parent === 'CLN') {
            altNames.push('CLN');
            altNames.push('CLV');
          }
          if (b.building_parent === 'UWP') {
            altNames.push('UWP');
          }
          var bm = new BuildingModel(b.building_name,b.building_id,b.building_code,[b.latitude,b.longitude],altNames);
          self.model.buildingModels.push(bm); 
        });
        _.each(self.model.buildingModels, function(bm){
          var outerdiv = $(document.createElement('div')).attr({id:bm.id}).addClass('outerdiv');
          var innerdiv = $(document.createElement('div')).addClass('innerdiv');
          var label = $(document.createElement('div')).addClass('buildingitem');
          var check = $(document.createElement('input')).attr({type:'checkbox',name:'buildings',value:bm.id}).addClass('cb form-control');
          innerdiv.html(bm.name+' ('+bm.code+')');
          label.append(check);
          outerdiv.append(label).append(innerdiv);
          self.searchList.append(outerdiv);
          check.change(function(event){
            if (check.is(':checked')){
              $(this).parent().parent().addClass('checkt');
            } else {
              $(this).parent().parent().removeClass('checkt');
            }
            self.checkit($(this),event,true,false);
          });
          outerdiv.mousedown(function(event){
            self.checkit(check,event,false,false);
          });
        });
      })
      .fail(function() {
          console.log('something bad happened.' );
      });

    },

    checkit: function(check,event,override,clear){
      var self = this;
      var val;
      var ourmodel;
      if (event.target.tagName.toUpperCase() !== 'INPUT' && !clear){
        if(check.is(':checked')){
          check.prop('checked', false);
        } else {
          check.prop('checked', true);
        }
      } 
        if (check.is(':checked') && (event.target.tagName.toUpperCase() !== 'INPUT' || override || clear)){
                check.parent().parent().addClass('checkt');
                val = check.val();
                ourmodel = _.find(self.model.buildingModels, function(b){
                  return b.id === val;
                });
                var myLatlng = new google.maps.LatLng(ourmodel.coord[0],ourmodel.coord[1]);
                ourmodel.marker = new google.maps.Marker({
                    position: myLatlng,
                    map: self.mapView.map
                });
        } else if (event.target.tagName.toUpperCase() !== 'INPUT' || override || clear) {
                check.parent().parent().removeClass('checkt');
                val = check.val();
                ourmodel = _.find(self.model.buildingModels, function(b){
                  return b.id === val;
                });
                ourmodel.marker.setMap(null);
        } 
    }

  });

  var MapView = function(model, UWaterlooService) {
    AbstractView.apply(this, arguments);
    this.UWaterlooService = UWaterlooService;
    this.map = null;
    this.mapOptions = null;
    this.init();
  };

  _.extend(MapView.prototype, AbstractView.prototype, {
    init: function() {
      this.mapOptions = {
          center : new google.maps.LatLng(43.472761,-80.542164), 
          zoom: 15
      };
      this.map = new google.maps.Map(document.getElementById('container'), this.mapOptions);
    }
  });

  return {
    BuildingListView: BuildingListView,
    MapView: MapView
  };
})(ModelModule.BuildingModel);
