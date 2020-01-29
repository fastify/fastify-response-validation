'use strict'

const fastify = require('fastify')()

fastify.register(require('./'))

fastify.route({
  method: 'GET',
  path: '/',
  schema: {
    response: {
      '2xx': {
        type: 'object',
        properties: {
          answer: { type: 'number' }
        }
      }
    }
  },
  handler: async (req, reply) => {
    return { answer: '42' }
  }
})

fastify.inject({
  method: 'GET',
  path: '/'
}, (err, res) => {
  if (err) throw err
  console.log(res.payload)
})
