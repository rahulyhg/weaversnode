var mongoose = require('mongoose');
var objectid = require("mongodb").ObjectId;
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var uniqueValidator = require('mongoose-unique-validator');
var timestamps = require('mongoose-timestamp');
var validators = require('mongoose-validators');
var monguurl = require('monguurl');
require('mongoose-middleware').initialize(mongoose);

var Schema = mongoose.Schema;

var schema = new Schema({
    image: {
        type: String,
        default: ""
    },
    image2:{
        type:String,
        default:""
    },
    youtubeLink: {
        type: String,
        default: ""
    },
    order: Number,
    status: {
        type: String,
        enum: ["true", "false"]
    }
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Gallery', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {
    getImages: function (data, callback) {
        console.log(data);
        Gallery.findOne({
            _id: data._id
        }).exec(function (err, found) {
            if (err) {
                // console.log(err);
                callback(err, null);
            } else {
                // console.log(found,"000");
                var data = {};
                data.results = found.images;
                if (found) {
                    callback(null, data);
                } else {
                    callback(null, {
                        message: "No Data Found"
                    });
                }
            }

        })
    },
    getAllImages: function (data, callback) {
        Gallery.find({}).sort({
            order: 1
        }).exec(function (err, found) {
            if (err) {
                // console.log(err);
                callback(err, null);
            } else if (found) {
                callback(null, found);
            } else {
                callback(null, {
                    message: "No Data Found"
                });
            }


        })
    },
    saveImages: function (data, callback) {
        //  var product = data.product;
        //  console.log(product);
        // console.log("dddddd",data);
        if (!data._id) {
            Gallery.update({
                _id: data.Gallery
            }, {
                $push: {
                    images: data
                }
            }, function (err, updated) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else {
                    callback(null, updated);
                }
            });
        } else {
            data._id = objectid(data._id);
            tobechanged = {};
            var attribute = "images.$.";
            _.forIn(data, function (value, key) {
                tobechanged[attribute + key] = value;
            });
            Gallery.update({
                "images._id": data._id
            }, {
                $set: tobechanged
            }, function (err, updated) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else {
                    callback(null, updated);
                }
            });
        }
    },
    getOneImages: function (data, callback) {
        Gallery.aggregate([{
            $unwind: "$images"
        }, {
            $match: {
                "images._id": objectid(data._id)
            }
        }, {
            $project: {
                "images.image": 1,
                "images.order": 1,
                "images.status": 1,
                "images._id": 1
            }
        }]).exec(function (err, found) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                callback(null, found[0].images);
            }
        });
    },
    deleteImages: function (data, callback) {
        Gallery.update({
            "images._id": data._id
        }, {
            $pull: {
                "images": {
                    "_id": objectid(data._id)
                }
            }
        }, function (err, updated) {
            console.log(updated);
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                callback(null, updated);
            }
        });
    }
};
module.exports = _.assign(module.exports, exports, model);