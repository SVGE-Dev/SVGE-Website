import axios from "axios";
import { IsInt, IsPositive } from "class-validator";
import { GuildMember } from "discord.js";
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";
import { File } from "../../config/_configs";
import { DiscordBot } from "../../services/_services";
import { cropAndResize } from "../../utils/cropAndResize";


@Entity()
export class SiteUser extends BaseEntity
{
    @PrimaryGeneratedColumn("uuid")
	private uuid : string;
	
	@Column({type: "varchar", length: 32})
    discordId : string;

	@Column({ type: "varchar", length: 37 })
	discordUsername : string;

	// the person's name that they want to show on the site
	@Column({ type: "varchar", length: 24 })
	name : string;

	// this is the group of users that this entry belongs to, such as committee members, esports team members etc.
	@Column({type: "varchar", length: 32 }) // 26 character limit of a game's URL, plus enough space for "_reps" or "_team"
	group : string;

	// position in a list of users in this group
	@IsPositive()
	@IsInt()
	@Column()
	position : number;

	// this could be a committee position name, rep name, etc...
	@Column({ type: "varchar", length: 32 })
	title : string;

	// a slightly longer piece of text, such as the description of a committee position
	@Column({type: "varchar", length: 128 })
	desc : string;

	// a much longer piece of text, such as about them, about what they can do for you, etc
	@Column({ type: "varchar", length: 1024 })
	message : string = "";

	@Column({ type: "mediumblob" })
	avatar : Buffer;

	@Column({ type: "boolean" })
	avatarIsCustom : boolean = false;

	private discordGuildMember : GuildMember | undefined;


	public async setAvatar(img? : File) : Promise<boolean>
	{
		const imgBuffer = img?.buffer || await this.discordAvatar();
		if(!imgBuffer) return false;

		const imgMimetype = !!img ? img.mimetype : "image/png";
		this.avatarIsCustom = !!img;

		const avatar = await cropAndResize(2048, 2048, imgBuffer);
		this.avatar = await avatar.getBufferAsync(imgMimetype);
		return true;
	}

	protected async discordAvatar() : Promise<Buffer | undefined>
	{
		if(!this.discordGuildMember) this.updateDiscordUser();
		if(!this.discordGuildMember) return;
		
		const res = await axios.get(this.discordGuildMember.user.avatarURL, { responseType: "arraybuffer" });
		return Buffer.from(res.data, "utf-8");
	}

	public avatarBase64()
	{
		return `data:image/png;base64,${this.avatar.toString("base64")}`;
	}

	protected updateDiscordUser()
	{
		this.discordGuildMember = DiscordBot.Utils.getGuildMemberFromId(this.discordId);
		if(!!this.discordGuildMember) this.discordUsername = this.discordGuildMember.user.username;
	}
}