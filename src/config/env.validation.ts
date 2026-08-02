import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  DATABASE_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  PORT: Joi.number().default(4200),
  APP_URL: Joi.string().default('http://localhost:3000'),
  ORDERS_ENABLED: Joi.string().valid('true', 'false').default('false'),
  DELIVERY_PRICE: Joi.number().default(100),
  RETURN_URL: Joi.string().default('http://localhost:3000/thanks'),
  SHOP_ID: Joi.string().allow('').optional(),
  PAYMENT_TOKEN: Joi.string().allow('').optional()
});
