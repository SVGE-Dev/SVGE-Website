import { registerDecorator, ValidationArguments } from "class-validator";


const usernameRegexp = new RegExp(/(.*)#(\d{4})/);


/**
 * Decorator to validate whether a request parameter is a valid Discord username.
 * Also checks that it is a string and its length is between 5 and 37 characters (2-32 character username, plus # and 4-digit discriminator).
 */
export const IsDiscordUsername = () : PropertyDecorator =>
{
	return (object : Object, propertyName : string) =>
	{
		registerDecorator({
			name: "isDiscordUsername",
			target: object.constructor,
			propertyName: propertyName,
			validator: {
				validate: (username : string) => typeof username === 'string' && username.length >= 7 && username.length <= 37 && usernameRegexp.test(username),
				defaultMessage: (args : ValidationArguments) =>
					`Argument '${args.value}' supplied for parameter '${args.property}' is not a valid Discord username.`
			}
		});
	};
};