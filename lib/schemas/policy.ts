import joi from 'joi'

export const policySchema = joi.object().keys({
  '*': joi.alternatives().try(
    joi.func(),
    joi.string(),
    joi.object(),
    joi.array().items(joi.string())
  ),
  GET: joi.alternatives().try(
    joi.func(),
    joi.string(),
    joi.object(),
    joi.array().items(joi.string())
  ),
  HEAD: joi.alternatives().try(
    joi.func(),
    joi.string(),
    joi.object(),
    joi.array().items(joi.string())
  ),
  POST: joi.alternatives().try(
    joi.func(),
    joi.string(),
    joi.object(),
    joi.array().items(joi.string())
  ),
  PUT: joi.alternatives().try(
    joi.func(),
    joi.string(),
    joi.object(),
    joi.array().items(joi.string())
  ),
  DELETE: joi.alternatives().try(
    joi.func(),
    joi.string(),
    joi.object(),
    joi.array().items(joi.string())
  ),
  CONNECT: joi.alternatives().try(
    joi.func(),
    joi.string(),
    joi.object(),
    joi.array().items(joi.string())
  ),
  OPTIONS: joi.alternatives().try(
    joi.func(),
    joi.string(),
    joi.object(),
    joi.array().items(joi.string())
  ),
  TRACE: joi.alternatives().try(
    joi.func(),
    joi.string(),
    joi.object(),
    joi.array().items(joi.string())
  ),
  PATCH: joi.alternatives().try(
    joi.func(),
    joi.string(),
    joi.object(),
    joi.array().items(joi.string())
  )
}).unknown()
