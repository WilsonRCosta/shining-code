const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().min(6).required(),
  email: Joi.string().max(255).required().email(),
  password: Joi.string().min(6).max(1024).required(),
  repeat_password: Joi.string().valid(Joi.ref("password")).required(),
});

const loginSchema = Joi.object({
  name: Joi.string().min(6).required(),
  password: Joi.string().min(6).max(1024).required(),
});

const registerValidation = (data) => registerSchema.validate(data);

const loginValidation = (data) => loginSchema.validate(data);

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
