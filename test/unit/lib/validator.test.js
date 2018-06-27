const assert = require('assert')
const lib = require('../../../dist')

describe('lib.Validator', () => {

  describe('#validateRoute', () => {
    it('should reject a bad route', (done) => {
      lib.Validator.validateRoute({})
        .then(() => {
          const err = new Error('Should have failed validation!')
          done(err)
        })
        .catch(err => {
          assert(err)
          done()
        })
    })
  })
})
