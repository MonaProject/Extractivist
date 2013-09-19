<?php namespace mona;

/**
 * Present some interesting trends and facts on the front page
 */
class RelatedEntitiesController extends \mona\Controller {
  /**
   *
   */
  function process() {
    $this->data['template'] = '';
    $this->data['content'] = $this->get_entities();
  }

  /**
   * Calculate the number of results that one would get with the current number of filters
   */
  function get_entities() {
    exec('python application/models/related_entities.py ' . 
          escapeshellarg(str_replace('"', '~~~~~', $this->arguments['type'])) . ' ' .
          escapeshellarg(str_replace('"', '~~~~~', $this->arguments['name'])),
          $entities);
    echo implode("\n", $entities);
    ob_flush();
  }
}