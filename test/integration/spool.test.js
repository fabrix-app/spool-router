const assert = require('assert')
const _ = require('lodash')

describe('Router Spool', () => {

  describe('#initialize', () => {
    it('should have set app.routes', () => {
      const routes = global.app.routes
      assert(_.isObject(routes))
      console.log(routes)
      // assert(Object.values(routes).some(r => _.isFunction(r.handler)))
      // assert(Object.values(routes).some(r => _.isPlainObject(r.handler)))
      // assert(_.isFunction(routes[0].handler))
      // assert(_.isFunction(routes[1].handler))
      // assert(_.isFunction(routes[2].handler))
      // assert(_.isPlainObject(routes[3].handler))

      assert(global.app.routes['/test/foo1'])
      assert(global.app.routes['/test/foo2'])
      assert(global.app.routes['/prefix/test/custom/prefix'])

      assert.equal(Object.keys(global.app.routes).length, 9)
    })
  })

  describe('route #config', () => {

    it('tags could be an array', () => {
      const routes = global.app.routes
      const route = routes['/test/foo/tags']
      assert(_.isObject(route.config))
      assert(_.isArray(route.config.tags))
      assert(_.includes(route.config.tags, 'test', 'other'))
    })
  })
})
