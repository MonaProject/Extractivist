/**
 *
 */
function TimeFilter(id, original_data) {
  this.id = id;                       // The ID of the DOM object
  this.original_data = original_data; // Data as it was retrieved from server
  this.data = original_data;          // Possibly filtered and reordered data

  /**
   * Gets the min and max time
   */
  this.get_time_range = function() {
    min = 99999999999999;
    max = 0;

    for(var time in this.data) {
      if(this.data[time]['timestamps'][0]['start'] < min)
        min = this.data[time]['timestamps'][0]['start'];
      if(this.data[time]['timestamps'][0]['finish'] > max)
        max = this.data[time]['timestamps'][0]['finish'];
    }

    return [min, max];
  } 

  /**
   * (Re-)create the visualization
   */
  this.redraw = function() {
    var range = this.get_time_range();

    if(parseInt(range[0].substring(0, 4)) < ((new Date()).getFullYear() - 20))
      var defaultMin = new Date((new Date).valueOf() - 20 * 365 * 24 * 60 * 60 * 1000);
    else
      var defaultMin = new Date(range[0].substring(0, 4), parseInt(range[0].substring(4, 6)) - 1, range[0].substring(6 ,8));

    if(range[1] > new Date())
      var defaultMax = new Date();
    else
      var defaultMax = new Date(range[1].substring(0, 4), parseInt(range[1].substring(4, 6)) - 1, range[1].substring(6 ,8));

    if(!$('#time-filter').hasClass('ui-rangeSlider')) {
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
    }
    $('#time-filter').dateRangeSlider("bounds", new Date(range[0].substring(0, 4), parseInt(range[0].substring(4, 6)) - 1, range[0].substring(6 ,8)), new Date(range[1].substring(0, 4), parseInt(range[1].substring(4, 6)) - 1, range[1].substring(6 ,8)));

    $('#time-filter').bind('valuesChanged', function(e, data) {
      var min = data.values.min.toJSON().replace('-', '').substring(0, 9).replace('-', '') + '000000';
      var max = data.values.max.toJSON().replace('-', '').substring(0, 9).replace('-', '') + '235959';
      filters['time'] = function(x) { return occurs_between(x, min, max) }
      redraw_visualizations();
    });
  }
}