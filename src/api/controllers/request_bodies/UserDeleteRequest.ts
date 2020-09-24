import { IsUUID } from "class-validator";

export class UserDeleteRequest
{
	@IsUUID()
	uuid : string;
}