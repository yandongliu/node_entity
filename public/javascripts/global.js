
// DOM Ready =============================================================
$(document).ready(function() {

    // Populate the user table on initial page load
    //populateTable();

    //IMPORTNAT: naming convention: {pagename}_{DOM type}_{functionality}.
    //functionality: verb + noun
    
    //index page
    //create entity
    $('#index_btn_create_entity').on('click', index_createEntity);
    //create instance
    $('#index_btn_create_instance').on('click', index_createInstance);
    //delete entity
    $('#index_div_entitylist').on('click', 'a.linkdelete', index_deleteEntity);
    //delete instance
    $('#index_div_instancelist').on('click', 'a.linkdelete', index_deleteInstance);
    //populate subentities list once select changes
    $('#index_select_create_instance').change(index_populateSubentities);

    //entity edit page
    $('#entity_edit___btn_create_entity').on('click', entity_edit___createEntity);
    $('#entity_edit___ul_subentity_list').on('click', 'a.linkdelete', entity_edit___delete_subentity_relation);
    $('#entity_edit___btn_add_subentity').on('click', entity_edit___addSubentity);
    $('#entity_edit___btn_create_instance').on('click', entity_edit___createInstance);
    $('#entity_edit___div_instancelist table tbody').on('click', 'a.linkdelete', entity_edit___deleteInstance);
});


/*
  retrieve subentities from id.children
*/
function entity_edit___populateSubentityList(eid, ename) {
  console.log('entity_edit___populateSubentityList');
  $.getJSON( '/entity/rest_subentities/'+eid, function( data ) {
    console.log('subentities:',data);
    var c = '';
    $.each(data, function(i,e){
      c+=('<li> <a href="/entity/show/'+e.id+'">'+e.name+'</a> <a href="#" class="linkdelete" p_id='+eid+' p_name='+ename.replace(/ /g,'%20')+' sube_id='+e.id+' sube_name='+e.name+'>#del</a>');
    });
    $('#entity_edit___ul_subentity_list').html(c);
  });
}

/*
  populate select of all entities
*/
function entity_edit___populateEntitySelect(pid,pname) {
  console.log('entity_edit___populateEntitySelect');
  $.getJSON( '/entity/rest_allentities/', function( data ) {
    var c = '';
    $.each(data, function(i,e){
      //c+=('<option id="'+e.id+'" name="'+e.name+'" p_id="'+pid+'" p_name="'+pname+'" >'+e.name+'</option>');
      c+=('<option id="%s" name="%s" p_id="%s" p_name="%s">%s</option>'.printf(e.id, e.name, pid, pname, e.name));
    });
    $('#entity_edit___select_entity').html(c);
  });
}
// Index Functions =============================================================

//populate subentities when choosing entity for instance creating
function index_populateSubentities() {
  var s_option = $('#index_select_create_instance option:selected');
  var s_entity = s_option.attr('id');
  console.log(1,s_entity);
  $.getJSON( '/entity/rest_subentities/'+s_entity, function( data ) {
    console.log('subentities:',data);
    var c = '<p> please also provide information for (as much as you can): <br/>';
    $.each(data, function(i,d){
        c+=(d.name+':<input type=text />');
    });
    c+='</p>';
    if(data.length>0)
      $('#index_div_subentities').html(c);
    else
      $('#index_div_subentities').html('');
  });
}

function index_populateEntityList() { 
  var entityContent = '<ul id="index_div_entitylist">'; 
  var selectContent_left = '<select id="index_select_create_entity">'; 
  var selectContent= '';
  $.getJSON( '/entity/rest_allentities', function( data ) { 
    $.each(data, function(){
      entityContent += ('<li> <a href="/entity/show/'+this.id+'">'+this.name + '</a> parent:<a href="/entity/show/'+this.p_id+'">'+this.p_name+'</a> <a href="#" class="linkdelete" rel="'+this._id+'">#del</a>');
      selectContent += ('<option id="'+this.id+'" name="'+this.name+'">'+this.name+' </option>');
    }); 
    entityContent += '</ul>';
    $('#index_div_entitylist').html(entityContent);
    $('#index_select_create_entity').html(selectContent);
    $('#index_select_create_instance').html(selectContent);
  });
}

