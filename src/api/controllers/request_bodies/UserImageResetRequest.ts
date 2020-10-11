import { IsUUID } from "class-validator";

export class UserImageResetRequest
{
	@IsUUID()
	uuid : string;
}