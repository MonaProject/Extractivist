        <div id="entity_container">
          <!--
          <div id="big_entity_filter">
            Currently active filters:
            <ul id="filtered_entities"></ul>
          </div>
          -->
          <div id="entity">
            <div id="big_vis_container">
              <div id="map">
                <div id="map-map"></div>
                <div id="map-toggler"><a onclick="toggle_map()">Show large map</a></div>
              </div>
              <div id="timeline">
                <div id="timeline-header" style="margin-bottom: 15px"></div>
                <div id="timeline-axis"></div>
                <div id="timeline-vis"></div>
              </div>
              <ul id="big_vis_container_nav">
                <li class="active" id="big_vis_map"><a onclick="set_big_vis('map'); redraw_visualizations()">Map</a></li>
                <li id="big_vis_time"><a onclick="set_big_vis('time'); redraw_visualizations()">Timeline</a></li>
              </ul>
            </div>
            <div class="tab-box">
              <ul id="data_overview" class="tabs"><!-- redraw_visualizations(false) to prevent map from refreshing entirely. filtered_entities = [] is only temporary [BUG MAP REFRESH] -->
                <li><a id="tab-box-tab-1" class="active" onclick="set_focus('events'); redraw_visualizations()"><img src="<?php echo $data['config']['base_dir'] ?>/images/event20.png" width="20" height="20" alt="event" /> Events (<span id="events_cloud_count">...</span>)</a></li>
                <li><a id="tab-box-tab-2" onclick="set_focus('actors'); redraw_visualizations()"><img src="<?php echo $data['config']['base_dir'] ?>/images/actor20.png" width="20" height="20" alt="actor"/> Actors (<span id="actors_cloud_count">...</span>)</a></li>
                <li><a id="tab-box-tab-3" onclick="set_focus('places'); redraw_visualizations()"><img src="<?php echo $data['config']['base_dir'] ?>/images/place20.png" width="20" height="20" alt="place" /> Places (<span id="places_cloud_count">...</span>)</a></li>
                <li><a id="tab-box-tab-4" onclick="set_focus('times'); redraw_visualizations()"><img src="<?php echo $data['config']['base_dir'] ?>/images/time20.png" width="20" height="20" alt="time"  /> Times (<span id="times_cloud_count">...</span>)</a></li>
                <li><a id="tab-box-tab-5" onclick="set_focus('articles');"><img src="<?php echo $data['config']['base_dir'] ?>/images/articles20.png" width="20" height="20" alt="articles" /> Articles (<span id="articles_count">...</span>)</a></li>
                <li><a id="tab-box-tab-6" onclick="set_focus('about');" title="Read more about <?php echo htmlentities($data['entity']) ?>"><span class="big_version"><span style="position: relative; right: 25px">About</span> <img src="<?php echo $data['config']['base_dir'] ?>/images/<?php echo htmlentities($data['type']) ?>20.png" width="20" height="20" alt="<?php echo htmlentities($data['type']) ?>" style="position: relative; left: 52px" /> <span class="<?php echo $data['type'] ?>-color">
<?php
  $name = htmlentities($data['entity']);
  if(strlen($name) > 20)
    echo substr($name, 0, 16) . '...';
  else
    echo $name;
