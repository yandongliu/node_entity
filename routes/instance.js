var express = require('express');
var router = express.Router();
var util = require('../util');
var _ = require('lodash');


/* Restful service
*/
router.get('/rest_allinstances', function(req, res) {
  var db = req.db;
  db.collection('instance').find().toArray(function (err, items) {
    res.json(items);
  });
});

router.get('/rest_instances/:e_id', function(req, res) {
  var db = req.db;
  var e_id= req.params.e_id; 
  db.collection('instance').find({entity_id:e_id}).toArray(function (err, items) {
    res.json(items);
  });
});

router.post('/createinstance', function(req, res) {
    var db = req.db;
    console.log('createinstance:',req.body);
    if('name' in req.body) {
      console.log('has instance name:',req.body.name);
      var inst = {};
      //inst.id = util.normalize_entity_name(req.body.name);
      inst.name = req.body.name;
      inst.mtime = new Date();
      inst.author = 'admin';
      inst.entity_id = req.body.e_id;
      inst.entity_name = req.body.e_name;
      var keys=['name','e_id','e_name'];
      console.log('print:',typeof(req.body),req.body);
      console.log('req.body has name:', req.body.hasOwnProperty('name'));
      console.log('req.body has food_court:', req.body.hasOwnProperty('food_court'));
      console.log('_ for k in req.body');
      _.each(req.body, function(val, key) {
        if(!util.include(keys, key)) {
          console.log(key,val);
          inst[key] = val;
        }
      });
      db.collection('instance').insert(inst, function(err, result){
        console.log('create instance err:',err);
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
      });
    } else {
      res.send('');
    }
});

router.delete('/delete/:_id', function(req, res) {
    var db = req.db;
    var inst = req.params._id;
    console.log('delete inst params:',req.params);
    db.collection('instance').removeById(inst, function(err, result) {
        res.send((result === 1) ? { msg: '' } : { msg:'error: ' + err });
    });
});

module.exports = router;
