'use strict'

const fp = require('fastify-plugin')
const Ajv = require('ajv')

function fastifyResponseValidation (fastify, opts, next) {
  const { plugins: ajvPlugins, ...ajvOptions } = Object.assign({
    coerceTypes: false,
    useDefaults: true,
    removeAdditional: true,
    allErrors: true,
    plugins: []
  }, opts.ajv)

  if (!ajvPlugins || !Array.isArray(ajvPlugins)) {
    next(new Error(`ajv.plugins option should be an array, instead got '${typeof ajvPlugins}'`))
    return
  }

  const ajv = new Ajv(ajvOptions)

  for (const plugin of ajvPlugins) {
    if (Array.isArray(plugin)) {
      plugin[0](ajv, plugin[1])
    } else {
      plugin(ajv)
    }
  }

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
      const responseSchema = schema[statusCode]
      statusCodes[statusCode] = ajv.compile(
        getSchemaAnyway(responseSchema)
      )
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

/**
 * Copy-paste of getSchemaAnyway from fastify
 *
 * https://github.com/fastify/fastify/blob/23371945d01c270af24f4a5b7e2e31c4e806e6b3/lib/schemas.js#L113
 */
function getSchemaAnyway (schema) {
  if (schema.$ref || schema.oneOf || schema.allOf || schema.anyOf || schema.$merge || schema.$patch) return schema
  if (!schema.type && !schema.properties) {
    return {
      type: 'object',
      properties: schema
    }
  }
  return schema
}

function schemaErrorsText (errors) {
  let text = ''
  const separator = ', '
  for (const e of errors) {
    text += 'response' + (e.instancePath || '') + ' ' + e.message + separator
  }
  return text.slice(0, -separator.length)
}

module.exports = fp(fastifyResponseValidation, {
  fastify: '4.x',
  name: '@fastify/response-validation'
})
module.exports.default = fastifyResponseValidation
module.exports.fastifyResponseValidation = fastifyResponseValidation
