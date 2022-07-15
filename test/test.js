'use strict'

const test = require('tap').test
const Fastify = require('fastify')
const plugin = require('..')

test('Should return a validation error', async t => {
  const fastify = Fastify()
  await fastify.register(plugin)

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

  const response = await fastify.inject({
    method: 'GET',
    path: '/'
  })

  t.equal(response.statusCode, 500)
  const data = response.json()
  t.strictSame(data, {
    statusCode: 500,
    error: 'Internal Server Error',
    message: 'response/answer must be number'
  })
})

test('Should support shortcut schema syntax', async t => {
  const fastify = Fastify()
  await fastify.register(plugin)

  fastify.route({
    method: 'GET',
    path: '/',
    schema: {
      response: {
        '2xx': {
          answer: { type: 'number' }
        }
      }
    },
    handler: async (req, reply) => {
      return { answer: '42' }
    }
  })

  const response = await fastify.inject({
    method: 'GET',
    path: '/'
  })

  t.equal(response.statusCode, 500)
  t.strictSame(JSON.parse(response.payload), {
    statusCode: 500,
    error: 'Internal Server Error',
    message: 'response/answer must be number'
  })
})

test('Should check only the assigned status code', async t => {
  const fastify = Fastify()
  await fastify.register(plugin)

  fastify.route({
    method: 'GET',
    path: '/',
    schema: {
      response: {
        '3xx': {
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

  const response = await fastify.inject({
    method: 'GET',
    path: '/'
  })

  t.equal(response.statusCode, 200)
  t.strictSame(JSON.parse(response.payload), { answer: '42' })
})

test('Should check anyOf Schema', async t => {
  const fastify = Fastify()
  await fastify.register(plugin)

  fastify.route({
    method: 'GET',
    path: '/',
    schema: {
      response: {
        '2xx': {
          anyOf: [
            {
              type: 'object',
              properties: {
                answer: { type: 'number' }
              }
            }
          ]
        }
      }
    },
    handler: async (req, reply) => {
      return { answer: '42' }
    }
  })

  const response = await fastify.inject({
    method: 'GET',
    path: '/'
  })

  t.equal(response.statusCode, 500)
  t.equal(JSON.parse(response.payload).error, 'Internal Server Error')
  t.equal(JSON.parse(response.payload).message, 'response/answer must be number, response must match a schema in anyOf')
})

test('response validation is set, but no response schema given returns unvalidated response', async t => {
  const fastify = Fastify()
  await fastify.register(plugin)

  fastify.route({
    method: 'GET',
    path: '/',
    schema: {},
    handler: async (req, reply) => {
      return { answer: '42' }
    }
  })

  const response = await fastify.inject({
    method: 'GET',
    path: '/'
  })

  t.equal(response.statusCode, 200)
  t.strictSame(JSON.parse(response.payload), { answer: '42' })
})

test('Override default ajv options', async t => {
  const fastify = Fastify()
  await fastify.register(plugin, { ajv: { coerceTypes: true } })

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

  const response = await fastify.inject({
    method: 'GET',
    path: '/'
  })

  t.equal(response.statusCode, 200)
  t.strictSame(JSON.parse(response.payload), { answer: 42 })
})

test('Disable response validation for a specific route', async t => {
  const fastify = Fastify()
  await fastify.register(plugin)

  fastify.route({
    method: 'GET',
    path: '/',
    responseValidation: false,
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

  const response = await fastify.inject({
    method: 'GET',
    path: '/'
  })

  t.equal(response.statusCode, 200)
  t.strictSame(JSON.parse(response.payload), { answer: 42 })
})

test('Disable response validation for every route', async t => {
  const fastify = Fastify()
  await fastify.register(plugin, { responseValidation: false })

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

  const response = await fastify.inject({
    method: 'GET',
    path: '/'
  })

  t.equal(response.statusCode, 200)
  t.strictSame(JSON.parse(response.payload), { answer: 42 })
})
