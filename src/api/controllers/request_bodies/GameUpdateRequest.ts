import { Transform } from "class-transformer";
import { IsNumber, IsOptional, IsPositive, IsUUID } from "class-validator";
import { SanitizeHtml } from "../transformers/SanitizeHtml";
import { IsLongerThan } from "../validators/IsLongerThan";
import { IsShorterThan } from "../validators/IsShorterThan";


export class GameUpdateRequest
{
	@IsUUID()
	uuid : string;

	@IsOptional()
	@IsShorterThan(64)
	@SanitizeHtml()
	name? : string;

	@IsOptional()
	@IsShorterThan(32)
	@SanitizeHtml()
	nameShort? : string;

	@IsOptional()
	@IsShorterThan(42)
	@SanitizeHtml()
	brief? : string;

	@IsOptional()
	@IsShorterThan(42)
	@SanitizeHtml()
	tagline? : string;

	@IsOptional()
	@IsShorterThan(32)
	@SanitizeHtml()
	heading? : string;

	@IsOptional()
	@IsShorterThan(2048)
	@IsLongerThan(256)
	@SanitizeHtml(["br"])
	text? : string;

	@IsOptional()
	@IsPositive()
	@IsNumber()
	@Transform((val) => typeof val == "number" ? val : parseInt(val))
	position? : number;
}