function index_populateInstanceList() { 
  var instanceContent = '<ul id="index_div_instancelist">';
  $.getJSON( '/instance/rest_allinstances', function( data ) { 
    $.each(data, function(){
      //instanceContent += ('<li>'+this.name + ' ' + this.id + ' entity: <a href="/entity/show?="'+this.entity_id+'">'+this.entity_name+'</a> <a href="#" class="linkdelete" rel="'+this._id+'">#del</a>');
      instanceContent += ('<li> %s (<a href="/entity/show/%s">%s</a>) lastedit:%s <a href="#" class="linkdelete" rel="%s">#del</a>'.printf(this.name, this.entity_id, this.entity_name, this.mtime, this._id));
    }); 
    instanceContent += '</ul>';
    // Inject the whole content string into our existing HTML table
    $('#index_div_instancelist').html(instanceContent);
  });
} 

function entity_edit___populateInstanceList(e_id) { 
    console.log('e_id:',e_id);
  var tbody = '';
  //var subentities=[];
  $.getJSON( '/entity/rest_subentities/'+e_id, function( subentities ) {
    console.log('subentities:',subentities);
    $.getJSON( '/instance/rest_instances/'+e_id, function( data ) { 
      console.log('data:',data);
      $.each(data, function(i, instance){
        var c='<td>'+instance.name+'</td>';
        $.each(subentities, function(i, entity) {
          c+='<td>'; 
          c+=instance[entity.id];
          c+='</td>'; 
        });
        console.log('c',c);
        tbody += ('<tr>%s<td><a href="#" class="linkdelete" _id="%s" e_id="%s">#del</a></td></tr>'.printf(c,instance._id,instance.entity_id));
      }); 
      // Inject the whole content string into our existing HTML table
      console.log('tbody',tbody);
      $('#entity_edit___div_instancelist table tbody').html(tbody);
    });
  });
} 

function entity_edit___addSubentity(event) {
    event.preventDefault(); 
    var s_option = $('#entity_edit___select_entity option:selected');
    var id=s_option.attr('id')
    var name=s_option.attr('name')
    var pid=s_option.attr('pid')
    var pname=s_option.attr('pname')
    console.log(id,name,pid,pname);
    var data = {
        'id': pid,
        'name': pname,
        'sube_id': id,
        'sube_name': name
    } 
    $.ajax({
        type: 'POST',
        data: data,
        url: '/entity/addsubentity',
        dataType: 'JSON'
    }).done(function( response ) { 
        if (response.msg === '') { 
          //$('#addField fieldset input').val(''); 
          entity_edit___populateSubentityList(pid, pname);
        } else { 
          alert('Error: ' + response.msg); 
        }
    });
};

function entity_edit___createEntity(event) {
    event.preventDefault(); 
    var errorCount = 0;
    $('#entity_edit___div_create_subentity input').each(function(index, val) {
        if($(this).val() === '') { errorCount++; }
    });

    if(errorCount === 0) {
        var p_id = $(this).attr('eid');
        var p_name = $(this).attr('ename');
        var newEntity = {
            'name': $('#entity_edit___div_create_subentity fieldset input#name').val()
        }
        $.ajax({
            type: 'POST',
            data: newEntity,
            url: '/entity/createentity',
            dataType: 'JSON'
        }).done(function( response ) {
              console.log(response);
            if (response.msg === '') {
              entity_edit___populateEntitySelect(p_id, p_name);
            } else { 
              alert('Error: ' + response.msg); 
            }
        });
    } else {
        alert('Please fill in all fields');
        return false;
    }
};

function entity_edit___createInstance(event) {
    event.preventDefault(); 
    var errorCount = 0;
        var data={};
        $.each(subentities,function(i,e) {
          console.log(e.id);
          console.log(e.name);
          //data[e.id] = 
        });
        var b = $('#entity_edit___div_create_instance').find('fieldSet')[0];
        $.each($(b).find('input'), function(i,e) {
          //console.log(i,e);
          console.log('id:',$(e).attr('id'));
          console.log('name:',$(e).attr('placeholder'));
        });
    $('#entity_edit___div_create_instance input').each(function(index, val) {
        if($(this).val() === '') { errorCount++; }
    }); 
    console.log('sube_name:',subentities);
    if(errorCount === 0) {
        var name = $('#entity_edit___div_create_instance fieldset input#name').val();
        var newInstance = {};
        var b = $('#entity_edit___div_create_instance').find('fieldSet')[0];
        newInstance['e_id'] = $(this).attr('e_id');
        console.log('e_id:', $(this).attr('e_id'));
  
        newInstance['e_name'] = $(this).attr('e_name');
        //var keys=[];
        //console.log(sube);
        $.each($(b).find('input'), function(i,e) {
          //console.log(i,e);
          console.log('id:',$(e).attr('id'));
          console.log('name:',$(e).attr('placeholder'));
          newInstance[$(e).attr('id')] = $(e).val();
          //keys.push($(e).attr('id));
        });
        console.log('newInstance',newInstance);
        $.ajax({
            type: 'POST',
            data: newInstance,
            url: '/instance/createinstance',
            dataType: 'JSON'
        }).done(function( response ) { 
            if (response.msg === '') { 
                $('#entity_edit___div_create_instance fieldset input').val(''); 
                entity_edit___populateInstanceList();
            }
            else { 
                alert('Error: ' + response.msg); 
            }
        });
    } else {
        alert('Please fill in all fields');
        return false;
    }
};

