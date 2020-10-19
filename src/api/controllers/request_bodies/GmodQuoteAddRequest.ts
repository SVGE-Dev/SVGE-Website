import { IsString } from "class-validator";

export class GmodQuoteAddRequest
{
	@IsString()
	quote : string;

	@IsString()
	author : string;
}