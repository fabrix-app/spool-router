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
        require('../dist/index').RouterSpool // spool-router
      ]
    },
    routes: [
      {
        method: 'GET',
        path: '/test/foo',
        handler: 'TestController.foo'
      },
      {
        method: 'GET',
        path: '/test/{foo}',
        handler: 'TestController.foo'
      },
      {
        method: [ 'GET', 'POST' ],
        path: '/',
        handler: 'HomeController.index'
      },
      {
        method: '*',
        path: '/foo/bar',
        handler: 'FooController.bar',
        config: {
          pre: [
            'FooPolicy.bar'
          ]
        }
      },
      {
        method: 'GET',
        path: '/node_modules',
        handler: {
          directory: {
            path: 'node_modules'
          }
        }
      },
      {
        method: 'GET',
        path: '/test/foo/tags',
        handler: 'TestController.foo',
        config: {
          tags: ['test', 'other']
        }
      }
    ]
  }
}
