import { FastifyPluginCallback, RawServerBase, RawServerDefault } from "fastify";
import { Options as AjvOptions } from "ajv";

declare module 'fastify' {
  interface RouteShorthandOptions<RawServer extends RawServerBase = RawServerDefault> {
    responseValidation?: boolean;
  }
}

type FastifyResponseValidation = FastifyPluginCallback<fastifyResponseValidation.Options>;

declare namespace fastifyResponseValidation {
  export interface Options {
    ajv?: AjvOptions & {
      plugins?: (Function | [Function, unknown])[];
    };
    responseValidation?: boolean;
  }
  
  export const fastifyReponseValidation: FastifyResponseValidation
  export { fastifyReponseValidation as default }
}

declare function fastifyResponseValidation(...params: Parameters<FastifyResponseValidation>): ReturnType<FastifyResponseValidation>
export = fastifyResponseValidation
