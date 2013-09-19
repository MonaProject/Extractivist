<?php namespace mona;

/**
 * Present some interesting trends and facts on the front page
 */
class CalculateMentionsController extends \mona\Controller {
  /**
   *
   */
  function process() {
    $this->data['template'] = '';
    $this->data['content'] = $this->calculate_events();
  }

  /**
   * Calculate the number of results that one would get with the current number of filters
   */
  function calculate_events() {
    exec('python application/models/calculate_mentions.py ' . 
          escapeshellarg(str_replace('"', '~~~~~', $this->arguments['form'])),
          $suggestions);
    echo implode("\n", $suggestions);
    ob_flush();
  }
}