'use strict';

var express = require('express');
var router = express.Router();
var util = require('../util');
var async = require('async');
var _ = require('lodash');


/* Restful service
*/
router.get('/rest_entity/:id', function(req, res) {
  var db = req.db;
  var eid = req.params.id;
  db.collection('entity').findOne({id:eid}, function (err, entity) {
    console.log(entity);
    if(!err&&entity) {
      res.json(entity);
    } else {
      res.json({});
    }
  });
});

function foo_stack(db, rs, stack,path, cb) {
  //var stack=[];
  //stack.push(eid);
  if(stack.length>0) {
    console.log('stack:', stack);
    var child = stack.pop();
    path.push(child);

    db.collection('entity').find({children:{$elemMatch:{id:child}}}).toArray(function (err, items) {
      console.log('retrieved:',_.pluck(items,'id'));
        if(items.length==0) {
          console.log('items len==0 stack:', stack);
          console.log('found a path:',path);
          //rs.push(path);
          //cb();
        } else {
          _.each(items, function(e) {
            stack.push(e.id);
          });
          foo_stack(db,rs,stack, path,cb);

          //_.each(items,function(e) {
            //path.push(e.id);
            //path.pop();
          //});
        }
    });
  }
}

function foo2(path, db, child, rs, cb) {
  db.collection('entity').find({children:{$elemMatch:{id:child}}}).toArray(function (err, items) {
    if(items.length==0) {
      rs.push(path.slice(0));
      cb(rs);
    } else {
      _(items).each(function(e) {
        path.push(e.id);
        foo2(path, db, e.id, rs, function(rs1) {
          rs = rs.concat(rs1);
          path.pop();
        });
      });
    }
  });
}

function findPath(path, db, child,  cb) {
  var rs = [];
  db.collection('entity').find({children:{$elemMatch:{id:child}}}).toArray(function (err, items) {
    if(items.length==0) {
      cb('no parent', [path.slice(0).reverse()]);
    } else { 
      async.eachSeries(items, function(e, cb1) {
        path.push(e.id);
        findPath(path, db, e.id,  function(err , rs1) {
          rs = rs.concat(rs1);
          path.pop();
          cb1(); 
        });
      }, function(err){
        if(err) console.log('async error.');
        cb(err, rs);
      });
    }
  });
}

router.get('/test/:id', function(req, res) {
  var db = req.db;
  var eid = req.params.id;
  var path=[eid];
  var rs=[];
  var stack=[eid];

  findPath(path, db, eid, function(err, rs) {
    console.log('err:',err);
    console.log('path rs:',rs);
  });
  res.send('hi');
});

router.get('/rest_parententities/:id', function(req, res) {
  var db = req.db;
  var eid = req.params.id;
  console.log('rest_parententities:',req.params);
  db.collection('entity').find({children:{$elemMatch:{id:eid}}}).toArray(function (err, items) {
    console.log(items);
    res.json(items);
  });
});
router.get('/rest_subentities/:id', function(req, res) {
  var db = req.db;
  var eid = req.params.id;
  console.log('rest_subentities:',req.params);
  db.collection('entity').findOne({id:eid}, function (err, item) {
    console.log(eid,item);
    res.json(item?item.children||[]:[]);
  });
});

router.get('/rest_allentities', function(req, res) {
  var db = req.db;
  db.collection('entity').find().toArray(function (err, items) {
    res.json(items);
  });
});

/*
 * page show entity
 */
router.get('/show/:id', function(req, res) {
  var db = req.db;
  var eid = req.params.id;
  console.log('entity params:',req.params);
  async.series([
    function(cb) {
      db.collection('entity').findOne({id:eid}, function (err, entity) {
        entity.name = util.unescape_string(entity.name);
        cb(null, entity);
      });
    },
    function(cb) {
      db.collection('instance').find({entity_id:eid}).toArray(function (err, instances) {
        cb(null, instances);
      });
    },
    function(cb) {
      db.collection('entity').findOne({id:eid}, function (err, entity) {
        cb(null, entity.children||[]);
      });
    },
    function(cb) {
      var path=[eid];
      findPath(path, db, eid,  function(err, paths){
        console.log(eid,paths);
        cb(null, paths);
      });
    },
    function(cb) {
      var path=[eid];
      db.collection('entity').find({children:{$elemMatch:{id:eid}}}).toArray(function (err, items) {
        cb(null, items||[]);
      });
    }
  ], function (err, r) {
       console.log(JSON.stringify(r[2]));
       res.render('entity', { title: 'Entity', entity:r[0], instances:r[1], subentities:r[2], parententities:r[4], paths:r[3], json_subentities:JSON.stringify(r[2]) });
  });
});

