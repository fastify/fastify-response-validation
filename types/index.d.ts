import { FastifyPluginCallback, RawServerBase, RawServerDefault } from 'fastify'
import Ajv, { Options as AjvOptions } from 'ajv'

declare module 'fastify' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface RouteShorthandOptions<RawServer extends RawServerBase = RawServerDefault> {
    responseValidation?: boolean;
    responseStatusCodeValidation?: boolean;
  }
}

type FastifyResponseValidation = FastifyPluginCallback<fastifyResponseValidation.Options>

declare namespace fastifyResponseValidation {
  export interface Options {
    ajv?: Ajv | (AjvOptions & {
      plugins?: (Function | [Function, unknown])[];
    });
    responseValidation?: boolean;
    responseStatusCodeValidation?: boolean;
  }

  export const fastifyResponseValidation: FastifyResponseValidation
  export { fastifyResponseValidation as default }
}

declare function fastifyResponseValidation (...params: Parameters<FastifyResponseValidation>): ReturnType<FastifyResponseValidation>
export = fastifyResponseValidation
