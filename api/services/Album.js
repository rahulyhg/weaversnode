var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var uniqueValidator = require('mongoose-unique-validator');
var timestamps = require('mongoose-timestamp');
var validators = require('mongoose-validators');
var monguurl = require('monguurl');
require('mongoose-middleware').initialize(mongoose);

var Schema = mongoose.Schema;

var schema = new Schema({
    name: {
        type: String,
        default: ""
    },

    image: {
        type: String,
        default: ""
    },
    order: {
        type: Number
    },

    status: {
        type: String,
        enum: ["true", "false"]
    }
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Album', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema,'Album','Album'));
var model = {};
module.exports = _.assign(module.exports, exports, model);