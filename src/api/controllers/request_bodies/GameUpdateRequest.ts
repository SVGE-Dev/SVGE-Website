import { Transform } from "class-transformer";
import { IsNumber, IsOptional, IsPositive, IsUUID } from "class-validator";
import { IsLongerThan } from "../validators/IsLongerThan";
import { IsShorterThan } from "../validators/IsShorterThan";


export class GameUpdateRequest
{
	@IsUUID()
	uuid : string;

	@IsOptional()
	@IsShorterThan(64)
	name? : string;

	@IsOptional()
	@IsShorterThan(32)
	nameShort? : string;

	@IsOptional()
	@IsShorterThan(32)
	brief? : string;

	@IsOptional()
	@IsShorterThan(32)
	tagline? : string;

	@IsOptional()
	@IsShorterThan(32)
	heading? : string;

	@IsOptional()
	@IsShorterThan(2048)
	@IsLongerThan(256)
	text? : string;

	@IsOptional()
	@IsPositive()
	@IsNumber()
	@Transform((val) => typeof val == "number" ? val : parseInt(val))
	position? : number;
}