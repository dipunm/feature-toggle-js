const joi = require('joi');

module.exports = function assertArgs(features) {
  if (!joi) return;

  const result = joi.validate(
    features,
    joi
      .array()
      .required()
      .unique('name')
      .min(1)
      .items(
        joi.object().keys({
          name: joi.string().required(),
          test: joi.func().required(),
          dependencies: joi.array(),
          health: joi.func(),
          resetOn: joi.func(),
        }),
      )
      .label('features'),
  );

  if (result.error) {
    throw new Error(`Argument exception: ${result.error.message}`);
  }
};
