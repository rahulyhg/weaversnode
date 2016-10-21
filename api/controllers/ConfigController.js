var fs = require("fs");
module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
    emailReader: function(req, res) {
        var isfile2 = fs.existsSync('./views/' + req.body.filename);
        if (isfile2) {
            res.view(req.body.filename, req.body);
        } else {
            res.json({
                value: false,
                message: "Please provide params"
            });
        }
    }
};
module.exports = _.assign(module.exports, controller);
