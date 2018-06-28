'use strict'
/* global describe, it */
const assert = require('assert')
const routeOrder = require('../../../dist/utils').Utils.createSpecificityComparator

describe('Utils Route Sort Order', () => {
  it('should exist', () => {
    assert(routeOrder)
  })
  it('should sort the routes for free variables', () => {
    const routes = [
      {
        path: '/a',
      },
      {
        path: '/a/:id',
      },
      {
        path: '/a/*',
      },
      {
        path: '/b',
      },
      {
        path: '/a/:id/:world',
      },
      {
        path: '/a/:id/*',
      },
      {
        path: '*',
      },
      {
        path: '/b/:id/:world',
      },
      {
        path: '/',
      },
      {
        path: '/b/:id/*',
      },
      {
        path: '/b/:id',
      },
      {
        path: '/b/*',
      }
    ]

    routes.sort(routeOrder({order: 'asc'}))

    assert.deepEqual(routes, [
      {
        path: '/a',
      },
      {
        path: '/a/:id',
      },
      {
        path: '/a/*',
      },
      {
        path: '/a/:id/:world',
      },
      {
        path: '/a/:id/*',
      },
      {
        path: '/b',
      },
      {
        path: '/b/:id',
      },
      {
        path: '/b/*',
      },
      {
        path: '/b/:id/:world',
      },
      {
        path: '/b/:id/*',
      },
      {
        path: '/',
      },
      {
        path: '*',
      }
    ])
  })
})
