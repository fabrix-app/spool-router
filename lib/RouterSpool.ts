import { SystemSpool } from '@fabrix/fabrix/dist/common/spools/system'
import { Utils } from './utils'
import { Validator } from './validator'


import { isObject } from 'lodash'
import * as config from './config/index'
import * as pkg from '../package.json'

/**
 * spool-router
 *
 * Unify all route handlers into a single, standard route object format. Route
 * objects are structured as Hapi.js routes.
 *
 * @see http://hapijs.com/api#route-configuration
 * @see https://github.com/fabrix-app/spool-express
 * @see https://github.com/fabrix-app/spool-hapi
 */
export class RouterSpool extends SystemSpool {
  private _routes = {}

  constructor (app) {
    super(app, {
      config: config,
      pkg: pkg,
      api: { },
    })

    this.extensions = {
      routes : {
        get: () => {
          return this.routes
        },
        set: (newRoutes) => {
          // throw new Error('routes can not be set through FabrixApp, check spool-router instead')
          this._routes = newRoutes
        },
        enumerable: true,
        configurable: true
      }
    }

    return this
  }

  async validate () {
    if (!this.app.config.get('router')) {
      this.app.log.warn('Missing config.router, a default empty configuration will be used')
    }
    if (!this.app.config.get('routes')) {
      this.app.log.warn('Missing config.routes, a default empty Array will be used')
    }
    return Promise.all([
      Validator.validateRouter(this.app.config.get('router')),
      Promise.all(
        Object.values(this.app.config.get('routes') || {}).map(Validator.validateRoute)
      )
    ])
  }


  /**
   * Get's the routes from spool-router
   */
  get routes(): {[key: string]: any} {
    return this._routes
  }

  /**
   * Compile route configuration and store in app.routes. Spools that wish
   * to extend/add new routes should do so either in their configure() lifecycle
   * method, or by creating a config.routes list -- this list will be
   * automatically merged into the application's config.routes list.
   */
  async initialize () {
    const routes =  this.app.config.get('routes') || {}
    this._routes = Utils.buildRoutes(this.app, routes)
  }

  sanity () {
    if (!isObject(this.app.routes)) {
      throw new Error('Sanity Failed: app.routes is not an array!')
    }
  }
}
