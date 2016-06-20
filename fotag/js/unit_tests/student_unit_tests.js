'use strict';

var expect = chai.expect;

describe('Student Unit Tests', function() {

	var modelModule;
	var imageCollectionModel;

	beforeEach(function() {
	  modelModule = createModelModule();
	  imageCollectionModel = new modelModule.ImageCollectionModel();
	});


	afterEach(function() {
	  modelModule = undefined;
	  imageCollectionModel = undefined;
	});



	it('imagemodel adds successfully and calls listeners', function() {
		    var listener_fn_1 = sinon.spy();
		    imageCollectionModel.addListener(listener_fn_1);
		    var IM = new modelModule.ImageModel(
	                        'images/filename.jpg',
	                        new Date(),
	                        '',
	                        0
	                    );
		    imageCollectionModel.addImageModel(IM);
		    expect(listener_fn_1.calledWith, IMAGE_ADDED_TO_COLLECTION_EVENT, imageCollectionModel, IM);
		    expect(imageCollectionModel.getImageModels().length == 1).to.be.true;
		    expect(listener_fn_1.callCount).to.be.below(2);
	});

	it('imagemodel removes successfully and calls listeners', function() {
		    var listener_fn_1 = sinon.spy();
		    imageCollectionModel.addListener(listener_fn_1);
		    var IM = new modelModule.ImageModel(
	                        'images/filename.jpg',
	                        new Date(),
	                        '',
	                        0
	                    );
		    imageCollectionModel.addImageModel(IM);
		    expect(listener_fn_1.calledWith, IMAGE_ADDED_TO_COLLECTION_EVENT, imageCollectionModel, IM);
		    imageCollectionModel.removeImageModel(IM);
		    expect(listener_fn_1.calledWith, IMAGE_REMOVED_FROM_COLLECTION_EVENT, imageCollectionModel, IM);
		    expect(imageCollectionModel.getImageModels().length == 0).to.be.true;
		    expect(listener_fn_1.callCount).to.be.below(3);
	});

	it('rating successfully changes and calls both listeners', function() {
		    var listener_fn_1 = sinon.spy();
		    var listener_fn_2 = sinon.spy();
		    imageCollectionModel.addListener(listener_fn_2);
		    var IM = new modelModule.ImageModel(
	                        'images/filename.jpg',
	                        new Date(),
	                        '',
	                        0
	                    );
		    IM.addListener(listener_fn_1);
		    imageCollectionModel.addImageModel(IM);
		    expect(listener_fn_2.calledWith, IMAGE_ADDED_TO_COLLECTION_EVENT, imageCollectionModel, IM);
		    IM.setRating(2);
		    expect(listener_fn_1.calledWith, IMAGE_META_DATA_CHANGED_EVENT, IM);
		    expect(listener_fn_2.calledWith, IMAGE_META_DATA_CHANGED_EVENT,imageCollectionModel, IM);
		    expect(IM.getRating() == 2).to.be.true
		    expect(listener_fn_1.callCount).to.be.below(2);
		    expect(listener_fn_2.callCount).to.be.below(3);
	});

	it('caption successfully changes and calls both listeners', function() {
		    var listener_fn_1 = sinon.spy();
		    var listener_fn_2 = sinon.spy();
		    imageCollectionModel.addListener(listener_fn_2);
		    var IM = new modelModule.ImageModel(
	                        'images/filename.jpg',
	                        new Date(),
	                        '',
	                        0
	                    );
		    IM.addListener(listener_fn_1);
		    imageCollectionModel.addImageModel(IM);
		    expect(listener_fn_2.calledWith, IMAGE_ADDED_TO_COLLECTION_EVENT, imageCollectionModel, IM);
		    IM.setCaption('this is a test');
		    expect(listener_fn_1.calledWith, IMAGE_META_DATA_CHANGED_EVENT, IM);
		    expect(listener_fn_2.calledWith, IMAGE_META_DATA_CHANGED_EVENT,imageCollectionModel, IM);
		    expect(IM.getCaption() == 'this is a test').to.be.true
		    expect(listener_fn_1.callCount).to.be.below(2);
		    expect(listener_fn_2.callCount).to.be.below(3);
	});

	it('successfully gets the modification date', function() {
		    var listener_fn_1 = sinon.spy();
		    var date = new Date();
		    imageCollectionModel.addListener(listener_fn_1);
		    var IM = new modelModule.ImageModel(
	                        'images/filename.jpg',
	                        date,
	                        '',
	                        0
	                    );
		    IM.addListener(listener_fn_1);
		    imageCollectionModel.addImageModel(IM);
		    expect(listener_fn_1.calledWith, IMAGE_ADDED_TO_COLLECTION_EVENT, imageCollectionModel, IM);
		    var date2 = IM.getModificationDate();
		    expect(date == date2).to.be.true
		    expect(listener_fn_1.callCount).to.be.below(2);
	});

});
