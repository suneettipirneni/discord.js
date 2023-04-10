import { s } from '@sapphire/shapeshift';
import { isValidationEnabled } from './validation.js';

export const customIdValidator = s.string
	.lengthGreaterThanOrEqual(1)
	.lengthLessThanOrEqual(100)
	.setValidationEnabled(isValidationEnabled);

export const emojiValidator = s
	.object({
		id: s.string,
		name: s.string,
		animated: s.boolean,
	})
	.partial.strict.setValidationEnabled(isValidationEnabled);

export const disabledValidator = s.boolean;
