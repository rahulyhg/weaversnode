module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

  getCategory:function(req,res){
    if(req.body){
      Home.getCategory(req.body,res.callback);
    }
    else {
      res.json({value:false,data:{message:"Invalid Request"}})
    }
  },
  saveHomeCategory:function(req,res){
    if(req.body){
      Home.saveHomeCategory(req.body,res.callback);
    }
    else {
      res.json({value:false,data:{message:"Invalid Request"}})
    }
  },
  getOneHomeCategory:function(req,res){
    if(req.body){
      Home.getOneHomeCategory(req.body,res.callback);
    }
    else {
      res.json({value:false,data:{message:"Invalid Request"}})
    }
  },
  deleteHomeCategory: function(req, res) {
  if (req.body) {
  if (req.body._id && req.body._id !== "") {
  //	console.log("not valid");
  Home.deleteHomeCategory(req.body, function(err, respo) {
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
};
module.exports = _.assign(module.exports, controller);
