import { FabrixApp } from '@fabrix/fabrix'
import { get } from 'lodash'
import { Router } from 'call'
import { IRoute } from './interfaces/IRoute'

export const Utils = {

  /**
   * Build a complete route, with bound handler and attached preconditions
   */
  buildRoute (app: FabrixApp, rawRoute: IRoute) {
    const route = Object.assign({ }, rawRoute)
    route.config = route.config || (route.config = { })
    route.config.pre = route.config.pre || (route.config.pre = [ ])

    route.handler = this.getHandlerFromString(app, rawRoute.handler)
    route.path = this.getPathFromRoute(app, route)

    route.config.pre = route.config.pre
      .map(pre => this.getHandlerFromPrerequisite(app, pre))
      .filter(handler => !!handler)

    if (!route.handler) {
      app.log.error('spool-router: route handler [', rawRoute.handler, ']',
        'does not correspond to any defined Controller handler')

      return
    }
    return route
  },

  getPrefix (app: FabrixApp, route): string {
    if (!route || !(route instanceof Object)) {
      throw new RangeError('Expected a route object')
    }

    const hasPrefix = route.config && route.config.hasOwnProperty('prefix') && route.config.prefix !== false
    const ignorePrefix = route.config && route.config.hasOwnProperty('prefix') && route.config.prefix === false
    const routeLevelPrefix = hasPrefix ? route.config.prefix.replace('$/', '') : null
    const prefix = (app.config.get('router.prefix') || '').replace(/$\//, '')

    return `${ ignorePrefix ? '' : routeLevelPrefix || prefix}`
  },
  /**
   * Build the Path from the Route config
   */
  getPathFromRoute (app: FabrixApp, route) {
    if (!route || !(route instanceof Object)) {
      throw new RangeError('Expected a route object')
    }
    const path = route.path.replace(/^\//, '')
    const prefix = Utils.getPrefix(app, route)

    return `${ prefix }/${ path }`
  },

  /**
   * Get handler method from a "hapi/hapi-like" prerequisite object/string
   */
  getHandlerFromPrerequisite (app: FabrixApp, pre) {
    let handler
    if (pre && typeof pre === 'string') {
      handler = get(app.policies, pre)
    }
    else if (pre && typeof pre.method === 'string') {
      handler = get(app.policies, pre.method)
    }

    if (!handler) {
      app.log.error('spool-router: route prerequisite [', pre, ']',
        'does not correspond to any defined Policy handler')

      return
    }

    return handler
  },

  /**
   * Get handler method from a controller.method string path
   */
  getHandlerFromString (app: FabrixApp, rawHandler) {
    if (typeof rawHandler === 'string') {
      return get(app.controllers, rawHandler)
    }
    else {
      return rawHandler
    }
  },

  /**
   * Return an error if the given route is not compatible with the router;
   * return null otherwise.
   */
  getRouteConflict (router: Set<any>, route) {
    let methods = [ route.method ]
    if (route.method === '*') {
      methods = [ 'GET', 'PUT', 'POST', 'DELETE', 'UPDATE' ]
    }
    if (Array.isArray(route.method)) {
      methods = route.method
    }

    return methods.map(method => {
      try {
        const r = Object.assign({ }, route)
        router.add(Object.assign(r, { method }))
        return null
      }
      catch (e) {
        return e
      }
    })
    .filter(err => !!err)
  },

  /**
   * Find conflicts within a particular route list which cannot be cleverly
   * reconciled by the program logic, and which require corrective action from
   * the developer.
   */
  findRouteConflicts (routeList = [ ]) {
    const router = new Router()
    const conflicts = routeList.map(route => {
      return {
        route: route,
        errors: this.getRouteConflict(router, route)
      }
    })
    return conflicts.filter(conflict => conflict.errors.length)
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
      routeA = (routeA.path || '').toLowerCase()
      routeB = (routeB.path || '').toLowerCase()
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
        const slicedA = routeA.split('/') // path.normalize('/' + routeA + '/').split('/').join('/')
        const slicedB = routeB.split('/') // path.normalize('/' + routeB + '/').split('/').join('/')
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

