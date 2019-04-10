const assert = require('assert')
const _ = require('lodash')
const lib = require('../../../dist/index')

describe('lib.Util', () => {
  describe('#splitRoute', () => {
    it('Scenario 1', () => {
      const [{path, route}] = lib.Utils.splitRoute(global.app, '/foo/bar', {
        '*': {
          method: 'FooController.bar',
          config: {
            prefix: '/test2',
            pre: [
              'FooPolicy.bar'
            ]
          }
        },
        config: {
          prefix: '/test'
        }
      })
      assert.equal(path, '/test2/foo/bar')
    })
    it('Scenario 2', () => {
      const [{path, route}] = lib.Utils.splitRoute(global.app, '/foo/bar', {
        'GET': {
          method: 'FooController.bar',
          config: {
            pre: [
              'FooPolicy.bar'
            ]
          }
        },
        config: {
          prefix: '/test'
        }
      })
      // console.log('BROKE 2', splitRoutes)
      assert.equal(path, '/test/foo/bar')
    })
    it('Scenario 3', () => {
      const [{path, route}] = lib.Utils.splitRoute(global.app, '/foo/bar', {
        'GET': {
          method: 'FooController.bar',
          config: {
            prefix: '/test2',
            pre: [
              'FooPolicy.bar'
            ]
          }
        },
        'POST': {
          method: 'FooController.bar',
          config: {
            prefix: '/test2',
            pre: [
              'FooPolicy.bar'
            ]
          }
        }
      })
      // console.log('BROKE 2', splitRoutes)
      assert.equal(path, '/test2/foo/bar')
    })
    it('Scenario 4', () => {
      const splitRoutes = lib.Utils.splitRoute(global.app, '/foo/bar', {
        'GET': {
          method: 'FooController.bar',
          config: {
            prefix: '/test2',
            pre: [
              'FooPolicy.bar'
            ]
          }
        },
        'POST': {
          method: 'FooController.bar',
          config: {
            prefix: '/test3',
            pre: [
              'FooPolicy.bar'
            ]
          }
        }
      })
      assert.equal(splitRoutes.length, 2)
      assert.equal(splitRoutes[0].path, '/test2/foo/bar')
      assert.equal(splitRoutes[1].path, '/test3/foo/bar')
    })
    it('Scenario 4.5', () => {
      const splitRoutes = lib.Utils.splitRoute(global.app, '/foo/bar', {
        'GET': {
          method: 'FooController.bar',
          config: {
            prefix: '/test2',
            pre: [
              'FooPolicy.bar'
            ]
          }
        },
        'HEAD': {
          method: 'FooController.bar',
          config: {
            prefix: '/test2',
            pre: [
              'FooPolicy.bar'
            ]
          }
        },
        'PUT': {
          method: 'FooController.bar',
          config: {
            prefix: '/test3',
            pre: [
              'FooPolicy.bar'
            ]
          }
        },
        'POST': {
          method: 'FooController.bar',
          config: {
            prefix: '/test3',
            pre: [
              'FooPolicy.bar'
            ]
          }
        }
      })
      assert.equal(splitRoutes.length, 2)
      assert.equal(splitRoutes[0].path, '/test2/foo/bar')
      assert.equal(splitRoutes[1].path, '/test3/foo/bar')
    })
    it('Scenario 5', () => {
      const [{path, route}] = lib.Utils.splitRoute(global.app, '/foo/bar', {
        'GET': {
          method: 'FooController.bar',
          config: {
            prefix: '/test2',
            pre: [
              'FooPolicy.bar'
            ]
          }
        },
        config: {
          prefix: '/test'
        }
      })
      // console.log('BROKE 2', splitRoutes)
      assert.equal(path, '/test2/foo/bar')
    })
  })
  describe('#buildRoute', () => {
    // it('should build valid route in typical case', () => {
    //   const routes = global.app.config.routes
    //   const route = lib.Utils.buildRoute(global.app, routes[0])
    //
    //   assert(_.isString(route.path))
    //   assert(_.isFunction(route.handler))
    // })
    it('should resolve the route handler to the correct controller method', () => {
      const [{path, route}] = lib.Utils.buildRoute(global.app, '/foo/bar', {
        '*': 'FooController.bar'
      })

      assert.equal(route.GET.handler, global.app.controllers.FooController.bar)
    })
    it('should resolve the route handler to the correct controller method', () => {
      const [{path, route}] = lib.Utils.buildRoute(global.app, '/foo/bar', {
        '*': {
          handler: 'FooController.bar'
        }
      })
      assert.equal(route.GET.handler, global.app.controllers.FooController.bar)
    })
    it('should resolve the prerequisite handler (string) to the correct policy method', () => {
      const [{path, route}] = lib.Utils.buildRoute(global.app, '/foo/bar', {
        '*': 'FooController.bar',
        config: {
          pre: [
            'FooPolicy.bar'
          ]
        }
      })

      assert.equal(route.GET.config.pre[0], global.app.policies.FooPolicy.bar)
      assert.equal(route.HEAD.config.pre[0], global.app.policies.FooPolicy.bar)
      assert.equal(route.POST.config.pre[0], global.app.policies.FooPolicy.bar)
      assert.equal(route.PUT.config.pre[0], global.app.policies.FooPolicy.bar)
      assert.equal(route.DELETE.config.pre[0], global.app.policies.FooPolicy.bar)
      assert.equal(route.CONNECT.config.pre[0], global.app.policies.FooPolicy.bar)
      assert.equal(route.OPTIONS.config.pre[0], global.app.policies.FooPolicy.bar)
      assert.equal(route.TRACE.config.pre[0], global.app.policies.FooPolicy.bar)
      assert.equal(route.PATCH.config.pre[0], global.app.policies.FooPolicy.bar)
    })
    it('should resolve the prerequisite handler (object) to the correct policy method', () => {
      const [{ path, route}] = lib.Utils.buildRoute(global.app, '/foo/bar', {
        '*': 'FooController.bar',
        config: {
          pre: [
            {
              method: 'FooPolicy.bar'
            }
          ]
        }
      })
      assert.equal(route.GET.config.pre[0], global.app.policies.FooPolicy.bar)
    })
    it('should resolve the prerequisite handler (string) to the correct policy method', () => {
      const [{path, route}] = lib.Utils.buildRoute(global.app, '/foo/bar', {
        'GET': {
          method: 'FooController.bar',
          config: {
            pre: [
              'FooPolicy.bar'
            ]
          }
        }
      })

      assert.equal(route.GET.config.pre[0], global.app.policies.FooPolicy.bar)
    })
  })
  describe('#policies', () => {
    it('should inherit the Global Policy on Every Method', () => {
      const [{ path, route}] = lib.Utils.buildRoute(global.app, '/foo/bar', {
        '*': 'FooController.bar',
        config: {
          pre: [
            {
              method: 'FooPolicy.bar'
            }
          ]
        }
      })
      assert.equal(route.GET.config.pre[0], global.app.policies.FooPolicy.bar)
      assert.equal(route.GET.config.pre[1], global.app.policies.GlobalPolicy.foo)
      assert.equal(route.HEAD.config.pre[0], global.app.policies.FooPolicy.bar)
      assert.equal(route.HEAD.config.pre[1], global.app.policies.GlobalPolicy.foo)
      assert.equal(route.POST.config.pre[0], global.app.policies.FooPolicy.bar)
      assert.equal(route.POST.config.pre[1], global.app.policies.GlobalPolicy.foo)
      assert.equal(route.PUT.config.pre[0], global.app.policies.FooPolicy.bar)
      assert.equal(route.PUT.config.pre[1], global.app.policies.GlobalPolicy.foo)
    })

    it('should inherit the global policy and the global GET policy', () => {
      const [{ path, route}] = lib.Utils.buildRoute(global.app, '/foo/bar', {
        'GET': 'FooController.bar'
      })
      assert.equal(route.GET.config.pre[0], global.app.policies.GlobalPolicy.foo)
      assert.equal(route.GET.config.pre[1], global.app.policies.GetPolicy.foo)
    })

    it('should inherit the global policy and the global GET/POST policy and the Controller Specific Get/POST Policy', () => {
      const [{ path, route}] = lib.Utils.buildRoute(global.app, '/foo/bar', {
        'GET': 'TestController.foo',
        'POST': 'TestController.foo'
      })
      assert.equal(route.GET.config.pre[0], global.app.policies.GlobalPolicy.foo)
      assert.equal(route.GET.config.pre[1], global.app.policies.GetPolicy.foo)
      assert.equal(route.GET.config.pre[2], global.app.policies.FooWildCardPolicy.foo)
      assert.equal(route.GET.config.pre[3], global.app.policies.FooGetPolicy.foo)
      assert.equal(route.GET.config.pre.length, 4)

      assert.equal(route.POST.config.pre[0], global.app.policies.GlobalPolicy.foo)
      assert.equal(route.POST.config.pre[1], global.app.policies.PostPolicy.post)
      assert.equal(route.POST.config.pre[2], global.app.policies.FooWildCardPolicy.foo)
      assert.equal(route.POST.config.pre[3], global.app.policies.FooPostPolicy.post)
      assert.equal(route.POST.config.pre.length, 4)
    })
    it('should inherit the global policy and the global GET/POST policy and the Controller Specific Get/POST Policy', () => {
      const [{ path, route}] = lib.Utils.buildRoute(global.app, '/foo/bar', {
        'GET': {
          handler: 'TestController.foo'
        },
        'POST': {
          handler: 'TestController.foo'
        }
      })
      console.log('BRK 1', route.GET.config)
      assert.equal(route.GET.config.pre[0], global.app.policies.GlobalPolicy.foo)
      assert.equal(route.GET.config.pre[1], global.app.policies.GetPolicy.foo)
      assert.equal(route.GET.config.pre[2], global.app.policies.FooWildCardPolicy.foo)
      assert.equal(route.GET.config.pre[3], global.app.policies.FooGetPolicy.foo)
      assert.equal(route.GET.config.pre.length, 4)

      console.log('BRK 2', route.POST.config)
      assert.equal(route.POST.config.pre[0], global.app.policies.GlobalPolicy.foo)
      assert.equal(route.POST.config.pre[1], global.app.policies.PostPolicy.post)
      assert.equal(route.POST.config.pre[2], global.app.policies.FooWildCardPolicy.foo)
      assert.equal(route.POST.config.pre[3], global.app.policies.FooPostPolicy.post)
      assert.equal(route.POST.config.pre.length, 4)
    })
  })
})
