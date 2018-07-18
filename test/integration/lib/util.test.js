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

      assert.equal(route.config.pre[0], global.app.policies.FooPolicy.bar)
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

      assert.equal(route.config.pre[0], global.app.policies.FooPolicy.bar)
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

})
