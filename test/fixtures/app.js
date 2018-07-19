require('@fabrix/fabrix')

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
