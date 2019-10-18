import { FabrixApp } from '@fabrix/fabrix'
import { FabrixController, FabrixGeneric } from '@fabrix/fabrix/dist/common'
import { FabrixPolicy } from '@fabrix/fabrix/dist/common'
import { ConfigValueError } from '@fabrix/fabrix/dist/errors'
import { get, omit, isString } from 'lodash'
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
   *
   */
  stringToArray(strOrArray): string[] {
    return isString(strOrArray) ? [ strOrArray ] : strOrArray
  },

  /**
   * If a route has nested methods that have a separate prefix, then it needs to be split into
   * multiple routes
   */
  splitRoute(app: FabrixApp, path: string, rawRoute: IRoute): {path: string, route: any}[] {
    const methods = ['*', ...Utils.methods]
    // Map for the Route Methods
    const routeMethods = new Set()
    // Map for the used prefixes (they need to be unique)
    const usedPrefixes = new Set()
    // Map for the used scopes (they need to be unique)
    const usedScopes = new Set()

    // Scenario 1: A wild card has a an object config different then the top level config = method prefix
    // Scenario 2: Prefix is set on the top level config and not on any methods = all have same prefix
    // Scenario 3: An Identical Prefix is set on the methods and not on the parent = all have same prefix
    // Scenario 4: A method has a different prefix then top level config = generate 2+ routes
    // Scenario 5: There is only one method and it's prefix is different then the top level = method prefix
    // Scenario 6: There route method is versioned, in which case it should use the version's prefix before going to defaults
    // Scenario 7: There route wildcard is versioned, in which case it should use the version's prefix before going to defaults
    const cases = new Set()

    // Clone of the original route
    const orgRoute = Object.assign({ }, rawRoute)
    // If there is a root level prefix, then set it eg /example: { config: { prefix: '/test' }}
    const parentPrefix = get(orgRoute, 'config.prefix')
    // If there is a root level auth scope, then set it eg /example: { config: { scope: 'private' }}
    const parentScope = get(orgRoute, 'config.scope')
    // const versionPrefixes = (get(orgRoute, 'versions') || [])
    //   .map(v =>)

    // The route must have a config to be set
    orgRoute.config = orgRoute.config || (orgRoute.config = { })
    orgRoute.config.pre = orgRoute.config.pre || (orgRoute.config.pre = [ ])

    // Add a prefix if given
    if (typeof parentPrefix !== 'undefined') {
      usedPrefixes.add(parentPrefix)
    }
    // Add a scope if given
    if (typeof parentScope !== 'undefined') {
      usedScopes.add(parentScope)
    }

    // Cycle through All the available methods
    methods.forEach(method => {
      // The route has the method
      if (orgRoute.hasOwnProperty(method)) {
        const methodVersions = new Map(Object.entries(get(rawRoute[method], 'versions') || {}))

        const methodPrefix = get(rawRoute[method], 'config.prefix')
        routeMethods.add({[method]: methodPrefix})

        const methodScope = get(rawRoute[method], 'config.scope')

        // Add a prefix if given
        if (typeof methodPrefix !== 'undefined') {
          usedPrefixes.add(methodPrefix)
        }
        // Add a scope if given
        if (typeof methodScope !== 'undefined') {
          usedScopes.add(methodScope)
        }

        if (method === '*' && methodVersions.size > 0) {
          cases.add(7)
        }

        // Scenario 1
        if (method === '*' && methodPrefix) {
          cases.add(1)
        }
        // Scenario 4
        if (
          typeof parentPrefix === 'undefined'
          && methodPrefix
          && usedPrefixes.size > 1
        ) {
          cases.add(4)
        }
      }
    })

    // Scenario 2
    if (
      typeof parentPrefix !== 'undefined'
      && usedPrefixes.size === 1
    ) {
      cases.add(2)
    }

    // Scenario 3
    if (
      typeof parentPrefix === 'undefined'
      && usedPrefixes.size === 1
    ) {
      cases.add(3)
    }

    // Scenario 5
    if (
      typeof parentPrefix !== 'undefined'
      && routeMethods.size === 1
      && usedPrefixes.size > 1
    ) {
      cases.add(5)
    }

    // Map the scenarios cases
    const scenarios = {
      '1': cases.has(1),
      '2': cases.has(2),
      '3': cases.has(3),
      '4': cases.has(4),
      '5': cases.has(5),
      '6': cases.has(6),
      '7': cases.has(7),
    }

    const type = Object.keys(scenarios).find((key) => scenarios[key])

    switch (type) {
      case '1': {
        orgRoute.config.prefix = orgRoute['*'].config.prefix
        return Utils.buildRoute(app, path, orgRoute)
      }
      case '2': {
        return Utils.buildRoute(app, path, orgRoute)
      }
      case '3': {
        orgRoute.config.prefix = usedPrefixes.values().next().value
        return Utils.buildRoute(app, path, orgRoute)
      }
      case '4': {
        const routes = new Set()
        const newRoutes = new Map()
        routeMethods.forEach(route => {
          const method: string = Object.keys(route)[0]
          const prefix: any = route[method]
          if (prefix !== parentPrefix) {
            const newRoute: IRoute = {
              [method]: orgRoute[method],
              config: {
                prefix: prefix
              }
            }
            if (newRoutes.has(prefix)) {
              newRoutes.set(prefix, {...newRoute,  ...newRoutes.get(prefix)})
            }
            else {
              newRoutes.set(prefix, newRoute)
            }
            delete orgRoute[method]
          }
        })
        newRoutes.forEach(newRoute => {
          routes.add(Utils.buildRoute(app, path, newRoute))
        })
        routes.add(Utils.buildRoute(app, path, orgRoute))
        return Array.from(routes).reduce((a, b) => a.concat(b), [])
      }
      case '5': {
        orgRoute.config.prefix = Array.from(usedPrefixes).pop()
        return Utils.buildRoute(app, path, orgRoute)
      }
      default: {
        return Utils.buildRoute(app, path, orgRoute)
      }
    }
  },

  /**
   * Build a complete route, with bound handler and attached preconditions
   */
  buildRoute(app: FabrixApp, path: string, rawRoute: IRoute): {path: string, route: any}[] {
    const orgRoute = Object.assign({ }, rawRoute)
    orgRoute.config = orgRoute.config || (orgRoute.config = { })
    orgRoute.config.pre = orgRoute.config.pre || (orgRoute.config.pre = [ ])

    if (app.config.get('router.debug')) {
      orgRoute._orgPath = path
    }

    path = Utils.getPathFromRoute(app, path, orgRoute)

    if (app.config.get('router.debug')) {
      orgRoute._newPath = path
    }

    Utils.getHandlerFromString(app, orgRoute)

    orgRoute.config.pre = orgRoute.config.pre
      .map(pre => Utils.getPolicyFromPrerequisite(app, pre))
      .filter(handler => !!handler)

    const orgRouteHandlers = Object.keys(orgRoute)
      .filter(value => -1 !== Utils.methods.indexOf(value))

    if (!orgRouteHandlers.some(v => Utils.methods.indexOf(v) >= 0 || !!orgRoute[v])) {
      app.log.error('spool-router: route ', path, ' handler [', orgRouteHandlers.join(', '), ']',
        'does not correspond to any defined Controller handler')
      return []
    }

    orgRouteHandlers.forEach(method => {
      if (orgRoute[method]) {
        orgRoute[method].config = orgRoute[method].config || orgRoute.config
        orgRoute[method].config.pre = orgRoute[method].config.pre || orgRoute.config.pre
        orgRoute[method].config.pre = orgRoute[method].config.pre
          .map(pre => Utils.getPolicyFromPrerequisite(app, pre))
          // .map(pre => Utils.getPolicyFromPrerequisite(app, pre))
          .filter(handler => !!handler)
      }
    })

    const route = omit(orgRoute, 'config')

    return [{ path, route }]
  },

  /**
   * Expands the search for the prefix to the route or config.* level
   */
  getRouteLevelPrefix(app: FabrixApp, route): string | null {
    const configuredPrefix = app.config.get(route.config.prefix)
    const routePrefix = get(route, 'config.prefix')

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
      throw new ConfigValueError('Expected a route object')
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
  getPathFromRoute (app: FabrixApp, path, route): string {
    if (!route || !(route instanceof Object)) {
      throw new ConfigValueError('Expected a route object')
    }

    path = path.replace(/^\//, '')
    const prefix = Utils.getPrefix(app, route)

    return `${ prefix }/${ path }`
  },

  getPolicyFromString(app: FabrixApp, handler): FabrixGeneric | FabrixPolicy {
    return get(app.policies, handler)
  },

  /**
   * Get a Controller's method's policies
   */
  getControllerPolicy(app: FabrixApp, handler, routeMethod, pre = [ ]): FabrixPolicy[] {
    const controller = Utils.getControllerFromHandler(handler)
    const method = Utils.getControllerMethodFromHandler(handler)

    if (app.config.get('policies.*.*')) {
      // console.log(handler, routeMethod,
      //   'policies.*.*',
      //   app.config.get('policies.*.*')
      // )
      pre = [...new Set([...pre, ...Utils.stringToArray(app.config.get('policies.*.*'))])]
    }
    if (app.config.get(`policies.*.${routeMethod}`)) {
      // console.log(handler, routeMethod,
      //   `policies.*.${routeMethod}`,
      //   app.config.get(`policies.*.${routeMethod}`)
      // )
      pre = [...new Set([...pre, ...Utils.stringToArray(app.config.get(`policies.*.${routeMethod}`))])]
    }
    if (controller && app.config.get(`policies.${controller}.*.*`)) {
      // console.log(handler, routeMethod,
      //   `policies.${controller}.*.*`,
      //   app.config.get(`policies.${controller}.*.*`)
      // )
      pre = [...new Set([...pre, ...Utils.stringToArray(app.config.get(`policies.${controller}.*.*`))])]
    }
    if (controller && app.config.get(`policies.${controller}.*.${routeMethod}`)) {
      // console.log(handler, routeMethod,
      //   `policies.${controller}.*.${routeMethod}`,
      //   app.config.get(`policies.${controller}.*.${routeMethod}`)
      // )
      pre = [...new Set([...pre, ...Utils.stringToArray(app.config.get(`policies.${controller}.*.${routeMethod}`))])]
    }
    if (controller && method && app.config.get(`policies.${controller}.${method}.*`)) {
      // console.log(handler, routeMethod
      //   `policies.${controller}.${method}.*`,
      //   app.config.get(`policies.${controller}.${method}.*`)
      // )
      pre = [...new Set([...pre, ...Utils.stringToArray(app.config.get(`policies.${controller}.${method}.*`))])]
    }
    if (controller && method && app.config.get(`policies.${controller}.${method}.${routeMethod}`)) {
      // console.log(handler,
      //   `policies.${controller}.${method}.${routeMethod}`,
      //   app.config.get(`policies.${controller}.${method}.${routeMethod}`)
      // )
      pre = [...new Set([...pre, ...Utils.stringToArray(app.config.get(`policies.${controller}.${method}.${routeMethod}`))])]
    }
    return pre
  },

  /**
   * Get handler method from a "hapi/hapi-like" prerequisite object/string
   */
  getPolicyFromPrerequisite (app: FabrixApp, pre) {
    let handler
    if (pre && typeof pre === 'string') {
      handler = Utils.getPolicyFromString(app, pre)
    }
    else if (pre && Array.isArray(pre)) {
      handler = pre
        .map(p => Utils.getPolicyFromString(app, p))
        .filter(p => p)
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

  /**
   *
   */
  getControllerFromString(app: FabrixApp, handler): FabrixGeneric | FabrixController {
    return get(app.controllers, handler)
  },

  /**
   *
   */
  getControllerFromHandler(handler): string {
    return isString(handler) ? handler.split('.')[0] : handler
  },

  getControllerMethodFromHandler(handler): string {
    return isString(handler) ? handler.split('.')[1] : handler
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
        // Clean copy of config
        const config = Object.assign({}, route.config)
        // Clean copy of config.pre
        config.pre = (route.config.pre || []).slice()
        // Get Policies
        config.pre = Utils.getControllerPolicy(app, null, method, config.pre)

        if (typeof route[method] === 'string') {
          const handler = route[method]
          route[method] = {
            handler: Utils.getControllerFromString(app, handler),
            config: config
          }
          route[method].config.pre = Utils.getControllerPolicy(app, handler, method, route[method].config.pre)
          return route[method]
        }
        else if (route[method] instanceof Object && route[method].hasOwnProperty('handler')) {
          route[method].config = route[method].config || config
          route[method].config.pre = route[method].config.pre || config.pre
          route[method].config.pre = Utils.getControllerPolicy(app, route[method].handler, method, route[method].config.pre)
          if (typeof route[method].handler === 'string') {

            return route[method] = {
              ...route[method],
              handler: Utils.getControllerFromString(app, route[method].handler),
            }
          }
          else {
            // route.config.pre = Utils.getControllerPolicy(app, route[method].handler, method, config.pre)
            return route[method] = {
              ...route[method],
              handler: route[method].handler
            }
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
  buildRoutes(app: FabrixApp, routes, toReturn = {}): Map<any, any> {
    Object.keys(routes).forEach(p => {
      Utils.splitRoute(app, p, routes[p]).forEach(({ path, route }) => {
        toReturn[path] = route
      })
    })
    return Utils.sortRoutes(
      toReturn,
      app.config.get('router.sortOrder'),
      app.config.get('router.default'),
      app.config.get('router.catchAllRoute')
    )
  },

  /**
   * Sort a route collection by object key
   */
  sortRoutes(routes, order, defaultRoute, catchAllRoute): Map<any, any> {
    const toReturn = new Map
    const sorted = Object.keys(routes).sort(Utils.createSpecificityComparator({
      order: order,
      default: defaultRoute,
      catchAllRoute: catchAllRoute
    }))
    sorted.forEach((r, i) => {
      toReturn.set(r, routes[r])
    })
    return toReturn
  },
  /**
   * Sorts routes based free variables.
   */
  createSpecificityComparator: function (options: {[key: string]: any} = {}) {
    // Bit misleading: here we mean that the default (or home) route is '' if not defined
    const defaultRoute = options.default || ''
    const defaultRegex = new RegExp('^\\' + defaultRoute + '$', 'g')
    // This is a wildcard catch all route in Express
    const catchAllRoute = options.catchAllRoute || '*'

    // Ascending order flag, defaults to false
    let asc = false

    if (options.order && options.order === 'asc') {
      asc = true
    }

    return function specificityComparator(routeA, routeB) {
      routeA = (routeA || '').toLowerCase()
      routeB = (routeB || '').toLowerCase()
      // If it's the default route, push it all the way
      // over to one of the ends
      if (routeB === catchAllRoute) {
        return asc ? -1 : 1
      }
      else if (
        routeA === defaultRoute
        || routeA === catchAllRoute
      ) {
        // console.log('yep a', routeA === defaultRoute, routeA === catchAllRoute)
        return asc ? 1 : -1
      }
      // Also push index route down to end, but not past the default
      else if (
        routeB === defaultRoute
        || routeB === catchAllRoute
      ) {
        // console.log('yep b', routeB === defaultRoute, routeB === catchAllRoute)
        return asc ? -1 : 1
      }
      // Also push index route down to end, but not past the default
      else if (
        (/^\/$/.test(routeA) || defaultRegex.test(routeA))
        && (
          routeB !== defaultRoute
          && routeB !== catchAllRoute
        )
      ) {
        // console.log('yep c', routeB !== defaultRoute, routeB !== catchAllRoute, routeB)
        return asc ? 1 : -1
      }
      // Otherwise, sort based on either depth or free variable priority
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
  freeVariableWeight: function (slice: string) {
    const colMatches = slice.match(/(:|\{)/gm)
    const optionalMatches = slice.match(/(\?\})/gm)
    const col = colMatches ? colMatches.length : 0
    const optional = optionalMatches ? optionalMatches.length : 0
    return col - optional
  },

  /**
   *
   * @param sliced
   */
  optionalParts: function (sliced: string[]) {
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

