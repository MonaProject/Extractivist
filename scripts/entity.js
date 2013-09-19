  /**************************************************************************/

  /* Global stuff */

  // List of visualizations. Add more using .push()
  var visualizations = [];
  
  // List of currently active filters
  var filters = {};
  
  // The function that is used to sort data items
  var sorter = function(x) { return x };
  
  // Currently active color
  var active_colorizer = 'count';

  // The currently opened tab
  var current_tab = 'events';
  
  // Current focus (similar to open tab)
  var current_focus = 'events';
  
  // The currently opened big visualization
  var big_vis = 'time';
  
  // Stores a copy of all the data
  var all_data;
  
  // Time min and max
  var time_minmax = [];
  
  // Currently active entity filters
  var filtered_entities = [];
  
  // Event IDs for those entities
  var allowed_event_ids = [];
  
  // Used for popups to calculate %
  var entity_total = {};
  
  // Used for popup charts
  var popup_data = {};
  
  // Map
  var map_size = 0;
  


  /**************************************************************************/
  
  /* Tiny little helper functions */


  /**
   * Only show items with a higher value than min_count
   */
  function between_values(x, min, max) {
    return {'passed': x.value >= min && x.value <= max,
            'value':  x.value};
  }
  
  /**
   * Show only times with a timestamp in this range
   */
  function occurs_between(x, min, max) {
    var count = 0;
    if(x.timestamps.length > 0) {
      for(var timestamp in x.timestamps) {
        if(x.timestamps[timestamp].finish > min && x.timestamps[timestamp].start < max ||
           x.timestamps[timestamp].start < max && x.timestamps[timestamp].finish > min) {
          count++;
        }
      }
    }
    if($('#timeframe_filter')[0].children.length > 0)
      if(!$('#only_show_entities_with_time')[0].checked) {
        count += (x.value - x.timestamps.length);
      }

    return {'passed': count > 0,
            'value': count}
  }
  
  /**
   *
   */
  function is_allowed_entity(x, allowed_event_ids) {
    var passed = 0;
  
    for(var event in x.events) {
      if(allowed_event_ids.indexOf(x.events[event]) !== -1) {
        passed++;
      }
      
    }
    
    return {'passed': passed > 0, 'value': passed}
  }

  /**
   * Gets the min and max time
   */
  function get_time_range(x) {
    min = 99999999999999;
    max = 0;
    for(var time in x) {
      for(var timestamp in x[time]['timestamps']) {
        if(x[time]['timestamps'][timestamp]['start'] < min)
          min = x[time]['timestamps'][timestamp]['start'];
        if(x[time]['timestamps'][timestamp]['finish'] > max)
          max = x[time]['timestamps'][timestamp]['finish'];
      }
    }

    return [min, max];
  }

  /**
   *
   */
  function filter(data) {
    for(var filter in filters) {
      data = filter_helper(data, filters[filter]);
    }
    return data;
  }

  /**
   *
   */
  function filter_helper(data, data_filter) {
    new_data = [];
    
    for(var x in data) {
      var data_item = data_filter(data[x]);
      if(data_item.passed) {
        data[x].value = data_item.value;
        new_data.push(data[x]);
      }
    }
    return new_data;
  }


  /**
   * Valid event IDs for currently filtered entities
   */
  function retrieve_valid_event_ids() {
    var types = ['actors', 'events', 'places', 'times'];
    
    var filter = '[';
    for(var entity in filtered_entities) {
      if(types.indexOf(filtered_entities[entity].type) !== -1)
        filter += '{"type": "' + filtered_entities[entity].type + '", "label": "' + filtered_entities[entity].label + '"}, ';
    }
    filter = filter.substring(0, filter.length - 2) + ']';
    
    $.post('calculate-mentions-verbose', {'form': filter}, function(data) {
      allowed_event_ids = JSON.parse(data);
      $('.current_focus_count').text(allowed_event_ids.length);
      filters['entity'] = function(x) { return is_allowed_entity(x, allowed_event_ids) };
      redraw_visualizations();
    });
    
    return allowed_event_ids;
  }

  /**
   *
   */
  function add_entity_to_filters(type, label) {
    var already_added = false;
    
    for(var entity in filtered_entities) {
      if(filtered_entities[entity].type == type && filtered_entities[entity].label == label) {
        already_added = true;
      }
    }
  
    if(!already_added)
      filtered_entities.push({'type': type, 'label': label});
    
    retrieve_valid_event_ids();
    redraw_filter();
    set_focus(current_focus);
    redraw_visualizations();
  }

  /**
   *
   */
  function change_entity_focus(type, label) {
    var filter = '[';
    for(var entity in filtered_entities) {
      filter += '{"type": "' + filtered_entities[entity].type + '", "label": "' + filtered_entities[entity].label + '"}, ';
    }
    filter = filter.substring(0, filter.length - 2) + ']';
  
    window.location.replace('entity?type=' + type.substring(0, type.length - 1) + '&name=' + label + '&filters=' + encodeURIComponent(filter));
  }

  /**
   *
   */
  function remove_entity(type, label) {
    var new_filtered_entities = [];
    for(var entity in filtered_entities) {
      if(!(filtered_entities[entity].type == type && filtered_entities[entity].label == label)) {
        new_filtered_entities.push(filtered_entities[entity]);
      }
    }
    filtered_entities = new_filtered_entities;
    redraw_filter();
    retrieve_valid_event_ids();
    set_focus(current_focus);
    redraw_visualizations();
  }


  /**
   *
   */
  function redraw_filter() {   
    var types = ['actors', 'events', 'places', 'times'];
    $('#filtered_entities').empty();
    for(var entity in filtered_entities) {
      var remove = '';
      if(filtered_entities.length !== 1)
        remove = ' <a title="Remove \'' + filtered_entities[entity].label + '\' from filters" onclick="remove_entity(\'' + filtered_entities[entity].type + '\', \'' + filtered_entities[entity].label + '\')" style="display: inline-block; margin-left: 5px">&times;</a>';
      
      if(types.indexOf(filtered_entities[entity].type) !== -1) {
        var active = '';
        var change_focus = 'title="Switch main focus to \'' + filtered_entities[entity].label + '\'" onclick="change_entity_focus(\'' + filtered_entities[entity].type + '\', \'' + filtered_entities[entity].label + '\')"';
        if(getGET('type') + 's' === filtered_entities[entity].type && getGET('name') === filtered_entities[entity].label) {
          active = ' class="active"';
          remove = '';
          change_focus = '';
        }
        
        $('#filtered_entities').append('<li' + active + '><a ' + change_focus + '><img src="images/' + filtered_entities[entity].type.substring(0, filtered_entities[entity].type.length - 1) + '.png" width="12" height="12" alt="' + filtered_entities[entity].type.substring(0, filtered_entities[entity].type.length - 1) + '" />' + filtered_entities[entity].label.replace('category:', '') + '</a>' + remove + '</li>');
      }
    }
    
    
  }


  /**
   *
   */
  function redraw_visualizations() {
    for(var visualization in visualizations) {
      // Histogram and timeline should always show distributions for current type of data
      if(visualizations[visualization] instanceof Histogram ||
         visualizations[visualization] instanceof Timeline) {
        visualizations[visualization].original_data = all_data[current_focus];
        visualizations[visualization].data = all_data[current_focus];
      }
      
      var data = visualizations[visualization].original_data;

      visualizations[visualization].data = sorter(filter(data));
      
      visualizations[visualization].redraw();
      
      // Change tab box indicators
      var count = 0;
      for(var datum in visualizations[visualization].data) {
        count += visualizations[visualization].data[datum].value;
      }
      var type_n = visualizations[visualization].id.split('_')[0];
      if(type_n == 'times')
        type_n = 'time periods';
      
      var type_specific_explanation = '';
      
      if(type_n == 'actors')
        type_specific_explanation = 'Actors participate in events and are typically persons and organizations. ';
      else if(type_n == 'events')
        type_specific_explanation = 'Events are things that "happen". ';
      else if(type_n == 'places')
        type_specific_explanation = 'Events can take place in places, such as cities or countries. ';
      else if(type_n == 'time periods')
        type_specific_explanation = 'Events can take place at a date or a time, such as January 2014. ';
      
      $('#' + visualizations[visualization].id + '_count').parent().attr('title', type_specific_explanation + visualizations[visualization].data.length + ' ' + type_n + ' have been mentioned ' + count + ' times together with \'' + getGET('name').replace('category:', '') + '\'');
      //$('#' + visualizations[visualization].id + '_count').text(visualizations[visualization].data.length);
      $('#' + visualizations[visualization].id + '_count').text(count);
    }

    var entities = '';
    var fancy_entities = '';
    for(var entity in filtered_entities) {
      entities += 'the ' + filtered_entities[entity].type.substring(0, filtered_entities[entity].type.length - 1) + ' "' + filtered_entities[entity].label + '", ';
      fancy_entities += ' <img src="images/' + filtered_entities[entity].type.substring(0, filtered_entities[entity].type.length - 1) + '20.png" width="20" height="20" alt="' + filtered_entities[entity].type.substring(0, filtered_entities[entity].type.length - 1) + '" /> <span class="' + filtered_entities[entity].type.substring(0, filtered_entities[entity].type.length - 1) + '-color">' + filtered_entities[entity].label + '</span>, ';
      if(entity == filtered_entities.length - 2) {
        entities = entities.substring(0, entities.length - 2) + ' ';
        fancy_entities = fancy_entities.substring(0, fancy_entities.length - 2) + ' ';
        entities += 'and ';
        fancy_entities += 'and ';
      }
    }
    
    get_filtered_entities_string();
    
    colorize(active_colorizer);
    
    $('.current_focus').text(current_focus);
  }

  function get_filtered_entities_string() {
    var entities = '';
    var fancy_entities = '';
    for(var entity in filtered_entities) {
      entities += 'the ' + filtered_entities[entity].type.substring(0, filtered_entities[entity].type.length - 1) + ' "' + filtered_entities[entity].label + '", ';
      fancy_entities += ' <img src="images/' + filtered_entities[entity].type.substring(0, filtered_entities[entity].type.length - 1) + '20.png" width="20" height="20" alt="' + filtered_entities[entity].type.substring(0, filtered_entities[entity].type.length - 1) + '" /> <span class="' + filtered_entities[entity].type.substring(0, filtered_entities[entity].type.length - 1) + '-color">' + filtered_entities[entity].label + '</span>, ';
      if(entity == filtered_entities.length - 2) {
        entities = entities.substring(0, entities.length - 2) + ' ';
        fancy_entities = fancy_entities.substring(0, fancy_entities.length - 2) + ' ';
        entities += 'and ';
        fancy_entities += 'and ';
      }
    }

    entities = entities.substring(0, entities.length - 2);
    fancy_entities = fancy_entities.substring(0, fancy_entities.length - 2);
    
    $('#tab-box-tab-5').attr('title', $('#tab-box-tab-5 span').text() + ' articles describe events with ' + entities);
    $('.filtered_entities_string').empty().append(fancy_entities);
    
    return fancy_entities;
  }

  /**
   *
   */
  function draw_popup_charts() {
    var ignore_these = [popup_data.target];
    
    for(var x in filtered_entities) {
      ignore_these.push(filtered_entities[x].label);
    }
  
    // Places
    var places = [['Place', '#']];
    for(var place in popup_data.places) {
      if(ignore_these.indexOf(place) == -1)
        places.push([place, popup_data.places[place][0]]);
    }
    
    var data = google.visualization.arrayToDataTable(places);
    var options = {
          backgroundColor: '#eeeeee',
          pieSliceText: 'label',
          sliceVisibilityThreshold: 3/360
        };
    
    var chart = new google.visualization.PieChart(document.getElementById('places_chart'));
        chart.draw(data, options);

    // Times
    var times = [['Time', '#']];
    for(var time in popup_data.times) {
      if(ignore_these.indexOf(time) == -1)
        times.push([time, popup_data.times[time][0]]);
    }
    
    var data = google.visualization.arrayToDataTable(times);
    
    var chart = new google.visualization.PieChart(document.getElementById('times_chart'));
        chart.draw(data, options);
    
    // Sources
    var sources = [['Source', '#']];
    for(var source in popup_data.sources) {
      sources.push([source, popup_data.sources[source][0]]);
    }
    
    var data = google.visualization.arrayToDataTable(sources);
    
    var chart = new google.visualization.PieChart(document.getElementById('sources_chart'));
        chart.draw(data, options);
    
    // Publication dates
    var publication_dates = [['Publication date', '#']];
    for(var publication_date in popup_data.publication_dates) {
      publication_dates.push([publication_date, popup_data.publication_dates[publication_date]]);
    }
    
    var data = google.visualization.arrayToDataTable(publication_dates);
    
    var chart = new google.visualization.PieChart(document.getElementById('publication_dates_chart'));
        chart.draw(data, options);
    
    // Events
    var events = [['Event', '#']];
    for(var event in popup_data.events) {
      if(ignore_these.indexOf(event) == -1)
        events.push([event, popup_data.events[event][0]]);
    }
    
    var data = google.visualization.arrayToDataTable(events);
    
    var chart = new google.visualization.PieChart(document.getElementById('events_chart'));
        chart.draw(data, options);
    
    // Actors
    var actors = [['Actor', '#']];
    for(var actor in popup_data.actors) {
      if(ignore_these.indexOf(actor) == -1)
      actors.push([actor, popup_data.actors[actor][0]]);
    }
    
    var data = google.visualization.arrayToDataTable(actors);
    
    var chart = new google.visualization.PieChart(document.getElementById('actors_chart'));
        chart.draw(data, options);

    // These are not charts, but I still put them here because I cba to make another function for it
      console.log('dbpedia?type=' + popup_data.type + '&name=' + popup_data.target);
    $.getJSON('dbpedia?type=' + popup_data.type + '&name=' + popup_data.target, function(x) {
      console.log(x);
      if(typeof x != 'undefined' && x !== null) {
        if(url_exists(x['thumbnail'])) {
          $('#popup_about').empty().append(x['formatted_abstract']);
        }
        else {
          $('#popup_about').empty().append(x['formatted_abstract'].replace('/commons/', '/en/'));
        }
      }
    });
  }

  /**
   *
   */
  function preprocess_popup_charts(entity_data) {
    var events = {};
    for(var event in all_data['events']) {
      for(var event2 in all_data['events'][event].events) {
        if(entity_data.events.indexOf(all_data['events'][event].events[event2]) !== -1) {
          if(!(all_data['events'][event].label in events)) {
            events[all_data['events'][event].label] = [0, all_data['events'][event]];
          }
          events[all_data['events'][event].label] = [events[all_data['events'][event].label][0] + 1, events[all_data['events'][event]]];
        }
      }
    }

    var actors = {};
    for(var actor in all_data['actors']) {
      for(var event in all_data['actors'][actor].events) {
        if(entity_data.events.indexOf(all_data['actors'][actor].events[event]) !== -1) {
          if(!(all_data['actors'][actor].label in actors)) {
            actors[all_data['actors'][actor].label] = [0, all_data['actors'][actor]];
          }
          actors[all_data['actors'][actor].label] = [actors[all_data['actors'][actor].label][0] + 1, actors[all_data['actors'][actor]]];
        }
      }
    }
    
    var places = {};
    for(var place in all_data['places']) {
      for(var event in all_data['places'][place].events) {
        if(entity_data.events.indexOf(all_data['places'][place].events[event]) !== -1) {
          if(!(all_data['places'][place].label in places)) {
            places[all_data['places'][place].label] = [0, all_data['places'][place]];
          }
          places[all_data['places'][place].label] = [places[all_data['places'][place].label][0] + 1, places[all_data['places'][place]]];
        }
      }
    }
    
    var times = {};
    for(var time in all_data['times']) {
      for(var event in all_data['times'][time].events) {
        if(entity_data.events.indexOf(all_data['times'][time].events[event]) !== -1) {
          if(!(all_data['times'][time].label in times)) {
            times[all_data['times'][time].label] = [0, all_data['times'][time]];
          }
          times[all_data['times'][time].label] = [times[all_data['times'][time].label][0] + 1, times[all_data['times'][time]]];
        }
      }
    }

    var sources = {};
    for(var source in entity_data.sources) {
      if(!(entity_data.sources[source].site in sources)) {
        sources[entity_data.sources[source].site] = [0, entity_data.sources[source]];
      }
      sources[entity_data.sources[source].site] = [sources[entity_data.sources[source].site][0] + 1, entity_data.sources[source]];
    }

    var publication_dates = {};
    var article_ids = []; // Just a helper array
    for(var source in entity_data.sources) {
      if(article_ids.indexOf(entity_data.sources[source].id) === -1) {
        article_ids.push(entity_data.sources[source].id);
        publication_dates[entity_data.sources[source].date] = 0;
      }
      publication_dates[entity_data.sources[source].date] += 1;
    }
    
    popup_data['type']   = entity_data.type.toLowerCase();
    popup_data['target'] = entity_data.label;
    popup_data['events'] = events;
    popup_data['actors'] = actors;
    popup_data['places'] = places;
    popup_data['times'] = times;
    //popup_data['time_counts'] = time_counts;
    popup_data['sources'] = sources;
    popup_data['publication_dates'] = publication_dates;

    draw_popup_charts();
  }

  
  /**
   *
   */
  function snippet_toggle(snippet) {
    snippet = $(snippet).parent();
    if($(snippet).hasClass('collapsed')) {
      $(snippet).removeClass('collapsed');
      $(snippet).children('p').css('display', 'block');
      $(snippet).children('.highlighted').css('background', '#fe9');
      $(snippet).children('.snippet_toggle_notification').text('click to collapse');
    }
    else {
      $(snippet).children('p').css('display', 'none');
      $(snippet).children('.highlighted').css('display', 'block');
      $(snippet).children('.highlighted').css('background', '#fff');
      $(snippet).children('.snippet_toggle_notification').text('click to expand');
      $(snippet).addClass('collapsed');
    }
  }
  
  /**
   *
   */
  function load_articles(event_ids) {
    // This should never happen
    if(event_ids == undefined)
      event_ids = [];
    $.post('relevant-articles', {'events': JSON.stringify(event_ids)}, function(data) {
      try {
        articles = JSON.parse(data);
      }
      catch(error) {
        console.log(event_ids);
        console.log(data);
      }
      // Slightly modified version of articles.js
      
      // Yes, I know this is ugly, but I don't have an internet connection right now, so I can't look it up
      // on Google. And I will probably forget to replace this when I do have a connection again.
      // EDIT: This time I'm just too lazy to look it up
      var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      var output = '<ol id="popup_articles_list">';
      for(var article in articles) {
        output += '<li>' +
                  '<h4><a href="' + articles[article].source.url + '" target="_blank">' + articles[article].source.title + ' <img src="images/external.png" width="12" height="12" alt="External link" /></a></h4>';
        
        for(var snippet in articles[article].snippets) {
          output += '<div class="article_snippet collapsed"><span class="snippet_toggle_notification" onclick="snippet_toggle(this)">click to expand</span>' + articles[article].snippets[snippet] + '</div>';
        }
        
        output += '<span class="article_meta_container news_site_meta_container"><span class="news_site">' + 
                  '<img src="http://' + articles[article].source.site + '/favicon.ico" width="16" height="16" alt="' + articles[article].source.site + '"/> <a href="' + articles[article].source.url + '">' + articles[article].source.site + '</a></span></span>';
                   
        output += '<span class="article_meta_container"><span class="publication_date">' +
                  parseInt(articles[article].source.date.split('-')[2], 10) + ' ' + months[parseInt(articles[article].source.date.split('-')[1], 10) - 1] + ' ' + articles[article].source.date.split('-')[0] + '</span></span>'; 
        output += '</li>';
      }
      output += '</ol>';
      
      $('#popup_articles').html(output);
    });
  }


  /**
   *
   */
  function open_floating_popup(uid) {
    var label = uid.substring(0, uid.lastIndexOf('(') - 1);
    var type  = uid.substring(uid.lastIndexOf('(') + 1, uid.length - 1);

    var entity_data = '';
    for(var x in all_data[type + 's']) {
      if(all_data[type + 's'][x].label == label) {
        entity_data = all_data[type + 's'][x];
        break;
      }
    }
    
    $('.floating').remove();
    
    $('body').append(create_popup(entity_data, 'timeline'));
    $('.popup').draggable({ containment: 'document', scroll: false, handle: 'h3' });
    preprocess_popup_charts(entity_data);
    load_articles(entity_data.events);
  }

  /**
   *
   */
  function open_event_popup(uid, start, finish) {
    var label = uid.substring(0, uid.lastIndexOf('(') - 1);
    var type  = uid.substring(uid.lastIndexOf('(') + 1, uid.length - 1);

    var entity_data = '';
    for(var x in all_data[type + 's']) {
      if(all_data[type + 's'][x].label == label) {
        entity_data = all_data[type + 's'][x];
        break;
      }
    }

    var timestamps = []
    for(var timestamp in entity_data['timestamps']) {
      if(parseInt(entity_data['timestamps'][timestamp].start) <= parseInt(start) && parseInt(entity_data['timestamps'][timestamp].finish) >= parseInt(finish)) {
        timestamps.push(entity_data['timestamps'][timestamp].timestamp_label);
      }
    }

    console.log(entity_data.events);
    var new_entity_data = {label: entity_data.label, type: entity_data.type, uid: entity_data.uid};
    var new_events = [];
    for(var time in all_data['times']) { // Looping through all times
      console.log(all_data['times'][time]);
      for(var timestamp in all_data['times'][time]['timestamps']) {
        if(all_data['times'][time]['timestamps'][timestamp] != undefined && timestamps.indexOf(all_data['times'][time]['timestamps'][timestamp].timestamp_label) !== -1) { // If the time is in the list of timestamps, then it it contains the events we are interested in
          // But it might also contain other events which we are not interested in, so let's remove all the ones which are not with this entity
          var events = all_data['times'][time]['events'];
          for(var event in events) {
            if(entity_data.events.indexOf(events[event]) !== -1 && new_events.indexOf(events[event]) == -1)
              new_events.push(events[event]);
          }

          var sources = entity_data.sources;
          new_entity_data.events     = new_events;
          
          // Add sources
          new_entity_data.articles = [];
          new_entity_data.sources  = [];
          for(var mention in entity_data.mentions) {
            if(new_events.indexOf(entity_data.mentions[mention].event_id) !== -1) {
              // Add article ID to articles
              new_entity_data.articles.push(entity_data.mentions[mention].article_id)
              
              // Find corresponding source and add it as well
              for(var source in entity_data.sources) {
                if(entity_data.sources[source].id == entity_data.mentions[mention].article_id) {
                  new_entity_data.sources.push(entity_data.sources[source]);
                }
              }
            }
          }
          
          // Add times and places
          new_entity_data.timestamps = [];
          for(var timestamp in entity_data.timestamps) {
            if(new_events.indexOf(entity_data.timestamps[timestamp].event_id) !== -1) {
              new_entity_data.timestamps.push(entity_data.timestamps[timestamp]);
            }
          }
          new_entity_data.places = [];
          for(var place in entity_data.places) {
            if(new_events.indexOf(entity_data.places[place].event_id) !== -1) {
              new_entity_data.places.push(entity_data.places[place]);
            }
          }

          new_entity_data.value = new_entity_data.events.length;
          break;
        }
      }
    }
    
    $('.floating').remove();
    
    console.log(new_entity_data);
    $('body').append(create_event_popup(new_entity_data, 'timeline'));
    $('.popup').draggable({ containment: 'document', scroll: false, handle: 'h3' });
    
    load_articles(new_entity_data.events);
  }

  /**
   *
   */
  function sort_data(by) {
    if(by == 'value') {
      sorter = function(data_list) {
        return data_list.sort(function(a, b) {
          return b.value - a.value
        })
      }
    }
    else if(by == 'label') {
      if(current_focus == 'times') {
        sorter = function(data_list) {
          return data_list.sort(function(a, b) {
            if(b.type == 'Time') {
              if(a.timestamps.length === 0 || b.timestamps.length === 0)
                return 0;
              return a.timestamps[0].start - b.timestamps[0].start
            }
            else {
              if(b.label > a.label)
                return -1;
              if(b.label < a.label)
                return 1;
              return 0;
            }
          })
        }
      }
      else {
        sorter = function(data_list) {
          return data_list.sort(function(a, b) {
            if(b.label > a.label)
              return -1;
            if(b.label < a.label)
              return 1;
            return 0;
          })
        }
      }
    }

    redraw_visualizations();
    
    // Update UI to show that the current sorting order has been changed
    $('.sorter').removeClass('active');
    $('#' + by + '_sorter').addClass('active');
  }

  /**
   * Currently opened tab
   */
  function set_focus(focus) {

    if($('#label_sorter').hasClass('active'))
      sort_data('label');
    else
      sort_data('value');

    current_tab = focus;
    
    var color = '222222';
    
    if(current_tab == 'events')
      color = '984EA3';
    else if(current_tab == 'places')
      color = '4DAF4A';
    else if(current_tab == 'actors')
      color = 'E41A1C';
    else if(current_tab == 'times')
      color = '377EB8';
    
    $('.popup').remove();
    var img = $('aside h2 img.current_focus_image');
    
    if(focus == 'actors' || focus == 'events' || focus == 'places' || focus == 'times') {
      img.attr('alt', focus.substring(0, focus.length - 1));
      var url = img.attr('src');
      url = url.substring(0, url.lastIndexOf('/')) + '/' + focus.substring(0, focus.length - 1) + url.substring(url.lastIndexOf('.'));
      img.attr('src', url);
      img.css('display', 'inline-block');
      
      $('aside h2 span.current_focus').removeClass().addClass('current_focus').addClass(focus.substring(0, focus.length - 1) + '-color-light');
      
      $('.current_focus_count').text($('#' + current_tab + '_cloud_count').text());
      $('.current_focus_count').text($('#' + current_tab + '_cloud_count').text());
      
      $('#color-panel').css('display', 'block');
      $('#sorter-panel').css('display', 'block');
    }
    else {
      img.css('display', 'none');
      $('#color-panel').css('display', 'none');
      $('#sorter-panel').css('display', 'none');
    }
    
    if(['actors', 'events', 'places', 'times'].indexOf(focus) !== -1)
      current_focus = focus;
    
    if(current_focus == 'times')
      $('#label_sorter').text('By time (earliest to most recent)');
    else
      $('#label_sorter').text('Alphabetically (A–Z)');
  }

  /**
   * Currently shown big visualization
   */
  function set_big_vis(vis) {
    $('.floating.popup').remove();
    big_vis = vis;
    $('#big_vis_map').removeClass('active');
    $('#big_vis_time').removeClass('active');
    
    $('#big_vis_' + vis).addClass('active');
    
    if(vis == 'time') {
      $('#timeline').css('display', 'block');
      $('#map').css('display', 'none');
    }
    else if(vis == 'map') {
      $('#map').css('display', 'block');
      $('#timeline').css('display', 'none');
    }
  }


  /**
   *
   */
  function url_exists(url)
  {
    var http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    http.send();
    return http.status != 404;
  }

  /**
   *
   */
  function recreate_time_filter(destroy_original) {
    if(typeof(destroy_original) === 'undefined') destroy_original = false;

    var times = filter(all_data['times']);

    if(times.length > 1) {
      var range = get_time_range(times);
      time_minmax = [range[0], range[1]];

      if(parseInt(range[0].substring(0, 4)) < ((new Date()).getFullYear() - 20))
        var defaultMin = new Date((new Date).valueOf() - 20 * 365 * 24 * 60 * 60 * 1000);
      else
        var defaultMin = new Date(range[0].substring(0, 4), parseInt(range[0].substring(4, 6)) - 1, range[0].substring(6 ,8));

      if(range[1] > new Date())
        var defaultMax = new Date();
      else
        var defaultMax = new Date(range[1].substring(0, 4), parseInt(range[1].substring(4, 6)) - 1, range[1].substring(6 ,8));

      if(destroy_original)
        $('#time-filter').dateRangeSlider('destroy');
      
      $('#time-filter').dateRangeSlider({arrows: false,
                                         bounds: {
                                                   min: new Date(range[0].substring(0, 4), parseInt(range[0].substring(4, 6)) - 1, range[0].substring(6 ,8)),
                                                   max: new Date(range[1].substring(0, 4), parseInt(range[1].substring(4, 6)) - 1, range[1].substring(6 ,8))
                                                 },
                                         defaultValues: {
                                                          min: defaultMin,
                                                          max: defaultMax
                                                        },
      });
      $('#time-filter').bind('valuesChanged', function(e, data) {
        var min = data.values.min.toJSON().replace('-', '').substring(0, 9).replace('-', '') + '000000';
        var max = data.values.max.toJSON().replace('-', '').substring(0, 9).replace('-', '') + '235959';
        time_minmax = [min, max];
        filters['time'] = function(x) { return occurs_between(x, min, max) }
        redraw_visualizations();
      });
    }
    else {
      $('#timeframe_filter').empty();
      delete filters['time'];
    }
  }

  /**
   *
   */
  function toggle_sidebox(box) {
    if($(box).hasClass('hide-button')) {
      if($(box).text() == '-') {
        $(box).text('+');
        $($(box).parent().children('.sidebox')[0]).css('display', 'none');
      }
      else {
        $(box).text('-');
        $($(box).parent().children('.sidebox')[0]).css('display', 'block');
      }
    }
    else {
      if($($(box).parent().parent().children('.hide-button')[0]).text() == '-') {
        $($(box).parent().parent().children('.hide-button')[0]).text('+');
        $($(box).parent().parent().children('.sidebox')[0]).css('display', 'none');
      }
      else {
        $($(box).parent().parent().children('.hide-button')[0]).text('-');
        $($(box).parent().parent().children('.sidebox')[0]).css('display', 'block');
      }
    }
  }

  /**
   *
   */
  function toggle_map() {
    if(map_size === 0) {
      $('#map-map').css('width', '1024px');
      $('#map-map').css('height', '600px');
      $('#map').css('height', '640px');
      $('#map-toggler a').empty().append('Show small map');
    }
    else {
      $('#map-map').css('width', '512px');
      $('#map-map').css('height', '360px');
      $('#map').css('height', '400px');
      $('#map-toggler a').empty().append('Show large map');
    }
    map_size = (map_size + 1) % 2;
    
    for(var visualization in visualizations) {
      if(visualizations[visualization] instanceof Map)
        visualizations[visualization].redraw();
    }
  }

  /**************************************************************************/

  /* Just spaghetti, no meatballs */
  
  initialize_tab_box("data_overview");

