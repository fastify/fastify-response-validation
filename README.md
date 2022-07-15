# @fastify/response-validation

![CI](https://github.com/fastify/fastify-response-validation/workflows/CI/badge.svg)
[![NPM version](https://img.shields.io/npm/v/@fastify/response-validation.svg?style=flat)](https://www.npmjs.com/package/@fastify/response-validation)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://standardjs.com/)

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

By default the response validation is enabled on every route that has a response schema defined. If needed you can disable it all together with `responseValidation: false`:
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
const ajvFormats = require('ajv-formats')
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

## License
[MIT](./LICENSE)
