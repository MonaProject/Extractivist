<?php namespace mona;

/**
 * Outputs a HTML-formatted article with relevant parts in bold
 */
class SnippetController extends \mona\Controller {
  /**
   *
   */
  function process() {
    $this->data['template'] = '';
    $this->data['content'] = $this->retrieve_snippet();
  }

  /**
   *
   */
  function retrieve_snippet() {
    exec('python application/models/snippet2.py ' . 
          escapeshellarg($this->arguments['article']) . ' ' .
          escapeshellarg($this->arguments['event']),
          $snippet);
    echo implode("\n", $snippet);
    ob_flush();
  }
}