$.getJSON('dbpedia' + window.location.search, function(x) {
  if(typeof x != 'undefined' && x !== null) {
    if(url_exists(x['thumbnail'])) {
      $('#dbpedia_abstract').empty().append(x['formatted_abstract']);
    }
    else {
      $('#dbpedia_abstract').empty().append(x['formatted_abstract'].replace('/commons/', '/en/'));
    }
  }
});

$.getJSON('related-entities' + window.location.search, function(x) {
  data = x;
  if(data.label.length) {
    $('#dbpedia_abstract').append('<h3>Entities with similar names</h3>');
    for(var x in data.label) {
      $('#dbpedia_abstract').append(' <a href="entity?type=' + data.label[x].type + '&name=' + data.label[x].label + '&filters=' + encodeURI('[{"type": "' + data.label[x].type + 's", "label": "' + data.label[x].label + '"}]').replace(/:/g, '%3A').replace(/,/g, '%2C') + '" class="entity_label"><img src="images/' + data.label[x].type + '.png" width="12" height="12" alt="' + data.label[x].type + '"> ' + decodeURI(data.label[x].label) + '</a> ');
    }
  }
  if(data.category.length) {
    $('#dbpedia_abstract').append('<h3>Semantically similar entities</h3>');
    for(var x in data.category) {
      categories = data.category[x].category;
      
      var cat_str = 'Categories in common: ';
      for(var category in categories) {
        cat_str += categories[category] + ', ';
      }
      cat_str = cat_str.substring(0, cat_str.length - 2);
      
      $('#dbpedia_abstract').append(' <a href="entity?type=' + data.category[x].type + '&name=' + data.category[x].label + '&filters=' + encodeURI('[{"type": "' + data.category[x].type + 's", "label": "' + data.category[x].label + '"}]').replace(/:/g, '%3A').replace(/,/g, '%2C') + '" class="entity_label" title="' + cat_str + '"><img src="images/' + data.category[x].type + '.png" width="12" height="12" alt="' + data.category[x].type + '">' + decodeURI(data.category[x].label) + '</a> ');
    }
  }
  if(data.spacetime.length) {
    $('#dbpedia_abstract').append('<h3>Entities mentioned in the same times and places</h3>');
    for(var x in data.spacetime) {
      $('#dbpedia_abstract').append(' <a href="entity?type=' + getGET('type') + '&name=' + data.spacetime[x].label + '&filters=' + encodeURI('[{"type": "' + getGET('type') + 's", "label": "' + data.spacetime[x].label + '"}]').replace(/:/g, '%3A').replace(/,/g, '%2C') + '" class="entity_label"><img src="images/' + getGET('type') + '.png" width="12" height="12" alt="' + getGET('type') + '"> ' + decodeURI(data.spacetime[x].label) + '</a> ');
    }
  }
});

