import * as joi from 'joi'
import { Util } from './util'
import { routeSchema } from './schemas/route'

export const Validator = {

  /**
   * Validate the structure of an individual route
   */
  validateRoute (route) {
    return new Promise((resolve, reject) => {
      joi.validate(route, routeSchema, (err, value) => {
        if (err) {
          return reject(err)
        }

        return resolve(value)
      })
    })
  },

  /**
   * Validate a route list
   */
  validateRouteList (routeList) {
    return Util.findRouteConflicts(routeList)
  }

}
