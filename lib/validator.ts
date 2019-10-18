import joi from 'joi'
import { Utils } from './utils'

import { policySchema } from './schemas/policy'
import { routeSchema } from './schemas/route'
import { routerSchema } from './schemas/router'


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
   * Validate the structure of an individual route
   */
  validatePolicy (policy) {
    return new Promise((resolve, reject) => {
      joi.validate(policy, policySchema, (err, value) => {
        if (err) {
          return reject(err)
        }

        return resolve(value)
      })
    })
  },

  /**
   * Validate the structure of router
   */
  validateRouter (router) {
    return new Promise((resolve, reject) => {
      joi.validate(router, routerSchema, (err, value) => {
        if (err) {
          return reject(err)
        }

        return resolve(value)
      })
    })
  },

  // LEGACY
  // /**
  //  * Validate a route list
  //  */
  // validateRouteList (routeList) {
  //   return Utils.findRouteConflicts(routeList)
  // }

}
