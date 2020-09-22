import { IsUUID } from "class-validator";

export class DeleteUserRequest
{
	@IsUUID()
	uuid : string;
}