import joi from 'joi'
export const handler = joi.alternatives().try(
  joi.func(),
  joi.string(),
  joi.object()
)

export const route = {
  vhost: joi.string(),
  cache: joi.object().keys({
    privacy: joi.string(),
    expiresIn: joi.any(),
    expiresAt: joi.any(),
    statuses: joi.array()
  }),
  handler: handler,
  file: joi.object().keys({
    relativeTo: joi.string(),
    path: joi.string(),
  }),
  directory: joi.object().keys({
    relativeTo: joi.string(),
    path: joi.string(),
  }),
  versions: joi.object(),
  config: joi.object().keys({
    prefix: joi.alternatives().try(
      joi.boolean(),
      joi.string(),
      joi.object().keys({}).unknown()
    ),
    scope: joi.string(),
    app: joi.object(),
    description: joi.string(),
    notes: joi.string(),
    tags: [joi.string(), joi.array()],
    handler: handler,
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
}
export const routeSchema = joi.object().keys({
  // method: joi.alternatives().try(
  //   joi.string(),
  //   joi.array()
  // ),
  // path: joi.string().required(),
  '*': joi.alternatives().try(
    joi.func(),
    joi.string(),
    joi.object().keys(route)
  ),
  GET: joi.alternatives().try(
    joi.func(),
    joi.string(),
    joi.object().keys(route)
  ),
  HEAD: joi.alternatives().try(
    joi.func(),
    joi.string(),
    joi.object().keys(route)
  ),
  POST: joi.alternatives().try(
    joi.func(),
    joi.string(),
    joi.object().keys(route)
  ),
  PUT: joi.alternatives().try(
    joi.func(),
    joi.string(),
    joi.object().keys(route)
  ),
  DELETE: joi.alternatives().try(
    joi.func(),
    joi.string(),
    joi.object().keys(route)
  ),
  CONNECT: joi.alternatives().try(
    joi.func(),
    joi.string(),
    joi.object().keys(route)
  ),
  OPTIONS: joi.alternatives().try(
    joi.func(),
    joi.string(),
    joi.object().keys(route)
  ),
  TRACE: joi.alternatives().try(
    joi.func(),
    joi.string(),
    joi.object().keys(route)
  ),
  PATCH: joi.alternatives().try(
    joi.func(),
    joi.string(),
    joi.object().keys(route)
  ),
  ...route
}).or('*', 'GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE', 'PATCH')
