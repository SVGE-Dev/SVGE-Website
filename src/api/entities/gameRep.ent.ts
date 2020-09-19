import { Game } from "./game.ent";
import { BaseEntity, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class GameRep extends BaseEntity
{
	@PrimaryGeneratedColumn("increment")
	private id : number;

	@ManyToOne((type) => Game, (game : Game) => game.reps)
	game : Game;
}