?></span></span><span class="short_version">About</span></a></li>
              </ul>
              <div id="tab-box-box-1" class="active tab">
                <h3>
                  <img src="<?php echo $data['config']['base_dir'] ?>/images/event20.png" width="20" height="20" alt="event" />
                  <span class="event-color">Events</span> which are mentioned together with <span class="filtered_entities_string"><img src="<?php echo $data['config']['base_dir'] ?>/images/<?php echo $data['type'] ?>20.png" width="20" height="20" alt="<?php echo $data['type'] ?>" /> <span class="<?php echo $data['type'] ?>-color"><?php echo $data['entity'] ?></span></span>
                </h3>
                <ul id="events_cloud" class="cloud"></ul>
              </div>
              <div id="tab-box-box-2" class="tab">
                <h3>
                  <img src="<?php echo $data['config']['base_dir'] ?>/images/actor20.png" width="20" height="20" alt="actor" />
                  <span class="actor-color">Actors</span> which are mentioned together with <span class="filtered_entities_string"><img src="<?php echo $data['config']['base_dir'] ?>/images/<?php echo $data['type'] ?>20.png" width="20" height="20" alt="<?php echo $data['type'] ?>" /> <span class="<?php echo $data['type'] ?>-color"><?php echo $data['entity'] ?></span></span>
                </h3>
                <ul id="actors_cloud" class="cloud"></ul>
              </div>
              <div id="tab-box-box-3" class="tab">
                <h3>
                  <img src="<?php echo $data['config']['base_dir'] ?>/images/place20.png" width="20" height="20" alt="place" />
                  <span class="place-color">Places</span> which are mentioned together with <span class="filtered_entities_string"><img src="<?php echo $data['config']['base_dir'] ?>/images/<?php echo $data['type'] ?>20.png" width="20" height="20" alt="<?php echo $data['type'] ?>" /> <span class="<?php echo $data['type'] ?>-color"><?php echo $data['entity'] ?></span></span>
                </h3>
                <ul id="places_cloud" class="cloud"></ul>
              </div>
              <div id="tab-box-box-4" class="tab">
                <h3>
                  <img src="<?php echo $data['config']['base_dir'] ?>/images/time20.png" width="20" height="20" alt="time" />
                  <span class="time-color">Times</span> which are mentioned together with <span class="filtered_entities_string"><img src="<?php echo $data['config']['base_dir'] ?>/images/<?php echo $data['type'] ?>20.png" width="20" height="20" alt="<?php echo $data['type'] ?>" /> <span class="<?php echo $data['type'] ?>-color"><?php echo $data['entity'] ?></span></span>
                </h3>
                <ul id="times_cloud"  class="cloud"></ul>
              </div>
              <div id="tab-box-box-5" class="tab"><h3>Articles in this dataset which mention events with <span class="filtered_entities_string"></span></h3><ol id="articles_list"></ol></div>
              <div id="tab-box-box-6" class="tab"><div id="dbpedia_abstract"><p>No description could be found for this <?php echo $data['type'] ?><p></div></div>
              <p style="margin: 20px"><a onclick="$('html, body').animate({ scrollTop: 0 }, 'fast');" class="back_to_top"><img src="images/arrow_up.svg" width="12" height="12" alt="Return to top" /> Back to top</a></p>
            </div>
          </div>
        </div>
        <div id="sidebar_container">
          <div id="sidebar">
            <aside id="filter-panel">
              <a class="hide-button" onclick="toggle_sidebox(this)">-</a>
              <h2 title="Use these to view only the information that you want to see"><a onclick="toggle_sidebox(this)">Filter <span class="current_focus_count"></span> <img src="<?php echo $data['config']['base_dir'] ?>/images/event.png" width="12" height="12" alt="event" class="current_focus_image" /> <span class="current_focus">events</span> with <img src="<?php echo $data['config']['base_dir'] ?>/images/<?php echo $data['type'] ?>.png" width="12" height="12" alt="<?php echo $data['type'] ?>" /> <span class="<?php echo $data['type'] ?>-color-light"><?php echo $data['entity'] ?></span></a></h2>
              <div class="sidebox">
                <h3>By number of mentions (popularity)</h3>
                <div id="count_histogram"></div>
                <div id="count-filter"></div>
                
                <div id="timeframe_filter">
                  <h3>Select timeframe</h3>
                  <div id="time-filter"></div>
                  
                  <input type="checkbox" id="only_show_entities_with_time" name="only_show_entities_with_time" onclick="redraw_visualizations()"> <label for="only_show_entities_with_time">Only show entities with time</label>
                  <!--
                  <input type="checkbox" id="include_time_outliers" name="include_time_outliers" onclick="redraw_visualizations()"> <label for="include_time_outliers">Include outliers</label>
                  -->
                </div>
                
                <div id="big_entity_filter">
                  <h3>Currently active filters</h3>
                  <ul id="filtered_entities"></ul>
                </div>
              </div>
            </aside>
            <aside id="color-panel">
              <a class="hide-button" onclick="toggle_sidebox(this)">-</a>
              <h2 title="Color events, actors, places or times if you are looking for particular information within a specific information type"><a onclick="toggle_sidebox(this)">Color <span class="current_focus_count"></span> <img src="<?php echo $data['config']['base_dir'] ?>/images/event.png" width="12" height="12" alt="event" class="current_focus_image" /> <span class="current_focus">events</span> with <img src="<?php echo $data['config']['base_dir'] ?>/images/<?php echo $data['type'] ?>.png" width="12" height="12" alt="<?php echo $data['type'] ?>" /> <span class="<?php echo $data['type'] ?>-color-light"><?php echo $data['entity'] ?></span></a></h2>
              <div class="sidebox">
                <ul>
                  <li id="count_colorizer" class="active colorizer" onclick="colorize('count')">Popularity with <img src="<?php echo $data['config']['base_dir'] ?>/images/<?php echo $data['type'] ?>.png" width="12" height="12" alt="<?php echo $data['type'] ?>" /> <span class="<?php echo $data['type'] ?>-color"><?php echo $data['entity'] ?></span></li>
                  <li id="actor_type_colorizer" class="colorizer actors-colorizer" onclick="colorize('actor_type')">People, organizations, and places</li>
                  <li id="continent_colorizer" class="colorizer places-colorizer" onclick="colorize('continent')">Continents</li>
                  <li id="nothing_colorizer" class="colorizer" onclick="colorize('nothing')"><em>No colors</em></li>
                  
                  <!-- 
                  I don't know what I was thinking
                  <li id="sources_colorizer" class="colorizer" onclick="colorize('sources')">News source</li>
                  -->
                </ul>
                <div id="colorization_legend">
                  <h3>Legend</h3>
                  <dl class="legend"></dl>
                </div>
              </div>
            </aside>
            <aside id="sorter-panel">
              <a class="hide-button" onclick="toggle_sidebox(this)">-</a>
              <h2 title="Reorder information to see the things which are mentioned most often or to look for something with a particular name"><a onclick="toggle_sidebox(this)">Sort <span class="current_focus_count"></span> <img src="<?php echo $data['config']['base_dir'] ?>/images/event.png" width="12" height="12" alt="event" class="current_focus_image" /> <span class="current_focus">events</span> with <img src="<?php echo $data['config']['base_dir'] ?>/images/<?php echo $data['type'] ?>.png" width="12" height="12" alt="<?php echo $data['type'] ?>" /> <span class="<?php echo $data['type'] ?>-color-light"><?php echo $data['entity'] ?></span></a></h2>
              <div class="sidebox">
                <ul>
                  <li id="label_sorter" class="sorter" onclick="sort_data('label')">Alphabetically (A&ndash;Z)</li>
                  <li id="value_sorter" class="active sorter" onclick="sort_data('value')">By number of mentions (popularity)</li>
                </ul>
              </div>
            </aside>
            <!--
            <aside>
              <a class="hide-button" onclick="toggle_sidebox(this)">-</a>
              <h2><a onclick="toggle_sidebox(this)">Report <span style="color: #fff">mistake</span></a></h2>
              <div class="sidebox">
                <p>What should be changed about this entity?</p>
                <ul>
                  <li><a class="mistake">Entity type</a></li>
                  <li><a class="mistake">Entity name</a></li>
                  <li><a class="mistake"></a></li>
                </ul>
              </div>
            </aside>
            -->
          </div>
        </div>
        <script>
          $(document).ready(function() {
            /*
            $('#sidebar').slimScroll({
              height: $('#sidebar').css({'height': ($(window).height() - 105) + 'px'}),
              alwaysVisible: true
            });
            $('#entity').slimScroll({
              height: $('#entity').css({'height': ($(window).height() - 135) + 'px'}),
              alwaysVisible: true
            });
            */
            $('#timeline-vis').slimScroll({
              height: $('#timeline-vis').css({'height': '330px'}),
              alwaysVisible: true
            });
          });
          
          $(window).resize(function(){
            /*
            $('#sidebar').slimScroll({
              height: $('#sidebar').css({'height': ($(window).height() - 105) + 'px'})
            });
            $('#entity').slimScroll({
              height: $('#entity').css({'height': ($(window).height() - 135) + 'px'})
            });
            */
            $('#timeline-vis').slimScroll({
              height: $('#timeline-vis').css({'height': '330px'})
            });
          });
        </script>
