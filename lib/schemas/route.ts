import * as joi from 'joi'

export const routeSchema = joi.object().keys({
  // method: joi.alternatives().try(
  //   joi.string(),
  //   joi.array()
  // ),
  // path: joi.string().required(),
  '*': joi.alternatives().try(
    joi.func(),
    joi.string(),
    joi.object()
  ),
  GET: joi.alternatives().try(
    joi.func(),
    joi.string(),
    joi.object()
  ),
  HEAD: joi.alternatives().try(
    joi.func(),
    joi.string(),
    joi.object()
  ),
  POST: joi.alternatives().try(
    joi.func(),
    joi.string(),
    joi.object()
  ),
  PUT: joi.alternatives().try(
    joi.func(),
    joi.string(),
    joi.object()
  ),
  DELETE: joi.alternatives().try(
    joi.func(),
    joi.string(),
    joi.object()
  ),
  CONNECT: joi.alternatives().try(
    joi.func(),
    joi.string(),
    joi.object()
  ),
  OPTIONS: joi.alternatives().try(
    joi.func(),
    joi.string(),
    joi.object()
  ),
  TRACE: joi.alternatives().try(
    joi.func(),
    joi.string(),
    joi.object()
  ),
  PATCH: joi.alternatives().try(
    joi.func(),
    joi.string(),
    joi.object()
  ),
  vhost: joi.string(),
  cache: joi.object().keys({
    privacy: joi.string(),
    expiresIn: joi.any(),
    expiresAt: joi.any(),
    statuses: joi.array()
  }),
  config: joi.object().keys({
    prefix: joi.alternatives().try(
      joi.boolean(),
      joi.string(),
      joi.object().keys({

      })
    ),
    app: joi.object(),
    description: joi.string(),
    notes: joi.string(),
    tags: [joi.string(), joi.array()],
    handler: joi.alternatives().try(
      joi.func(),
      joi.string(),
      joi.object()
    ),
    cors: joi.alternatives().try(
      joi.boolean(),
      joi.object().keys({
        origin: joi.array(),
        maxAge: joi.number(),
        headers: joi.array(),
        additionalHeaders: joi.array(),
        exposedHeaders: joi.array(),
        additionalExposedHeaders: joi.array(),
        credentials: joi.boolean()
      })
    ),
    ext: joi.object(),
    files: joi.object().keys({
      relativeTo: joi.string()
    }),
    id: joi.string(),
    isInternal: joi.boolean(),
    json: joi.object(),
    jsonp: joi.any(),
    payload: joi.any(),
    plugins: joi.object(),
    pre: joi.array(),
    security: joi.object(),
    state: joi.object(),
    validate: joi.object(),
    timeout: joi.object(),

    response: joi.object(),
    auth: joi.alternatives().try(
      joi.boolean(),
      joi.string(),
      joi.object().keys({
        mode: joi.string(),
        strategies: joi.array(),
        payload: joi.any(),
        scope: joi.alternatives().try(
          joi.string(),
          joi.array()
        ),
        entity: joi.string()
      })
    ),
    bind: joi.object()
  })
}).or('*', 'GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE', 'PATCH')
