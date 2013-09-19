/**
 *
 */
function Map(id, original_data) {

  this.id = id;                       // The ID of the DOM object
  this.original_data = original_data; // Data as it was retrieved from server
  this.data = original_data;          // Possibly filtered and reordered data
  this.map;                           // Reference to the map (somewhat redundant)
  this.layers = [];                   // Currently active layers

  /**
   *
   */
  this.initialize_map = function(data) {
        // Make the map look a bit more minimalistic
    var styles = [
      {
        stylers: [
          { visibility: 'off' },
        ]
      },
      {
        featureType: 'administrative.country',
        elementType: 'geometry.stroke',
        stylers: [
          { color: '#777777' },
          { visibility: 'on' },
          { weight: 1 }
        ]
      },
      {
        featureType: 'administrative.country',
        elementType: 'label',
        stylers: [
          { visibility: 'on' },
        ]
      },
      {
        featureType: 'administrative.province',
        elementType: 'label',
        stylers: [
          { visibility: 'on' },
        ]
      },
      {
        featureType: 'administrative.locality',
        elementType: 'label',
        stylers: [
          { visibility: 'on' },
        ]
      },
      {
        featureType: 'administrative.neighborhood',
        elementType: 'label',
        stylers: [
          { visibility: 'on' },
        ]
      },
      {
        featureType: 'administrative.land_parcel',
        elementType: 'label',
        stylers: [
          { visibility: 'on' },
        ]
      },
      {
        featureType: 'landscape',
        elementType: 'all',
        stylers: [
          { color: '#e5e5e5' },
          { visibility: 'on' }
        ]
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [
          { color: '#ffffff' },
          { visibility: 'on' }
        ]
      },
    ];
    
    // Map options and stuff
    if(map_size === 0) {
      this.map = new google.maps.Map(document.getElementById(this.id), {
        center:            new google.maps.LatLng(25.366667, 8.883333),
        zoom:              1,
        minZoom:           1,
        maxZoom:           14,
        backgroundColor:   '#ffffff',
        mapTypeId:         google.maps.MapTypeId.ROADMAP,
        mapTypeControl:    false,
        panControl:        false,
        /*
        scrollwheel:       false,
        */
        streetViewControl: false
      });
    }
    else {
      this.map = new google.maps.Map(document.getElementById(this.id), {
        center:            new google.maps.LatLng(25.366667, 8.883333),
        zoom:              1,
        minZoom:           1,
        maxZoom:           14,
        backgroundColor:   '#ffffff',
        mapTypeId:         google.maps.MapTypeId.ROADMAP,
        mapTypeControlOptions: {
          mapTypeIds: [google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.TERRAIN, 'map_style']
        },
        /*
        scrollwheel:       false,
        */
        streetViewControl: false
      });
    }
    
    //this.map.setOptions({styles: styles});
    var styledMap = new google.maps.StyledMapType(styles, {name: 'Minimalist'});
    this.map.mapTypes.set('map_style', styledMap);
    this.map.setMapTypeId('map_style');

    // Prevent map from scrolling (entirely) off the edge of the earth, BECAUSE
    // THEN WE WOULD FALL AND OH MY GOD, WE'RE ALL GONNA DIE
    // http://stackoverflow.com/questions/10589124/google-map-pans-off-the-edge-of-the-earth
    var map = this.map;
    google.maps.event.addListener(this.map, 'center_changed', function() {
      if(allowedBounds.contains(map.getCenter())) {
        return;
      }
      var mapCenter = map.getCenter();
      var X = mapCenter.lng();
      var Y = mapCenter.lat();

      var AmaxX = allowedBounds.getNorthEast().lng();
      var AmaxY = allowedBounds.getNorthEast().lat();
      var AminX = allowedBounds.getSouthWest().lng();
      var AminY = allowedBounds.getSouthWest().lat();

      if (Y < AminY) {Y = AminY;}
      if (Y > AmaxY) {Y = AmaxY;}
   
     map.setCenter(new google.maps.LatLng(Y,X));
    });

    var allowedBounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(-76.85200239592201, -179.66565397011107),
      new google.maps.LatLng(76.903255924231566, 179.57922246681517));
    
    // Initialize an info window as well
    //this.map.infowindow = new google.maps.InfoWindow();
  }

  /**
   * Converts coordinates into lists of latitude, longitude objects that can be
   * fed into Google Maps
   */
  this.prepare_geo_data = function() {
    data = this.data;
    markers = []
    for(var place in data) {
      if(data[place]['places'][0].coordinates.length > 0) {
        if(isNaN(data[place]['places'][0].coordinates[0]))
          data[place]['places'][0].coordinates[0] = 0;
        if(isNaN(data[place]['places'][0].coordinates[1]))
          data[place]['places'][0].coordinates[1] = 0;
        markers.push({'location': new google.maps.LatLng(data[place]['places'][0].coordinates[0],
                                                         data[place]['places'][0].coordinates[1]),
                      'country': data[place]['places'][0]['country'],
                      'is_country': data[place]['places'][0]['is_country'],
                      'label': data[place]['places'][0]['label'],
                      'weight': data[place]['value']});
      }
    }
    return markers;
  }

  /**
   * Returns a list of markers for places /within/ countries
   */
  this.remove_countries = function(markers) {
    new_set = []
    for(var marker in markers) {
      if(!markers[marker]['is_country'])
        new_set.push(markers[marker]);
    }
    return new_set;
  }

  /**
   * Returns a list of markers for places that /are/ countries
   */
  this.keep_countries = function(markers) {
    new_set = []
    for(var marker in markers) {
      if(markers[marker]['is_country'])
        new_set.push(markers[marker]);
    }
    return new_set;
  }

  /**
   * Get everything you need to draw country polygons (that includes data)
   */
  this.get_countries = function(markers) {
    countries = {}
    country_counts = {}
    
    // Get list of country shapes
    for(var marker in markers) {
      if(!(markers[marker].country in countries)) {
        countries[markers[marker].country] = [];
        country_counts[markers[marker].country] = 0;
        
        if(markers[marker].country in country_polygons) {
          for(var polygon_list in country_polygons[markers[marker].country]) {
            local_polygon_list = []
            for(var polygons in country_polygons[markers[marker].country][polygon_list]) {
              local_polygon_list.push(new google.maps.LatLng(country_polygons[markers[marker].country][polygon_list][polygons][1],
                                                             country_polygons[markers[marker].country][polygon_list][polygons][0]));
            }
            countries[markers[marker].country].push(local_polygon_list);
          }
        }
      }
      country_counts[markers[marker].country] += 1;
    }
    
    // Get the largest value (necessary for scaling colors)
    var max = 0;
    for(var country in country_counts) {
      if(country_counts[country] > max) {
        max = country_counts[country];
      }
    }
    return {'polygons': countries, 'counts': country_counts, 'max': max}
  }

  /**
   * Creates colored regions on the map which show event intensity
   */
  this.draw_choropleth = function(markers) {
    country_data = this.get_countries(markers);
    countries = country_data['polygons']
    for(var country in countries) {
      for(var polygon_list in countries[country]) {
        country_polygon = new google.maps.Polygon({
          paths: countries[country][polygon_list],
          strokeWeight: 1,
          fillColor: '#3399dd',
          fillOpacity: (country_data['counts'][country] * .8 / country_data.max)
        });
        country_polygon.setMap(this.map);
        this.layers.push(country_polygon);
      }
    }
  }

  /**
   * Draw those heat thingies on the map.
   */
  this.draw_heatmap = function(markers) {
    var heatmap = new google.maps.visualization.HeatmapLayer({
        data: this.remove_countries(markers),
        radius: 25,
    });
    //console.log(JSON.stringify(markers));
    heatmap.setMap(this.map); 
    this.layers.push(heatmap);
  }
  
  /**
   * Open an info window when a user clicks on a marker
   */
  this.add_marker_click_event = function(map_marker) {
    var marker_data;
    for(var dinges in this.data) {
      if(this.data[dinges].label == map_marker.title) {
        marker_data = this.data[dinges];
        break;
      }
    }
    google.maps.event.addListener(map_marker,'click', function(){
      //this.map.infowindow.setContent(create_popup(marker_data, 'map'));
      //this.map.infowindow.open(this.map, map_marker);
      open_floating_popup(marker_data.uid);
    });
  }

  /**
   * (Re-)create the visualization
   */
  this.redraw = function() {
    /*
    // Causes bugs
    if(typeof this.map == 'undefined') {
      this.initialize_map();
    }
    */

    this.initialize_map();
    
    markers = null;
    markers = this.prepare_geo_data();
    
    // Remove the old layers, otherwise it just draws the new layers on top of
    // the old ones
    for(var layer in this.layers) {
      this.layers[layer].setMap(null);
    }
    
    this.draw_heatmap(markers);

    this.draw_choropleth(markers);

    marker_locations = []
    for(var marker in markers)
      marker_locations.push(markers[marker].location);

    for(var marker in markers) {
      map_marker = new google.maps.Marker({
                                           'position': markers[marker].location,
                                           'title': markers[marker].label
                                          }
                                         );
      map_marker.setMap(this.map);
      
      this.add_marker_click_event(map_marker);
    }

    /*
    // Set marker clusterer
    actual_markers = []
    for(var marker in markers) {
      map_marker = new google.maps.Marker({
                                           'position': markers[marker].location,
                                           'title': markers[marker].label
                                          }
                                         );
      actual_markers.push(map_marker);
      
      this.add_marker_click_event(map_marker);
    }

    var mc = new MarkerClusterer(this.map, actual_markers);
    */
    
    // Should focus the map on the interesting part of the map.
    // Does something that is close, and sometimes completely wrong
    /*
    var bounds = new google.maps.LatLngBounds();
    for(var marker in marker_locations)
      bounds.extend(marker_locations[marker]);
    this.map.setCenter(bounds.getCenter());
    this.map.fitBounds(bounds);
    */
  }
}