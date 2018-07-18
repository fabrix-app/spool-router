import { FabrixApp } from '@fabrix/fabrix'
import { get } from 'lodash'
import { Router } from 'call'
import { IRoute } from './interfaces/IRoute'

export const Utils = {
  methods: [
    'GET',
    'HEAD',
    'POST',
    'PUT',
    'DELETE',
    'CONNECT',
    'OPTIONS',
    'TRACE',
    'PATCH'
  ],

  /**
   * Build a complete route, with bound handler and attached preconditions
   */
  buildRoute (app: FabrixApp, path: string, rawRoute: IRoute) {
    const route = Object.assign({ }, rawRoute)
    route.config = route.config || (route.config = { })
    route.config.pre = route.config.pre || (route.config.pre = [ ])

    path = Utils.getPathFromRoute(app, path, route)
    Utils.getHandlerFromString(app, route)

    route.config.pre = route.config.pre
      .map(pre => Utils.getHandlerFromPrerequisite(app, pre))
      .filter(handler => !!handler)

    const routeHandlers = Object.keys(route).filter(value => -1 !== Utils.methods.indexOf(value))

    if (!routeHandlers.some(v => Utils.methods.indexOf(v) >= 0 || !!route[v])) {
      app.log.error('spool-router: route ', path, ' handler [', routeHandlers.join(', '), ']',
        'does not correspond to any defined Controller handler')
      return {}
    }

    routeHandlers.forEach(method => {
      if (route[method]) {
        route[method].config = route[method].config || route.config
        route[method].config.pre = route[method].config.pre || route.config.pre
        route[method].config.pre = route[method].config.pre
          .map(pre => Utils.getHandlerFromPrerequisite(app, pre))
          .filter(handler => !!handler)
      }
    })

    return { path, route }
  },

  /**
   * Expands the search for the prefix to the route or config.* level
   */
  getRouteLevelPrefix(app: FabrixApp, route) {
    const configuredPrefix = app.config.get(route.config.prefix)
    const routePrefix = route.config.prefix
    if (typeof configuredPrefix !== 'undefined') {
      if (configuredPrefix) {
        return (configuredPrefix).replace(/$\//, '')
      }
      else {
        return
      }
    }
    else {
      return (routePrefix || '').replace(/$\//, '')
    }
  },

  /**
   * Get's the prefix for a path
   */
  getPrefix (app: FabrixApp, route): string {
    if (!route || !(route instanceof Object)) {
      throw new RangeError('Expected a route object')
    }

    const hasPrefix = route.config && route.config.hasOwnProperty('prefix') && route.config.prefix !== false
    const ignorePrefix = route.config && route.config.hasOwnProperty('prefix') && route.config.prefix === false
    const routeLevelPrefix = hasPrefix ? Utils.getRouteLevelPrefix(app, route) : null
    const prefix = (app.config.get('router.prefix') || '').replace(/$\//, '')

    return `${ ignorePrefix ? '' : routeLevelPrefix || prefix}`
  },

  /**
   * Build the Path from the Route config
   */
  getPathFromRoute (app: FabrixApp, path, route) {
    if (!route || !(route instanceof Object)) {
      throw new RangeError('Expected a route object')
    }

    path = path.replace(/^\//, '')
    const prefix = Utils.getPrefix(app, route)

    return `${ prefix }/${ path }`
  },

  getPolicyFromString(app: FabrixApp, handler) {
    return get(app.policies, handler)
  },

  /**
   * Get handler method from a "hapi/hapi-like" prerequisite object/string
   */
  getHandlerFromPrerequisite (app: FabrixApp, pre) {
    let handler
    if (pre && typeof pre === 'string') {
      handler = Utils.getPolicyFromString(app, pre)
    }
    else if (pre && typeof pre.method === 'string') {
      handler = Utils.getPolicyFromString(app, pre.method)
    }
    else if (pre && typeof pre === 'function') {
      handler = pre
    }

    if (!handler) {
      app.log.error('spool-router: route prerequisite [', pre, ']',
        'does not correspond to any defined Policy handler')
      return
    }

    return handler
  },

  getControllerFromString(app: FabrixApp, handler) {
    return get(app.controllers, handler)
  },

  /**
   * Get handler method from a controller.method string path
   */
  getHandlerFromString (app: FabrixApp, route) {
    if (route['*']) {
      Utils.methods.forEach(method => {
        if (!route[method]) {
          route[method] = route['*']
        }
      })
    }

    Utils.methods.forEach(method => {
      if (route[method]) {
        if (typeof route[method] === 'string') {
          return route[method] = { handler: Utils.getControllerFromString(app, route[method]) }
        }
        else if (route[method] instanceof Object && route[method].hasOwnProperty('handler')) {
          if (typeof route[method].handler === 'string') {
            return route[method].handler = Utils.getControllerFromString(app, route[method].handler)
          }
          else {
            return route[method].handler
          }
        }
        else {
          return route[method]
        }
      }
    })
  },

  /**
   * Build a route collection
   */
  buildRoutes(app: FabrixApp, routes, toReturn = {}) {
    Object.keys(routes).forEach(r => {
      const { path, route } = Utils.buildRoute(app, r, routes[r])
      toReturn[path] = route
    })
    return Utils.sortRoutes(toReturn, app.config.get('router.sortOrder'))
  },

  /**
   * Sort a route collection by object key
   */
  sortRoutes(routes, order) {
    const toReturn = {}
    const sorted = Object.keys(routes).sort(Utils.createSpecificityComparator({ order: order }))
    sorted.forEach((r, i) => {
      toReturn[r] = routes[r]
    })
    return toReturn
  },
  /**
   * Sorts routes based free variables.
   */
  createSpecificityComparator: function (options) {
    options = options || {}
    // Ascending order flag, defaults to false
    let asc = false
    if (options.order && options.order === 'asc') {
      asc = true
    }
    // Bit misleading: here we mean that the default route is ''
    const defaultRoute = options.default || ''
    // This is a wildcard catch all route in Express
    const catchAllRoute = options.catchAllRoute || '*'

    return function specificityComparator(routeA, routeB) {
      routeA = (routeA || '').toLowerCase()
      routeB = (routeB || '').toLowerCase()
      // If it's the default route, push it all the way
      // over to one of the ends
      if (
        routeA === defaultRoute
        || routeA === catchAllRoute
      ) {
        return asc ? 1 : -1
        // Also push index route down to end, but not past the default
      }
      else if (
        routeB === defaultRoute
        || routeB === catchAllRoute
      ) {
        return asc ? -1 : 1
        // Also push index route down to end, but not past the default
      }
      else if (/^\/$/.test(routeA) && (routeB !== defaultRoute && routeB !== catchAllRoute)) {
        return asc ? 1 : -1
        // Otherwise, sort based on either depth or free variable priority
      }
      else {
        const slicedA = routeA.split('/') // .normalize('/' + routeA + '/').split('/').join('/')
        const slicedB = routeB.split('/') // .normalize('/' + routeB + '/').split('/').join('/')
        const joinedA = slicedA.join('')
        const joinedB = slicedB.join('')
        const depthA = Utils.optionalParts(slicedA)
        const depthB = Utils.optionalParts(slicedB)

        // let status = 0
        // slicedA.forEach(slice, index => {
        //   if (slicedA[index] === slicedB[index]) {
        //
        //   }
        //   else{
        //
        //   }
        // })
        // return status
        // If the start is already alphabetical different
        if (slicedA[1] > slicedB[1]) {
          return asc ? 1 : -1
        }
        if (slicedA[1] < slicedB[1]) {
          return asc ? -1 : 1
        }
        // If the start is alphabetically the same
        if (slicedA[1] === slicedB[1]) {
          // If one has more url parts
          if (depthA > depthB) {
            return asc ? 1 : -1
          }
          if (depthA < depthB) {
            return asc ? -1 : 1
          }
          // They the have the same amount of url parts
          if (depthA === depthB) {
            const weightA = Utils.freeVariableWeight(joinedA)
            const weightB = Utils.freeVariableWeight(joinedB)

            if (weightA > weightB) {
              return asc ? -1 : 1
            }
            if (weightA < weightB) {
              return asc ? 1 : -1
            }
            // They have the same weighted score
            if (weightA === weightB) {
              if (joinedA > joinedB) {
                return asc ? 1 : -1
              }
              if (joinedA < joinedB) {
                return asc ? -1 : 1
              }
            }
          }
        }
      }
      return 0
    }
  },

  /**
   * Takes a sliced path and returns an integer representing the
   * "weight" of its free variables. More specific routes are heavier
   *
   * Intuitively: when a free variable is at the base of a path e.g.
   * '/:resource', this is more generic than '/resourceName/:id' and thus has
   * a lower weight
   *
   * Weight can only be used to compare paths of the same depth
   */
  freeVariableWeight: function (sliced) {
    const colMatches = sliced.match(/(:|\{)/gm)
    const optionalMatches = sliced.match(/(\?\})/gm)
    const col = colMatches ? colMatches.length : 0
    const optional = optionalMatches ? optionalMatches.length : 0
    return col - optional
  },

  optionalParts: function (sliced) {
    let count = 0
    sliced.forEach(slice => {
      if (!/\{.*\?\}$/.test(slice)) {
        count = count + 1
      }
      else {
        // count = count
      }
    })
    return count
  }
}

