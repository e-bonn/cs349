'use strict';

/**
 * A function that creates and returns all of the model classes and constants.
  */
function createViewModule() {

    var LIST_VIEW = 'LIST_VIEW';
    var GRID_VIEW = 'GRID_VIEW';
    var RATING_CHANGE = 'RATING_CHANGE';

    var IMAGE_ADDED_TO_COLLECTION_EVENT = 'IMAGE_ADDED_TO_COLLECTION_EVENT';
    var IMAGE_REMOVED_FROM_COLLECTION_EVENT = 'IMAGE_REMOVED_FROM_COLLECTION_EVENT';
    var IMAGE_META_DATA_CHANGED_EVENT = 'IMAGE_META_DATA_CHANGED_EVENT';

    var RatingsView = function(imageModel,rating) {
        this.imageModel = imageModel;
        this.rating = rating;
        this._init();
        this.notify = function(eventType) {
            _.each(this.listeners, function(listener) {
                listener(eventType,imageModelCollection,imageModel, Date.now()); 
            });
        }
    }

    _.extend(RatingsView.prototype, {

        _init: function(){
            var self = this;
            this.ratingViewDiv = document.createElement('div');
            var ratingViewTemplate = document.getElementById('ratingsView');
            this.ratingViewDiv.appendChild(document.importNode(ratingViewTemplate.content, true));
            var ratingInput = this.ratingViewDiv.querySelectorAll('.each-star');
            for (var i = 0; i < this.rating; i++){
                ratingInput[i].src = "assignment_spec_images/star_filled.png";
            }
            _.each(ratingInput, function(rating){
                rating.addEventListener('click', function(evt){
                    var star = evt.target;
                    var star_index = star.getAttribute('data-index');
                    self.rating = star_index;
                    self.imageModel.rating = star_index;
                    star.src = "assignment_spec_images/star_filled.png";
                    for (var i = 0; i < star_index; i++){
                        ratingInput[i].src = "assignment_spec_images/star_filled.png";
                    }
                    for (var i = star_index; i < 5; i++){
                        ratingInput[i].src = "assignment_spec_images/star.png";
                    }
                });
            });
        },

        getElement: function() {
            return this.ratingViewDiv;
        }

    });

    /**
     * An object representing a DOM element that will render the given ImageModel object.
     */
    var ImageRenderer = function(imageModel,rating,view) {
        this.imageModel = imageModel;
        this.view = view;
        this.DOMelement = null;
        this.DOMelement_large = null;
        this.ratingView = new RatingsView(imageModel,rating);
    };

    _.extend(ImageRenderer.prototype, {

        /**
         * Returns an element representing the ImageModel, which can be attached to the DOM
         * to display the ImageModel.
         */
        getElement: function() {
            if (this.DOMelement == null){
                this.DOMelement = document.createElement('div');
                this.DOMelement.className = "inner-image";
                var imageRendererTemplate = document.getElementById('imageModel');
                this.DOMelement.appendChild(document.importNode(imageRendererTemplate.content, true));

                // change img src
                var img = this.DOMelement.querySelector('.pic');
                var path = this.imageModel.getPath();
                img.src = path;

                var file_div = this.DOMelement.querySelector('.file-name');
                file_div.innerHTML = this.imageModel.getPath().replace(/^.*(\\|\/|\:)/, '');

                var date_div = this.DOMelement.querySelector('.date');
                date_div.innerHTML = this.imageModel.getModificationDate().toLocaleDateString();

                var self = this;
                img.addEventListener('click', function(){
                    if (self.DOMelement_large == null){
                        self.DOMelement_large = document.createElement('div');
                        var enlargeTemplate = document.getElementById('enlarge');
                        self.DOMelement_large.appendChild(document.importNode(enlargeTemplate.content, true));
                        document.getElementById('app-container').appendChild(self.DOMelement_large);
                        var img_large = self.DOMelement_large.querySelector('.large-img');
                        img_large.src = path;
                    }
                });

                this.DOMelement.querySelector('.inner-rating').appendChild(this.ratingView.getElement());
            }

            if (this.view === LIST_VIEW){
                this.DOMelement.querySelector('.inner-image').style.display = "inline-block";
                this.DOMelement.querySelector('.info').style.display = "inline-block"; 
                this.DOMelement.style.display = "block";                
            }

            return this.DOMelement;
        },  

        /**
         * Returns the ImageModel represented by this ImageRenderer.
         */
        getImageModel: function() {
            return this.imageModel;
        },

        /**
         * Sets the ImageModel represented by this ImageRenderer, changing the element and its
         * contents as necessary.
         */
        setImageModel: function(imageModel) {
            this.imageModel = imageModel;
        },

        /**
         * Changes the rendering of the ImageModel to either list or grid view.
         * @param viewType A string, either LIST_VIEW or GRID_VIEW
         */
        setToView: function(viewType) {
            this.view = viewType;
        },

        /**
         * Returns a string of either LIST_VIEW or GRID_VIEW indicating which view type it is
         * currently rendering.
         */
        getCurrentView: function() {
            return this.view;
        }
    });

    /**
     * A factory is an object that creates other objects. In this case, this object will create
     * objects that fulfill the ImageRenderer class's contract defined above.
     */
    var ImageRendererFactory = function() {
    };

    _.extend(ImageRendererFactory.prototype, {

        /**
         * Creates a new ImageRenderer object for the given ImageModel
         */
        createImageRenderer: function(imageModel,rating,view) {
            var imageRenderer = new ImageRenderer(imageModel,rating,view);
            return imageRenderer;
        }
    });

    /**
     * An object representing a DOM element that will render an ImageCollectionModel.
     * Multiple such objects can be created and added to the DOM (i.e., you shouldn't
     * assume there is only one ImageCollectionView that will ever be created).
     */
    var ImageCollectionView = function() {
        this.imageCollectionModel = null;
        this.DOMelement = null;
        this.factory = new ImageRendererFactory();
        this.imageRenderers = [];
        this.view = GRID_VIEW;
    };

    _.extend(ImageCollectionView.prototype, {
        /**
         * Returns an element that can be attached to the DOM to display the ImageCollectionModel
         * this object represents.
         */
        getElement: function() {
            if (this.DOMelement == null){
                this.DOMelement = document.createElement('div');
                var imageCollectionTemplate = document.getElementById('imageCollectionView');
                this.DOMelement.appendChild(document.importNode(imageCollectionTemplate.content, true));

                this.DOMelement.appendChild(this.DOMelement.querySelector('.imageCollectionView-div'));
            }
            return this.DOMelement;
        },

        /**
         * Gets the current ImageRendererFactory being used to create new ImageRenderer objects.
         */
        getImageRendererFactory: function() {
            return this.factory;
        },

        /**
         * Sets the ImageRendererFactory to use to render ImageModels. When a *new* factory is provided,
         * the ImageCollectionView should redo its entire presentation, replacing all of the old
         * ImageRenderer objects with new ImageRenderer objects produced by the factory.
         */
        setImageRendererFactory: function(imageRendererFactory) {
            this.factory = imageRendererFactory;
        },

        /**
         * Returns the ImageCollectionModel represented by this view.
         */
        getImageCollectionModel: function() {
            return this.imageCollectionModel;
        },

        /**
         * Sets the ImageCollectionModel to be represented by this view. When setting the ImageCollectionModel,
         * you should properly register/unregister listeners with the model, so you will be notified of
         * any changes to the given model.
         */
        setImageCollectionModel: function(imageCollectionModel) {
            var self = this;
            if (this.imageCollectionModel){
                this.imageCollectionModel.removeListener(this.rendererlistener); 
                _.each(this.imageCollectionModel.imageRenderers, function(ir) {
                    document.getElementById('app-container').removeChild(ir);
                });
                this.imageCollectionModel.imageRenderers = [];
            }     

            this.imageCollectionModel = imageCollectionModel;

            _.each(imageCollectionModel.imageModels, function(im) {
                var imageRenderer = self.factory.createImageRenderer(im,im.rating,self.view);
                self.imageRenderers.push(imageRenderer);
                document.querySelector('.imageCollectionView-div').appendChild(imageRenderer.getElement());
            });

            this.rendererlistener = this.imageCollectionModel.addListener(function(eventType, imageModelCollection, imageModel, eventDate) {
                if (eventType === IMAGE_ADDED_TO_COLLECTION_EVENT) {
                    var imageRenderer = self.factory.createImageRenderer(imageModel,imageModel.rating,self.view);
                    self.imageRenderers.push(imageRenderer);
                    document.querySelector('.imageCollectionView-div').appendChild(imageRenderer.getElement());
                }
            });
        },

        /**
         * Changes the presentation of the images to either grid view or list view.
         * @param viewType A string of either LIST_VIEW or GRID_VIEW.
         */
        setToView: function(viewType) {
            this.view = viewType;
        },

        /**
         * Returns a string of either LIST_VIEW or GRID_VIEW indicating which view type is currently
         * being rendered.
         */
        getCurrentView: function() {
            return this.view;
        }
    });

    /**
     * An object representing a DOM element that will render the toolbar to the screen.
     */
    var Toolbar = function(imageModel) {
        this.listeners = [];
        this.currentView = GRID_VIEW;
        this.ratingFilter = new RatingsView(imageModel,0);
        this.notify = function(eventType) {
            _.each(this.listeners, function(listener) {
                listener(this,eventType, Date.now()); 
            });
        }
    };

    _.extend(Toolbar.prototype, {
        /**
         * Returns an element representing the toolbar, which can be attached to the DOM.
         */
        getElement: function() {

            this.DOMelement = document.createElement('div');
            var imageRendererTemplate = document.getElementById('toolbar-template');
            this.DOMelement.appendChild(document.importNode(imageRendererTemplate.content, true));

            this.DOMelement.querySelector('.stars-toolbar').appendChild(this.ratingFilter.getElement());
            var self = this;

            var nofilter = this.DOMelement.querySelector('.clear-filter');
            nofilter.addEventListener('click',function(event){
                self.ratingFilter.rating = 0;
                var ratingInput = self.ratingFilter.getElement().querySelectorAll('.each-star');
                for (var i = 0; i < 5; i++){
                    ratingInput[i].src = "assignment_spec_images/star.png";
                }
                self.notify(RATING_CHANGE);
            });

            var ratingInput = this.ratingFilter.getElement().querySelectorAll('.each-star');
            _.each(ratingInput, function(rating){
                rating.addEventListener('click', function(evt){
                    self.ratingFilter.rating = evt.target.getAttribute('data-index');
                    self.notify(RATING_CHANGE);
                });
            });

            var layout_buttons = this.DOMelement.querySelectorAll('.label');
            _.each(layout_buttons, function(lb){
                lb.addEventListener('click', function(evt){
                    var layout = evt.target;
                    var layout_index = layout.getAttribute('data-index'); // 1 is grid, 2 is list
                    if (layout_index == 1){
                        self.notify(GRID_VIEW);
                    } else if (layout_index == 2){
                        self.notify(LIST_VIEW);
                    }
                });
            });

            return this.DOMelement;
            
        },

        /**
         * Registers the given listener to be notified when the toolbar changes from one
         * view type to another.
         * @param listener_fn A function with signature (toolbar, eventType, eventDate), where
         *                    toolbar is a reference to this object, eventType is a string of
         *                    either, LIST_VIEW, GRID_VIEW, or RATING_CHANGE representing how
         *                    the toolbar has changed (specifically, the user has switched to
         *                    a list view, grid view, or changed the star rating filter).
         *                    eventDate is a Date object representing when the event occurred.
         */
        addListener: function(listener_fn) {
            this.listeners.push(listener_fn);
        },

        /**
         * Removes the given listener from the toolbar.
         */
        removeListener: function(listener_fn) {
            var index = this.listeners.indexOf(listener_fn);
            if (index > -1){
                this.listeners.splice(index,1);
            }
        },

        /**
         * Sets the toolbar to either grid view or list view.
         * @param viewType A string of either LIST_VIEW or GRID_VIEW representing the desired view.
         */
        setToView: function(viewType) {
            this.currentView = viewType;
        },

        /**
         * Returns the current view selected in the toolbar, a string that is
         * either LIST_VIEW or GRID_VIEW.
         */
        getCurrentView: function() {
            return this.currentView;
        },

        /**
         * Returns the current rating filter. A number in the range [0,5], where 0 indicates no
         * filtering should take place.
         */
        getCurrentRatingFilter: function() {
            return this.ratingFilter.rating;
        },

        /**
         * Sets the rating filter.
         * @param rating An integer in the range [0,5], where 0 indicates no filtering should take place.
         */
        setRatingFilter: function(rating) {
            this.ratingFilter.rating = rating;
        }
    });

    /**
     * An object that will allow the user to choose images to display.
     * @constructor
     */
    var FileChooser = function() {
        this.listeners = [];
        this._init();
    };

    _.extend(FileChooser.prototype, {
        // This code partially derived from: http://www.html5rocks.com/en/tutorials/file/dndfiles/
        _init: function() {
            var self = this;
            this.fileChooserDiv = document.createElement('div');
            var fileChooserTemplate = document.getElementById('file-chooser');
            this.fileChooserDiv.appendChild(document.importNode(fileChooserTemplate.content, true));
            var fileChooserInput = this.fileChooserDiv.querySelector('.files-input');
            fileChooserInput.addEventListener('change', function(evt) {
                var files = evt.target.files;
                var eventDate = new Date();
                _.each(
                    self.listeners,
                    function(listener_fn) {
                        listener_fn(self, files, eventDate);
                    }
                );
            });
        },

        /**
         * Returns an element that can be added to the DOM to display the file chooser.
         */
        getElement: function() {
            return this.fileChooserDiv;
        },

        /**
         * Adds a listener to be notified when a new set of files have been chosen.
         * @param listener_fn A function with signature (fileChooser, fileList, eventDate), where
         *                    fileChooser is a reference to this object, fileList is a list of files
         *                    as returned by the File API, and eventDate is when the files were chosen.
         */
        addListener: function(listener_fn) {
            if (!_.isFunction(listener_fn)) {
                throw new Error("Invalid arguments to FileChooser.addListener: " + JSON.stringify(arguments));
            }
            this.listeners.push(listener_fn);
        },

        /**
         * Removes the given listener from this object.
         * @param listener_fn
         */
        removeListener: function(listener_fn) {
            if (!_.isFunction(listener_fn)) {
                throw new Error("Invalid arguments to FileChooser.removeListener: " + JSON.stringify(arguments));
            }
            this.listeners = _.without(this.listeners, listener_fn);
        }
    });

    // Return an object containing all of our classes and constants
    return {
        ImageRenderer: ImageRenderer,
        ImageRendererFactory: ImageRendererFactory,
        ImageCollectionView: ImageCollectionView,
        Toolbar: Toolbar,
        FileChooser: FileChooser,
        RatingsView: RatingsView,

        LIST_VIEW: LIST_VIEW,
        GRID_VIEW: GRID_VIEW,
        RATING_CHANGE: RATING_CHANGE
    };
}