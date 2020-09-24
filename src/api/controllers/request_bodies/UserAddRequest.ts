import { Transform } from "class-transformer";
import { IsInt, IsOptional, IsPositive } from "class-validator";
import { IsDiscordUsername } from "../validators/IsDiscordUsername";
import { IsShorterThan } from "../validators/IsShorterThan";

export class UserAddRequest
{
	@IsDiscordUsername()
	username : string;

	// the person's name that they want to show on the site
	@IsShorterThan(24) // might need to be longer depending on people's names
	name : string;

	// position in which users in this group will be listed
	@IsPositive()
	@IsInt()
	@Transform((val) => typeof val == "number" ? val : parseInt(val))
	position : number;

	// this could be a committee position name, rep name, etc...
	@IsShorterThan(32)
	title : string;

	// a slightly longer piece of text, such as the description of a committee position
	@IsShorterThan(128)
	desc : string;

	// a much longer piece of text, such as about them, about what they can do for you, etc
	@IsShorterThan(1024)
	@IsOptional()
	message : string | undefined;
}