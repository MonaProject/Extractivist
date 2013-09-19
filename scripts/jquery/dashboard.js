function gather_input() {
  var types = ['actors', 'events', 'places', 'times'];
  
  var input = [];

  for(var type in types) {
    var list = $('#' + types[type] + '_query_list input');
    for(var i = 0; i < list.length; i++) {
      if(list[i].checked) {
        input.push({type: types[type], label: list[i].value});
      }
    }
  }
  
  return input;
}

function visualize() {
  var input = gather_input();
 
  var filter = '[';
  for(var entity in input) {
    filter += '{"type": "' + input[entity].type + '", "label": "' + input[entity].label + '"}, ';
  }
  filter = filter.substring(0, filter.length - 2) + ']';

  window.location.replace('entity?type=' + input[0].type.substring(0, input[0].type.length - 1) + '&name=' + input[0].label + '&filters=' + encodeURIComponent(filter));
  
  /*
  // This is the jQuery way of doing it. I ended up not using it, because it's
  // more difficult to parse on the server side.
  var serialized_object = {}
  for(var i = 0; i < input.length; i++) {
    serialized_object[i] = input[i];
  }
  
  console.log(serialized_object);

  console.log( decodeURIComponent($.param(serialized_object) ) );
  */
}

function calculate_results() {
  var input = gather_input();

  if(input.length) {
    $.post('calculate-mentions', {'form': JSON.stringify(input)}, function(data) {
      if(data != 0) {
        $('#big_search_results').html(data + ' events');
        $('.query_results a.button').css('display', 'inline-block');
        $('.query_results span').css('display', 'block');
      }
      else {
        $('#big_search_results').html('No events');
        $('.query_results a.button').css('display', 'none');
        $('.query_results span').css('display', 'none');
      }
    });
  }
  else {
    $('#big_search_results').html('Choose at least one filter');
    $('.query_results a.button').css('display', 'none');
    $('.query_results span').css('display', 'none');
  }
}

$(function() {

  // Yes, I'm basically duplicating the same code a few times here. It didn't work
  // when I tried using a for-loop. This however works, so...
  
  $( "#event_small_search" ).autocomplete({
    source: "event-autocomplete",
    minLength: 1,
    select: function( event, selection ) {
      selection_a = selection.item.label.split('(');
      
      name = '';
      for(var i = 0; i < selection_a.length - 1; i++) {
        if(i === 0)
          name += ' ' + selection_a[i];
        else
          name += ' (' + selection_a[i];
      }
      name = name.substring(1).replace('  ', ' ').trim();
      
      
      // Now add it to the list of events
      var items = $('#events_query_list li label');
      
      var already_in_list = false;
      for(var item in items) {
        if(items[item].innerHTML == name) {
          already_in_list = true;
          break;
        }
      }
      
      if(!already_in_list) {
        var value_name = name;
        if(selection.item.label[selection.item.label.lastIndexOf(')') - 1] == '*') {
          value_name = 'category:' + name;
        }
        $('#events_query_list').append('<li><input type="checkbox" checked="checked" name="events" value="' + value_name + '" id="filter_selection_' + name.replace(/\W/g, '') + '" onclick="calculate_results()" /> <label for="filter_selection_' + name.replace(/\W/g, '') + '">' + name + '</label>');
      }
      
      // Update number of results
      calculate_results();
      
      // Clear search field
      $('#event_small_search').val('');
      return false;
    }
  });

  $( "#actor_small_search" ).autocomplete({
    source: "actor-autocomplete",
    minLength: 1,
    select: function( event, selection ) {
      selection_a = selection.item.label.split('(');
      
      name = '';
      for(var i = 0; i < selection_a.length - 1; i++) {
        if(i === 0)
          name += ' ' + selection_a[i];
        else
          name += ' (' + selection_a[i];
      }
      name = name.substring(1).replace('  ', ' ').trim();
      
      
      // Now add it to the list of actors
      var items = $('#actors_query_list li label');
      
      var already_in_list = false;
      for(var item in items) {
        if(items[item].innerHTML == name) {
          already_in_list = true;
          break;
        }
      }
      
      if(!already_in_list) {
        var value_name = name;
        if(selection.item.label[selection.item.label.lastIndexOf(')') - 1] == '*') {
          value_name = 'category:' + name;
        }
        $('#actors_query_list').append('<li><input type="checkbox" checked="checked" name="actors" value="' + value_name + '" id="filter_selection_' + name.replace(/\W/g, '') + '" onclick="calculate_results()" /> <label for="filter_selection_' + name.replace(/\W/g, '') + '">' + name + '</label>');
      }
      
      // Update number of results
      calculate_results();
      
      // Clear search field
      $('#actor_small_search').val('');
      return false;
    }
  });

  $( "#place_small_search" ).autocomplete({
    source: "place-autocomplete",
    minLength: 1,
    select: function( event, selection ) {
      selection_a = selection.item.label.split('(');
      
      name = '';
      for(var i = 0; i < selection_a.length - 1; i++) {
        if(i === 0)
          name += ' ' + selection_a[i];
        else
          name += ' (' + selection_a[i];
      }
      name = name.substring(1).replace('  ', ' ').trim();
      
      
      // Now add it to the list of places
      var items = $('#places_query_list li label');
      
      var already_in_list = false;
      for(var item in items) {
        if(items[item].innerHTML == name) {
          already_in_list = true;
          break;
        }
      }
      
      if(!already_in_list) {
        var value_name = name;
        if(selection.item.label[selection.item.label.lastIndexOf(')') - 1] == '*') {
          value_name = 'category:' + name;
        }
        $('#places_query_list').append('<li><input type="checkbox" checked="checked" name="places" value="' + value_name + '" id="filter_selection_' + name.replace(/\W/g, '') + '" onclick="calculate_results()" /> <label for="filter_selection_' + name.replace(/\W/g, '') + '">' + name + '</label>');
      }
      
      // Update number of results
      calculate_results();
      
      // Clear search field
      $('#place_small_search').val('');
      return false;
    }
  });

  $( "#time_small_search" ).autocomplete({
    source: "time-autocomplete",
    minLength: 1,
    select: function( event, selection ) {
      selection_a = selection.item.label.split('(');
      
      name = '';
      for(var i = 0; i < selection_a.length - 1; i++) {
        if(i === 0)
          name += ' ' + selection_a[i];
        else
          name += ' (' + selection_a[i];
      }
      name = name.substring(1).replace('  ', ' ').trim();
      
      
      // Now add it to the list of times
      var items = $('#times_query_list li label');
      
      var already_in_list = false;
      for(var item in items) {
        if(items[item].innerHTML == name) {
          already_in_list = true;
          break;
        }
      }
      
      if(!already_in_list) {
        var value_name = name;
        if(selection.item.label[selection.item.label.lastIndexOf(')') - 1] == '*') {
          value_name = 'category:' + name;
        }
        $('#times_query_list').append('<li><input type="checkbox" checked="checked" name="times" value="' + value_name + '" id="filter_selection_' + name.replace(/\W/g, '') + '" onclick="calculate_results()" /> <label for="filter_selection_' + name.replace(/\W/g, '') + '">' + name + '</label>');
      }
      
      // Update number of results
      calculate_results();
      
      // Clear search field
      $('#time_small_search').val('');
      return false;
    }
  });
  
  $('.list_navigator').each(function(x) {
    var list = $($($('.list_navigator')[x]).parent().children('ol')[0]).children('li');
    $(list).css('display', 'none');
    for(var i = 0; i < 10; i++) {
      $(list[i]).css('display', 'list-item');
    }
    
    var pages = Math.ceil(list.length / 10);
    var nav = '<span class="active">1</span>';
    
    if(pages > 1) {
      for(var i = 2; i <= 3; i++)
        nav += ' <a onclick="browse_list(\'' + $($('.list_navigator')[x]).parent().attr('id') + '\', ' + i + ')">' + i + '</a>';
      if(pages > 3)
        nav += ' ... <a onclick="browse_list(\'' + $($('.list_navigator')[x]).parent().attr('id') + '\', ' + pages + ')">' + pages + '</a>';
    }
    
    $($('.list_navigator')[x]).append(nav);
  });
});

