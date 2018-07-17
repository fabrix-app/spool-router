const Spool = require('@fabrix/fabrix/dist/common').Spool

module.exports = class Testspool1 extends Spool {
  constructor (app) {
    super(app, {
      pkg: {
        name: 'spool-test-1'
      },
      config: {
        routes: {
          '/test/foo1': {
            'GET': 'TestController.foo'
          }
        }
      },
      api: {}
    })
  }
}
