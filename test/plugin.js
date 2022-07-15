'use strict'

const test = require('tap').test
const Fastify = require('fastify')
const ajvFormats = require('ajv-formats')
const ajvErrors = require('ajv-errors')
const plugin = require('..')

test('use ajv formats', async t => {
  const fastify = Fastify()
  await fastify.register(plugin, { ajvPlugins: [ajvFormats] })

  fastify.route({
    method: 'GET',
    url: '/',
    schema: {
      response: {
        '2xx': {
          type: 'object',
          properties: {
            answer: { type: 'number', format: 'float' }
          }
        }
      }
    },
    handler: async (req, reply) => {
      return { answer: 2.4 }
    }
  })

  const response = await fastify.inject({
    method: 'GET',
    url: '/'
  })

  t.equal(response.statusCode, 200)
  t.strictSame(JSON.parse(response.payload), { answer: 2.4 })
})

test('use ajv errors', async t => {
  const fastify = Fastify()
  await fastify.register(plugin, { ajvPlugins: [[ajvErrors, { singleError: false }]] })

  fastify.route({
    method: 'GET',
    url: '/',
    schema: {
      response: {
        '2xx': {
          type: 'object',
          required: ['answer'],
          properties: {
            answer: { type: 'number' }
          },
          additionalProperties: false,
          errorMessage: 'should be an object with an integer property answer only'
        }
      }
    },
    handler: async (req, reply) => {
      return { foo: 24 }
    }
  })

  const response = await fastify.inject({
    method: 'GET',
    url: '/'
  })

  t.equal(response.statusCode, 500)
  t.equal(JSON.parse(response.payload).message, 'response should be an object with an integer property answer only')
})
