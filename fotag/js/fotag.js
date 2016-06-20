'use strict';

// This should be your main point of entry for your app

var LIST_VIEW = 'LIST_VIEW';
var GRID_VIEW = 'GRID_VIEW';
var RATING_CHANGE = 'RATING_CHANGE';

var IMAGE_ADDED_TO_COLLECTION_EVENT = 'IMAGE_ADDED_TO_COLLECTION_EVENT';
var IMAGE_REMOVED_FROM_COLLECTION_EVENT = 'IMAGE_REMOVED_FROM_COLLECTION_EVENT';
var IMAGE_META_DATA_CHANGED_EVENT = 'IMAGE_META_DATA_CHANGED_EVENT';

window.addEventListener('load', function() {
    var modelModule = createModelModule();
    var viewModule = createViewModule();
    var appContainer = document.getElementById('app-container');

    var imageCollectionModel = modelModule.loadImageCollectionModel();

    var toolBar = new viewModule.Toolbar(imageModel);
    var imageCollectionView = new viewModule.ImageCollectionView();

    document.body.appendChild(toolBar.getElement());
    document.getElementById('app-container').appendChild(imageCollectionView.getElement());

    imageCollectionView.setImageCollectionModel(imageCollectionModel);

    // Attach the file chooser to the page. You can choose to put this elsewhere, and style as desired
    var fileChooser = new viewModule.FileChooser();
    appContainer.appendChild(fileChooser.getElement());

    toolBar.addListener(function(toolbar,eventType,eventDate){
        if (eventType !== RATING_CHANGE){
            imageCollectionView.setToView(eventType);
            _.each(
                imageCollectionView.imageRenderers,
                function(ir) {
                    var ourdiv1 = ir.DOMelement.querySelector('.inner-image');
                    var ourdiv2 = ir.DOMelement.querySelector('.info');
                    if (eventType === GRID_VIEW){
                        if (ir.DOMelement.querySelector('.inner-image') != null){
                            //ourdiv1.className = 'inner-image';
                            ourdiv1.style.display = "block"
                            //ourdiv2.className = 'info';
                            ourdiv2.style.display = "block"
                            if (toolBar.ratingFilter.rating != 0 && (ir.ratingView.rating < toolBar.ratingFilter.rating)){
                                ir.DOMelement.style.display = "none";
                            } else {
                                ir.DOMelement.style.display = ""
                            }
                        }
                    } else if (eventType === LIST_VIEW){
                        if (ir.DOMelement.querySelector('.inner-image') != null){
                            //ourdiv1.className = 'inner-image-list';
                            ourdiv1.style.display = "inline-block"
                            //ourdiv2.className = 'info-list';
                            ourdiv2.style.display = "inline-block"
                            if (toolBar.ratingFilter.rating != 0 && (ir.ratingView.rating < toolBar.ratingFilter.rating)){
                                ir.DOMelement.style.display = "none";
                            } else {
                                ir.DOMelement.style.display = "block"
                            }
                        }
                    }
                    ir.setToView(eventType);
                }
            );
        } else {
            _.each(
                imageCollectionView.imageRenderers,
                function(ir) {
                    if (toolBar.ratingFilter.rating != 0 && (ir.ratingView.rating < toolBar.ratingFilter.rating)){
                         ir.DOMelement.style.display = "none";
                    } else {
                        if (ir.view === GRID_VIEW){    
                            ir.DOMelement.style.display = "";
                        } else if (ir.view === LIST_VIEW){
                            ir.DOMelement.style.display = "block"
                        }
                    }
                }
            );
            appContainer.appendChild(fileChooser.getElement());

        }
    });

    // Demo that we can choose files and save to local storage. This can be replaced, later
    fileChooser.addListener(function(fileChooser, files, eventDate) {
        _.each(
            files,
            function(file) {
                var newDiv = document.createElement('div');
                var fileInfo = "File name: " + file.name + ", last modified: " + file.lastModifiedDate;
                newDiv.innerText = fileInfo;
                appContainer.appendChild(newDiv);
                var newIM = new modelModule.ImageModel(
                        'images/' + file.name,
                        file.lastModifiedDate,
                        '',
                        0
                    );
                imageCollectionModel.addImageModel(newIM);
            }
        );
        //modelModule.storeImageCollectionModel(imageCollectionModel);
    });
    // Demo retrieval
    /*var storedImageDiv = document.createElement('div');
    _.each(
        imageCollectionModel.getImageModels(),
        function(imageModel) {
            var imageModelDiv = document.createElement('div');
            imageModelDiv.innerText = "ImageModel from storage: " + JSON.stringify(imageModel);
            storedImageDiv.appendChild(imageModelDiv);
        }
    );*/
    //appContainer.appendChild(storedImageDiv);

    window.addEventListener('beforeunload', function() {
        modelModule.storeImageCollectionModel(imageCollectionModel);
    });

    // PRESS ESCAPE TO CLOSE ENLARGED IMAGE
    window.addEventListener('keydown',function(event){
        if (event.keyCode == 27){
            _.each(
                imageCollectionView.imageRenderers,
                function(ir) {
                    if (ir.DOMelement_large != null){
                        document.getElementById('app-container').removeChild(ir.DOMelement_large);
                        ir.DOMelement_large = null;
                    }
                }
            );
        }
    });

});