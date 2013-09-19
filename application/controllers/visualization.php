<?php namespace mona;

/**
 * Present some interesting trends and facts on the front page
 */
class VisualizationController extends \mona\Controller {
  /**
   *
   */
  function process() {
    if($this->get_number_of_events() > 0) {
      $filters = json_decode($this->arguments['filters'], true);
    
      $this->data['title'] = 'Visualization';
      $this->data['filters'] = $filters;
      $this->data['content'] = 'Boo.';
      ob_flush();
    }
    elseif(!isset($this->arguments['filters'])) {
      $this->data['title'] = 'No events could be found';
      $this->data['is_special'] = true;
      $this->data['content'] = <<< CONTENT
    <div style="margin-top: 50px; text-align: center">
      <h1>No events could be found</h1>
      <img src="{$this->config['base_dir']}/images/fail.svg" width="453" height="219" alt="Yep, something went terribly wrong there" />
      <p>Please try another search.</p>
    </div>
CONTENT;
    }
    else {
      $this->data['title'] = 'Server britta\'d the database connection';
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

  function get_number_of_events() {
    if(isset($this->arguments['filters'])) {
      exec('python application/models/calculate_mentions.py ' . 
            escapeshellarg(str_replace('"', '~~~~~', $this->arguments['filters'])),
            $suggestions);
      return (int) implode('', $suggestions);
    }
    return 0;
  }
}