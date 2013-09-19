<?php namespace mona;

/**
 * Present some interesting trends and facts on the front page
 */
class DashboardController extends \mona\Controller {
  private $top10s;
  private $titles = array('events' => 'Events are things that happen',
                          'actors' => 'Actors participate in events, and typically are persons or organizations',
                          'places' => 'Events often occur at particular places',
                          'times'  => 'Events often occur at particular times');
  /**
   *
   */
  function process() {
    $this->data['title'] = 'Dashboard';
    $this->data['is_main'] = true;
    $this->data['pre_scripts'] = array('scripts/jquery/dashboard.js');
    $this->data['content'] = <<< CONTENT
        <img src="{$this->config['base_dir']}/images/eye.svg" width="150" height="150" alt="{$this->config['application_name']}" class="logo" />
        <h1 class="huge_ass">{$this->config['application_name']}</h1>

CONTENT;
    $this->top10s = $this->retrieve_top_10();
    
    if(count($this->top10s) > 0) {
      $this->make_big_query_editor();
      $this->draw_top_10_boxes($this->top10s);
      $this->draw_dataset_stats();
    }
    else {
      $this->data['title'] = 'Database went MIA';
      $this->data['is_special'] = true;
      $this->data['content'] = <<< CONTENT
    <div style="margin-top: 50px; text-align: center">
      <h1>It seems that something has gone terribly wrong</h1>
      <img src="{$this->config['base_dir']}/images/fail.svg" width="453" height="219" alt="Yep, something went terribly wrong there" />
      <p>I don't know what causes this, but a page refresh usually works.</p>
    </div>
CONTENT;
    }
  }


  /**
   *
   */
  function draw_dataset_stats() {
    $stats = $this->retrieve_dataset_stats();
    $this->data['content'] .= <<< CONTENT
        <div id="dataset_stats" class="topbox">
          <h3>About <em>this dataset</em></h3>
          <img src="images/db.svg" width="150" height="150" alt="DB" />
          <div class="article_count"><em>{$stats->total}</em>articles</div>
          <div class="sources_list">
            <p>From the following sources</p>
            <ol>
CONTENT;
    foreach($stats->sources as $source) {
      $this->data['content'] .= '<li>' . $source->site .' (' . $source->count . ')</li>';
    }
    $actors = count($this->top10s->actor);
    $this->data['content'] .= <<< CONTENT
            </ol>
          </div>
          <div class="entities_list">
CONTENT;
    foreach($this->top10s as $type => $top10list) {
      $count = count($this->top10s->$type);
      $this->data['content'] .= <<< CONTENT
            <div>
              <span style="display: inline-block; min-width: 40px">{$stats->counts->$type}</span> <img src="images/{$type}30.png" width="30" height="30" alt="{$type}s" /> {$type}s, of which {$count} unique
            </div>
CONTENT;
    }
    $this->data['content'] .= <<< CONTENT
          </div>
          <hr style="visibility: hidden; clear: left; padding-top: 1px" />
        </div>
CONTENT;
  }

  
  /**
   * Retrieve and display suggestions in JSON format
   */
  function retrieve_dataset_stats() {
    exec('python application/models/dataset_stats.py MONKEY KING',
          $stats);
    return json_decode(implode("\n", $stats));
  }


  /**
   *
   */
  function make_big_query_editor() {
    $this->data['content'] .= '<h2>What would you like to know more about?</h2>';
    $this->data['content'] .= <<< CONTENT
        <div id="query_editor">
         <div class="query_entity_type">
          <h3 class="event-background" title="{$this->titles['events']}">Events</h3>
          <input type="text" class="small_search" id="event_small_search" placeholder="Find an event" />
          <ul id="events_query_list"></ul>
         </div>
         <div class="query_entity_type">
          <h3 class="actor-background" title="{$this->titles['actors']}">Actors</h3>
          <input type="text" class="small_search" id="actor_small_search" placeholder="Find an actor" />
          <ul id="actors_query_list"></ul>
         </div>
         <div class="query_entity_type">
          <h3 class="place-background" title="{$this->titles['places']}">Places</h3>
          <input type="text" class="small_search" id="place_small_search" placeholder="Find a place" />
          <ul id="places_query_list"></ul>
         </div>
         <div class="query_entity_type">
          <h3 class="time-background"  title="{$this->titles['times']}">Times</h3>
          <input type="text" class="small_search" id="time_small_search" placeholder="Find a time" />
          <ul id="times_query_list"></ul>
         </div>
         <div class="query_entity_type query_results">
          <h3 style="background: #666">Results</h3>
          <p id="big_search_results">Choose at least one filter</p>
          <a class="button" style="display: none" onclick="visualize()">Visualize</a> <span style="display: none">or choose more filters</span>
         </div>
        </div>

CONTENT;
  }

  /**
   *
   */
  function draw_top_10_boxes($unordered_top10s) {
    $top10s['event'] = $unordered_top10s->event;
    $top10s['actor'] = $unordered_top10s->actor;
    $top10s['place'] = $unordered_top10s->place;
    $top10s['time']  = $unordered_top10s->time;
    
    $this->data['content'] .= '        <h2>Don\'t know what you are looking for yet? Choose one of these popular entities to get started</h2>' . "\n";
    foreach($top10s as $type=>$top10list) {
      $title = $this->titles[$type . 's'];
      $this->data['content'] .= <<< CONTENT
        <div id="{$type}-topbox" class="topbox">
          <h3 title="{$title}" class="{$type}-background">most popular <em>{$type}s</em></h3>
          <img src="images/{$type}.svg" width="150" height="150" alt="{$type}s" />
          <ol>

CONTENT;
      $i = 1;
      foreach($top10list as $entity) {
        $filters = str_replace('+', '%20', urlencode('[{"type": "' . $type . 's", "label": "' . $entity->label . '"}]'));
        $safe_label = $entity->label;
        if(strlen($safe_label) > 32)
          $safe_label = substr($safe_label, 0, 30) . '...';
        
        if($type == 'actor')
          $title = "'{$entity->label}' was involved in {$entity->value} events";
        elseif($type == 'event')
          $title = "The event '{$entity->label}' occurred {$entity->value} timess";
        elseif($type == 'place')
          $title = "{$entity->value} events took place in {$entity->label}";
        elseif($type == 'time')
          $title = "{$entity->value} events occurred in/on {$entity->label}";
        
        $this->data['content'] .= <<< CONTENT
            <li><span>{$i}.</span> <a href="entity?type={$type}&amp;name={$entity->label}&amp;filters={$filters}" class="{$type}-color" title="{$title}">{$safe_label}</a> ({$entity->value})</li>

CONTENT;
        $i++;
      }
      $this->data['content'] .= <<< CONTENT
          </ol>
          <div class="list_navigator"></div> <!-- Add controls here -->
        </div>

CONTENT;
    }
  }


  /**
   * Retrieve and display suggestions in JSON format
   */
  function retrieve_top_10() {
    exec('python application/models/overall_mentions.py BANANA KING',
          $mentions);
    return json_decode(implode("\n", $mentions));
  }
}