var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/lcm_test');

var mongooseTypes = require("mongoose-types");
mongooseTypes.loadTypes(mongoose);
