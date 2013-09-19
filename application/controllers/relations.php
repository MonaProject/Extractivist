<?php namespace mona;

/**
 * Retrieves four JSON objects containing subjects related to the entry point.
 * Should be called using AJAX after the page has completely loaded.
 */
class RelationsController extends \mona\Controller {
  /**
   *
   */
  public function process() {
    $this->data['template'] = '';
    $this->data['content'] = $this->retrieve_related_subjects();
  }

  /**
   *
   */
  function retrieve_related_subjects() {
    exec('python application/models/concept_counts.py ' . 
           escapeshellarg($this->arguments['type']) . ' ' .
           escapeshellarg($this->arguments['name']),
           $output);
    echo implode("\n", $output);
    ob_flush();
  }
}