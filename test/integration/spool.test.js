const assert = require('assert')
const _ = require('lodash')

describe('Router Spool', () => {

  describe('#initialize', () => {
    it('should have set app.routes', () => {
      const routes = global.app.routes
      assert(_.isObject(routes))
      // console.log(routes)
      // assert(Object.values(routes).some(r => _.isFunction(r.handler)))
      // assert(Object.values(routes).some(r => _.isPlainObject(r.handler)))
      // assert(_.isFunction(routes[0].handler))
      // assert(_.isFunction(routes[1].handler))
      // assert(_.isFunction(routes[2].handler))
      // assert(_.isPlainObject(routes[3].handler))

      assert(global.app.routes.get('/test/foo1'))
      assert(global.app.routes.get('/test/foo2'))
      assert(global.app.routes.get('/prefix/test/custom/prefix'))

      assert.equal(global.app.routes.size, 9)
    })
  })

  describe('route #config', () => {

    it('tags could be an array', () => {
      const routes = global.app.routes
      const route = routes.get('/test/foo/tags')
      assert(_.isObject(route.GET.config))
      assert(_.isArray(route.GET.config.tags))
      assert(_.includes(route.GET.config.tags, 'test', 'other'))
    })
  })
})
