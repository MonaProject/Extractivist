<?php namespace mona;

/**
 * Retrieves four JSON objects containing subjects related to the entry point.
 * Should be called using AJAX after the page has completely loaded.
 */
class DbpediaController extends \mona\Controller {
  /**
   *
   */
  public function process() {
    $this->data['template'] = '';
    $this->data['content'] = $this->retrieve_dbpedia_data();
  }

  /**
   *
   */
  function retrieve_dbpedia_data() {
    exec('python application/models/dbpedia.py ' . 
           escapeshellarg($this->arguments['type']) . ' ' .
           escapeshellarg($this->arguments['name']),
           $output);
    echo implode("\n", $output);
    ob_flush();
  }
}