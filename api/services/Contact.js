var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var uniqueValidator = require('mongoose-unique-validator');
var timestamps = require('mongoose-timestamp');
var validators = require('mongoose-validators');
var monguurl = require('monguurl');
var md5 = require('md5');
var moment = require('moment');
require('mongoose-middleware').initialize(mongoose);

var Schema = mongoose.Schema;

var schema = new Schema({
  name :{
    type: String,
    default: ""
  },

  email:{
      type:String,
      validate:validators.isEmail(),
      unique:true
    },

  mobile: {
    type: String
  },

  message: {
    type: String
  },

  status: {
    type: String,
    enum: ["true", "false"]
  }

});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Contact', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {
   saveContactData: function (data, callback) {
    console.log("data",data);
    var contact = this(data);
    contact.save(function (err, data3) {
      // data3.password = '';
      if (err) {
        callback(err, null);
      } else if (data3){
        var emailData = {};
        emailData.to = "parmarpriyank94@gmail.com"
        emailData.email = data.email;
        emailData.mobile = data.mobile;
        emailData.message = data.message;
        emailData.filename = "contactmail.ejs";
        emailData.name = data.name;
        emailData.subject = "Contact Us Form Details";
        console.log("email data : ",emailData);

        Config.email(emailData, function (err, emailRespo) {
          if (err) {
            console.log(err);
            callback(err, null);
          } else if(emailRespo){
            console.log("email respo");
            callback(null, emailRespo);
          } else{
            callback(null, "Invalid data");
          }
        });
      }
      else{
        callback(null, "Invalid data");
      }
    });
  },
   encrypt: function (plaintext, shiftAmount) {
    var ciphertext = "";
    for (var i = 0; i < plaintext.length; i++) {
      var plainCharacter = plaintext.charCodeAt(i);
      if (plainCharacter >= 97 && plainCharacter <= 122) {
        ciphertext += String.fromCharCode((plainCharacter - 97 + shiftAmount) % 26 + 97);
      } else if (plainCharacter >= 65 && plainCharacter <= 90) {
        ciphertext += String.fromCharCode((plainCharacter - 65 + shiftAmount) % 26 + 65);
      } else {
        ciphertext += String.fromCharCode(plainCharacter);
      }
    }
    return ciphertext;
  },
  decrypt: function (ciphertext, shiftAmount) {
    var plaintext = "";
    for (var i = 0; i < ciphertext.length; i++) {
      var cipherCharacter = ciphertext.charCodeAt(i);
      if (cipherCharacter >= 97 && cipherCharacter <= 122) {
        plaintext += String.fromCharCode((cipherCharacter - 97 - shiftAmount + 26) % 26 + 97);
      } else if (cipherCharacter >= 65 && cipherCharacter <= 90) {
        plaintext += String.fromCharCode((cipherCharacter - 65 - shiftAmount + 26) % 26 + 65);
      } else {
        plaintext += String.fromCharCode(cipherCharacter);
      }
    }
    return plaintext;
  }
};
module.exports = _.assign(module.exports, exports, model);
