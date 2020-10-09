import { Transform } from "class-transformer";
import { IsBoolean, IsInt, IsPositive, ValidateIf } from "class-validator";
import { IsDiscordUsername } from "../validators/IsDiscordUsername";
import { IsLongerThan } from "../validators/IsLongerThan";
import { IsShorterThan } from "../validators/IsShorterThan";

export class UserAddRequest
{
	@IsDiscordUsername()
	username : string;

	// the person's name that they want to show on the site
	@IsLongerThan(1)
	@IsShorterThan(24) // might need to be longer depending on people's names
	name : string;

	// position in which users in this group will be listed
	@IsPositive()
	@IsInt()
	@Transform((val) => typeof val == "number" ? val : parseInt(val))
	position : number;

	// this could be a committee position name, rep name, etc...
	@IsLongerThan(1)
	@IsShorterThan(32)
	title : string;

	// a slightly longer piece of text, such as the description of a committee position
	@IsLongerThan(32)
	@IsShorterThan(90)
	desc : string;

	// a much longer piece of text, such as about them, about what they can do for you, etc
	@IsLongerThan(64)
	@IsShorterThan(256)
	@ValidateIf((userAddRequest : UserAddRequest) =>
		userAddRequest.message !== undefined && userAddRequest.message != "")
	message : string | undefined;

	@IsBoolean()
	@Transform((s) => Boolean(s != 0))
	show : boolean = true;
}