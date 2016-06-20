'use strict';

(function(Models, Views, Services) {
  $(document).ready(function() {

  	var service = new Services.UWaterlooService();
  	var BLModel = new ModelModule.BuildingListModel();
  	var mapView = new ViewModule.MapView(null,service);
  	var BLView = new ViewModule.BuildingListView(BLModel,service, mapView);

  	$('.search').focus(function(event){
  		event.stopPropagation();
  		if ($('.search').val() === 'Search buildings'){
  			$('.search').val('');
  		}
  		$('.searchList').show();
      $('.mybutton').show();
  	});
  	$('.searchList').mousedown(function(event){
		  event.stopPropagation();
  	});
  	$('#container').mousedown(function(){
  		if ($('.search').val() === ''){
  			$('.search').val('Search buildings');
  		}
  		$('.searchList').hide();
      $('.mybutton').hide();
  	});
  	$('.search').keyup(function(event){
  		event.stopPropagation();
  		BLModel.notify();
  	});
    $('.clearall').mousedown(function(event){
      event.stopPropagation();
      $('.searchList').show();
      $('.mybutton').show();
      _.each(BLModel.buildingModels, function(bm){
        var check = $('#'+bm.id).find(':checkbox');
        if (check.is(':checked')){
          check.prop('checked', false);
          BLView.checkit(check,event,false,true);
        }
      });
    });

    $('.selectall').mousedown(function(event){
      event.stopPropagation();
      $('.searchList').show();
      $('.mybutton').show();
      _.each(BLModel.buildingModels, function(bm){
        var check = $('#'+bm.id).find(':checkbox');
        if (!check.is(':checked')){
          check.prop('checked', true);
          BLView.checkit(check,event,false,true);
        }
      });
    });

  });
})(ModelModule, ViewModule, ServiceModule);
