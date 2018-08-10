# spool-router


[![Gitter][gitter-image]][gitter-url]
[![NPM version][npm-image]][npm-url]
[![Build Status][ci-image]][ci-url]
[![Test Coverage][coverage-image]][coverage-url]
[![Dependency Status][daviddm-image]][daviddm-url]
[![Follow @FabrixApp on Twitter][twitter-image]][twitter-url]

Spool Router. Aggregates all routes from `config.routes` to create [hapi.js route objects](http://hapijs.com/api#route-configuration).

## Install
```sh
$ npm install @fabrix/spool-router --save
```

## Usage
Load from your spool config. (This pack is included by default).

```js
// config/main.ts
import { RouterSpool } from '@fabrix/spool-router'
export const main = {
  // ...
  spools: [
    RouterSpool
  ]
}
```

## Configure

#### `config.router`
The Router takes a few Configuration values
```js
// config/router.ts
export const router = {
  sortOrder: 'asc', // (asc | desc)
  prefix: '/api/v1'
}
```
##### router.sortOrder
This will sort the routes based on the key (path) either ascending or descending. This is used in spools like Express where the order of routes matters.

##### router.prefix
This config is optional and can be left as `''` or `null`.  This will prefix each route with the specified prefix.

#### `config.routes`
The list of route objects to be compiled for use by the webserver.

```js
// config/routes.ts
const routes = {
  '/example/test': {
    'GET': 'ExampleController.test'
  }
}
```

During initialization, for the above example, a route object will be compiled
that takes the following form:

```js
{
  // ...
  '/example/test': {
    'GET': {
      handler: 'ExampleController.test',
      config: {
        pre: [ ]
      }
    }
  }
  // ...
}
```

You can also refine this by explicitly defining the handler and config:

```js
{
  // ...
  '/example/test': {
    'GET': {
      handler: 'ExampleController.get',
      config: {
        pre: [ 'ExamplePolicy.get' ]
      }
    },
    'POST': {
      handler: 'ExampleController.post',
      config: {
        pre: [ 'ExamplePolicy.post' ]
      }
    }
  }
  // ...
}
```
Which is useful for refining controller over different http methods on a route.

##### Prefixes
```js
{
  // ...
  '/example/test': {
    'GET': 'ExampleController.test',
    config: {
      prefix: '/api/v2'
    }
  }
  // ...
}
```
The Configuration above, will give this route a prefix of `/api/v2` instead of using the `config.prefix` that was specified 

Optionally:

```js
{
  // ...
  '/example/test': {
    'GET': 'ExampleController.test',
    config: {
      prefix: false
    }
  }
  // ...
}
```
The Configuration above, will ignore any prefix given to it. 

Optionally:

```js
{
  // ...
  '/example/test': {
    'GET': 'ExampleController.test',
    config: {
      prefix: 'customPrefixer.prefix'
    }
  }
  // ...
}
```
The configuration above will take the configuration of another config attribute, in this case: `app.config.customPrefixer.prefix` is set to `/custom/endpoint` so the resulting route prefix will be `/custom/endpoint/example/test`

Finally, you can also provide 2 different prefixes for the same route with different methods.

```js
{
  // ...
  '/example/test': {
    'GET': {
      handler: 'ExampleController.get',
      config: {
        prefix: '/api/v1'
        pre: [ 'ExamplePolicy.get' ]
      }
    },
    'POST': {
      handler: 'ExampleController.post',
      config: {
        prefix: '/api/v2'
        pre: [ 'ExamplePolicy.post' ]
      }
    }
  }
  // ...
}
```

The configuration above will produce 2 routes, one for `GET /api/v1/example/test` and one for `POST /api/v2/example/test` respecting their prefixes. This is useful for when one method may still be on an older API than the other or they need to be handled differently.

## Tapestries and Policies

Support for tapestries and Policies is provided by [spool-tapestries](https://github.com/fabrix-app/spool-tapestries).

## Compatible Spools
- [spool-express](https://github.com/fabrix-app/spool-express)
- [spool-hapi](https://github.com/fabrix-app/spool-hapi) (TODO)
- [spool-koa](https://github.com/fabrix-app/spool-koa) (TODO)

## Contributing
We love contributions! Please see our [Contribution Guide](https://github.com/fabrix-app/fabrix/blob/master/CONTRIBUTING.md)
for more information.

## License
[MIT](https://github.com/fabrix-app/spool-router/blob/master/LICENSE)

[npm-image]: https://img.shields.io/npm/v/spool-router.svg?style=flat-square
[npm-url]: https://npmjs.org/package/spool-router
[ci-image]: https://img.shields.io/circleci/project/github/fabrix-app/spool-router/master.svg
[ci-url]: https://circleci.com/gh/fabrix-app/spool-router/tree/master
[daviddm-image]: http://img.shields.io/david/fabrix-app/spool-router.svg?style=flat-square
[daviddm-url]: https://david-dm.org/fabrix-app/spool-router
[gitter-image]: http://img.shields.io/badge/+%20GITTER-JOIN%20CHAT%20%E2%86%92-1DCE73.svg?style=flat-square
[gitter-url]: https://gitter.im/fabrix-app/fabrix
[twitter-image]: https://img.shields.io/twitter/follow/FabrixApp.svg?style=social
[twitter-url]: https://twitter.com/FabrixApp
[coverage-image]: https://img.shields.io/codeclimate/coverage/github/fabrix-app/spool-router.svg?style=flat-square
[coverage-url]: https://codeclimate.com/github/fabrix-app/spool-router/coverage
