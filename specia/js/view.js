/***
 * Scaffolded by Jingjie (Vincent) Zheng on June 24, 2015.
 */

'use strict';

/**
 * A function that creates and returns the spaceship model.
 */

 var start;
 var end;
 var prev = [];

function createViewModule() {
  var SpaceshipView = function(model, canvas) {
    /**
     * Obtain the SpaceshipView itself.
     */
    var self = this;

    /**
     * Maintain the model.
     */
    this.model = model;

    /**
     * Maintain the canvas and its context.
     */
    this.canvas = canvas;
    this.context = canvas.getContext('2d');

    /**
     * Update the canvas. 
     * You should be able to do this trivially by first clearing the canvas, then call the rootNode's 
     * renderAll() with the context.
     */
    this.update = function() {
        
      self.context.clearRect(0, 0, self.canvas.width, self.canvas.height);
      this.model.rootNode.renderAll(this.context);

    };

    /**
     * You should add the view as a listener to each node in the scene graph, so that the view can get 
     * updated when the model is changed.
     */
    this.model.rootNode.addListener(this);
    this.model.headNode.addListener(this)
;    this.model.tailNode.addListener(this);
    this.model.bodyNode.addListener(this);
    this.model.spaceshipNode.addListener(this);
    this.model.handleNode.addListener(this);
    this.model.fireNode.addListener(this);
    
    //TODO

    setInterval(function () {
      var dend = new Date();
      end = dend.getTime();
      if ((end-start)>=5000 && self.model.powerup){
        self.model.spaceshipNode.scale(0.5,0.5);
        self.model.speed = 0.5*self.model.speed;
        self.model.powerup = false; 
      }
    }, 50);

    setInterval(function () {
      if (self.model.forward){
        self.model.spaceshipNode.translate(0,-self.model.speed);
        self.model.fireNode.on = true;
        if (self.model.tailNode.currenttheta != 0){
          self.model.spaceshipNode.rotate(-self.model.tailNode.currenttheta/20,0,0);
        }
        var body = [self.model.bodyNode.localBoundingBox.x,self.model.bodyNode.localBoundingBox.y,
                             self.model.bodyNode.localBoundingBox.x+self.model.bodyNode.localBoundingBox.w,
                             self.model.bodyNode.localBoundingBox.y,self.model.bodyNode.localBoundingBox.x,
                             self.model.bodyNode.localBoundingBox.y+self.model.bodyNode.localBoundingBox.h,
                             self.model.bodyNode.localBoundingBox.x+self.model.bodyNode.localBoundingBox.w,
                             self.model.bodyNode.localBoundingBox.y+self.model.bodyNode.localBoundingBox.h];
        var bodytransform = [];
        self.model.bodyNode.globalTransformation.transform(body,0,bodytransform,0,4);
        var exceedx = [];
        var exceedy = [];
        var xs = [];
        var ys = []
        _.each(bodytransform, function (bt, val) {
            if (!(val%2)){
                if (bt > 800){
                  exceedx.push("right");
                } else if (bt < 0) {
                  exceedx.push("left");
                } else {
                  exceedx.push("none");
                }
                xs.push(bt);
            } else if (val%2){
                if (bt > 600){
                  exceedy.push("bottom");
                } else if (bt < 0) {
                  exceedy.push("top");
                } else {
                  exceedy.push("none");
                }
                ys.push(bt);
            }
        });
        var maxx = _.max(xs);
        var maxy = _.max(ys);
        var minx = _.min(xs);
        var miny = _.min(ys);
        var dirx = _.every(exceedx,function(x){
            return (x === exceedx[0]) && (exceedx[0] !== "none");
        });
        var diry = _.every(exceedy,function(y){
            return (y === exceedy[0]) && (exceedy[0] !== "none");
        });
        var ph = [];
        if (dirx){
          if (exceedx[0] === "right"){
            self.model.spaceshipNode.globalTransformation.createInverse().transform([0,0,-canvas.width-(maxx-minx),0],0,ph,0,2);
            self.model.spaceshipNode.translate(ph[2]-ph[0],ph[3]-ph[1]);
          } else if (exceedx[0] === "left"){
            self.model.spaceshipNode.globalTransformation.createInverse().transform([0,0,canvas.width+(maxx-minx),0],0,ph,0,2);
            self.model.spaceshipNode.translate(ph[2]-ph[0],ph[3]-ph[1]); 
          }
        }
        var ph = [];
        if (diry){
          if (exceedy[0] === "top"){
            self.model.spaceshipNode.globalTransformation.createInverse().transform([0,0,0,canvas.height+(maxy-miny)],0,ph,0,2);
            self.model.spaceshipNode.translate(ph[2]-ph[0],ph[3]-ph[1]);
          } else if (exceedy[0] === "bottom"){
            self.model.spaceshipNode.globalTransformation.createInverse().transform([0,0,0,-canvas.height-(maxy-miny)],0,ph,0,2);
            self.model.spaceshipNode.translate(ph[2]-ph[0],ph[3]-ph[1]); 
          }
        }
        self.update();
      }
      if (self.model.right){
        if (self.model.tailNode.currenttheta > -Math.PI/4){
          self.model.tailNode.rotate(-Math.PI/36,0,0);
          self.model.tailNode.currenttheta -= Math.PI/36;
        }
      }
      if (self.model.left){
        if (self.model.tailNode.currenttheta < Math.PI/4){
          self.model.tailNode.rotate(Math.PI/36,0,0);
          self.model.tailNode.currenttheta += Math.PI/36;
        }
      }
      self.context.fillStyle="yellow";
      var lng = 5000-(end-start);
      if (lng < 0 || !self.model.powerup) lng = 0;
      self.update();
      self.context.fillRect(10,10,lng/80,10);
    }, 15);

    /**
     * Handle mousedown events.
     * You should perform a hit detection here by calling the model's performHitDetection().
     */ 
    canvas.addEventListener('mousedown', function(e) {
      var point = [e.offsetX,e.offsetY]; 
      var node = self.model.performHitDetection(point);
      if (node === self.model.bodyNode){
        self.model.bodyNode.dragging = true;
      } else if (node === self.model.handleNode){
        self.model.handleNode.dragging = true;
        prev = [e.offsetX,e.offsetY];
      }
    });

    /**
     * Handle mousemove events.
     */ 
    canvas.addEventListener('mousemove', function(e) {
      var point = [e.offsetX,e.offsetY];
      var node = self.model.performHitDetection(point);
      if (node === self.model.bodyNode){
        canvas.style.cursor='all-scroll';
      } else if (node === self.model.handleNode){
        canvas.style.cursor='pointer';
      } else {
        canvas.style.cursor='default';
      }
      if (self.model.bodyNode.dragging && !self.model.powerup){
        point = [e.offsetX,e.offsetY];
        var inverseGlobal = self.model.spaceshipNode.globalTransformation.createInverse();
        var transformpoint = point;
        inverseGlobal.transform(point,0,transformpoint,0,1);
        self.model.spaceshipNode.translate(transformpoint[0],transformpoint[1]);
      }
      if (self.model.handleNode.dragging && !self.model.powerup){
        point = [0,0,e.offsetX-prev[0],e.offsetY-prev[1]];
        var inverseGlobal = self.model.spaceshipNode.globalTransformation.createInverse();
        var transformpoint = [];
        inverseGlobal.transform(point,0,transformpoint,0,2);
        console.log(transformpoint);
        if (self.model.bodyNode.localBoundingBox.y < 0.75*(self.model.bodyNode.localBoundingBox.h)+0.1*self.model.bodyNode.localBoundingBox.y 
          || (point[3] < 0)){
          self.model.bodyNode.localBoundingBox.y += transformpoint[3]-transformpoint[1];
          self.model.bodyNode.localBoundingBox.h -= transformpoint[3]-transformpoint[1];
          self.model.handleNode.localBoundingBox.y += transformpoint[3]-transformpoint[1];
          self.model.headNode.localBoundingBox.y += transformpoint[3]-transformpoint[1];
        }
        prev = [e.offsetX,e.offsetY];
        self.update();
      }
    });


    /**
     * Handle mouseup events.
     */ 
    canvas.addEventListener('mouseup', function(e) {
      self.model.bodyNode.dragging = false;
      self.model.handleNode.dragging = false;
    });

    /**
     * Handle keydown events.
     */ 
    document.addEventListener('keydown', function(e) {
      if (e.keyCode == 38){ // up arrow
        self.model.forward = true;
      } else if (e.keyCode == 32){ // space bar
        if (!self.model.powerup){
          self.model.spaceshipNode.scale(2,2);
          self.model.speed = 2*self.model.speed;
          self.model.powerup = true;
          var dstart = new Date();
          start = dstart.getTime();
        }
      } else if (e.keyCode == 39){ // right arrow
        self.model.right = true;
      } else if (e.keyCode == 37){ // left arrow
        self.model.left = true;
      }
    });

    /**
     * Handle keyup events.
     */ 
    document.addEventListener('keyup', function(e) {
      if (e.keyCode == 38){
        self.model.fireNode.on = false;
        self.model.forward = false;
        self.update();
      } else if (e.keyCode == 37){
        self.model.left = false;
      } else if (e.keyCode == 39){
        self.model.right = false;
      }

    });

    /**
     * Update the view when first created.
     */
    this.update();
  };

  return {
    SpaceshipView: SpaceshipView
  };
}