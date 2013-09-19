/**
 *
 */
function Cloud(id, original_data) {

  this.id = id;                       // The ID of the DOM object
  this.original_data = original_data; // Data as it was retrieved from server
  this.data = original_data;          // Possibly filtered and reordered data
  this.max_size = 20;                 // Maximum font size
  this.min_size = 10;

  /**
   * (Re-)create the visualization
   */
  this.redraw = function() {  
    // Remove old stuff (if present)
    var cloud = $('#' + this.id)
    cloud.empty();
    
    //
    if(this.data.length > 0) {
      //max = this.original_data[0].value;
      
      var max = 0;      
      var total = 0;
      for (var i=this.original_data.length; i--;) {
        total += this.original_data[i].value;
        if(this.original_data[i].value > max)
          max = this.original_data[i].value;
      }
      entity_total[this.id.split('_')[0]] = total;

      for(var item in this.data) {
        size = this.max_size * Math.log(1 + this.data[item].value)
                               / Math.log(max);
        if(size < this.min_size)
          size = this.min_size;
        
        if(!(getGET('type') == this.data[item].type.toLowerCase() && getGET('name') == this.data[item].label)) {
          cloud.append('<li style="font-size: ' + size + 'pt" ' + 'class="data-item" ' +
                       'id="cloud_' + this.data[item].uid.replace(/ /g, '_').replace(/\(/g, '_').replace(/\)/g, '_').replace(/\./g, '_').replace(/,/g, '_') + '" ' +
                       'data-mona-id="' + this.data[item].uid + '" ' +
                       'data-mona-label="' + this.data[item].label + '" ' +
                       'data-mona-actor_type="' + this.data[item].actor_type + '" ' + 
                       'data-mona-continent="' + this.data[item].continent + '" ' + 
                       'data-mona-count="' + this.data[item].value + '" ' + 
                       'data-mona-percentage="' + Math.ceil((this.data[item].value * 100 / total) * 100) / 100 + '" ' +
                       'data-mona-type="' + this.data[item].type + '" ' + 
                       'data-mona-events=\'' + JSON.stringify(this.data[item].events) + '\' '+ 
                       //'data-mona-sources=\'' + JSON.stringify(this.data[item].sources) + '\' ' +
                       'data-mona-timestamps=\'' + JSON.stringify(this.data[item].timestamps) + '\'' + 
                       'data-mona-articles=\'' + JSON.stringify(this.data[item].articles) + '\'' +
                       '>' +
                    //   '<a href="snippets?type1=' + getGET('type') + '&type2=' + this.data[item].type.toLowerCase() + '&name1=' + getGET('name') + '&name2=' + this.data[item].label + '" class="trigger">' + this.data[item].label + ' (' + this.data[item].value + ')</a>' +
                       '<a onclick="open_floating_popup(\'' + this.data[item].uid + '\')"' + 
                       'title="\'' + this.data[item].label + '\' is mentioned ' + this.data[item].value + ' times with \'' + getGET('name') + '\'. This is ' + Math.ceil((this.data[item].value * 100 / total) * 100) / 100 + '% of all ' + current_focus + ' which are mentioned together with \'' + getGET('name') + '\'"' +
                       '>' + this.data[item].label + ' (' + this.data[item].value + ')</a>' +
                       '<div class="popup"></div>' +
                       /*
                       '<div class="popup">' +
                       '<h4>Unstyled debug info</h4>' + 
                       '<ul>' +
                       '<li>Together ' + this.data[item].value + ' event(s) (this is ' + Math.ceil((this.data[item].value * 100 / total) * 100) / 100 + '% of all mentions)</li>' + 
                       '</ul>' +
                       '<a href="entity?type=' + this.data[item].type.toLowerCase() + '&name=' + this.data[item].label + '">View detailed information</a>' +
                       ' | ' +
                       '<a href="snippets?type1=' + getGET('type') + '&type2=' + this.data[item].type.toLowerCase() + '&name1=' + getGET('name') + '&name2=' + this.data[item].label + '">View articles for these events</a>' + 
                       '</div>' +
                       */
                       '</li>');
        }
      }
    }
  }
}