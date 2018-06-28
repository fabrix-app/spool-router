const assert = require('assert')
const lib = require('../../../dist')

describe('lib.utils', () => {

  describe('#findRouteConflicts', () => {
    const handler = function () { }

    it('should return empty list if there are no route conflicts', () => {
      const routes = [
        {
          method: 'GET',
          path: '/test/foo',
          handler: 'TestController.foo'
        },
        {
          method: [ 'GET', 'POST' ],
          path: '/',
          handler: 'HomeController.index'
        }
      ]

      const conflicts = lib.Utils.findRouteConflicts(routes)

      assert.equal(conflicts.length, 0)
    })
    it('should return list of errors if there are route conflicts', () => {
      const routes = [
        {
          method: 'GET',
          path: '/test/foo',
          handler: 'TestController.foo'
        },
        {
          method: [ 'GET', 'POST' ],
          path: '/test/foo',
          handler: 'TestController.bar'
        }
      ]

      const conflicts = lib.Utils.findRouteConflicts(routes)

      assert.equal(conflicts.length, 1)
    })
    it('should return no results for a valid route list', () => {
      const routeList = [
        { method: '*', path: '/a', handler: handler },
        { method: '*', path: '/b', handler: handler },
        { method: '*', path: '/c', handler: handler }
      ]

      const conflicts = lib.Utils.findRouteConflicts(routeList)
      assert.equal(conflicts.length, 0)
    })
    it('should return no errors for identical paths with different methods', () => {
      const routeList = [
        { method: 'GET', path: '/a', handler: handler },
        { method: [ 'POST', 'PUT' ], path: '/a', handler: handler },
        { method: '*', path: '/c', handler: handler }
      ]

      const conflicts = lib.Utils.findRouteConflicts(routeList)
      assert.equal(conflicts.length, 0)
    })
    it('should return errors for routes with identical paths and overlapping wildcard method', () => {
      const routeList = [
        { method: '*', path: '/a', handler: handler },
        { method: 'GET', path: '/a', handler: handler },
      ]

      const conflicts = lib.Utils.findRouteConflicts(routeList)
      assert.equal(conflicts.length, 1)
    })
    it('should detect invalid route list (duplicate paths)', () => {
      const routeList = [
        { method: 'GET', path: '/a', handler: handler },
        { method: 'GET', path: '/a', handler: handler }
      ]

      const conflicts = lib.Utils.findRouteConflicts(routeList)

      assert.equal(conflicts.length, 1)
      assert.equal(conflicts[0].errors[0].message, 'New route /a conflicts with existing /a')
    })
    it('should detect multiple errors in invalid route list (duplicate paths)', () => {
      const routeList = [
        { method: 'GET', path: '/a', handler: handler },
        { method: 'GET', path: '/a', handler: handler },
        { method: 'GET', path: '/a', handler: handler }
      ]

      const conflicts = lib.Utils.findRouteConflicts(routeList)

      assert.equal(conflicts.length, 2)
      assert.equal(conflicts[0].errors[0].message, 'New route /a conflicts with existing /a')
    })
    it('should validate non-overlapping methods for a single path', () => {
      const routeList = [
        { method: 'POST', path: '/a', handler: handler },
        { method: 'GET', path: '/a', handler: handler }
      ]

      const conflicts = lib.Utils.findRouteConflicts(routeList)
      assert.equal(conflicts.length, 0)
    })

  })

  describe('#buildRoutes errors', () => {
    it('should log an error if there is no handler and return undefined', () => {
      const rawRoute = {
        method: 'GET',
        path: '/test/foo'
      }
      const route = lib.Utils.buildRoute(global.app, rawRoute)
      assert.equal(route, undefined)
      // getHandlerFromPrerequisite
    })
  })
  describe('#getHandlerFromPrerequisite errors', () => {
    it('should log an error if there is no pre and return undefined', () => {
      const route = lib.Utils.getHandlerFromPrerequisite(global.app, null)
      assert.equal(route, undefined)
    })
  })

  describe('#findRouteConflicts errors', () => {
    it('should take a null value', () => {
      const route = lib.Utils.findRouteConflicts()
      assert.deepEqual(route, [])
    })
  })

  describe('#getPathFromRoute', () => {
    const handler = function () { }

    it('should use the router config prefix', () => {
      const app = global.app
      app.config.immutable = false
      app.config.set('router.prefix', '/api/v1')

      const route = {
        method: 'POST',
        path: '/a',
        handler: handler
      }
      const path = lib.Utils.getPathFromRoute(global.app, route)
      assert.equal(path, '/api/v1/a')
    })
    it('should use the route level config prefix', () => {
      const app = global.app
      app.config.immutable = false
      app.config.set('router.prefix', '/api/v1')

      const route = {
        method: 'POST',
        path: '/a',
        handler: handler,
        config: {
          prefix: '/api/v2'
        }
      }
      const path = lib.Utils.getPathFromRoute(global.app, route)
      assert.equal(path, '/api/v2/a')
    })
    it('should ignore router config prefix and route level config prefix', () => {
      const app = global.app
      app.config.immutable = false
      app.config.set('router.prefix', '/api/v1')

      const route = {
        method: 'POST',
        path: '/a',
        handler: handler,
        config: {
          prefix: false
        }
      }
      const path = lib.Utils.getPathFromRoute(global.app, route)
      assert.equal(path, '/a')
    })
  })

})

