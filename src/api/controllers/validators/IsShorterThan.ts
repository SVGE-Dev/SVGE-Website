import { registerDecorator, ValidationArguments } from "class-validator";


/**
 * Decorator to validate whether a property is a string and its length is less than or equal to 'length' characters.
 * 
 * @param {number} length - The number that the property's length must be less than or equal to.
 */
export const IsShorterThan = (length : number) : PropertyDecorator =>
{
	return (object : Object, propertyName : string) =>
	{
		registerDecorator({
			name: "isShorterThanOrEqualTo",
			target: object.constructor,
			propertyName: propertyName,
			validator: {
				validate: (text : string) => typeof text == "string" && text.length <= length,
				defaultMessage: (args : ValidationArguments) =>
					`Argument '${args.value}' supplied for parameter '${args.property}' must be shorter than or equal to ${length} characters.`
			}
		});
	};
};