function index_createInstance(event) {
    event.preventDefault(); 
    var errorCount = 0;
    $('#index_div_create_instance input').each(function(index, val) {
        if($(this).val() === '') { errorCount++; }
    }); 
    if(errorCount === 0) {
        var s_option = $('#index_select_create_instance option:selected');
        var ename = s_option.attr('name');
        var eid = s_option.attr('id'); 
        var newInstance = {
            'name': $('#index_div_create_instance fieldset input#name').val(),
            'entity_id': eid,
            'entity_name': ename
        } 
        $.ajax({
            type: 'POST',
            data: newInstance,
            url: '/instance/createinstance',
            dataType: 'JSON'
        }).done(function( response ) { 
            if (response.msg === '') { 
                $('#index_div_create_instance fieldset input').val(''); 
                index_populateInstanceList();
            }
            else { 
                alert('Error: ' + response.msg); 
            }
        });
    } else {
        alert('Please fill in all fields');
        return false;
    }
};
function index_createEntity(event) {
    event.preventDefault();

    var errorCount = 0;
    $('#index_div_create_entity input').each(function(index, val) {
        if($(this).val() === '') { errorCount++; }
    });

    if(errorCount === 0) {
        var s_option = $('#index_select_create_entity option:selected');
        //var ename = s_option.attr('name');
        //var eid = s_option.attr('id');
        var newEntity = {
            'name': $('#index_div_create_entity fieldset input#name').val()
            //'p_name': ename,
            //'p_id': eid
        } 
        $.ajax({
            type: 'POST',
            data: newEntity,
            url: '/entity/createentity',
            dataType: 'JSON'
        }).done(function( response ) { 
            if (response.msg === '') { 
              index_populateEntityList();
            } else { 
              alert('Error: ' + response.msg); 
            }
        });
    } else {
        alert('Please fill in all fields');
        return false;
    }
}; 

function entity_edit___deleteInstance(event) { 
    console.log('instance delete:', $(this).attr('id'), $(this).attr('e_id'));
    var _id = $(this).attr('_id');
    var e_id = $(this).attr('e_id');
    event.preventDefault();
    $.ajax({
        type: 'DELETE',
        url: '/instance/delete/' + _id
    }).done(function( response ) { 
        // Check for a successful (blank) response
        if (response.msg === '') {
        } else {
            alert('Error: ' + response.msg);
        } 
        entity_edit___populateInstanceList(e_id);
    }); 
};
function index_deleteInstance(event) { 
    event.preventDefault();
    $.ajax({
        type: 'DELETE',
        url: '/instance/delete/' + $(this).attr('rel')
    }).done(function( response ) { 
        // Check for a successful (blank) response
        if (response.msg === '') {
        } else {
            alert('Error: ' + response.msg);
        } 
        index_populateInstanceList(); 
    }); 
};
function index_deleteEntity(event) { 
    event.preventDefault();
    $.ajax({
        type: 'DELETE',
        url: '/entity/delete/' + $(this).attr('rel')
    }).done(function( response ) { 
        // Check for a successful (blank) response
        if (response.msg === '') {
        } else {
          alert('Error: ' + response.msg);
        } 
        index_populateEntityList(); 
    }); 
};

//entity still exists after deletion
function entity_edit___delete_subentity_relation(event) {
    event.preventDefault();
    var id = $(this).attr('sube_id');
    var name = $(this).attr('sube_name');
    var p_id = $(this).attr('p_id');
    var p_name = $(this).attr('p_name');
    $.ajax({
        type: 'DELETE',
        url: '/entity/delete_subentity_relation/' + p_id+'/'+id+'/'+name
    }).done(function( response ) { 
        // Check for a successful (blank) response
        if (response.msg === '') {
        } else {
          alert('Error: ' + response.msg);
        } 
        entity_edit___populateSubentityList(p_id,p_name);
    }); 
};
