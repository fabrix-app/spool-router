import joi from 'joi'

export const routerSchema = joi.object().keys({
  sortOrder: joi.string().allow('asc', 'desc').required(),
  default: joi.string().allow('', null).required(),
  catchAllRoute: joi.string().allow('', null).required(),
  prefix: joi.string().allow('', null).required(),
  debug: joi.any()
})
