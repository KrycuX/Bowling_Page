import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  // App
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  APP_PORT: Joi.number().default(4000),
  APP_HOST: Joi.string().default('0.0.0.0'),
  APP_URL: Joi.string().uri().default('http://localhost:4000'),
  ALLOWED_ORIGINS: Joi.string().default('http://localhost:3000'),

  // Database
  DATABASE_URL: Joi.string().required(),
});
