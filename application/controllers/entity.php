<?php namespace mona;

/**
 * Present some interesting trends and facts on the front page
 */
class EntityController extends \mona\Controller {
  /**
   *
   */
  function process() {
    if($count = $this->retrieve_entity_count()) {
      $this->show_entity_page($count);
    }
    elseif($count === 0) {
      $this->show_not_found();
    }
    else {
      $this->data['title'] = 'Oops!';
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
  function show_entity_page($count) {
    $title = htmlentities($this->arguments['name']);
    $type  = htmlentities($this->arguments['type']);
    if(substr($title, 0, strlen('category:')) == 'category:')
      $title = substr($title, strlen('category:')) . ' (category)';
      
    $s = '';
    if($count > 1)
      $s = 's';
    
    $this->data['title']              = '<span class="' . $type . '-color">' . $title . '</span>';// (occurs ' . $count . ' time' . $s . ')';
    $this->data['mentions']           = $count;
    $this->data['type']               = $type;
    $this->data['entity']             = $title;
    $this->data['secondary_template'] = 'entity';
    $this->data['pre_scripts']        = array(
                                              'scripts/jquery/slimscroll.js',
                                              'scripts/jquery/jqrangeslider.js',
                                              'https://www.google.com/jsapi',
                                              'scripts/popup.js',
                                              'https://maps.googleapis.com/maps/api/js?libraries=drawing,visualization&amp;key=AIzaSyASXsbBZvdGk006PQPYJaYDEy42lAEKdCw&amp;sensor=false',
                                              'scripts/countries.json',
                                              /*
                                              'scripts/markerclusterer.js',
                                              */
                                              'scripts/map.js',
                                              'scripts/d3/d3.v3.min.js',
                                              'scripts/d3/timeline.js',
                                              'scripts/d3/histogram.js',
                                              'scripts/articles.js');
    $this->data['post_scripts']       = array('scripts/cloud.js',
                                              'scripts/tabbox.js',
                                              'scripts/colorize.js',
                                              'scripts/entity.js');
  }

  /**
   * Show a page that tells the user that the subject does not exist.
   */
  function show_not_found() {
    $suggestion = $this->retrieve_suggestion();
    
    $type = htmlentities(urldecode($this->arguments['type']));
    $name = htmlentities(urldecode($this->arguments['name']));
    if(substr($name, 0, strlen('category:')) == 'category:')
      $name = substr($name, strlen('category:'));

    $this->data['title'] = 'Entity not found';
    $this->data['content'] = <<< CONTENT
    <div style="font-size: 5em;
                font-weight: bold;
                text-align: center">;-(</div>
    <p>Sorry, no <strong>{$type}</strong> called <strong>{$name}</strong> could be found.{$suggestion}</p>
CONTENT;
  }

  /**
   * Retrieves the count for the requested entity.
   */
  function retrieve_entity_count() {
    /*
    exec('python application/models/concept_count.py ' . 
           escapeshellarg($this->arguments['type']) . ' ' .
           escapeshellarg($this->arguments['name']),
           $output);
    */
    exec('python application/models/calculate_mentions.py ' . 
           escapeshellarg(str_replace('"', '~~~~~', '[{"type": "' . $this->arguments['type'] . 's", "label": "' . $this->arguments['name'] . '"}]')),
           $output);
    return implode("\n", $output);
  }

  /**
   * Todo: add something that helps users who made a typo
   */
  function retrieve_suggestion() {
    return '';
  }
}