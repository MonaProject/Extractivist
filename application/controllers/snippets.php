<?php namespace mona;

/**
 * Present some interesting trends and facts on the front page
 */
class SnippetsController extends \mona\Controller {
  /*
  function process() {
    $this->data['title']              = 'Snippets and stuff';
    $this->data['snippets']           = '';
    $this->data['secondary_template'] = 'snippets';
  }
*/
  
  public function process() {
    if(isset($_GET['type1']) and isset($_GET['type2']) and isset($_GET['name1']) and isset($_GET['name2'])) {
      $this->data['title'] = 'Articles';
      $this->data['secondary_template'] = 'snippets';
      
      exec('python application/models/relation_snippets.py ' . escapeshellarg($_GET['type1']) . ' ' . escapeshellarg($_GET['type2']) . ' ' . escapeshellarg($_GET['name1']) . ' ' . escapeshellarg($_GET['name2']), $output);

      $this->data['content'] = implode("\n", $output);
      $this->data['pre_scripts'] = array('scripts/jquery/slimscroll.js');
    }
    else {
      $this->data['title'] = 'Something went wrong!';
      $this->data['main'] = 'Asoh fuck up';
    }
  }
  
  /**
   *
   */
  function retrieve_snippets() {
  }
}