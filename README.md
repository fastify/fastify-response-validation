# fastify-response-validation

![Node.js CI](https://github.com/fastify/fastify-response-validation/workflows/Node.js%20CI/badge.svg)  [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/)


A simple plugin that enables response validation for Fastify.  
The use of this plugin will slow down your overall performances, so we suggest using it only during development.

## Install
```
npm i fastify-response-validation
```

## Usage
You just need to register the plugin and you will have response validation enabled.

```js
const fastify = require('fastify')()

fastify.register(require('fastify-response-validation'))

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

fastify.inject({
  method: 'GET',
  path: '/'
}, (err, res) => {
  if (err) throw err
  console.log(res.payload)
})
```

If you want to override the default [ajv](https://www.npmjs.com/package/ajv) configuration, you can do that by using the `ajv` option.
```js
// Default configuration:
//    coerceTypes: false
//    useDefaults: true
//    removeAdditional: true
//    allErrors: true
//    nullable: true

fastify.register(require('fastify-response-validation'), {
  ajv: {
    coerceTypes: true
  }
})
```

## License
[MIT](./LICENSE)
