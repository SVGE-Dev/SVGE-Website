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
		/**
	 * Re-orders the Site Users in this user's group.
	 */
	public async reorderAroundGame()
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

		const posTooHigh : boolean = (this.position > games.length);
		let pos = 1;
		for(const game of games)
		{
			if(pos == this.position) pos++; // skip over this position value, as it belongs to the pivot SiteUser
			console.log(`Pos A: ${pos}`);
			if(!posTooHigh && game.uuid == this.uuid) continue; // don't need to set its position again
			console.log(`Pos B: ${pos}`);
			game.position = pos++;
		}

		await Game.save(games);
	}

	/**
	 * Re-orders the Site Users in a given group.
	 * 
	 * @param {string} group The group to re-order
	 */
	public static async reorderGames()
	{
		const games = await Game.find({
			select: [
				"position"
			],
			order: {
				position: "ASC"
			}
		});

		for(let i = 0; i < games.length; i++)
		{
			games[i].position = i + 1;
		}
	}
}