import { TransformDecodeCheckError, TransformDecodeError, Value, ValueError } from "@sinclair/typebox/value";
import { Env, envConfigValidator, envSchema } from "../types/env";
import { PluginSettings, pluginSettingsSchema, commandQueryUserSchemaValidator } from "../types/plugin-input";

export function validateAndDecodeSchemas(env: Env, rawSettings: object) {
  const errors: ValueError[] = [];
  const settings = Value.Default(pluginSettingsSchema, rawSettings) as PluginSettings;

  if (!commandQueryUserSchemaValidator.test(settings)) {
    for (const error of commandQueryUserSchemaValidator.errors(settings)) {
      console.error(error);
      errors.push(error);
    }
  }

  if (!envConfigValidator.test(env)) {
    for (const error of envConfigValidator.errors(env)) {
      console.error(error);
      errors.push(error);
    }
  }

  if (errors.length) {
    throw { errors };
  }

  try {
    const decodedEnv = Value.Decode(envSchema, env);
    const decodedSettings = Value.Decode(pluginSettingsSchema, settings);
    return { decodedEnv, decodedSettings };
  } catch (e) {
    if (e instanceof TransformDecodeCheckError || e instanceof TransformDecodeError) {
      throw { errors: [e.error] };
    }
    throw e;
  }
}
