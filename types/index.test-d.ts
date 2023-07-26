import fastify, {
  FastifyInstance,
} from 'fastify';
import plugin from '..';
import Ajv from 'ajv';
import Ajv2019 from "ajv/dist/2019";
import Ajv2020 from "ajv/dist/2020";

const app: FastifyInstance = fastify();
app.register(plugin);
app.register(plugin, {});
app.register(plugin, { ajv: { coerceTypes: true } });
app.register(plugin, { responseValidation: true });
app.register(plugin, { responseValidation: false });
app.register(plugin, { responseStatusCodeValidation: true });
app.register(plugin, { responseStatusCodeValidation: false });
app.register(plugin, { ajv: { plugins: [require('ajv-formats')] } })
app.register(plugin, { ajv: { plugins: [require('ajv-errors')] } })
app.register(plugin, { ajv: { plugins: [[require('ajv-errors'), {}]] } })
app.register(plugin, { ajv: { plugins: [require('ajv-formats'), [require('ajv-errors'), {}]] } })
app.register(plugin, { ajv: new Ajv() })
app.register(plugin, { ajv: new Ajv2019() })
app.register(plugin, { ajv: new Ajv2020() })

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
