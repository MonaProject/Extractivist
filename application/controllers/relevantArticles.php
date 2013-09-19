<?php namespace mona;

/**
 * Present some interesting trends and facts on the front page
 */
class RelevantArticlesController extends \mona\Controller {
  /**
   *
   */
  function process() {
    $this->data['template'] = '';
    $this->data['content'] = $this->retrieve_snippets();
  }

  /**
   * Retrieve and display suggestions in JSON format
   */
  function retrieve_snippets() {
    exec('python application/models/relevant_articles.py ' . 
          escapeshellarg(str_replace('"', '~~~~~', $this->arguments['events'])),
          $snippets);
    echo implode("\n", $snippets);
    ob_flush();
  }
}