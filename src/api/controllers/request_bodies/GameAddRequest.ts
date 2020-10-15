import { Transform } from "class-transformer";
import { IsNumber, IsPositive } from "class-validator";
import { IsLongerThan } from "../validators/IsLongerThan";
import { IsShorterThan } from "../validators/IsShorterThan";

export class GameAddRequest
{
	@IsShorterThan(64)
	name : string;

	@IsShorterThan(32)
	nameShort : string;

	@IsShorterThan(42)
	brief : string;

	@IsShorterThan(42)
	tagline : string;

	@IsShorterThan(32)
	heading : string;

	@IsShorterThan(2048)
	@IsLongerThan(256)
	text : string;

	@IsPositive()
	@IsNumber()
	@Transform((val) => typeof val == "number" ? val : parseInt(val))
	position : number;
}