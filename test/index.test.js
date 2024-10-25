'use strict'

const { test } = require('node:test')
const Fastify = require('fastify')
const plugin = require('..')

test('Should return a validation error', async t => {
  const fastify = Fastify()
  await fastify.register(plugin)

  fastify.route({
    method: 'GET',
    url: '/',
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
    url: '/'
  })

  t.assert.strictEqual(response.statusCode, 500)
  const data = response.json()
  t.assert.deepStrictEqual(data, {
    code: 'FST_RESPONSE_VALIDATION_FAILED_VALIDATION',
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
    url: '/',
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
    url: '/'
  })

  t.assert.strictEqual(response.statusCode, 500)
  t.assert.deepStrictEqual(JSON.parse(response.payload), {
    code: 'FST_RESPONSE_VALIDATION_FAILED_VALIDATION',
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
    url: '/',
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
    url: '/'
  })

  t.assert.strictEqual(response.statusCode, 200)
  t.assert.deepStrictEqual(JSON.parse(response.payload), { answer: '42' })
})

/**
 * OpenAPI 3.1.0 - Responses Object - 2XX status filter in upper case
 * https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#responses-object
 */
test('Should use response matching 5XX instead of default', async t => {
  const fastify = Fastify()
  await fastify.register(plugin)

  fastify.route({
    method: 'GET',
    url: '/',
    schema: {
      response: {
        '2XX': {
          type: 'object',
          properties: {
            answer: { type: 'number' }
          }
        },
        default: {
          type: 'object',
          properties: {
            error_message: { type: 'string' }
          },
          required: [
            'error_message'
          ]
        }
      }
    },
    handler: async (req, reply) => {
      return { answer: 42 }
    }
  })

  const response = await fastify.inject({
    method: 'GET',
    url: '/'
  })

  t.assert.strictEqual(response.statusCode, 200)
  t.assert.deepStrictEqual(JSON.parse(response.payload), { answer: 42 })
})

/**
 * OpenAPI 3.1.0 - Responses Object - default
 * https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#responses-object
 */
test('Should fallback to default response if nothing matches', async t => {
  const fastify = Fastify()
  await fastify.register(plugin)

  fastify.route({
    method: 'GET',
    url: '/',
    schema: {
      response: {
        '2XX': {
          type: 'object',
          properties: {
            answer: { type: 'number' }
          }
        },
        default: {
          type: 'object',
          properties: {
            error_message: { type: 'string' }
          },
          required: [
            'error_message'
          ]
        }
      }
    },
    handler: async (req, reply) => {
      reply.status(500).send({ error_message: 'the answer is 42' })
    }
  })

  const response = await fastify.inject({
    method: 'GET',
    url: '/'
  })

  t.assert.strictEqual(response.statusCode, 500)
  t.assert.deepStrictEqual(JSON.parse(response.payload), { error_message: 'the answer is 42' })
})

test('Should check media types', async t => {
  const fastify = Fastify()
  await fastify.register(plugin)

  fastify.route({
    method: 'GET',
    url: '/',
    schema: {
      response: {
        '2xx': {
          content: {
            'application/geo+json': {
              schema: {
                type: 'object',
                properties: {
                  answer: { type: 'number' }
                }
              }
            }
          }
        }
      }
    },
    handler: async (req, reply) => {
      reply.header('Content-Type', 'application/not+json')
      return { answer: 42 }
    }
  })

  const response = await fastify.inject({
    method: 'GET',
    url: '/'
  })

  t.assert.strictEqual(response.statusCode, 500)
  t.assert.deepStrictEqual(JSON.parse(response.payload), {
    code: 'FST_RESPONSE_VALIDATION_SCHEMA_NOT_DEFINED',
    statusCode: 500,
    error: 'Internal Server Error',
    message: 'No schema defined for media type application/not+json'
  })
})

