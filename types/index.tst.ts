import fastify, {
  FastifyInstance,
} from 'fastify'
import plugin from '.'
import Ajv from 'ajv'
import Ajv2019 from 'ajv/dist/2019'
import Ajv2020 from 'ajv/dist/2020'
import { expect } from 'tstyche'

const app: FastifyInstance = fastify()
app.register(plugin)
app.register(plugin, {})
app.register(plugin, { ajv: { coerceTypes: true } })
app.register(plugin, { responseValidation: true })
app.register(plugin, { responseValidation: false })
app.register(plugin, { responseStatusCodeValidation: true })
app.register(plugin, { responseStatusCodeValidation: false })
app.register(plugin, { ajv: { plugins: [require('ajv-formats')] } })
app.register(plugin, { ajv: { plugins: [require('ajv-errors')] } })
app.register(plugin, { ajv: { plugins: [[require('ajv-errors'), {}]] } })
app.register(plugin, { ajv: { plugins: [require('ajv-formats'), [require('ajv-errors'), {}]] } })
app.register(plugin, { ajv: new Ajv() })
app.register(plugin, { ajv: new Ajv2019() })
app.register(plugin, { ajv: new Ajv2020() })

{
  const routeOptions = {
    method: 'GET' as const,
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
    }
  }

  expect(routeOptions.responseValidation).type.toBeAssignableTo<
    boolean | undefined
  >()
}
