/***
 * Scaffolded by Jingjie (Vincent) Zheng on June 24, 2015.
 */

'use strict';

/**
 * A function that creates and returns the scene graph classes.
 * This module has an astract GraphNode which generalises the behaviour of a node in a scene graph.
 * Other classes inherit the GraphNode, forming a tree structure when instantiated.
 * - RootNode represents the background and the scene.
 * - SpaceshipNode represents the spaceship.
 * - BodyNode, HeadNode, and TailNode represent the three parts that belong to the spaceship.
 * - HandleNode refers to the black handle on the top of the body.
 * - FireNode belongs to the tail, representing the fire at the end of the spaceship.
 * These classes should be instantiated in model.js.
 */
function createSceneGraphModule() {

    /**
     * An abstract graph node in a scene graph.
     * @param id: Node identifier.
     * @param parent: Parent of the node in the scene graph.
     */
    var GraphNode = function(id, parent) {
        // Maintain the identifier.
        this.id = id;

        // Maintain a local transformation that is relative to its parent.
        this.localTransformation = new AffineTransform();

        // Maintain a global transformation that is relative to the canvas coordinate.
        // This matrix is useful when performing a hit detection.
        this.globalTransformation = new AffineTransform();

        // If a valid parent is passed in, save the parent to this node, then add this node to the parent.
        this.parent = typeof parent !== 'undefined' ? parent : null;
        if (parent) {
            parent.addChild(this);
        }

        // Maintain a list of child nodes.
        this.children = [];

        // Local bounding box of this node. This should be overridden by concreate graph nodes.
        // The coordinate of the bounding box is from the perspective of the node itself, not 
        // from the canvas.
        this.localBoundingBox = {
            x: 0,
            y: 0,
            w: 0,
            h: 0
        };

        // Indicate whether this node is interactable with a mouse. If it is not interactable with 
        // mouse at all, we do not need to perform a hit detection on it.
        this.isInteractableWithMouse = false;

        // Maintain a list of listners.
        this.listeners = [];
    };

    _.extend(GraphNode.prototype, {
        
        /**
         * Notify all listeners the change in this node.
         */
        notify: function() {
            _.each(this.listeners, function(listener) {
                listener.update();
            });
        },

        /**
         * Add a listener, if it is not registered with this node.
         * @param listener: Object that listens for the change of the node.
         */
        addListener: function(listener) {
            this.listeners.push(listener);
        },

        /**
         * Remove a listener, if it is registered with this node.
         * @param listener: Listener that is registered with this node. 
         */
        removeListener: function(listener) {
            var index = this.listeners.indexOf(listener);
            if (index > -1){
                this.listeners.splice(index,1);
            }
        },

        /**
         * Add a child node to this node if it is not appended to this node.
         * 
         * You should point the child's parent to this node and add the child to the children list.
         * You should also recursively update the global transformations of its descendants, as they are
         * appended to a new parent.
         * @param node: Child node to be added.
         */
        addChild: function(node) {
            this.children.push(node);
            node.parent = this;
            this.updateAllGlobalTransformation();
        },

        /**
         * Remove a child node of this node, if it is appended to this node.
         * @param node: Child node to be removed.
         */
        removeChild: function(node) {
            var index = this.children.indexOf(node);
            if (index > -1){
                var removed = this.children.splice(index,1);
                removed.parent = null;
            }
        },

        /**
         * Apply a Google Closure AffineTransform object to the HTML5 Canvas context.
         * @param context: HTML5 Canvas context.
         * @param transformation: Google Closure AffineTransform object.
         */
        applyTransformationToContext: function(context, transformation) {
            context.transform(transformation.m00_, 
                transformation.m10_,
                transformation.m01_,
                transformation.m11_,
                transformation.m02_,
                transformation.m12_);
        },

        /**
         * Update the global transformation of _ONLY_ this node.
         * Specifically, if it is the root of the scene graph, update itself with its local 
         * transformation, otherwise clone the global transformation of its parent, then concatenate it 
         * with this node's local transformation.
         */
        updateGlobalTransformation: function() {
            if (!this.parent){
                this.globalTransformation.copyFrom(this.localTransformation);
            } else {
                var parentClone = this.parent.globalTransformation.clone();
                parentClone.concatenate(this.localTransformation);
                this.globalTransformation.copyFrom(parentClone);
            }
        },

        /**
         * Update the global transformations of this node and its descendants recursively.
         */
        updateAllGlobalTransformation: function() {
            this.updateGlobalTransformation();
                _.each(this.children,function(child){
                    child.updateAllGlobalTransformation();
                });
        },

        /**
         * Render _ONLY_ this node with the assumption that the node is painted at around the origin. 
         * @param context: Context obtained from HTML5 Canvas.
         */
        renderLocal: function(context) {
            //TODO     
        },

        /**
         * Recursively render itself and its descendants.
         * 
         * Specifically, 
         * 1. Save Canvas context before performing any operation.
         * 2. Apply local transformation to the context.
         * 3. Render the node and its children, 
         * 4. Restore Canvas context.
         *
         * @param context: Context obtained from HTML Canvas.
         */
        renderAll: function(context) {
            context.save();
            this.applyTransformationToContext(context,this.localTransformation);
            this.renderLocal(context);
                _.each(this.children,function(child){
                    child.renderAll(context);
                });
            context.restore();
        },

        /**
         * Rotate this node and its descendants.
         * 
         * Specifically, 
         * 1. Concatenate a rotation matrix after the current local transformation. This would apply 
         *    the rotation prior to other transformation that has been applied to this node. It is 
         *    equivalent to using the inverse of the current local transformation to return this node 
         *    back to the origin, applying the rotation, and transforming this node back with the local
         *    transformation.
         * 2. Update the global transfomration. Applying change to this node would in fact change the 
         *    positions and orientations of all its descendants. Thus, you should update the global 
         *    transformation matrix of itself and all its descendants. This allows us to perform a O(1)
         *    hit detection without the need to concatenate local matrices along the hierarchy each
         *    time we perform the hit detection.
         * 3. Finally, notify the view to update. This would make the canvas to repaint the scene graph
         *    by traversing down the tree.
         *
         * You do not need to traverse down the tree to update every descendant's local transformation,
         * since the scene graph will render this node's children based on the transformation applied to
         * the node.
         *  
         * @param theta: Angle to rotate clockwise.
         * @param x, y: Centre of Rotation.
         */
        rotate: function(theta, x, y) {
            this.localTransformation.rotate(theta,x,y);
            this.updateAllGlobalTransformation();
            this.notify();
        },

        /**
         * Translate this node and its descendants.
         * 
         * Specifically, 
         * 1. Concatenate a translation matrix after the current local transformation. 
         * 2. Update the global transfomration recursively to the node and its descendants.
         * 3. Finally, notify the view to update.
         * 
         * @param dx: Distance to translate in the x direction from the node's coordinate system.
         * @param dy: Distance to translate in the y direction from the node's coordinate system.
         */
        translate: function(dx, dy) {
            this.localTransformation.translate(dx,dy);
            this.updateAllGlobalTransformation();
            this.notify();
        },

        /**
         * Scale this node and its descendants.
         * 
         * Specifically, 
         * 1. Concatenate a scaling matrix after the current local transformation. 
         * 2. Update the global transfomration recursively to the node and its descendants.
         * 3. Finally, notify the view to update.
         *
         * Note that doing this would propogate the scaling to its descendants when rendering.
         * You may also need another function to scale the shape by updating its rendering dimensions
         * as well as its bounding box.
         *
         * @param sx: Scaling factor in the x direction from the node's coordinate system.
         * @param sy: Scaling factor in the y direction from the node's coordinate system.
         */
        scale: function(sx, sy) {
            this.localTransformation.scale(sx,sy);
            this.updateAllGlobalTransformation();
            this.notify();
        },



        /** 
          * Check whether a point is within the local bounding box.
          * Specifically, 
          * if this node is interactable with a mouse,
          * 1. Create the inverse matrix of the current global transformation.
          * 2. Transform the point with the matrix, so that the point becomes the coordinate relative
          *    to this node.
          * 3. Check with the transformed point whether it's in the local bounding box.
          * 
          * If it does not interact with a mouse, there is no need to perform a hit detection, 
          * you should return false.
          *
          * @param point: Point to be checked. It is a coordinate represented with list [x y].
          *               It is always the coordinate from the perspective of the canvas, i.e., 
          *               in the world view.
          * 
          * @return false if the node is not interactable with a mouse. When it is, return true if the 
          *         point is in the local bounding box, otherwise false.
          */
        performHitDetection: function(point) {
            if(this.isInteractableWithMouse){
                var inverseGlobal = this.globalTransformation.createInverse();
                var transformpoint = [undefined,undefined];
                inverseGlobal.transform(point,0,transformpoint,0,1);
                if ((transformpoint[0] >= this.localBoundingBox.x && 
                    transformpoint[0] <= (this.localBoundingBox.x+this.localBoundingBox.w)) &&
                    (transformpoint[1] >= this.localBoundingBox.y &&
                    transformpoint[1] <= (this.localBoundingBox.y+this.localBoundingBox.h))){
                    return true;
                }
            } 
            return false;
        }
    });


    /**
     * RootNode is the root of the scene graph, i.e., it represents the canvas.
     */
    var RootNode = function() {
        // Inherit the constructor of GraphNode.
        GraphNode.apply(this, arguments);

        // Override the local bounding box of this node.
        this.localBoundingBox = {
            x: 0,
            y: 0,
            w: 800,
            h: 600
        };
    }

    // Inherit all other methods of GraphNode.
    _.extend(RootNode.prototype, GraphNode.prototype, {
        // TODO
    });

    /**
     * SpaceshipNode, representing the whole spaceship.
     */
    var SpaceshipNode = function() {
        // Inherit the constructor of GraphNode.
        GraphNode.apply(this, arguments);

        // Override the local bounding box of this node. You might want to modify this.
        this.localBoundingBox = {
            x: -12.5,
            y: -200,
            w: 25,
            h: 200
        };
    }

    // Inherit all other methods of GraphNode.
    _.extend(SpaceshipNode.prototype, GraphNode.prototype, {
        // Override the renderLocal function to draw itself in its own coordinate system.
        renderLocal: function(context) {

            // TODO

            // You might want to modify this.
        //    context.fillStyle = "rgb(200, 0, 0)";
        //   context.fillRect(-50, -50, 100, 100);

            
        }
    });



    /**
     * HeadNode is the child of the spaceship node, representing the head of the spaceship.
     */
    var HeadNode = function() {
        // Inherit the constructor of GraphNode.
        GraphNode.apply(this, arguments);

        // TODO

        // Override the local bounding box of this node, you might want to modify this.
        this.localBoundingBox = {
            x: -12.5,
            y: -25,
            w: 25,
            h: 25
        };
    }

    // Inherit all other methods of GraphNode.
    _.extend(HeadNode.prototype, GraphNode.prototype, {
        // Override the renderLocal function to draw itself in its own coordinate system.
        renderLocal: function(context) {
            var front=new Path2D();

            context.fillStyle="#FFFFFF";
            front.moveTo(this.localBoundingBox.x,this.localBoundingBox.y+this.localBoundingBox.h); // top
            front.lineTo(this.localBoundingBox.x+this.localBoundingBox.w,this.localBoundingBox.y+this.localBoundingBox.h);
            front.lineTo(this.localBoundingBox.x+(this.localBoundingBox.w/2),this.localBoundingBox.y);
            front.closePath();
            context.fill(front);
            context.fillStyle="#000000";
            context.lineWidth="2";
            context.stroke(front);

            // You might want to modify this.
        //    context.fillStyle = "rgb(100, 200, 0)";
        //    context.fillRect(-30, -30, 60, 60);

        }
    });




    /**
     * TailNode is a child of the spaceship node, representing the tail of the spaceship.
     */
    var TailNode = function() {
        GraphNode.apply(this, arguments);
        this.currenttheta = 0;

        this.localBoundingBox = {
            x: -12.5,
            y: 0,
            w: 25,
            h: 25
        };
    }
    _.extend(TailNode.prototype, GraphNode.prototype, {
        renderLocal: function(context) {
            var engine=new Path2D();
            context.fillStyle="#000000"; 
            engine.moveTo(this.localBoundingBox.x,this.localBoundingBox.y+this.localBoundingBox.h); // engine
            engine.lineTo(this.localBoundingBox.x+this.localBoundingBox.w,this.localBoundingBox.y+this.localBoundingBox.h);
            engine.lineTo(this.localBoundingBox.x+(this.localBoundingBox.w/2),this.localBoundingBox.y);
            engine.closePath();
            context.fill(engine);
        }
    });



    /**
     * FireNode is a child of the tail node, representing the fire at the end of the spaceship.
     */
    var FireNode = function() {
        GraphNode.apply(this, arguments);
        this.on = false;
    }
    _.extend(FireNode.prototype, GraphNode.prototype, {
        renderLocal: function(context) {
            if (this.on){
                context.fillStyle="#C00000";
                context.fillRect(-10,-20,4,40); // fire1
                context.fillRect(-1.75,-20,4,40); // fire2
                context.fillRect(6.5,-20,4,40); // fire3
            }
        }
    });



    /**
     * BodyNode is a child of the spaceship node, representing the body of the spaceship.
     */ 
    var BodyNode = function() {
        GraphNode.apply(this, arguments);
        this.isInteractableWithMouse = true;
        this.dragging = false;

        this.localBoundingBox = {
            x: -12.5,
            y: -100,
            w: 25,
            h: 105
        };
    }
    _.extend(BodyNode.prototype, GraphNode.prototype, {
        renderLocal: function(context) {
            context.fillStyle="#FFFFFF";
            context.fillRect(this.localBoundingBox.x,this.localBoundingBox.y,this.localBoundingBox.w,this.localBoundingBox.h);
            context.fillStyle="#000000";
            context.lineWidth="2";
            context.strokeRect(this.localBoundingBox.x,this.localBoundingBox.y,this.localBoundingBox.w,this.localBoundingBox.h);
            context.beginPath();
            context.arc(0,-0.75*(this.localBoundingBox.h)-0.1*this.localBoundingBox.y,6,0,2*Math.PI);
            context.fillStyle = 'blue';
            context.fill()
            context.stroke();
        }
    });



    /**
     * HandleNode is a child of the body node, representing the resizing handle of the spaceship.
     */ 
    var HandleNode = function() {
        GraphNode.apply(this, arguments);
        this.isInteractableWithMouse = true;
        this.dragging = false;

        this.localBoundingBox = {
            x: -12.5,
            y: -2.5,
            w: 25,
            h: 5
        };
    }
    _.extend(HandleNode.prototype, GraphNode.prototype, {
        renderLocal: function(context) {
            context.fillStyle="#000000";
            context.fillRect(this.localBoundingBox.x,this.localBoundingBox.y,this.localBoundingBox.w,this.localBoundingBox.h); // resize bar
            context.lineWidth="2";
            context.strokeRect(this.localBoundingBox.x,this.localBoundingBox.y,this.localBoundingBox.w,this.localBoundingBox.h);
        }
    });


    // Return an object containing all of our classes and constants
    return {
        RootNode: RootNode,
        SpaceshipNode: SpaceshipNode,
        HeadNode: HeadNode,
        TailNode: TailNode,
        FireNode: FireNode,
        BodyNode: BodyNode,
        HandleNode: HandleNode,
    };
}