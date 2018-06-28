import * as joi from 'joi'

export const routerSchema = joi.object().keys({
  sortOrder: joi.string().allow('asc', 'desc')
})
