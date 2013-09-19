/**
 * Colors are fixed and chosen to be maximally distinguishable
 */
function colorize_nominal_values(attribute) {
  // NEW LIST
  // http://colorbrewer2.org/
  var colors = ['#FC8D62',
                '#8DA0CB',
                '#66C2A5',
                '#E78AC3',
                '#A6D854',
                '#FFD92F',
                '#E5C494',
                '#B3B3B3'  // This is gray. Gray is bad. In our case.
                ];
  
  /*
  // List taken from http://web.media.mit.edu/~wad/color/palette.html
  // Black is not included, because the text is black
  // White is not included, because unlabeled items are white
  // Colors + #202020
  var colors = ['#FFB253', // peach
                '#4A6BF7', // Blue
                '#3D8934', // dark green
                '#A146E0', // Purple
                '#FFFF53', // yellow
                '#777777', // Dark grey
                '#49F0F0', // cyan
                '#FFEDFF', // Pink
                '#FFFEDB', // beige
                '#A16A39', // brown
                '#C0C0C0', // grey
                '#F5CD43', // Gold
                '#BDCFFF', // light blue
                '#A1F59A'  // light green
                ];
  */
  
  var stored_items = [];
  $('.data-item').each( function() {
    var data_value = $(this).data('mona-' + attribute);
    var id = $(this).data('mona-id');
    
    if(data_value == 'undefined' || data_value == null || data_value.length == 0) {
      $(document).find("[data-mona-id='" + id + "']").css('background-color', '#ddd');
      $(document).find("[data-mona-id='" + id + "']").attr('fill', '#ddd');
    }
    else {
      if(stored_items.indexOf(data_value) < 0) {
        stored_items.push(data_value);
      }
    }
  });
  
  stored_items = stored_items.sort();
  
  $('.data-item').each( function() {
    var data_value = $(this).data('mona-' + attribute);
    var id = $(this).data('mona-id');
    
    if(stored_items.indexOf(data_value) !== -1) {
      $(document).find("[data-mona-id='" + id + "']").css('background-color', colors[stored_items.indexOf(data_value)]);
      $(document).find("[data-mona-id='" + id + "']").attr('fill', colors[stored_items.indexOf(data_value)]);
    }
  });

  // Adjust legend
  var legend = $('#colorization_legend');
  legend.empty();
  legend.append('<h3>Legend</h3>');
  legend.append('<dl class="legend"></dl>');
  var legend = $('#colorization_legend dl');
  for(var item in stored_items) {
    legend.append('<dt style="background: ' + colors[item] + '">' + colors[item] + '</dt>');
    legend.append('<dd>' + stored_items[item] + '</dd>');
  }
  legend.append('<dt style="background: #ddd">#ddd</dt>');
  legend.append('<dd>No data available</dd>');
}

function calculate_color(num_value, min, max) {
  //return 'hsl(' + Math.round((1 - (num_value - min) / (max - min)) * .25 * 360) + ', 60%, 50%)'
  if(current_focus == 'actors')
    return 'rgba(228, 26, 28, ' + ((num_value - min) * 1.0 / (max - min) * .9 + .1) + ')';
  else if(current_focus == 'events')
    return 'rgba(152, 78, 163, ' + ((num_value - min) * 1.0 / (max - min) * .9 + .1) + ')';
  else if(current_focus == 'places')
    return 'rgba(77, 175, 74, ' + ((num_value - min) * 1.0 / (max - min) * .9 + .1) + ')';
  else if(current_focus == 'times')
    return 'rgba(55, 126, 184, ' + ((num_value - min) * 1.0 / (max - min) * .9 + .1) + ')';
}

function colorize_interval_values(attribute) {
  var min = 9999999999999999999999999;
  var max = 0;
  if(attribute == 'count') {
    for(var entity in all_data[current_focus]) {
      if(all_data[current_focus][entity].value < min)
        min = all_data[current_focus][entity].value;
      if(all_data[current_focus][entity].value > max && !(current_focus == getGET('type') + 's' && all_data[current_focus][entity].label == getGET('name')))
        max = all_data[current_focus][entity].value;
    }
    if(min === 1 && max === 1) {
      min = 0;
      max = 2;
    }
  }
  else {
    $('.data-item').each( function() {
      if($(this).data('mona-' + attribute) != 0) {
        if($(this).data('mona-' + attribute) < min) {
          min = $(this).data('mona-' + attribute);
        }
        if($(this).data('mona-' + attribute) > max) {
          max = $(this).data('mona-' + attribute);
        }
      }
    });
  }

  $('.data-item').each( function() {
    var id = $(this).data('mona-id');
    var color = calculate_color($(this).data('mona-' + attribute), min, max);
    
    if(attribute == 'count' && !(current_focus == getGET('type') + 's' && $(this).data('mona-label') == getGET('name'))) {
      $(document).find("[data-mona-id='" + id + "']").css('background-color', color);
      $(document).find("[data-mona-id='" + id + "']").attr('fill', color);
    }
    else {
      $(document).find("[data-mona-id='" + id + "']").css('background-color', '#fff');
      $(document).find("[data-mona-id='" + id + "']").attr('fill', '#fff');
    }
  });

  // Adjust legend only the first time, as subsequent changes in data may break
  // the legend.
  var legend = $('#colorization_legend');
  legend.empty();
  legend.append('<h3>Legend: number of mentions</h3>');
  legend.append('<span style="display: block; float: left; text-align: left; width: 90px;">' + min + '</span>');
  legend.append('<span style="display: block; float: left; text-align: center; width: 80px;">' + Math.round(min + (max - min) / 2) + '</span>');
  legend.append('<span style="display: block; float: left; text-align: right; width: 90px;">' + max + '</span>');
  
  legend.append('<div class="intensity_gradient ' + current_focus + '"></div>');
}


/**
 *
 */
function remove_colors(attribute) {
  $('.data-item').each( function() {
    $(this).css('background-color', '#ddd');
  });
  
  var legend = $('#colorization_legend');
  legend.empty();
}

/**
 *
 */
function colorize(attribute) {
  // Store the currently used colorizer
  active_colorizer = attribute;

  // Hide non-applicable colorizers
  var types = ['actors', 'events', 'places', 'times'];
  
  $('.colorizer').css('display', 'block');
  for(var type in types) {
    if(current_focus != types[type]) {
      $('.' + types[type] + '-colorizer').each( function() {
        $(this).css('display', 'none');
      });
    }
    if($('#' + attribute + '_colorizer').hasClass(types[type] + '-colorizer') &&
       current_focus != types[type]) {
      active_colorizer = 'count';   
    }
  }
  
  // Highlight currently active colorizer
  $('.colorizer').removeClass('active');
  $('#' + active_colorizer + '_colorizer').addClass('active');
  
  
  // Apply coloring
  if(active_colorizer == 'count') {
    colorize_interval_values(active_colorizer);
  }
  else if(active_colorizer == 'nothing') {
    remove_colors(active_colorizer);
  }
  else {
    colorize_nominal_values(active_colorizer);
  }
}