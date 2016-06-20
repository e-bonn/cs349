"use strict";var ModelModule=function(){var a=function(){this.listeners=[]};_.extend(a.prototype,{addListener:function(a){this.listeners.push(a)},removeListener:function(a){var b=this.listeners.indexOf(a);b>-1&&this.listeners.splice(b,1)},notify:function(){_.each(this.listeners,function(a){a.update()})},update:function(){}});var b=function(b,c,d,e,f){a.apply(this,arguments),this.name=b,this.id=c,this.code=d,this.coord=e,this.marker=null,this.alt=f};_.extend(b.prototype,a.prototype,{});var c=function(){a.apply(this,arguments),this.buildingModels=[]};return _.extend(c.prototype,a.prototype,{getBuildingModels:function(){return this.buildingModels}}),{BuildingModel:b,BuildingListModel:c}}(),ServiceModule=function(){var a=function(){this.key="ac2001d34fa22cc26aff9feaf8e50628",this.urlPrefix="https://api.uwaterloo.ca/v2",this.waterlooLatsq=[43.4925,43.45538],this.waterlooLngsq=[-80.58796,-80.51105]};return _.extend(a.prototype,{queryBuildings:function(){var a=Q.defer(),b=this;return $.get(this.urlPrefix+"/buildings/list.json?key="+this.key).success(function(c){c.data=_.filter(c.data,function(a){var c=a.latitude,d=a.longitude;return c<b.waterlooLatsq[0]&&c>b.waterlooLatsq[1]&&d>b.waterlooLngsq[0]&&d<b.waterlooLngsq[1]&&null!==c&&null!==d}),a.resolve(c.data)}).fail(function(){a.reject()}),a.promise},getBuilding:function(a){var b=Q.defer();return $.get(this.urlPrefix+"/buildings/"+a+".json?key="+this.key).success(function(a){b.resolve(a.data)}).fail(function(){b.reject()}),b.promise}}),{UWaterlooService:a}}(),ViewModule=function(a){var b=function(a){this.model=a,null!==a&&this.model.addListener(this)};_.extend(b.prototype,{init:function(){},update:function(){var a=$(".search").val().toLowerCase();_.each(this.model.buildingModels,function(b){var c=!1;_.each(b.alt,function(b){b.toLowerCase().indexOf(a)>=0&&(c=!0)}),b.code.toLowerCase().indexOf(a)<0&&b.name.toLowerCase().indexOf(a)<0&&!c&&""!==a?$("#"+b.id).hide():$("#"+b.id).show()})}});var c=function(a,c,d){b.apply(this,arguments),this.UWaterlooService=c,this.mapView=d,this.init()};_.extend(c.prototype,b.prototype,{init:function(){var b,c=this;this.searchBar=$(document.createElement("input")).attr({type:"text",value:"Search buildings"}).addClass("search form-control"),this.searchList=$(document.createElement("div")).addClass("searchList form-control").hide(),this.view=$(document.createElement("div")).addClass("view"),this.clear=$(document.createElement("button")).attr({type:"button"}).addClass("clearall mybutton btn btn-default btn-xs").hide(),this.select=$(document.createElement("button")).attr({type:"button"}).addClass("selectall mybutton btn btn-default btn-xs").hide(),this.view.append(this.searchBar),this.view.append(this.searchList),this.view.append(this.select.html("Select all buildings")),this.view.append(this.clear.html("Clear all selected buildings")),$("#container").append(this.view),this.UWaterlooService.queryBuildings().then(function(d){b=d,_.each(b,function(b){var d=b.alternate_names;"CLN"===b.building_parent&&(d.push("CLN"),d.push("CLV")),"UWP"===b.building_parent&&d.push("UWP");var e=new a(b.building_name,b.building_id,b.building_code,[b.latitude,b.longitude],d);c.model.buildingModels.push(e)}),_.each(c.model.buildingModels,function(a){var b=$(document.createElement("div")).attr({id:a.id}).addClass("outerdiv"),d=$(document.createElement("div")).addClass("innerdiv"),e=$(document.createElement("div")).addClass("buildingitem"),f=$(document.createElement("input")).attr({type:"checkbox",name:"buildings",value:a.id}).addClass("cb form-control");d.html(a.name+" ("+a.code+")"),e.append(f),b.append(e).append(d),c.searchList.append(b),f.change(function(a){f.is(":checked")?$(this).parent().parent().addClass("checkt"):$(this).parent().parent().removeClass("checkt"),c.checkit($(this),a,!0,!1)}),b.mousedown(function(a){c.checkit(f,a,!1,!1)})})}).fail(function(){console.log("something bad happened.")})},checkit:function(a,b,c,d){var e,f,g=this;if("INPUT"===b.target.tagName.toUpperCase()||d||(a.is(":checked")?a.prop("checked",!1):a.prop("checked",!0)),a.is(":checked")&&("INPUT"!==b.target.tagName.toUpperCase()||c||d)){a.parent().parent().addClass("checkt"),e=a.val(),f=_.find(g.model.buildingModels,function(a){return a.id===e});var h=new google.maps.LatLng(f.coord[0],f.coord[1]);f.marker=new google.maps.Marker({position:h,map:g.mapView.map})}else("INPUT"!==b.target.tagName.toUpperCase()||c||d)&&(a.parent().parent().removeClass("checkt"),e=a.val(),f=_.find(g.model.buildingModels,function(a){return a.id===e}),f.marker.setMap(null))}});var d=function(a,c){b.apply(this,arguments),this.UWaterlooService=c,this.map=null,this.mapOptions=null,this.init()};return _.extend(d.prototype,b.prototype,{init:function(){this.mapOptions={center:new google.maps.LatLng(43.472761,-80.542164),zoom:15},this.map=new google.maps.Map(document.getElementById("container"),this.mapOptions)}}),{BuildingListView:c,MapView:d}}(ModelModule.BuildingModel);!function(a,b,c){$(document).ready(function(){var a=new c.UWaterlooService,b=new ModelModule.BuildingListModel,d=new ViewModule.MapView(null,a),e=new ViewModule.BuildingListView(b,a,d);$(".search").focus(function(a){a.stopPropagation(),"Search buildings"===$(".search").val()&&$(".search").val(""),$(".searchList").show(),$(".mybutton").show()}),$(".searchList").mousedown(function(a){a.stopPropagation()}),$("#container").mousedown(function(){""===$(".search").val()&&$(".search").val("Search buildings"),$(".searchList").hide(),$(".mybutton").hide()}),$(".search").keyup(function(a){a.stopPropagation(),b.notify()}),$(".clearall").mousedown(function(a){a.stopPropagation(),$(".searchList").show(),$(".mybutton").show(),_.each(b.buildingModels,function(b){var c=$("#"+b.id).find(":checkbox");c.is(":checked")&&(c.prop("checked",!1),e.checkit(c,a,!1,!0))})}),$(".selectall").mousedown(function(a){a.stopPropagation(),$(".searchList").show(),$(".mybutton").show(),_.each(b.buildingModels,function(b){var c=$("#"+b.id).find(":checkbox");c.is(":checked")||(c.prop("checked",!0),e.checkit(c,a,!1,!0))})})})}(ModelModule,ViewModule,ServiceModule);