function browse_list(topbox, page) {
  var list = $($('#' + topbox).children('ol')[0]).children('li');

  $(list).css('display', 'none');
  for(var i = (page - 1) * 10; i < page * 10; i++) {
    $(list[i]).css('display', 'list-item');
  }
  
  var nav_menu = $($('#' + topbox).children('.list_navigator')[0]);
  var nav = '';
  if(list.length > 1) {
    if(list.length <= 60) {
      for(var i = 1; i <= Math.ceil(list.length / 10); i++)
        if(i === page)
          nav += ' <span class="active">' + i + '</span> ';
        else
          nav += ' <a onclick="browse_list(\'' + topbox + '\', ' + i + ')">' + i + '</a> ';
    }
    else {
      if(page <= 2) {
        for(var i = 1; i <= 3; i++)
          if(i === page)
            nav += ' <span class="active">' + i + '</span> ';
          else
            nav += ' <a onclick="browse_list(\'' + topbox + '\', ' + i + ')">' + i + '</a> ';
        nav += ' ... <a onclick="browse_list(\'' + topbox + '\', ' + Math.ceil(list.length / 10) + ')">' + Math.ceil(list.length / 10) + '</a> ';
      }
      else if(page + 2 > Math.ceil(list.length / 10)) {
        nav += '<a onclick="browse_list(\'' + topbox + '\', 1)">1</a> ... ';
        for(var i = Math.ceil(list.length / 10) - 2; i <= Math.ceil(list.length / 10); i++)
          if(i === page)
            nav += ' <span class="active">' + i + '</span> ';
          else
            nav += ' <a onclick="browse_list(\'' + topbox + '\', ' + i + ')">' + i + '</a> ';
      }
      else {
        nav += '<a onclick="browse_list(\'' + topbox + '\', 1)">1</a> ... ';
        
        nav += ' <a onclick="browse_list(\'' + topbox + '\', ' + (page - 1) + ')">' + (page - 1) + '</a> ';
        nav += ' <span class="active">' + page + '</span> ';
        nav += ' <a onclick="browse_list(\'' + topbox + '\', ' + (page + 1) + ')">' + (page + 1) + '</a> ';
        
        nav += ' ... <a onclick="browse_list(\'' + topbox + '\', ' + Math.ceil(list.length / 10) + ')">' + Math.ceil(list.length / 10) + '</a> ';
      }
    }
  }
  nav_menu.empty();
  nav_menu.append(nav);
}