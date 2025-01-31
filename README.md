# @fastify/response-validation

[![CI](https://github.com/fastify/fastify-response-validation/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/fastify/fastify-response-validation/actions/workflows/ci.yml)
[![NPM version](https://img.shields.io/npm/v/@fastify/response-validation.svg?style=flat)](https://www.npmjs.com/package/@fastify/response-validation)
[![neostandard javascript style](https://img.shields.io/badge/code_style-neostandard-brightgreen?style=flat)](https://github.com/neostandard/neostandard)

A simple plugin that enables response validation for Fastify.
The use of this plugin will slow down your overall performance, so we suggest using it only during development.

## Install
```
npm i @fastify/response-validation
```

## Usage
You just need to register the plugin and you will have response validation enabled:
```js
import fastify from 'fastify'

const app = fastify()

await app.register(require('@fastify/response-validation'))

app.route({
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

app.inject({
  method: 'GET',
  path: '/'
}, (err, res) => {
  if (err) throw err
  console.log(res.payload)
})
```

Different content types responses are supported by `@fastify/response-validation`, `@fastify/swagger`, and `fastify`. Please use `content` for the response otherwise Fastify itself will fail to compile the schema:
```js
{
  response: {
    200: {
      description: 'Description and all status-code based properties are working',
      content: {
        'application/json': {
          schema: {
            name: { type: 'string' },
            image: { type: 'string' },
            address: { type: 'string' }
          }
        },
        'application/vnd.v1+json': {
          schema: {
            fullName: { type: 'string' },
            phone: { type: 'string' }
          }
        }
      }
    }
  }
}
```

If you want to override the default [ajv](https://www.npmjs.com/package/ajv) configuration, you can do that by using the `ajv` option:
```js
// Default configuration:
//    coerceTypes: false
//    useDefaults: true
//    removeAdditional: true
//    allErrors: true

import responseValidator from '@fastify/response-validation'

// ... App setup

await fastify.register(responseValidator, {
  ajv: {
    coerceTypes: true
  }
})
```

You can also pass in an instance of ajv
```js
// Default configuration:
//    coerceTypes: false
//    useDefaults: true
//    removeAdditional: true
//    allErrors: true

import responseValidator from '@fastify/response-validation'
import Ajv from 'ajv'

// ... App setup

const ajv = new Ajv()
await fastify.register(responseValidator, { ajv })
```

By default, the response validation is enabled on every route that has a response schema defined. If needed you can disable it all together with `responseValidation: false`:
```js
import responseValidator from '@fastify/response-validation'

// ... App setup
await fastify.register(responseValidator, {
  responseValidation: false
})
```

Alternatively, you can disable a specific route with the same option:
```js
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
```

## Plugins
You can also extend the functionalities of the ajv instance embedded in this validator by adding new ajv plugins.

```js
fastify.register(require('fastify-response-validation'), {
  ajv: {
    plugins: [
      require('ajv-formats'),
      [require('ajv-errors'), { singleError: false }]
      // Usage: [plugin, pluginOptions] - Plugin with options
      // Usage: plugin - Plugin without options
    ]
  }
})
```

## Errors

The errors emitted by this plugin are:

- `FST_RESPONSE_VALIDATION_FAILED_VALIDATION`: This error is emitted when a response does not conform to the provided schema.

- `FST_RESPONSE_VALIDATION_SCHEMA_NOT_DEFINED`: This error is emitted when there is no JSON schema available to validate the response.

## License
[MIT](./LICENSE)
