require.config({
  baseUrl: '.'
, paths: {
    jquery: 'vendor/jquery/jquery'
  , es6: 'node_modules/requirejs-babel/es6'
  , babel: 'node_modules/requirejs-babel/babel-4.6.6.min'
  , react: 'vendor/react/react'
  , underscore: 'node_modules/underscore/underscore'
  , ace: 'vendor/ace-builds/ace'
  , 'react-bootstrap': 'vendor/react-bootstrap/react-bootstrap'
  , brace: 'node_modules/react-ace-wrapper/node_modules/brace'
  , pubsub: 'vendor/pubsub-js/pubsub'
  , 'dot-object': 'vendor/dot-object/dot-object'
  , 'bpm-client': 'node_modules/borgnix-project-manager/client'
  , term: 'node_modules/term.js/src/term'
  , 'react-menus': 'node_modules/react-menus/dist/react-menus'
  , 'bootstrap-contextmenu': 'vendor/bootstrap-contextmenu/bootstrap-contextmenu'
  }
, shim: {
    term: {
      exports: 'Terminal'
    , deps: ['underscore']
    }
  , 'react-menus': {
      deps: ['react']
    }
    // 'vendor/ace-builds/ext-language_tools.js': ['ace']
  }
})

require(['jquery', 'es6!js/app'], function ($, app) {
  app.init()
})
