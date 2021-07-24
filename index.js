'use strict'

const fp = require('fastify-plugin')
const Ajv = require('ajv')

function validateResponse (fastify, opts, next) {
  const ajv = new Ajv(Object.assign({
    coerceTypes: false,
    useDefaults: true,
    removeAdditional: true,
    allErrors: true,
    nullable: true
  }, opts.ajv))

  if (opts.responseValidation !== false) {
    fastify.addHook('onRoute', onRoute)
  }

  function onRoute (opts) {
    if (opts.responseValidation === false) return
    if (opts.schema && opts.schema.response) {
      opts.preSerialization = opts.preSerialization || []
      opts.preSerialization.push(buildHook(opts.schema.response))
    }
  }

  function buildHook (schema) {
    const statusCodes = {}
    for (const statusCode in schema) {
      statusCodes[statusCode] = ajv.compile(schema[statusCode])
    }

    return preSerialization

    function preSerialization (req, reply, payload, next) {
      const validate = statusCodes[reply.statusCode] || statusCodes[(reply.statusCode + '')[0] + 'xx']
      if (validate !== undefined) {
        const valid = validate(payload)
        if (!valid) {
          const err = new Error(schemaErrorsText(validate.errors))
          err.validation = validate.errors
          reply.code(500)
          return next(err)
        }
      }
      next()
    }
  }

  next()
}

function schemaErrorsText (errors) {
  let text = ''
  const separator = ', '
  // eslint-disable-next-line no-var -- keep var for performance reasons
  for (var i = 0; i < errors.length; i++) {
    const e = errors[i]
    text += 'response' + (e.dataPath || '') + ' ' + e.message + separator
  }
  return text.slice(0, -separator.length)
}

module.exports = fp(validateResponse, {
  fastify: '>=2.0.0',
  name: 'fastify-response-validation'
})
