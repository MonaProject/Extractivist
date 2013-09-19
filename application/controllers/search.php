<?php namespace mona;

/**
 * Present some interesting trends and facts on the front page
 */
class SearchController extends \mona\Controller {
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
    exec('python application/models/autocomplete.py ' . 
          escapeshellarg($this->arguments['q']),
          $suggestions);
    $suggestions = json_decode(implode("\n", $suggestions), true);
    $suggestion = $suggestions[0];
    $entity = substr($suggestion, 0, strripos($suggestion, '(') - 1);
    $type   = substr($suggestion, strripos($suggestion, '(') + 1, -1);
    
    header('Location: entity?type='.$type.'&name='.$entity.'&filters=%5B%7B"type"%3A%20"'.$type.'s"%2C%20"label"%3A%20"'.str_replace('+', '%20', urlencode($entity)).'"%7D%5D');
    ob_flush();
  }
}