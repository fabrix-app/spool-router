const assert = require('assert')
const lib = require('../../../dist')

describe('lib.utils', () => {
  describe('#buildRoutes errors', () => {
    it('should log an error if there is no handler and return undefined', () => {
      const rawRoute = {
        'GET': null
      }
      const {path, route} = lib.Utils.buildRoute(global.app, '/test/foo', rawRoute)
      assert.equal(route.GET, undefined)
      // getHandlerFromPrerequisite
    })
  })
  describe('#getHandlerFromPrerequisite errors', () => {
    it('should log an error if there is no pre and return undefined', () => {
      const handler = lib.Utils.getHandlerFromPrerequisite(global.app, {})
      assert.equal(handler, undefined)
    })
  })

  describe('#getPrefix errors', () => {
    it('should log an error if there is no pre and return undefined', () => {
      assert.throws(() => lib.Utils.getPrefix(global.app, ''), RangeError)
    })
  })

  describe('#getPathFromRoute', () => {
    const handler = function () { }

    it('should use the router config prefix', () => {
      const app = global.app
      app.config.immutable = false
      app.config.set('router.prefix', '/api/v1')

      const route = {
        'POST': handler
      }
      const path = lib.Utils.getPathFromRoute(global.app, '/a', route)
      assert.equal(path, '/api/v1/a')
    })
    it('should use the route level config prefix', () => {
      const app = global.app
      app.config.immutable = false
      app.config.set('router.prefix', '/api/v1')

      const route = {
        'POST': handler,
        config: {
          prefix: '/api/v2'
        }
      }
      const path = lib.Utils.getPathFromRoute(global.app, '/a', route)
      assert.equal(path, '/api/v2/a')
    })
    it('should ignore router config prefix and route level config prefix', () => {
      const app = global.app
      app.config.immutable = false
      app.config.set('router.prefix', '/api/v1')

      const route = {
        'POST': handler,
        config: {
          prefix: false
        }
      }
      const path = lib.Utils.getPathFromRoute(global.app, '/a', route)
      assert.equal(path, '/a')
    })
    it('should ignore router config prefix and route level config prefix', () => {
      const app = global.app
      app.config.immutable = false
      app.config.set('router.prefix', '/api/v1')

      const route = {
        'POST': handler,
        config: {
          prefix: 'customPrefixer.prefix'
        }
      }
      const path = lib.Utils.getPathFromRoute(global.app, '/a', route)
      assert.equal(path, '/prefix/a')
    })
  })

})

