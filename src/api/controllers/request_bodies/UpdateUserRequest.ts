import { IsOptional, IsPositive, IsUUID } from "class-validator";
import { IsShorterThan } from "../validators/IsShorterThan";

export class UpdateUserRequest
{
	// this is the user's unique ID in the database
	@IsUUID()
	uuid : string;

	// the person's name that they want to show on the site
	@IsShorterThan(24) // might need to be longer depending on people's names
	name : string;

	// position in which users in this group will be listed
	@IsPositive()
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