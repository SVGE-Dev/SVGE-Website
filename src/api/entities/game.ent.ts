import { IsString } from "class-validator";
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { GameRep } from "./gameRep.ent";

@Entity()
export class Game extends BaseEntity
{
	@PrimaryGeneratedColumn("increment")
	private id : number;

	@Column({ type: "varchar", length: 64 })
	name : string;

	@Column({ type: "varchar", length: 26 })
	nameShort : string; // used for the URL and on the game list, optional but necessary if "name" is too long

	// the url is the short name but with dashes instead of spaces
	@Column({ type: "varchar", length: 26 })
	url : string;

	// On the list of games, this is the upper line in the black box
	@Column({ type: "varchar", length: 26 })
	brief : string;

	// On the list of games, this is the lower line in the black box
	@Column({ type: "varchar", length: 26 })
	tagline : string;

	// heading above the main text on the game's page
	@Column({ type: "varchar", length: 24 })
	heading : string;

	// the text that appears on the game's page
	@Column({ type: "varchar", length: 512 })
	text : string;

	@Column({type: "mediumblob"})
	img : Buffer;

	// position in list of games
	@Column()
	position : number;

	public get imgBase64()
	{
		return `data:image/png;base64,${this.img.toString("base64")}`;
	}
}