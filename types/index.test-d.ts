import fastify, {
  FastifyInstance,
} from 'fastify';
import plugin from '..';

const app: FastifyInstance = fastify();
app.register(plugin);
app.register(plugin, {});
app.register(plugin, { ajv: { coerceTypes: true } });
app.register(plugin, { responseValidation: true });
app.register(plugin, { responseValidation: false });
app.register(plugin, { ajv: { plugins: [require('ajv-formats')] } })
app.register(plugin, { ajv: { plugins: [require('ajv-errors')] } })
app.register(plugin, { ajv: { plugins: [[require('ajv-errors'), {}]] } })
app.register(plugin, { ajv: { plugins: [require('ajv-formats'), [require('ajv-errors'), {}]] } })

app.route({
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
