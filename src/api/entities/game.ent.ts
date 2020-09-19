import { BaseEntity, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { GameRep } from "./gameRep.ent";

@Entity()
export class Game extends BaseEntity
{
	@PrimaryGeneratedColumn("increment")
	private id : number;

	@OneToMany((type) => GameRep, (rep : GameRep) => rep.game)
	reps : GameRep[];
}