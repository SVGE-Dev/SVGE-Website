import { Transform } from "class-transformer";
import { IsNumber, IsPositive } from "class-validator";
import { SanitizeHtml } from "../transformers/SanitizeHtml";
import { IsLongerThan } from "../validators/IsLongerThan";
import { IsShorterThan } from "../validators/IsShorterThan";

export class GameAddRequest
{
	@IsShorterThan(64)
	@SanitizeHtml()
	name : string;

	@IsShorterThan(32)
	@SanitizeHtml()
	nameShort : string;

	@IsShorterThan(42)
	@SanitizeHtml()
	brief : string;

	@IsShorterThan(42)
	@SanitizeHtml()
	tagline : string;

	@IsShorterThan(32)
	@SanitizeHtml()
	heading : string;

	@IsShorterThan(2048)
	@IsLongerThan(256)
	@SanitizeHtml(["br"])
	text : string;

	@IsPositive()
	@IsNumber()
	@Transform((val) => typeof val == "number" ? val : parseInt(val))
	position : number;
}