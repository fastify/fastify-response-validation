import { FastifyPluginCallback } from "fastify";
import {
  Options as AjvOptions,
  Plugin as AjvPlugin
} from "ajv";

declare namespace FastifyResponseValidationPlugin {
  interface Options {
    ajv?: AjvOptions;
    responseValidation?: boolean;
    ajvPlugins?: (AjvPlugin<any> | [AjvPlugin<any>, { [key: string]: any; }])[];
  }
}

declare const FastifyResponseValidationPlugin: FastifyPluginCallback<FastifyResponseValidationPlugin.Options>;
export default FastifyResponseValidationPlugin;
