'use strict'

import fastify from 'fastify'
import responseValidator from './index.js'

const app = fastify()

await app.register(responseValidator)

app.get('/', {
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

app.inject(
  {
    method: 'GET',
    path: '/'
  },
  (err, res) => {
    if (err) throw err
    console.log(res.payload)
  }
)
