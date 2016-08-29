var mongo = require('mongoskin');
var db = mongo.db("mongodb://localhost:27017/nodetest2", {native_parser:true});


var user1 = {username: 'c',
    email: 'd',
    fullname: 'e',
    age: 'f',
    location: 'g',
    newfield: '000',
    gender: 'h'};

console.log('inserting...');

db.collection('userlist').insert(user1, function(err, result) {
    if (err) throw err;
    console.log('insert user:', result);
});

console.log('updating...');
db.collection('userlist').update({username:'c'}, {$set:{email:'d_new'}},{multi:true},function(err, result) {
    if (err) throw err;
    console.log('updating user:', result);
});


console.log('retrieving...');
/*
db.collection('userlist').find({}, function(err, result) {
    if (err) throw err;
    result.each(function(err,user) {
      console.log('user:',user);
    });
});
*/

db.collection('userlist').find().toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
});

console.log('done.');
