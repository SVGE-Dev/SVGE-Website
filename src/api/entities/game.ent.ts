import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Game extends BaseEntity
{
	@PrimaryGeneratedColumn("uuid")
	uuid : string;

	@Column({ type: "varchar", length: 64 })
	name : string;

	// used for the URL and on the game list
	@Column({ type: "varchar", length: 32 })
	nameShort : string;

	// On the list of games, this is the upper line in the black box
	@Column({ type: "varchar", length: 64 })
	brief : string;

	// On the list of games, this is the lower line in the black box
	@Column({ type: "varchar", length: 64 })
	tagline : string;

	// heading above the main text on the game's page
	@Column({ type: "varchar", length: 64 })
	heading : string;

	// the text that appears on the game's page
	@Column({ type: "varchar", length: 2048 })
	text : string;

	// this is the image on the game's main page, cropped to 1920x1080
	@Column({type: "mediumblob"})
	img : Buffer;
	
	// this is the image that is used for the list of games, cropper to 1024x1024
	@Column({type: "mediumblob"})
	icon : Buffer;

	// position in list of games
	@Column()
	position : number;

	// the url is the short name but with dashes instead of spaces
	@Column({ type: "varchar", length: 26 })
	url : string;


	public get imgBase64()
	{
		return `data:image/png;base64,${this.img.toString("base64")}`;
	}

	public get iconBase64()
	{
		return `data:image/png;base64,${this.icon.toString("base64")}`;
	}

	// This function is something that could possibly be moved to a utils function so that both SiteUser and Game can use it.
	// Would probably require changing the primary column for one of the two though
	/**
	 * Re-orders the games.
	 * 
	 * @param {string} splitGameId The ID of the element to being re-ordering from
	 */
	public static async reorder(splitGameId? : string)
	{
		const games = await Game.find({
			select: [
				"uuid",
				"position"
			],
			order: {
				position: "ASC"
			}
		});

		if(!!splitGameId)
		{

			const splitGame = games.find((u) => u.uuid == splitGameId);
			if(!splitGame) return;

			const splitPosition = splitGame.position;

			const sortedGames = games.filter((u) => u.uuid != splitGameId && u.position >= splitGame.position);
			for(const sortedUser of sortedGames)
			{
				sortedUser.position += 1;
			}

			await Game.save(sortedGames);
		}
		else
		{
			let pos = 1;
			for(const game of games)
			{
				game.position = pos++;
			}
			await Game.save(games);
		}
	}
}