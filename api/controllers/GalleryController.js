module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
  getImages:function(req,res){
    if(req.body){
      Gallery.getImages(req.body,res.callback);
    }
    else {
      res.json({value:false,data:{message:"Invalid Request"}})
    }
  },
  saveImages:function(req,res){
    if(req.body){
      Gallery.saveImages(req.body,res.callback);
    }
    else{
      res.json({value:false,data:{message:"Invalid Request"}})
    }
  },
  getOneImages:function(req,res){
    if(req.body){
      Gallery.getOneImages(req.body,res.callback);
    }
    else {
      res.json({value:false,data:{message:"Invalid Request"}})
    }
  },
  deleteImages: function(req, res) {
  if (req.body) {
      if (req.body._id && req.body._id !== "") {
      //	console.log("not valid");
        Gallery.deleteImages(req.body, function(err, respo) {
            if (err) {
                  res.json({
                      value: false,
                      data: err
                  });
            } else {
                res.json({
                  value: true,
                  data: respo
                });
            }
        });
        } else {
        res.json({
              value: false,
              data: "Invalid Id"
        });
      }
    } else {
          res.json({
          value: false,
          data: "Invalid call"
    });
    }
    }
};
module.exports = _.assign(module.exports, controller);
