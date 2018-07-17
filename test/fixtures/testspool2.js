const Spool = require('@fabrix/fabrix/dist/common').Spool

module.exports = class Testspool2 extends Spool {
  constructor (app) {
    super(app, {
      pkg: {
        name: 'spool-test-2'
      },
      config: {
        routes: [{
          method: 'GET',
          path: '/test/foo2',
          handler: 'TestController.foo'
        }]
      },
      api: {}
    })
  }
}
