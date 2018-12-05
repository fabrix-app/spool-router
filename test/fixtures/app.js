'use strict'
const Controller = require('@fabrix/fabrix/dist/common/Controller').FabrixController
const Policy = require('@fabrix/fabrix/dist/common/Policy').FabrixPolicy

module.exports = {
  pkg: {
    name: 'router-spool-test'
  },
  api: {
    controllers: {
      TestController: class TestController extends Controller {
        foo () { }
        bar () { }
      },
      HomeController: class HomeController extends Controller {
        index () { }
      },
      FooController: class FooController extends Controller {
        bar () { }
      }
    },
    policies: {
      FooPolicy: class FooPolicy extends Policy {
        bar () { }
      },
      GlobalPolicy: class GlobalPolicy extends Policy {
        foo () { }
      },
      GetPolicy: class GetPolicy extends Policy {
        foo () { }
      },
      FooGetPolicy: class FooGetPolicy extends Policy {
        foo () { }
      },
      FooWildCardPolicy: class FooWildCardPolicy extends Policy {
        foo () { }
      }
    }
  },
  config: {
    main: {
      spools: [
        require('./testspool'),
        require('./testspool2'),
        require('../../dist/index').RouterSpool, // spool-router
      ]
    },
    customPrefixer: {
      prefix: '/prefix'
    },
    router: {
      debug: true
    },
    policies: {
      '*': {
        '*': ['GlobalPolicy.foo'],
        'GET': ['GetPolicy.foo']
      },
      'TestController': {
        '*': {
          '*': ['FooWildCardPolicy.foo']
        },
        'foo': {
          'GET': ['FooGetPolicy.foo']
        }
      }
    },
    routes: {
      '/test/foo': {
        'GET': 'TestController.foo'
      },
      '/test/{foo}': {
        'GET': 'TestController.foo'
      },
      '/': {
        'GET': 'HomeController.index',
        'POST': 'HomeController.index'
      },
      '/foo/bar': {
        '*': 'FooController.bar',
        config: {
          pre: [
            'FooPolicy.bar'
          ]
        }
      },
      '/node_modules': {
        'GET': {
          directory: {
            path: 'node_modules'
          }
        }
      },
      '/test/foo/tags': {
        'GET': 'TestController.foo',
        config: {
          tags: ['test', 'other']
        }
      },
      '/test/custom/prefix': {
        'GET': 'TestController.foo',
        config: {
          prefix: 'customPrefixer.prefix'
        }
      }
    }
  }
}
