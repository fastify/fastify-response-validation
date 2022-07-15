import fastify, {
  FastifyInstance,
} from 'fastify';
import plugin from '..';
import ajvFormats from 'ajv-formats';
import ajvErrors from 'ajv-errors';

const app: FastifyInstance = fastify();
app.register(plugin);
app.register(plugin, {});
app.register(plugin, { ajv: { coerceTypes: true } });
app.register(plugin, { responseValidation: true });
app.register(plugin, { responseValidation: false });
app.register(plugin, { ajvPlugins: [ajvFormats] })
app.register(plugin, { ajvPlugins: [ajvErrors] })
app.register(plugin, { ajvPlugins: [[ajvErrors, {}]] })
app.register(plugin, { ajvPlugins: [ajvFormats, [ajvErrors, {}]] })
