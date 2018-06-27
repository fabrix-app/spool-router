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

  /**
   * Get handler method from a hapi prerequisite object/string
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
  }
}

