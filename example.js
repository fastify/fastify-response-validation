'use strict'

const fastify = require('fastify')();

(async () => {
  await fastify.register(require('./'))

  fastify.get('/', {
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
    handler: (req, reply) => {
      return { answer: '42' }
    }
  })

  fastify.inject(
    {
      method: 'GET',
      path: '/'
    },
    (err, res) => {
      if (err) throw err
      console.log(res.payload)
    }
  )
})()
