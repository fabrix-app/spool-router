import { SystemSpool } from '@fabrix/fabrix/dist/common/spools/system'
import { Utils } from './utils'
import { Validator } from './validator'

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

  constructor (app) {
    super(app, {
      config: config,
      pkg: pkg,
      api: { },
    })
  }

  validate () {
    return Promise.all([
      Promise.all(this.app.config.get('routes').map(Validator.validateRoute)),
      Validator.validateRouteList(this.app.config.get('routes'))
    ])
  }

  /**
   * Compile route configuration and store in app.routes. Spools that wish
   * to extend/add new routes should do so either in their configure() lifecycle
   * method, or by creating a config.routes list -- this list will be
   * automatically merged into the application's config.routes list.
   */
  async initialize () {
    this.app.routes = (this.app.config.get('routes') || [])
      .map(route => Utils.buildRoute(this.app, route))
      .filter(route => !!route)
  }
}
