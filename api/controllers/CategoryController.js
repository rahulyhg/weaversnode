module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
  getHomeCategory:function(req,res){
    if(req.body){
      Category.getHomeCategory(req.body,res.callback);
    }
    else {
      res.json({value:false,data:{message:"Invalid Request"}})
    }
  },
  getCategory:function(req,res){
    if(req.body){
      Category.getCategory(req.body,res.callback);
    }
    else {
      res.json({value:false,data:{message:"Invalid Request"}})
    }
  },

  getImages:function(req,res){
    if(req.body){
      Category.getImages(req.body,res.callback);
    }
    else {
      res.json({value:false,data:{message:"Invalid Request"}})
    }
  },
  getOneImages:function(req,res){
    if(req.body){
      Category.getOneImages(req.body,res.callback);
    }
    else {
      res.json({value:false,data:{message:"Invalid Request"}})
    }
  },

  deleteImages: function(req, res) {
  if (req.body) {
  if (req.body._id && req.body._id !== "") {
  //	console.log("not valid");
  Category.deleteImages(req.body, function(err, respo) {
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
  },
  saveImages:function(req,res){
    if(req.body){
      Category.saveImages(req.body,res.callback);
    }
    else{
      res.json({value:false,data:{message:"Invalid Request"}})
    }
  },

};
module.exports = _.assign(module.exports, controller);
