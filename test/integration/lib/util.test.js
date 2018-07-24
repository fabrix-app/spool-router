const assert = require('assert')
const _ = require('lodash')
const lib = require('../../../dist')

describe('lib.Util', () => {
  describe('#buildRoute', () => {
    // it('should build valid route in typical case', () => {
    //   const routes = global.app.config.routes
    //   const route = lib.Utils.buildRoute(global.app, routes[0])
    //
    //   assert(_.isString(route.path))
    //   assert(_.isFunction(route.handler))
    // })
    it('should resolve the route handler to the correct controller method', () => {
      const {path, route} = lib.Utils.buildRoute(global.app, '/foo/bar', {
        '*': 'FooController.bar'
      })

      assert.equal(route.GET.handler, global.app.controllers.FooController.bar)
    })
    it('should resolve the route handler to the correct controller method', () => {
      const {path, route} = lib.Utils.buildRoute(global.app, '/foo/bar', {
        '*': {
          handler: 'FooController.bar'
        }
      })
      assert.equal(route.GET.handler, global.app.controllers.FooController.bar)
    })
    it('should resolve the prerequisite handler (string) to the correct policy method', () => {
      const {path, route} = lib.Utils.buildRoute(global.app, '/foo/bar', {
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
      const { path, route} = lib.Utils.buildRoute(global.app, '/foo/bar', {
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
      const {path, route} = lib.Utils.buildRoute(global.app, '/foo/bar', {
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
      const { path, route} = lib.Utils.buildRoute(global.app, '/foo/bar', {
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
      const { path, route} = lib.Utils.buildRoute(global.app, '/foo/bar', {
        'GET': 'FooController.bar'
      })
      assert.equal(route.GET.config.pre[0], global.app.policies.GlobalPolicy.foo)
      assert.equal(route.GET.config.pre[1], global.app.policies.GetPolicy.foo)
    })

    it('should inherit the global policy and the global GET policy and the Controller Specific Get Policy', () => {
      const { path, route} = lib.Utils.buildRoute(global.app, '/foo/bar', {
        'GET': 'TestController.foo'
      })
      assert.equal(route.GET.config.pre[0], global.app.policies.GlobalPolicy.foo)
      assert.equal(route.GET.config.pre[1], global.app.policies.GetPolicy.foo)
      assert.equal(route.GET.config.pre[2], global.app.policies.FooWildCardPolicy.foo)
      assert.equal(route.GET.config.pre[3], global.app.policies.FooGetPolicy.foo)
    })
  })
})
