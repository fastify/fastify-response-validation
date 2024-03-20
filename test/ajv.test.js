'use strict'

const test = require('tap').test
const Fastify = require('fastify')
const plugin = require('..')
const Ajv = require('ajv')
const Ajv2019 = require('ajv/dist/2019')
const Ajv2020 = require('ajv/dist/2020')
const ajvFormats = require('ajv-formats')
const ajvErrors = require('ajv-errors')

test('use ajv formats', async t => {
  const fastify = Fastify()
  await fastify.register(plugin, { ajv: { plugins: [require('ajv-formats')] } })

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
  await fastify.register(plugin, { ajv: { plugins: [[require('ajv-errors'), { singleError: false }]] } })

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

test('should throw an error if ajv.plugins is string', async t => {
  t.plan(1)
  const fastify = Fastify()
  t.rejects(fastify.register(plugin, { ajv: { plugins: 'invalid' } }), 'ajv.plugins option should be an array, instead got \'string\'')
})

test('should throw an error if ajv.plugins is null', async t => {
  t.plan(1)
  const fastify = Fastify()
  t.rejects(fastify.register(plugin, { ajv: { plugins: null } }), 'ajv.plugins option should be an array, instead got \'object\'')
})

test('should throw an error if ajv.plugins is undefined', async t => {
  t.plan(1)
  const fastify = Fastify()
  t.rejects(fastify.register(plugin, { ajv: { plugins: undefined } }), 'ajv.plugins option should be an array, instead got \'undefined\'')
})

test('should throw an error if ajv.plugins is boolean', async t => {
  t.plan(1)
  const fastify = Fastify()
  t.rejects(fastify.register(plugin, { ajv: { plugins: false } }), 'ajv.plugins option should be an array, instead got \'boolean\'')
})

test('should throw an error if ajv.plugins is number', async t => {
  t.plan(1)
  const fastify = Fastify()
  t.rejects(fastify.register(plugin, { ajv: { plugins: 0 } }), 'ajv.plugins option should be an array, instead got \'number\'')
})

test('use ajv formats with Ajv instance', async t => {
  const fastify = Fastify()
  const ajv = new Ajv()
  ajvFormats(ajv)
  await fastify.register(plugin, { ajv })

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

test('use ajv errors with Ajv instance', async t => {
  const fastify = Fastify()
  const ajv = new Ajv({ allErrors: true })
  ajvErrors(ajv, { singleError: true })
  await fastify.register(plugin, { ajv })

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
      return { notAnAnswer: 24 }
    }
  })

  const response = await fastify.inject({
    method: 'GET',
    url: '/'
  })

  t.equal(response.statusCode, 500)
  t.equal(response.json().message, 'response should be an object with an integer property answer only')
})

test('use ajv formats with 2019 Ajv instance', async t => {
  const fastify = Fastify()
  const ajv = new Ajv2019()
  ajvFormats(ajv)
  await fastify.register(plugin, { ajv })

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

test('use ajv errors with 2019 Ajv instance', async t => {
  const fastify = Fastify()
  const ajv = new Ajv2019({ allErrors: true })
  ajvErrors(ajv, { singleError: true })
  await fastify.register(plugin, { ajv })

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
      return { notAnAnswer: 24 }
    }
  })

  const response = await fastify.inject({
    method: 'GET',
    url: '/'
  })

  t.equal(response.statusCode, 500)
  t.equal(response.json().message, 'response should be an object with an integer property answer only')
})

test('use ajv formats with 2020 Ajv instance', async t => {
  const fastify = Fastify()
  const ajv = new Ajv2020()
  ajvFormats(ajv)
  await fastify.register(plugin, { ajv })

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

test('use ajv errors with 2019 Ajv instance', async t => {
  const fastify = Fastify()
  const ajv = new Ajv2020({ allErrors: true })
  ajvErrors(ajv, { singleError: true })
  await fastify.register(plugin, { ajv })

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
      return { notAnAnswer: 24 }
    }
  })

  const response = await fastify.inject({
    method: 'GET',
    url: '/'
  })

  t.equal(response.statusCode, 500)
  t.equal(response.json().message, 'response should be an object with an integer property answer only')
})

test('should throw an error if ajv.plugins is not passed to instance and not array', async t => {
  t.plan(1)
  const fastify = Fastify()
  t.rejects(fastify.register(plugin, { ajv: { plugins: 'invalid' } }), 'ajv.plugins option should be an array, instead got \'string\'')
})
