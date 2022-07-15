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
