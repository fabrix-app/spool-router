const assert = require('assert')
const _ = require('lodash')

describe('Router Spool', () => {

  describe('#initialize', () => {
    it('should set app.routes', () => {
      const routes = global.app.routes
      assert(_.isArray(routes))
      console.log(routes)
      assert.equal(routes.length, 6)
      assert(routes.some(r => _.isFunction(r.handler)))
      assert(routes.some(r => _.isPlainObject(r.handler)))
      // assert(_.isFunction(routes[0].handler))
      // assert(_.isFunction(routes[1].handler))
      // assert(_.isFunction(routes[2].handler))
      // assert(_.isPlainObject(routes[3].handler))
    })
  })

  describe('route #config', () => {

    it('tags could be an array', () => {
      const routes = global.app.routes
      assert(_.isArray(routes))

      const route = routes[routes.length - 1] //get last one.
      assert.equal(route.path, '/test/foo/tags')
      assert(_.isObject(route.config))
      assert(_.isArray(route.config.tags))
      assert(_.includes(route.config.tags, 'test', 'other'))
    })
  })
})
