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
[ci-image]: https://img.shields.io/circleci/project/github/fabrix-app/spool-router/nmaster.svg
[ci-url]: https://circleci.com/gh/fabrix-app/spool-router/tree/master
[daviddm-image]: http://img.shields.io/david/fabrix-app/spool-router.svg?style=flat-square
[daviddm-url]: https://david-dm.org/fabrix-app/spool-router
[gitter-image]: http://img.shields.io/badge/+%20GITTER-JOIN%20CHAT%20%E2%86%92-1DCE73.svg?style=flat-square
[gitter-url]: https://gitter.im/fabrix-app/fabrix
[twitter-image]: https://img.shields.io/twitter/follow/FabrixApp.svg?style=social
[twitter-url]: https://twitter.com/FabrixApp
[coverage-image]: https://img.shields.io/codeclimate/coverage/github/fabrix-app/spool-router.svg?style=flat-square
[coverage-url]: https://codeclimate.com/github/fabrix-app/spool-router/coverage
