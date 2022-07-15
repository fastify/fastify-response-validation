import { FastifyPluginCallback } from "fastify";
import {
  Options as AjvOptions,
} from "ajv";

declare namespace FastifyResponseValidationPlugin {
  interface Options {
    ajv?: AjvOptions;
    responseValidation?: boolean;
  }
}

declare const FastifyResponseValidationPlugin: FastifyPluginCallback<FastifyResponseValidationPlugin.Options>;
export default FastifyResponseValidationPlugin;
