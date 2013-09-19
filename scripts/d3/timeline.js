/**
 *
 */
function Timeline(id, original_data) {

  this.id = id;                       // The ID of the DOM object
  this.original_data = original_data; // Data as it was retrieved from server
  this.data = original_data;          // Possibly filtered and reordered data
  this.reformatted = [];           // Split data into time chunks

  /**
   * Get first and last (earliest and latest?) timestamp
   */
  this.get_boundaries = function() {
    var min = 9999999999999999999999;
    var max = 0;
    for(var datum in this.reformatted) {
      if(this.reformatted[datum].start_int < min)
        min = this.reformatted[datum].start_int;
      if(this.reformatted[datum].finish_int > max)
        max = this.reformatted[datum].finish_int;
    }
    return [String(min), String(max)];
  }


  /**
   *
   */
  this.calculate_color = function(label, start, finish) {
    // Essentially how many time periods there are between start and finish
    var intensity = -1;
    for(var datum in this.data) {
      if(this.data[datum].label == label) {
        for(var timestamp in this.data[datum].timestamps) {
          if(this.data[datum].timestamps[timestamp].start <= start && this.data[datum].timestamps[timestamp].finish >= finish)
            intensity++;
        }
      }
    }
    return intensity;
  }
  
  
  /**
   *
   */
  this.preprocess_data = function(format) {
    // Unexpected surprise post-pre-processing time!   /O\   \O\   /O/   \O/
    // Build a new dict that allows us to draw multiple blocks for each event
    this.reformatted = [];
    
    var i = 0;
    for(var datum in this.data) {
      if(this.data[datum].timestamps.length > 0) {
        for(var timestamp in this.data[datum].timestamps) {
          if(current_focus != 'times' || this.data[datum].label == this.data[datum].timestamps[timestamp].timestamp_label) {
            var label  = this.data[datum].label;
            var no     = i;
            var start  = format.parse(String(this.data[datum].timestamps[timestamp].start));
            var finish = format.parse(String(this.data[datum].timestamps[timestamp].finish));
            var uid    = this.data[datum].uid;
            
            if(this.data[datum].timestamps[timestamp].start >= time_minmax[0] && this.data[datum].timestamps[timestamp].finish <= time_minmax[1]) {
              this.reformatted.push({'label': label,
                                        'no': no,
                                        'start': start,
                                        'start_int': this.data[datum].timestamps[timestamp].start,
                                        'finish': finish,
                                        'finish_int': this.data[datum].timestamps[timestamp].finish,
                                        'timestamp_label': this.data[datum].timestamps[timestamp].timestamp_label,
                                        'intensity': this.calculate_color(label, this.data[datum].timestamps[timestamp].start, this.data[datum].timestamps[timestamp].finish),
                                        'uid': uid});
            }
          }
        }
        i++;
      }
    }
    
    for(var x in this.reformatted) {
      //console.log(this.reformatted[x].label + ' : ' + this.reformatted[x].uid + ' : ' + this.reformatted[x].start_int + ' : ' + this.reformatted[x].finish_int);
    }
    
    this.reformatted.sort(function(a, b) { return b.color - a.color } );
    // Find the maximum depth of time chunks overlapping each other
    var max = 0;
    for(var datum in this.reformatted) {
      if(this.reformatted[datum].intensity > max) {
        max = this.reformatted[datum].intensity;
      }
    }
    if(max === 0)
      max = 1;
    
    for(var datum in this.reformatted) {
      this.reformatted[datum].color = Math.ceil((max - this.reformatted[datum].intensity) / max * .25 * 360);
    }
    
    return max;
  }
  
  
  /**
   * (Re-)create the visualization
   */
  this.redraw = function() {
    // Unexpected surprise post-pre-processing time!   /O\   \O\   /O/   \O/
    var data = []
    for(var datum in this.data) {
      if(this.data[datum].timestamps.length > 0) {
        data.push(this.data[datum]);
      }
    } 
    this.data = data;

    var timeline = $('#' + this.id);
    $('#timeline-header').empty();
    $('#timeline-axis').empty();
    $('#timeline-vis').empty();
    // Same as #map (for now)
    var w = 1000;
    var h = this.data.length * 25 + 25;
    
    // Scale
    var format = d3.time.format('%Y%m%d%H%M%S');
    var max = this.preprocess_data(format);
    
    var boundaries = this.get_boundaries();

    var scale = d3.time.scale()
                  .domain([format.parse(boundaries[0]), format.parse(boundaries[1])])
                  .range([200, w - 20]);
  
    if(max > 0)
      $('#timeline-header').append('<div style="float: right; margin-right: 20px; margin-top: -10px"><span style="display: block; float: left; text-align: left; width: 50px;">' + 1 + 'x</span><span style="display: block; float: left; text-align: center; width: 200px;"><strong>Number of events in period</strong></span><span style="display: block; float: left; text-align: right; width: 50px;">' + (max + 1) + 'x</span><div class="intensity_gradient timeline"></div></div>');
      $('#timeline-header').append('<h3 style="text-align: left; margin-left: 20px">When did <img src="images/' + current_focus.substring(0, current_focus.length - 1) + '.svg" width="12" height="12" alt="' + current_focus.substring(0, current_focus.length - 1) + '" /> <span class="' + current_focus.substring(0, current_focus.length - 1) + '-color">' + current_focus + '</span> with <img src="images/' + getGET('type') + '.svg" width="12" height="12" alt="' + getGET('type') + '" /> <span class="' + getGET('type') + '-color">' + getGET('name').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') + '</span> occur?</h3>');
    
    // Timeline visualization
    var svg0 = d3.select('#' + this.id + '-axis')
                 .append('svg')
                 .attr('width', w)
                 .attr('height', 23);

    // Axis
    var axis = d3.svg.axis();
        axis.scale(scale)
            .orient('top');
    svg0.append('g')
        .attr('class', 'timeline-axis')
        .attr('transform', 'translate(0,20)')
        .call(axis);
        

    // Define overall visualization
    var svg = d3.select('#' + this.id + '-vis')
                .append('svg')
                .attr('width', w)
                .attr('height', h - 20);

    // Makes it slightly easier to see where the timeline ends
    
    svg.selectAll('rect.background')
       .data([1]) // There has to be a less hacky way to do this
       .enter()
       .append('rect')
       .attr('width', w)
       .attr('height', h)
       .attr('fill', '#fff');
    
       
    // Those colored bars that make it clearer which timelines belong to which
    // entity. I really ought to look up the real name of these thingies.
    /*
    svg.selectAll('rect.line')
       .data(this.data)
       .enter()
       .append('rect')
       .attr('fill', function(d, i) {
                       if(i % 2 == 0)
                         return '#eee';
                       else
                         return '#fafafa';
                     })
       .attr('height', 23)
       .attr('x', 22)
       .attr('y', function(d, i) {
                    return i * 25 + 1; // Same as rect.timeline
                  })
       .attr('width', w - 22);
       */

    // Divider line for that nasty gestalt effect
    svg.selectAll('rect.divider')
       .data(this.data)
       .enter()
       .append('rect')
       .attr('height', 25)
       .attr('x', 188)
       .attr('y', function(d, i) {
                    return i * 25; // Same as rect.timeline
                  })
       .attr('width', 2);

    // Label colored blocks
    svg.selectAll('rect.coloredblocks')
       .data(this.data)
       .enter()
       .append('rect')
       .attr('class', 'clickable')
       .attr('data-mona-id', function(d) {
                               return d.uid;
                             })
       .attr('height', 19)
       .attr('y', function(d, i) {
                    return i * 25 + 2;
                  })
       .attr('width', 19)
       .attr('onclick', function(d, i) {
                          return 'open_floating_popup(\'' + d.uid + '\')';
                        });

    // Lines to place the bubbles on
    svg.selectAll('rect.line')
       .data(this.data)
       .enter()
       .append('rect')
       .attr('fill', '#eee')
       .attr('height', 2)
       .attr('x', 190)
       .attr('y', function(d, i) {
                    return i * 25 + 12;
                  })
       .attr('width', w - 22);
                        
    // Labels
    svg.selectAll('text.label')
       .data(this.data)
       .enter()
       .append('text')
       .attr('class', 'clickable')
       .text( function(d) {
                if(d.label.length > 22)
                  return d.label.substring(0, 20) + '...' + ' (' + d.value + ')';
                else
                  return d.label + ' (' + d.value + ')';
              })
       .attr('x', 26)
       .attr('y', function(d, i) {
                    return i * 25 + 18;
                  })
       .attr('onclick', function(d, i) {
                          return 'open_floating_popup(\'' + d.uid + '\')';
                        });
    
    // Those bubbly thingies
    var timeline = this;
    svg.selectAll('circle')
       .data(this.reformatted)
       .enter()
       .append('circle')
       .attr('fill', '#000')
       .attr('cx', function(d) {
                    return scale(d.start);
                  })
       .attr('cy', function(d) {
                    return d.no * 25 + 12; // Same as rect.line
                  })
       .attr('r', function(d) {
                    var time_difference = d.finish - d.start;
                    if(time_difference > 30000000000)
                      return 10;
                    if(time_difference > 2200000000)
                      return 7;
                    else
                      return 4;
                  })
       .attr('fill', function(d) {
                    return 'hsl(' + d.color + ', 60%, 50%)';
                  })
       .attr('title', function(d) {
                        var s = '';
                        if(d.intensity > 0)
                          s = 's';
                        
                        var preposition = 'with';
                        if(current_focus == 'places')
                          preposition = 'in';
                        
                        if(current_focus != 'events') 
                          return (d.intensity + 1) + ' event' + s + ' ' + preposition + ' "' + d.label + '" happened in/on ' + d.timestamp_label;
                        else
                          return (d.intensity + 1) + ' "' + d.label + '" event' + s + ' happened in/on ' + d.timestamp_label;
                      })
       .attr('class', 'clickable')
       .attr('onclick', function(d, i) {
                          return 'open_event_popup(\'' + d.uid + '\', ' + d.start_int + ', ' + d.finish_int + ')';
                        });
  }
}