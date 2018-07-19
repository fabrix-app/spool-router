import * as joi from 'joi'

export const routerSchema = joi.object().keys({
  sortOrder: joi.string().allow('asc', 'desc').required(),
  prefix: joi.string().allow('', null).required()
})
