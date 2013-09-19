  /**
   *
   */
  function create_popup(entity_data, variant, include_header) {
    var cloud_entity_data = $('#cloud_' + entity_data.uid.replace(/ /g, '_').replace(/\(/g, '_').replace(/\)/g, '_').replace(/\./g, '_').replace(/,/g, '_'));
    var popup = '';
    if(typeof(include_header) === 'undefined') {
      var floating = '';
      if(variant == 'timeline')
        floating = 'floating ';
      var color = '';
      $('.cloud .data-item').each(function() {
        if(variant == 'map') {
          if($(this).data('mona-id') == entity_data['label'] + ' (place)')
            color = $(this).css('background-color');
        }
        else {
          if($(this).data('mona-id') == entity_data['uid'])
            color = $(this).css('background-color');
        }
      });
      popup = '<div class="popup ' + floating + variant + '-popup" style="border-color: ' + color + '">';

      var s = '';
      if(cloud_entity_data.data('mona-count') > 1)
        s = 's';

      if(floating.length > 0)
        popup += '<a onclick="$(\'.floating.popup\').remove()" class="close_button">&times;</a>';
        
      if(entity_data.type == 'Event')
        popup += '<h3 style="background: ' + color + '">' + cloud_entity_data.data('mona-count') + ' "' + entity_data['label'] + '" event' + s + '</h3>'     
      if(entity_data.type == 'Actor')
        popup += '<h3 style="background: ' + color + '">' + cloud_entity_data.data('mona-count') + ' event' + s + ' with "' + entity_data['label'] + '"</h3>'
      if(entity_data.type == 'Place')
        popup += '<h3 style="background: ' + color + '">' + cloud_entity_data.data('mona-count') + ' event' + s + ' in "' + entity_data['label'] + '"</h3>'
      if(entity_data.type == 'Time')
        popup += '<h3 style="background: ' + color + '">' + cloud_entity_data.data('mona-count') + ' event' + s + ' on/in "' + entity_data['label'] + '" events</h3>'
    }
    
    popup += '<div class="popup_container">';

    var s = '';
    if(cloud_entity_data.data('mona-count') > 1)
      s = 's';
    var current_focus_text = current_focus
    if(current_focus == 'times')
      current_focus_text = current_focus.substring(0, current_focus.length - 1) + ' periods';
    popup += '<p style="text-align: center"><em><img src="images/' + current_focus.substring(0, current_focus.length - 1) + '.png" width="12" height="12" alt="' + current_focus.substring(0, current_focus.length - 1) + '"/> <span class="' + entity_data.type.toLowerCase() + '-color">' + entity_data.label + '</span> is mentioned ' + cloud_entity_data.data('mona-count') + ' time' + s + ' with ' + get_filtered_entities_string().replace('20.', '.').replace(/"20"/g, '"12"') + '. This is ' + cloud_entity_data.data('mona-percentage') + '% of all ' + entity_total[current_focus] + ' <img src="images/' + current_focus.substring(0, current_focus.length - 1) + '.png" width="12" height="12" alt="' + current_focus.substring(0, current_focus.length - 1) + '"/> <strong class="' + current_focus.substring(0, current_focus.length - 1) + '-color">' + current_focus_text + '</strong> which are mentioned together with ' + get_filtered_entities_string().replace('20.', '.').replace(/"20"/g, '"12"') + '</em></p>';

    var is_already_filtered = false;
    for(var entity in filtered_entities) {
      if(filtered_entities[entity].type == entity_data.type.toLowerCase() + 's' && filtered_entities[entity].label == entity_data.label) {
        is_already_filtered = true;
        break;
      }
    }
    popup += '<a href=\'entity?type=' + entity_data.type.toLowerCase() + '&name=' + entity_data.label + '&filters=%5B%7B"type"%3A%20"' + entity_data.type.toLowerCase() + 's"%2C%20"label"%3A%20"' + entity_data.label + '"%7D%5D\' class="button">Show only <img src="images/' + entity_data.type.toLowerCase() + '.png" width="12" height="12" alt="' + entity_data.type.toLowerCase() + '"/> <strong class="' + entity_data.type.toLowerCase() + 's-color-light">' + entity_data.label + '</strong></a> ';
    if(is_already_filtered) {
      popup += '<a class="button" onclick="remove_entity(\'' + entity_data.type.toLowerCase() + 's' + '\', \'' + entity_data.label + '\')">Remove <img src="images/' + entity_data.type.toLowerCase() + '.png" width="12" height="12" alt="' + entity_data.type.toLowerCase() + '"/> <strong class="' + entity_data.type.toLowerCase() + 's-color-light">' + entity_data.label + '</strong> from filters</a>';
    }
    else {
      popup += '<a class="button" onclick="add_entity_to_filters(\'' + entity_data.type.toLowerCase() + 's' + '\', \'' + entity_data.label + '\')">Add <img src="images/' + entity_data.type.toLowerCase() + '.png" width="12" height="12" alt="' + entity_data.type.toLowerCase() + '"/> <strong class="' + entity_data.type.toLowerCase() + 's-color-light">' + entity_data.label + '</strong> to filters</a>';
    }

    popup += '<ul class="popup-tabs">'
    popup += '<li class="active" onclick="$(\'.popup_summary\').css(\'display\', \'block\'); $(\'.popup_articles\').css(\'display\', \'none\'); $(\'.popup_about\').css(\'display\', \'none\'); $(\'.popup-tabs li\').removeClass(\'active\'); $(this).addClass(\'active\')"><img src="images/piechart20.png" width="20" height="20" alt="summary" /> Summary</li>'
    popup += '<li onclick="$(\'.popup_summary\').css(\'display\', \'none\'); $(\'.popup_articles\').css(\'display\', \'block\'); $(\'.popup_about\').css(\'display\', \'none\'); $(\'.popup-tabs li\').removeClass(\'active\'); $(this).addClass(\'active\')"><img src="images/articles20.png" width="20" height="20" alt="articles" /> Articles</li>'
    popup += '<li onclick="$(\'.popup_summary\').css(\'display\', \'none\'); $(\'.popup_articles\').css(\'display\', \'none\'); $(\'.popup_about\').css(\'display\', \'block\'); $(\'.popup-tabs li\').removeClass(\'active\'); $(this).addClass(\'active\')"><img src="images/' + current_focus.substring(0, current_focus.length - 1) + '20.png" width="20" height="20" alt="about" /> About</li>'
    popup += '</ul>'
    
    popup += '<div class="popup_summary">';
    popup += '<div class="chart_block">';
    popup += '<h4>Events</h4>';
    popup += '<div id="events_chart"></div>';
    popup += '</div>';
    
    popup += '<div class="chart_block">';
    popup += '<h4>Actors</h4>';
    popup += '<div id="actors_chart"></div>';
    popup += '</div>';
    
    popup += '<div class="chart_block">';
    popup += '<h4>Times</h4>';
    popup += '<div id="times_chart"></div>';
    popup += '</div>';
    
    popup += '<div class="chart_block">';
    popup += '<h4>Places</h4>';
    popup += '<div id="places_chart"></div>';
    popup += '</div>';
    
    popup += '<div class="chart_block">';
    popup += '<h4>News sources</h4>';
    popup += '<div id="sources_chart"></div>';
    popup += '</div>';
    
    popup += '<div class="chart_block">';
    popup += '<h4>Publication dates</h4>';
    popup += '<div id="publication_dates_chart"></div>';
    popup += '</div>';
    popup += '</div>'; //popup_summary
    
    popup += '<div id="popup_articles" class="popup_articles" style="display:none">';
    popup += '<p>Either the popup is still working very hard to retrieve the articles, or something\'s broken</p>';
    popup += '</div>';
    
    popup += '<div id="popup_about" class="popup_about" style="display: none">';
    popup += '<p>No information available</p>';
    popup += '</div>';
    
    popup += '<div style="clear: both"></div>';
    popup += '</div>';
    
    if(typeof(include_header) === 'undefined')
      popup += '</div>'; // <div class="popup_container"> and <div class="popup">

    return popup;
  }
  
  
  /**
   *
   */
  function create_event_popup(entity_data) {
    popup = '<div class="popup floating timeline-popup" style="border-color: #111">';

    var s = '';
    if(entity_data.value > 1)
      s = 's';

    popup += '<a onclick="$(\'.floating.popup\').remove()" class="close_button">x</a>';
      
    if(entity_data.type == 'Event')
      popup += '<h3 style="background: #111; color: #eee">' + entity_data.value + ' "' + entity_data['label'] + '" event' + s + '</h3>'     
    if(entity_data.type == 'Actor')
      popup += '<h3 style="background: #111; color: #eee">' + entity_data.value + ' event' + s + ' with "' + entity_data['label'] + '"</h3>'
    if(entity_data.type == 'Place')
      popup += '<h3 style="background: #111; color: #eee">' + entity_data.value + ' event' + s + ' in "' + entity_data['label'] + '"</h3>'
    if(entity_data.type == 'Time')
      popup += '<h3 style="background: #111; color: #eee">' + entity_data.value + ' event' + s + ' on/in "' + entity_data['label'] + '" events</h3>'

    popup += '<div class="popup_container" style="width: 800px; margin: 0 auto; max-height: 600px; overflow-y: scroll">';
    
    //popup += JSON.stringify(entity_data.articles).replace(/"/g, '~~~~~');
    popup += '<div id="popup_articles"></div>';
    
    popup += '</div>';

    popup += '</div>'; // <div class="popup_container"> and <div class="popup">

    return popup;
  }