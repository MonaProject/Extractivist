<?php namespace mona;

/**
 * Present some interesting trends and facts on the front page
 */
class StaticPagesController extends \mona\Controller {
  function process() {
    $request = explode('?', $_SERVER['REQUEST_URI']);
    $page = substr($request[0], strlen($this->config['base_dir']));

    if(strpos('.', $page) === false and
       strpos('|', $page) === false and
       file_exists('application/views/pages' . $page . '.php')) {
      require 'application/views/pages' . $page . '.php';
      $this->data['title'] = $title;
      $this->data['content'] = $content;
    }
    else {
      $this->data['title'] = 'Page not found';
      $this->data['is_special'] = true;
      $this->data['content'] = <<< CONTENT
    <div style="padding-top: 50px; text-align: center">
      <h1>It seems that something has gone terribly wrong</h1>
      <img src="{$this->config['base_dir']}/images/fail.svg" width="453" height="219" alt="Yep, something went terribly wrong there" />
      <p>You can <a href="{$this->config['base_dir']}/feedback">inform</a> the owner of this website if you believe that this may be caused by a programming error.</p>
    </div>

CONTENT;
    }
  }
}