'use strict'

const fp = require('fastify-plugin')
const Ajv = require('ajv')
const AjvCore = require('ajv/dist/core')
const createError = require('@fastify/error')

const ReplyValidationFailError = createError('FST_RESPONSE_VALIDATION_FAILED_VALIDATION', '%s', 500)
const NoSchemaDefinedError = createError('FST_RESPONSE_VALIDATION_SCHEMA_NOT_DEFINED', 'No schema defined for %s')

function fastifyResponseValidation (fastify, opts, next) {
  let ajv
  if (opts.ajv && opts.ajv instanceof AjvCore.default) {
    ajv = opts.ajv
  } else {
    const { plugins: ajvPlugins, ...ajvOptions } = Object.assign({
      coerceTypes: false,
      useDefaults: true,
      removeAdditional: true,
      allErrors: true,
      plugins: []
    }, opts.ajv)

    if (!Array.isArray(ajvPlugins)) {
      next(new Error(`ajv.plugins option should be an array, instead got '${typeof ajvPlugins}'`))
      return
    }
    ajv = new Ajv(ajvOptions)

    for (const plugin of ajvPlugins) {
      if (Array.isArray(plugin)) {
        plugin[0](ajv, plugin[1])
      } else {
        plugin(ajv)
      }
    }
  }

  if (opts.responseValidation !== false) {
    fastify.addHook('onRoute', onRoute)
  }

  function onRoute (routeOpts) {
    if (routeOpts.responseValidation === false) return
    if (routeOpts.schema && routeOpts.schema.response) {
      const schemas = Object.values(fastify.getSchemas())

      for (const schema of schemas) {
        if (!ajv.getSchema(schema.$id)) {
          ajv.addSchema(schema)
        }
      }

      const responseStatusCodeValidation = routeOpts.responseStatusCodeValidation || opts.responseStatusCodeValidation || false
      routeOpts.preSerialization = routeOpts.preSerialization || []
      routeOpts.preSerialization.push(buildHook(routeOpts.schema.response, responseStatusCodeValidation))
    }
  }

  function buildHook (schema, responseStatusCodeValidation) {
    const statusCodes = {}
    for (const statusCode in schema) {
      const responseSchema = schema[statusCode]

      if (responseSchema.content !== undefined) {
        statusCodes[statusCode] = {}
        for (const mediaName in responseSchema.content) {
          statusCodes[statusCode][mediaName] = ajv.compile(
            getSchemaAnyway(responseSchema.content[mediaName].schema)
          )
        }
      } else {
        statusCodes[statusCode] = ajv.compile(
          getSchemaAnyway(responseSchema)
        )
      }
    }

    return preSerialization

    function preSerialization (req, reply, payload, next) {
      let validate = statusCodes[reply.statusCode] || statusCodes[(reply.statusCode + '')[0] + 'xx']

      if (responseStatusCodeValidation && validate === undefined) {
        next(new NoSchemaDefinedError(`status code ${reply.statusCode}`))
        return
      }

      if (validate !== undefined) {
        // Per media type validation
        if (validate.constructor === Object) {
          const mediaName = reply.getHeader('content-type').split(';', 1)[0]
          if (validate[mediaName] == null) {
            next(new NoSchemaDefinedError(`media type ${mediaName}`))
            return
          }
          validate = validate[mediaName]
        }

        const valid = validate(payload)
        if (!valid) {
          const err = new ReplyValidationFailError(schemaErrorsText(validate.errors))
          err.validation = validate.errors
          reply.code(err.statusCode)
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
  fastify: '5.x',
  name: '@fastify/response-validation'
})
module.exports.default = fastifyResponseValidation
module.exports.fastifyResponseValidation = fastifyResponseValidation
