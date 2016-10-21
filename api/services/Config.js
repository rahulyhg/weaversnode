/**
 * Config.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var mongoose = require('mongoose');
var Grid = require('gridfs-stream');
var fs = require("fs");
var lwip = require("lwip");
var process = require('child_process');
var lodash = require('lodash');
var moment = require("moment");
var MaxImageSize = 1200;
var requrl = "http://localhost:1337/";
var moment = require('moment');
var request = require("request");
// var sendgrid = require('sendgrid');
var gfs = Grid(mongoose.connections[0].db, mongoose);
gfs.mongo = mongoose.mongo;

var Schema = mongoose.Schema;
var schema = new Schema({
  name: String
});

module.exports = mongoose.model('Config', schema);

var models = {
  maxRow: 10,
  getForeignKeys: function (schema) {
    var arr = [];
    _.each(schema.tree, function (n, name) {
      if (n.key) {
        arr.push({
          name: name,
          ref: n.ref,
          key: n.key
        });
      }
    });
    return arr;
  },
  checkRestrictedDelete: function (Model, schema, data, callback) {

    var values = schema.tree;
    var arr = [];
    var ret = true;
    _.each(values, function (n, key) {message
      if (n.restrictedDelete) {
        arr.push(key);message
      }
    });

    Model.findOne({
      "_id": data._id
    }, function (err, data2) {
      if (err) {
        callback(err, null);
      } else if (data2) {
        _.each(arr, function (n) {
          if (data2[n].length !== 0) {
            ret = false;messagemessage
          }
        });
        callback(null, ret);
      } else {
        callback("No Data Found", null);
      }
    });
  },
  manageArrayObject: function (Model, id, data, key, action, callback) {
    Model.findOne({
      "_id": id
    }, function (err, data2) {message
      if (err) {
        callback(err, null);
      } else if (data2) {
        switch (action) {
          case "create":
            {
              data2[key].push(data);
              data2[key] = _.unique(data2[key]);
              console.log(data2[key]);
              data2.update(data2, {
                w: 1
              }, callback);
            }
            break;
          case "delete":message
            {
              _.remove(data2[key], function (n) {
                return (n + "") == (data + "");
              });
              data2.update(data2, {
                w: 1
              }, callback);
            }
            break;
        }
      } else {
        callback("No Data Found for the ID", null);
      }
    });


  },
  GlobalCallback: function (err, data, res) {
    if (err) {
      res.json({
        error: err,
        value: false
      });
    } else {
      res.json({
        data: data,
        value: true
      });
    }
  },
  generateExcel: function (name, found, res) {
    var name = _.kebabCase(name);
    var excelData = [];
    _.each(found, function (singleData) {
      var singleExcel = {};
      _.each(singleData, function (n, key) {
        if (key != "__v" && key != "createdAt" && key != "updatedAt") {
          singleExcel[_.capitalize(key)] = n;
        }
      });
      excelData.push(singleExcel);
    });
    var xls = sails.json2xls(excelData);
    var folder = "./.tmp/";
    var path = name + "-" + moment().format("MMM-DD-YYYY-hh-mm-ss-a") + ".xlsx";
    var finalPath = folder + path;
    sails.fs.writeFile(finalPath, xls, 'binary', function (err) {
      if (err) {
        res.callback(err, null);
      } else {
        fs.readFile(finalPath, function (err, excel) {
          if (err) {
            res.callback(err, null);
          } else {
            res.set('Content-Type', "application/octet-stream");
            res.set('Content-Disposition', "attachment;filename=" + path);
            res.send(excel);
            sails.fs.unlink(finalPath);
          }
        });
      }
    });

  },
  uploadFile: function (filename, callback) {
    var id = mongoose.Types.ObjectId();
    var extension = filename.split(".").pop();
    extension = extension.toLowerCase();
    if (extension == "jpeg") {
      extension = "jpg";
    }
    var newFilename = id + "." + extension;

    var writestream = gfs.createWriteStream({
      filename: newFilename
    });
    var imageStream = fs.createReadStream(filename);

    function writer2(metaValue) {
      var writestream2 = gfs.createWriteStream({
        filename: newFilename,
        metadata: metaValue
      });
      writestream2.on('finish', function () {
        callback(null, {
          name: newFilename
        });
        fs.unlink(filename);
      });
      fs.createReadStream(filename).pipe(writestream2);
    }

    if (extension == "png" || extension == "jpg" || extension == "gif") {
      lwip.open(filename, extension, function (err, image) {
        if (err) {
          console.log(err);
          callback(err, null);
        } else {
          var upImage = {
            width: image.width(),
            height: image.height(),
            ratio: image.width() / image.height()
          };

          if (upImage.width > upImage.height) {
            if (upImage.width > MaxImageSize) {
              image.resize(MaxImageSize, MaxImageSize / (upImage.width / upImage.height), function (err, image2) {
                if (err) {
                  console.log(err);
                  callback(err, null);
                } else {
                  upImage = {
                    width: image2.width(),
                    height: image2.height(),
                    ratio: image2.width() / image2.height()
                  };
                  image2.writeFile(filename, function (err) {
                    writer2(upImage);
                  });
                }
              });
            } else {
              writer2(upImage);
            }
          } else {
            if (upImage.height > MaxImageSize) {
              image.resize((upImage.width / upImage.height) * MaxImageSize, MaxImageSize, function (err, image2) {
                if (err) {
                  console.log(err);
                  callback(err, null);
                } else {
                  upImage = {
                    width: image2.width(),
                    height: image2.height(),
                    ratio: image2.width() / image2.height()
                  };
                  image2.writeFile(filename, function (err) {
                    writer2(upImage);
                  });
                }
              });
            } else {
              writer2(upImage);
            }
          }
        }
      });
    } else {
      imageStream.pipe(writestream);
    }

    writestream.on('finish', function () {
      callback(null, {
        name: newFilename
      });
      fs.unlink(filename);
    });
  },
  readUploaded: function (filename, width, height, style, res) {
    var readstream = gfs.createReadStream({
      filename: filename
    });
    readstream.on('error', function (err) {
      res.json({
        value: false,
        error: err
      });
    });

    function writer2(filename, gridFSFilename, metaValue) {
      var writestream2 = gfs.createWriteStream({
        filename: gridFSFilename,
        metadata: metaValue
      });
      writestream2.on('finish', function () {
        fs.unlink(filename);
      });
      fs.createReadStream(filename).pipe(res);
      fs.createReadStream(filename).pipe(writestream2);
    }

    function read2(filename2) {
      var readstream2 = gfs.createReadStream({
        filename: filename2
      });
      readstream2.on('error', function (err) {
        res.json({
          value: false,
          error: err
        });
      });
      readstream2.pipe(res);
    }
    var onlyName = filename.split(".")[0];
    var extension = filename.split(".").pop();
    if ((extension == "jpg" || extension == "png" || extension == "gif") && ((width && width > 0) || (height && height > 0))) {
      //attempt to get same size image and serve
      var newName = onlyName;
      if (width > 0) {
        newName += "-" + width;
      } else {
        newName += "-" + 0;
      }
      if (height) {
        newName += "-" + height;
      } else {
        newName += "-" + 0;
      }
      if (style && (style == "fill" || style == "cover")) {
        newName += "-" + style;
      } else {
        newName += "-" + 0;
      }
      var newNameExtire = newName + "." + extension;
      gfs.exist({
        filename: newNameExtire
      }, function (err, found) {
        if (err) {
          res.json({
            value: false,
            error: err
          });
        }
        if (found) {
          read2(newNameExtire);
        } else {
          var imageStream = fs.createWriteStream('./.tmp/uploads/' + filename);
          readstream.pipe(imageStream);
          imageStream.on("finish", function () {
            lwip.open('./.tmp/uploads/' + filename, function (err, image) {
              ImageWidth = image.width();
              ImageHeight = image.height();
              var newWidth = 0;
              var newHeight = 0;
              var pRatio = width / height;
              var iRatio = ImageWidth / ImageHeight;
              if (width && height) {
                newWidth = width;
                newHeight = height;
                switch (style) {
                  case "fill":
                    if (pRatio > iRatio) {
                      newHeight = height;
                      newWidth = height * (ImageWidth / ImageHeight);
                    } else {
                      newWidth = width;
                      newHeight = width / (ImageWidth / ImageHeight);
                    }
                    break;
                  case "cover":
                    if (pRatio < iRatio) {
                      newHeight = height;
                      newWidth = height * (ImageWidth / ImageHeight);
                    } else {
                      newWidth = width;
                      newHeight = width / (ImageWidth / ImageHeight);
                    }
                    break;
                }
              } else if (width) {
                newWidth = width;
                newHeight = width / (ImageWidth / ImageHeight);
              } else if (height) {
                newWidth = height * (ImageWidth / ImageHeight);
                newHeight = height;
              }
              image.resize(parseInt(newWidth), parseInt(newHeight), function (err, image2) {
                image2.writeFile('./.tmp/uploads/' + filename, function (err) {
                  writer2('./.tmp/uploads/' + filename, newNameExtire, {
                    width: newWidth,
                    height: newHeight
                  });
                });
              });
            });
          });
        }
      });
      //else create a resized image and serve
    } else {
      readstream.pipe(res);
    }
    //error handling, e.g. file does not exist
  },
  email: function (data, callback) {
    Password.find().exec(function (err, userdata) {
      if (err) {
        console.log(err);
        callback(err, null);
      } else if (userdata && userdata.length > 0) {
        if (data.filename && data.filename != "") {
          //console.log("filename ", data.filename);
          request.post({
            url: requrl + "config/emailReader/",
            json: data
          }, function (err, http, body) {
            //console.log("body : ", body);
            if (err) {
              console.log(err);
              callback(err, null);
            } else {
              console.log('email else');
              if (body && body.value != false) {
                var helper = require('sendgrid').mail

                from_email = new helper.Email("info@weavers.com")
                to_email = new helper.Email(data.to)
                subject = data.subject
                content = new helper.Content("text/html", body)
                mail = new helper.Mail(from_email, subject, to_email, content)
                console.log("user data ",userdata[0].name);
                var sg = require('sendgrid')(userdata[0].name);
                var request = sg.emptyRequest({
                  method: 'POST',
                  path: '/v3/mail/send',
                  body: mail.toJSON()
                });

                sg.API(request, function (error, response) {
                  if (error) {
                    callback(null, error);
                    console.log('Error response received');
                  } else {
                    console.log(response.statusCode)
                    console.log(response.body)
                    console.log(response.headers)
                    callback(null, response);
                  }
                })
              } else {
                callback({
                  message: "Some error in html"
                }, null);
              }
            }
          });
        } else {
          callback({
            message: "Please provide params"
          }, null);
        }
      } else {
        callback({
          message: "No api keys found"
        }, null);
      }
    });
  },
  message: function (data, callback) {
    if (data.mobile || data.mobileno) {
      // request.get({
      //     url: "http://etsdom.kapps.in/webapi/wohlig/api/gofish_sms.py?sms_text=" + data.content + "&mobile_number=" + data.mobile
      // }, function(err, http, body) {
      //     if (err) {
      //         console.log(err);
      //     } else {
      //         console.log(body);
      //     }
      // });
      request.get({
        url: "http://api-alerts.solutionsinfini.com/v3/?method=sms&api_key=Ab239cf5d62a8e6d2c531663f289d0f5d&to=" + data.mobile + "&sender=JAKNWS&message=" + data.content + "&format=json"
      }, function (err, http, body) {
        if (err) {
          console.log(err);
          callback(err, null);
        } else {
          console.log(body);
        }
      });
    } else {
      callback({
        message: "Mobile number not found"
      }, null);
    }
  },
  message2: function (data, callback) {
    if (data.mobile || data.mobileno) {
      request.get({
        url: "http://api-alerts.solutionsinfini.com/v3/?method=sms&api_key=Ab239cf5d62a8e6d2c531663f289d0f5d&to=" + data.mobile + "&sender=JAKNWS&message=" + data.content + "&format=json"
      }, function (err, http, body) {
        if (err) {
          console.log(err);
          callback(err, null);
        } else {
          console.log(body);
          callback(null, body);
        }
      });
    } else {
      callback({
        message: "Mobile number not found"
      }, null);
    }
  },
  checkCall: function (data, callback) {
    Booking.findOne({
      _id: data._id
    }).populate("user", "-_id mobile").populate("expert", "-_id mobileno").lean().exec(function (err, data2) {
      if (err) {
        console.log(err);
        callback(err, null);
      } else if (_.isEmpty(data2)) {
        console.log("No calls found");
        callback({
          mesage: "No calls found"
        }, null);
      } else {
        if (data2.user && data2.user.mobile) {
          console.log("Calls found");
          console.log(data2);
          data2.callDuration = parseInt(data2.callDuration.split(" ")[0]);
          data2.callDuration = data2.callDuration * 60;
          data2.callTime = moment(data2.callTime).add(5, "hours").add(30, "minutes").format("YYYY-MM-DD HH:mm");
          // data2.callTime = moment(data2.callTime).format("YYYY-MM-DD HH:mm");
          console.log(data2.callTime);
          data2.endTime = moment(data2.callTime).add(data2.callDuration, 's').format("YYYY-MM-DD HH:mm");
          console.log(data2.endTime);
          request.get({
            url: "http://etsdom.kapps.in/webapi/wohlig/api/wohlig_c2c.py?customer_number=+91" + data2.user.mobile + "&agent_number=+91" + data2.expert.mobileno + "&call_duration=" + data2.callDuration + "&call_start_time=" + data2.callTime + "&call_stop_time=" + data2.endTime + "&auth_key=bb23a8a029-8bd4-4e44-97ccaa"
          }, function (err, http, body) {
            if (err) {
              console.log("error", err);
              callback(err, null);
            } else {
              console.log(body);
              body = JSON.parse(body);
              if (body && body.callId) {
                Booking.update({
                  _id: data._id
                }, {
                  $set: {
                    callId: body.callId
                  }
                }, function (err, respo) {
                  if (err) {
                    console.log(err);
                    callback(err, null);
                  } else {
                    callback(null, {
                      mesage: "Calls found"
                    });
                  }
                });
              } else {
                callback({
                  message: "Some error"
                }, null);
              }
            }
          });
        } else {
          callback({
            message: "User mobile number not found"
          }, null);
        }
      }
    });
  }

};
module.exports = _.assign(module.exports, models);