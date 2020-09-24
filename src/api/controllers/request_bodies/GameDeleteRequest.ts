import { IsUUID } from "class-validator";

export class GameDeleteRequest
{
	@IsUUID()
	uuid : string;
}