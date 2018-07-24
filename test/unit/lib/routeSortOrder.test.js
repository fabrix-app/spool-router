'use strict'
/* global describe, it */
const assert = require('assert')
const routeOrder = require('../../../dist/utils').Utils.createSpecificityComparator
const sort = require('../../../dist/utils').Utils.sortRoutes

describe('Utils Route Sort Order', () => {
  it('should exist', () => {
    assert(routeOrder)
    assert(sort)
  })
  it('should sort the routes for free variables (express style)', () => {
    let routes = {
       '/a': {},
       '/a/:id': {},
      '/a/*': {},
      '/b': {},
      '/a/:id/:world': {},
      '/a/:id/*': {},
      '*': {},
      '/b/:id/:world': {},
      '/': {},
      '/b/:id/*': {},
      '/b/:id': {},
      '/b/*': {}
    }

    routes = sort(routes, 'asc')
    assert(routes)
    console.log(routes)
    const ordered = new Map()
    const order = {
      '/a': {},
      '/a/:id': {},
      '/a/*': {},
      '/a/:id/:world': {},
      '/a/:id/*': {},
      '/b': {},
      '/b/:id': {},
      '/b/*': {},
      '/b/:id/:world': {},
      '/b/:id/*': {},
      '/': {},
      '*': {},
    }
    Object.keys(order).forEach(k => {
      ordered.set(k, order[k])
    })
    assert.deepEqual(routes, ordered)
  })

  it('should sort the routes for free variables (hapi style)', () => {
    let routes = {
      '/a': {},
      '/a/{id}': {},
      '/a/*': {},
      '/b': {},
      '/a/{id}/{world}': {},
      '/a/{id}/*': {},
      '*': {},
      '/b/{id}/{world}': {},
      '/': {},
      '/b/{id}/*': {},
      '/b/{id}': {},
      '/b/*': {},
    }

    routes = sort(routes, 'asc')
    assert(routes)

    const ordered = new Map()
    const order = {
      '/a': {},
      '/a/{id}': {},
      '/a/*': {},
      '/a/{id}/{world}': {},
      '/a/{id}/*': {},
      '/b': {},
      '/b/{id}': {},
      '/b/*': {},
      '/b/{id}/{world}': {},
      '/b/{id}/*': {},
      '/': {},
      '*': {},
    }
    Object.keys(order).forEach(k => {
      ordered.set(k, order[k])
    })
    assert.deepEqual(routes, ordered)
  })

  it('should sort the routes for free variables desc', () => {
    let routes = {
      '/a': {},
      '/a/{id}': {},
      '/a/*': {},
      '/b': {},
      '/a/{id}/{world}': {},
      '/a/{id}/*': {},
      '*': {},
      '/b/{id}/{world}': {},
      '/': {},
      '/b/{id}/*': {},
      '/b/{id}': {},
      '/b/*': {},
    }

    routes = sort(routes, 'desc')
    assert(routes)
    const ordered = new Map()
    const order = {
      '/a': {},
      '/a/{id}': {},
      '/a/*': {},
      '/a/{id}/{world}': {},
      '/a/{id}/*': {},
      '/b': {},
      '/b/{id}': {},
      '/b/*': {},
      '/b/{id}/{world}': {},
      '/b/{id}/*': {},
      '/': {},
      '*': {},
    }
    Object.keys(order).forEach(k => {
      ordered.set(k, order[k])
    })
    assert.deepEqual(routes, ordered)
  })

  it('should sort the routes for free variables asc', () => {
    let routes = {
      '/a': {},
      '/a/{id}': {},
      '/a/*': {},
      '/b': {},
      '/a/{id}/{world}': {},
      '/a/{id}/*': {},
      '*': {},
      '/b/{id}/{world}': {},
      '/': {},
      '/b/{id}/*': {},
      '/b/{id}': {},
      '/b/*': {},
    }

    const order = Object.keys(routes).sort(routeOrder({order: 'asc'}))
    assert.deepEqual(order, [
      '/a',
      '/a/{id}',
      '/a/*',
      '/a/{id}/{world}',
      '/a/{id}/*',
      '/b',
      '/b/{id}',
      '/b/*',
      '/b/{id}/{world}',
      '/b/{id}/*',
      '/',
      '*',
    ])
  })

  // TODO
  it.skip('should sort the routes for free variables desc', () => {
    let routes = {
      '/a': {},
      '/a/{id}': {},
      '/a/*': {},
      '/b': {},
      '/a/{id}/{world}': {},
      '/a/{id}/*': {},
      '*': {},
      '/b/{id}/{world}': {},
      '/': {},
      '/b/{id}/*': {},
      '/b/{id}': {},
      '/b/*': {},
    }

    const order = Object.keys(routes).sort(routeOrder({order: 'desc'}))
    console.log('BROKE', order)
    assert.deepEqual(order, [
      '*',
      '/',
      '/b/{id}/*',
      '/b/{id}/{world}',
      '/b/*',
      '/b/{id}',
      '/b',
      '/a/{id}/*',
      '/a/{id}/{world}',
      '/a/*',
      '/a/{id}',
      '/a'
    ])
  })

  describe('# tough cases', () => {
    it.skip('should sort the routes for free variables asc', () => {
      let routes = {
        '/a': {},
        '/a/mars': {},
        '/a/earth': {},
        '/a/:world': {},
        '/b/:world': {},
        '/b/mars': {},
        '/b/earth': {},
        '/b': {}
      }

      routes = sort(routes, 'asc')
      assert(routes)
      const order = [
        '/a',
        '/a/earth',
        '/a/mars',
        '/a/:world',
        '/b',
        '/b/mars',
        '/b/earth',
        '/b/:world'
      ]

      let index = 0
      // console.log('BROKE', routes)
      routes.forEach((value, key) => {
        // console.log('BROKE here', key)
        assert.equal(key, order[index])
        index++
      })
    })
  })
})
