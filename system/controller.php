<?php namespace mona;

abstract class Controller {
  protected $config;
  protected $arguments;
  protected $data;

  function set_default_page() {
    $page = explode('?', substr($_SERVER['REQUEST_URI'], strlen($this->config['base_dir']) + 1));
    $page = $page[0];
  
    $this->data = array('title'        => 'It works!',
                        'content'      => '<p>But add some application logic.</p>',
                        'template'     => 'template',
                        'page'         => $page,
                        'pre_scripts'  => array(),
                        'pre_script'   => '',
                        'post_scripts' => array(),
                        'post_script'  => ''
                       );
  }

  /**
   *
   */
  function set_config($config) {
    $this->config = $config;
  }

  /**
   * This is usually where $_GET and $_POST go to
   */
  function set_arguments($arguments) {
    $this->arguments = $arguments;
  }

  abstract function process();

  /**
   *
   */
  function output() {
    $data = $this->data;
    $data['config'] = $this->config;
    if(strlen($this->data['template']) > 0) {
      require_once 'application/views/' . $data['template'] . '.php';
    }
  }
}