/*
 * page edit
 */
router.get('/edit/:id', function(req, res) {
  var db = req.db;
  console.log('edit entity params:',req.params);
  var eid = req.params.id;
  async.series([
  ], function(err, r) {
  });
  db.collection('entity').findOne({id:eid}, function(err, item) {
    if(!err&&item) {
      console.log('entity:',item.id);
      //find all entities to populate entity list
      db.collection('entity').find().toArray(function(err, allentities) {
        //find all instances
        db.collection('instance').find({entity_id:eid}).toArray(function (err, instances) {
          console.log('instances:',_.pluck(instances,'name'));
          if(!('children' in item)) item.children=[];
          console.log('children entities:',_.pluck(item.children, 'id'));
          res.render('entity_edit', { title: 'Edit '+item.name, instances:instances, subentities:item.children, entity:item, allentities:allentities, json_subentities:JSON.stringify(item.children)});
        });
      });
    }
    else
      res.send('entity not found');
  });
});

/*
  index page create entity
*/
router.post('/createentity', function(req, res) {
    var db = req.db;
    console.log('create entity params:',req.body);
    if('name' in req.body) {
      var obj={};
      //console.log('has entity name:',req.body.name);
      obj.id = util.normalize_entity_name(req.body.name);
      obj.name = util.escape_string(req.body.name);
      //console.log('normalized to entity id:',req.body.id);
      obj.mtime = new Date();
      obj.author = 'admin';
      obj.children = req.body.children||[];
      //verify p_id exists
      db.collection('entity').insert(obj, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
      });
    } else {
       res.send('');
    }
});

/* edit page add subentity relation
 one entity can have multiple sub entities
*/ 
router.post('/addsubentity', function(req, res) {
    var db = req.db;
    console.log('addsubentity params:',req.body);
    var id = req.body.id;
    var sube_id = req.body.sube_id;
    var sube_name = req.body.sube_name;
    var mtime = new Date();
    var author = 'admin';
    //verify p_id exists
    //check for duplicate children
    db.collection('entity').update({id:id},{$push:{children:{id:sube_id,name:sube_name}},$set:{mtime:mtime, author:author}}, function(err, result){
      res.send(
          (err === null) ? { msg: '' } : { msg: err }
      );
    });
});

/*
  edit page create subentity
*/
router.post('/dep_createsubentity', function(req, res) {
    var db = req.db;
    console.log('create subentity params:',req.body);

    var entity = {};
    entity.name = util.escape_string(req.body.name);
    entity.id = util.normalize_entity_name(req.body.name);
    entity.p_id = req.body.p_id;
    entity.p_name = util.escape_string(req.body.p_name);
    entity.mtime = new Date();
    entity.author = 'admin';

    db.collection('entity').insert(entity, function(err, result){
      res.send(
          (err === null) ? { msg: '' } : { msg: err }
      );
    });
});

router.delete('/delete/:id', function(req, res) {
    var db = req.db;
    var eid = req.params.id;
    console.log('delete entity params:',req.params);
    //also delete all its instances
    db.collection('entity').removeById(eid, function(err, result) {
        res.send((result === 1) ? { msg: '' } : { msg:'error: ' + err });
    });
});

router.delete('/delete_subentity_relation/:pid/:eid/:ename', function(req, res) {
  console.log('delete_subentity_relation params:', req.params);
  var db = req.db;
  var pid = req.params.pid;
  var eid = req.params.eid;
  var ename = req.params.ename;
  db.collection('entity').update({id:pid},{$pull:{children:{id:eid,name:ename}}},{multi:true}, function(err, result) {
      res.send((result === 1) ? { msg: '' } : { msg:'error: ' + err });
  });
});


module.exports = router;
