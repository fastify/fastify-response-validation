import { FastifyPluginCallback, RawServerBase, RawServerDefault } from "fastify";
import {
  Options as AjvOptions
} from "ajv";

declare module 'fastify' {
  interface RouteShorthandOptions<
    RawServer extends RawServerBase = RawServerDefault
  > {
    responseValidation?: boolean;
  }
}

declare namespace FastifyResponseValidationPlugin {
  interface Options {
    ajv?: AjvOptions;
    responseValidation?: boolean;
    ajvPlugins?: (Function | [Function, unknown])[]
  }
}

declare const FastifyResponseValidationPlugin: FastifyPluginCallback<FastifyResponseValidationPlugin.Options>;
export default FastifyResponseValidationPlugin;