test('Should support media types', async t => {
  const fastify = Fastify()
  await fastify.register(plugin)

  fastify.route({
    method: 'GET',
    url: '/',
    schema: {
      response: {
        '2xx': {
          content: {
            'application/a+json': {
              schema: {
                type: 'object',
                properties: {
                  answer: { type: 'boolean' }
                }
              }
            },
            'application/b+json': {
              schema: {
                type: 'object',
                properties: {
                  answer: { type: 'number' }
                }
              }
            }
          }
        }
      }
    },
    handler: async (req, reply) => {
      reply.header('Content-Type', 'application/b+json')
      return { answer: 42 }
    }
  })

  const response = await fastify.inject({
    method: 'GET',
    url: '/'
  })

  t.assert.strictEqual(response.statusCode, 200)
  t.assert.deepStrictEqual(JSON.parse(response.payload), { answer: 42 })
})

test('Should check anyOf Schema', async t => {
  const fastify = Fastify()
  await fastify.register(plugin)

  fastify.route({
    method: 'GET',
    url: '/',
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
    url: '/'
  })

  t.assert.strictEqual(response.statusCode, 500)
  t.assert.strictEqual(JSON.parse(response.payload).error, 'Internal Server Error')
  t.assert.strictEqual(JSON.parse(response.payload).message, 'response/answer must be number, response must match a schema in anyOf')
})

test('response validation is set, but no response schema given returns unvalidated response', async t => {
  const fastify = Fastify()
  await fastify.register(plugin)

  fastify.route({
    method: 'GET',
    url: '/',
    schema: {},
    handler: async (req, reply) => {
      return { answer: '42' }
    }
  })

  const response = await fastify.inject({
    method: 'GET',
    url: '/'
  })

  t.assert.strictEqual(response.statusCode, 200)
  t.assert.deepStrictEqual(JSON.parse(response.payload), { answer: '42' })
})

test('Override default ajv options', async t => {
  const fastify = Fastify()
  await fastify.register(plugin, { ajv: { coerceTypes: true } })

  fastify.route({
    method: 'GET',
    url: '/',
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
    url: '/'
  })

  t.assert.strictEqual(response.statusCode, 200)
  t.assert.deepStrictEqual(JSON.parse(response.payload), { answer: 42 })
})

test('Disable response validation for a specific route', async t => {
  const fastify = Fastify()
  await fastify.register(plugin)

  fastify.route({
    method: 'GET',
    url: '/',
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
    url: '/'
  })

  t.assert.strictEqual(response.statusCode, 200)
  t.assert.deepStrictEqual(JSON.parse(response.payload), { answer: 42 })
})

test('Disable response validation for every route', async t => {
  const fastify = Fastify()
  await fastify.register(plugin, { responseValidation: false })

  fastify.route({
    method: 'GET',
    url: '/',
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
    url: '/'
  })

  t.assert.strictEqual(response.statusCode, 200)
  t.assert.deepStrictEqual(JSON.parse(response.payload), { answer: 42 })
})

test('Enable response status code validation for a specific route', async t => {
  const fastify = Fastify()
  await fastify.register(plugin)

  fastify.route({
    method: 'GET',
    url: '/',
    responseStatusCodeValidation: true,
    schema: {
      response: {
        204: {
          type: 'object',
          properties: {
            answer: { type: 'number' }
          }
        }
      }
    },
    handler: async (req, reply) => {
      return { answer: 42 }
    }
  })

  const response = await fastify.inject({
    method: 'GET',
    url: '/'
  })

  t.assert.strictEqual(response.statusCode, 500)
  t.assert.deepStrictEqual(JSON.parse(response.payload), {
    code: 'FST_RESPONSE_VALIDATION_SCHEMA_NOT_DEFINED',
    statusCode: 500,
    error: 'Internal Server Error',
    message: 'No schema defined for status code 200'
  })
})

test('Enable response status code validation for every route', async t => {
  const fastify = Fastify()
  await fastify.register(plugin, { responseStatusCodeValidation: true })

  fastify.route({
    method: 'GET',
    url: '/',
    schema: {
      response: {
        204: {
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
    url: '/'
  })

  t.assert.strictEqual(response.statusCode, 500)
  t.assert.deepStrictEqual(JSON.parse(response.payload), {
    code: 'FST_RESPONSE_VALIDATION_SCHEMA_NOT_DEFINED',
    statusCode: 500,
    error: 'Internal Server Error',
    message: 'No schema defined for status code 200'
  })
})
