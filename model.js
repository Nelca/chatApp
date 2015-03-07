const MONGO_URL = 'mongodb://localhost/user';
//const MONGO_URL = process.env.MONGOHQ_URL;
var mongoose = require('mongoose');
var db = mongoose.connect(MONGO_URL);

// Modelの定義
var UserSchema = new mongoose.Schema({
    user_name : String,
    password  : String
},{collection: 'info'});

exports.User = db.model('User', UserSchema);
