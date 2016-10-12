module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
  getContent:function(req,res){
    if(req.body){
      Metal.getContent(req.body,res.callback);
    }
    else {
      res.json({value:false,data:{message:"Invalid Request"}})
    }
  },
  getOneContent:function(req,res){
    if(req.body){
      Metal.getOneContent(req.body,res.callback);
    }
    else {
      res.json({value:false,data:{message:"Invalid Request"}})
    }
  },

deleteContent: function(req, res) {
if (req.body) {
if (req.body._id && req.body._id !== "") {
//	console.log("not valid");
Metal.deleteContent(req.body, function(err, respo) {
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
  saveContent:function(req,res){
    if(req.body){
      Metal.saveContent(req.body,res.callback);
    }
    else{
      res.json({value:false,data:{message:"Invalid Request"}})
    }
  },
  getMetal:function(req,res){
    if(req.body){
      Metal.getMetal(req.body,res.callback);
    }
    else {
      res.json({value:false,data:{message:"Invalid Request"}})
    }
  },

};
module.exports = _.assign(module.exports, controller);