$.getJSON('relations' + window.location.search, function(x) {
  visualizations = [new Cloud('events_cloud'  , x['events']),
                    new Cloud('actors_cloud'  , x['actors']),
                    new Cloud('places_cloud'  , x['places']),
                    new Cloud('times_cloud'   , x['times'] ),
                    
                    new Histogram('count_histogram', x['events']),
                    
                    new Timeline('timeline', x['events']),
                    
                    new Map('map-map', x['places']),
                    
                    new ArticlesBrowser('articles_browser', x['events'])
                   ];

  all_data = x;
  // Calculate the largest value in this subset before applying any filters on it
  largest_value = 0;
  
  for(var type in x) {
    for(var entity in x[type]) {
      if(x[type][entity].value > largest_value)
        largest_value = x[type][entity].value;
    }
  }
  filtered_entities = JSON.parse(decodeURI(getGET('filters')).replace(/%3A/g, ':').replace(/%2C/g, ','));
  redraw_filter();
  set_focus('events');
  filters['time'] = function(x) { return occurs_between(x, 0, 99999999999999) };
  retrieve_valid_event_ids();

  //redraw_visualizations(); // retrieve_valid_event_ids() also redraws
  //$('.current_focus_count').text($('#events_cloud_count').text());
  colorize('count');
  $('#timeline').css('display', 'none');
  $('#map').css('display', 'block');
  
  if(largest_value > 1) {
    $('#count-filter').rangeSlider({arrows: false,
                                    bounds: {
                                              min: 1,
                                              max: largest_value
                                            },
                                    defaultValues: {
                                                     min: 1,
                                                     max: largest_value
                                                   },
    });
    $('#count-filter').bind('valuesChanged', function(e, data) {
      filters['count'] = function(x) { return between_values(x, data.values.min, data.values.max) }
      redraw_visualizations();
    });
  }
  
  $(document).ready( function() {
    recreate_time_filter(false);
  });
});

$(document).keyup(function(e) {
  if(e.keyCode == 27) {
    $('.popup').remove();
  }
});