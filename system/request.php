<?php namespace mona;

/**
 * Handle incoming requests and make sure that there is always so some sort of
 * useful output.
 */
class Request {
  /**
   * Extract the part of the URL that indicates which resource the user is
   * requesting and load the corresponding controller class.
   */
  function __construct($request, $config, $arguments = null) {
    $request = explode('/', $request);

    $request = explode('?', $request[1]);
    $request = explode('-', $request[0]);
    
    for($i = 0; $i < count($request); $i++) {
      $request[$i] = ucfirst($request[$i]);
    }

    $request = join('', $request);

    $this->load_controller($request, $config, $arguments);
  }



  /**
   * Convert request to camel case and loads a controller
   */
  function load_controller($request, $config, $arguments) {
    $controller = '\\' . $config['namespace'] . '\\' . $request . 'Controller';

    if(class_exists($controller)) {
      $controller = new $controller;
    }
    else {
      $controller = new \mona\StaticPagesController();
    }
    $controller->set_config($config);
    $controller->set_arguments($arguments);
    $controller->set_default_page();
    $controller->process();
    $controller->output();
  }
}