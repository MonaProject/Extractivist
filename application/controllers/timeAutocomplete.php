<?php namespace mona;

/**
 * Present some interesting trends and facts on the front page
 */
class TimeAutocompleteController extends \mona\Controller {
  /**
   *
   */
  function process() {
    $this->data['template'] = '';
    $this->data['content'] = $this->retrieve_autocomplete_results();
  }

  /**
   * Retrieve and display suggestions in JSON format
   */
  function retrieve_autocomplete_results() {
    exec('python application/models/autocomplete_type_specific.py ' . 
          'time ' .
          escapeshellarg($this->arguments['term']),
          $suggestions);
    echo urldecode(implode("\n", $suggestions));
    ob_flush();
  }
}