# spool-router

[![Gitter][gitter-image]][gitter-url]
[![NPM version][npm-image]][npm-url]
[![Build status][ci-image]][ci-url]
[![Dependency Status][daviddm-image]][daviddm-url]
[![Code Climate][codeclimate-image]][codeclimate-url]
[![Follow @fabrix-app on Twitter][twitter-image]][twitter-url]

Spool Router. Aggregates all routes from `config.routes` to create [hapi.js route objects](http://hapijs.com/api#route-configuration).

## Usage
Load from your spool config. (This pack is included by default).

```js
// config/main.js
module.exports = {
  // ...
  spools: [
    require('spool-router').Router
  ]
}
```

## Configure

#### `config.routes`
The list of route objects to be compiled for use by the webserver.

```js
// config/routes.js
module.exports = [
  {
    method: [ 'GET' ],
    path: '/example/test',
    handler: 'ExampleController.test'
  }
]
```

During initialization, for the above example, a route object will be compiled
that takes the following form:

```js
  {
    method: [ 'GET' ],
    path: '/example/test',
    handler: 'ExampleController.test',
    config: {
      pre: [ 'ExamplePolicy.test' ]
    }
  }
```

## tapestries and Policies

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
[ci-image]: https://img.shields.io/travis/fabrix-app/spool-router/master.svg?style=flat-square
[ci-url]: https://travis-ci.org/fabrix-app/spool-router
[daviddm-image]: http://img.shields.io/david/fabrix-app/spool-router.svg?style=flat-square
[daviddm-url]: https://david-dm.org/fabrix-app/spool-router
[codeclimate-image]: https://img.shields.io/codeclimate/github/fabrix-app/spool-router.svg?style=flat-square
[codeclimate-url]: https://codeclimate.com/github/fabrix-app/spool-router
[gitter-image]: http://img.shields.io/badge/+%20GITTER-JOIN%20CHAT%20%E2%86%92-1DCE73.svg?style=flat-square
[gitter-url]: https://gitter.im/fabrix-app/fabrix
[twitter-image]: https://img.shields.io/twitter/follow/fabrix-app.svg?style=social
[twitter-url]: https://twitter.com/fabrix-app
