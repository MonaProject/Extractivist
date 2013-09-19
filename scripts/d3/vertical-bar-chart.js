function getURLParameter2(name) {
    return decodeURI(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
    );
}

function vertical_bar_chart(div_id, data, complete)
{
    if(typeof(complete)==='undefined') complete = false;
    
    var type;
    
    switch(div_id) {
        case 'actors_counts': type = 'actor'; break;
        case 'event_counts': type = 'event'; break;
        case 'places_counts': type = 'place'; break;
        case 'times_counts': type = 'time'; break;
    }
    
    if(getURLParameter2('type') == type) {
        var i = 0;
        for(var item in data) {
            if(data[item].name == getURLParameter2('name'))
                break;
            i++;
        }
        data.splice(i, 1);
    }

    if(complete)
        data = data;
    else
        data = data.slice(0, 10);
    
    var w = 600 + 40;
    var h = 30 * data.length;

    $('#' + div_id).empty();
    var svg = d3.select('#' + div_id)
                .append('svg')
                .attr('width', w)
                .attr('height', h);
    
    var scale = d3.scale.linear ()
                        .domain([0, d3.max(data, function(d) { return d.value; })])
                        .range([0, w - 300 - 40]);

    svg.selectAll('rect.background')
       .data(data)
       .enter()
       .append('rect')
       .attr('y', function(d, i) {
                    return i * 25 + 5;
       })
       .attr('width', 300)
       .attr('height', 24)
       .attr('fill', function(d, i) {
                       if(i % 2 == 0)
                         return '#eee';
                       else
                         return '#ddd';
       });

    svg.selectAll('text.labels')
       .data(data)
       .enter()
       .append('a')
       .attr('xlink:href', function(d) {
                             return 'subject?type=' + type + '&name=' + encodeURIComponent(d.name);
        })
       .append('text')
       .text( function(d) {
                return d.name;
        })
       .attr('y', function(d, i) {
                    return i * 25 + 25;
        })
       .attr('width', 300);
       
    svg.selectAll('rect.bars')
       .data(data)
       .enter()
       .append('rect')
       .attr('x', 300)
       .attr('y', function(d, i) {
                    return i * 25 + 5;
       })
       .attr('width', function(d) {
                        return scale(d.value);
        })
       .attr('height', 24)
       .attr('data-mpj0-persorganization', function(d) {
                                             return d.actor_type;
        })
       .attr('fill', function(d) {
                       if(d.actor_type == 'person')
                          return '#f31';
                       if(d.actor_type == 'organization')
                          return '#27f';
                       else
                          return '#aaa';
        });
       //.attr('fill', '#4d5');

    svg.selectAll('text.values')
       .data(data)
       .enter()
       .append('text')
       .text( function(d) {
                return d.value;
        })
       .attr('y', function(d, i) {
                    return i * 25 + 25 - 2;
        })
       .attr('x', function(d) {
                    return 300 + 4; //+ scale(d.value);
        })
       .attr('fill', 'white');
}