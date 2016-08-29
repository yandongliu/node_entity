var express = require('express');
var router = express.Router();
var _ = require('lodash');
var util = require('../util');
var async = require('async'); 

/* GET home page. */
router.get('/', function(req, res) {
  var db = req.db;
  async.series([
    function(cb) {
      db.collection('entity').find().toArray(function (err, items) {
        _(items).each(function(e) {
          e.name = util.unescape_string(e.name);
        });
        cb(null, items);
      });
    },
    function(cb) {
      db.collection('instance').find().toArray(function (err, insts) {
        cb(null, insts);
      });
    }
  ], function(err,r) {
       res.render('index', { title: 'Express', entities:r[0], instances:r[1] });
  });
});

module.exports = router;
