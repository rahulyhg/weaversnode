module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
    saveContact: function (req, res) {
		if (req.body) {
			Contact.saveContactData(req.body, function (err, data) {
				if (err) {
					res.json({
						value: false,
						data: err
					});
				} else {
					res.json({
						value: true,
						data: data
					});
				}
			});
		} else {
			res.json({
				value: false,
				data: "Invalid Request"
			});
		}
	},
};
module.exports = _.assign(module.exports, controller);
