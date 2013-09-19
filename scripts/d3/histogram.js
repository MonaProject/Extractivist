/**
 *
 */
function Histogram(id, original_data) {

  this.id = id;                       // The ID of the DOM object
  this.original_data = original_data; // Data as it was retrieved from server
  this.data = original_data;          // Possibly filtered and reordered data

  /**
   * (Re-)create the visualization
   */
  this.redraw = function() {

    this.data = this.original_data.slice(0).sort(function(a, b) {
                                return b.value - a.value;
                              });

    // Remove old stuff (if present)
    var histogram = $('#' + this.id);
    histogram.empty();
    
    var w = 260;
    var h = 50;

    var svg = d3.select('#' + this.id)
                .append('svg')
                .attr('width', w)
                .attr('height', h);

    var scale = d3.scale.linear()
                        //.domain([0, d3.max(this.original_data, function(x) { return x.value; })])
                        //.range([0, h]);
                        .domain([1, d3.max(this.data, function(x) { return x.value; })])
                        .range([1, h])
 
    entity_count = this.original_data.length;
    svg.selectAll('rect')
       .data(this.data)
       .enter()
       .append('rect')
       .attr('y', function(d, i) {
                    return h - scale(d.value);
       })
       .attr('x', function(d, i) {
                    return i * w / entity_count;
       })
       .attr('height', function(d) {
                        return scale(d.value);
        })
       .attr('width', function(d) {
                        return w / entity_count;
       })
       .attr('fill', '#777');
       //.attr('class', current_focus.substring(0, current_focus.length - 1) + '-background');
  }
}