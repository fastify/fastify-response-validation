'use strict'

const test = require('ava')
const Fastify = require('fastify')
const plugin = require('./')

test('Should return a validation error', async t => {
  const fastify = Fastify()
  fastify.register(plugin)

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

  t.is(response.statusCode, 500)
  t.deepEqual(JSON.parse(response.payload), {
    statusCode: 500,
    error: 'Internal Server Error',
    message: 'response.answer should be number'
  })
})

test('Shoult check only the assigned status code', async t => {
  const fastify = Fastify()
  fastify.register(plugin)

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

  t.is(response.statusCode, 200)
  t.deepEqual(JSON.parse(response.payload), { answer: '42' })
})

test('Override default ajv options', async t => {
  const fastify = Fastify()
  fastify.register(plugin, { ajv: { coerceTypes: true } })

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

  t.is(response.statusCode, 200)
  t.deepEqual(JSON.parse(response.payload), { answer: 42 })
})

test('Disable response validation for a specific route', async t => {
  const fastify = Fastify()
  fastify.register(plugin)

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

  t.is(response.statusCode, 200)
  t.deepEqual(JSON.parse(response.payload), { answer: 42 })
})

test('Disable response validation for every route', async t => {
  const fastify = Fastify()
  fastify.register(plugin, { responseValidation: false })

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

  t.is(response.statusCode, 200)
  t.deepEqual(JSON.parse(response.payload), { answer: 42 })
})
