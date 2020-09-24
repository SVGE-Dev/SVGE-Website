import axios from "axios";
import { IsInt, IsPositive } from "class-validator";
import { GuildMember } from "discord.js";
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";
import { File } from "../../config/_configs";
import { DiscordBot } from "../../services/_services";
import { cropAndResize } from "../../utils/cropAndResize";
import { Profile as DiscordProfile } from 'passport-discord';


@Entity()
export class SiteUser extends BaseEntity
{
    @PrimaryGeneratedColumn("uuid")
	uuid : string | undefined;
	
	// this shouldn't be exposed on the website
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

	// either a custom photo or their Discord avatar
	@Column({ type: "mediumblob" })
	avatar : Buffer;

	// so we don't update it from Discord
	@Column({ type: "boolean" })
	avatarIsCustom : boolean = false;

	// flag for whether a user should be shown or not
	@Column({ type: "boolean" })
	show : boolean = true;

	private discordGuildMember : GuildMember | undefined;
	private discordProfile : DiscordProfile;
	public set profile(p : DiscordProfile) { this.discordProfile = p; }

	public static async findFromProfile(profile : DiscordProfile, group? : string) : Promise<SiteUser | SiteUser[]>
	{
		if(!!group)
		{
			const user = await SiteUser.findOne({
				discordId: profile.id,
				group: group
			});
			if(!!user) user.profile = profile;
			return user;
		}
		else
		{
			const users = await SiteUser.find({
				discordId: profile.id
			});
			if(!!users)
			{
				for(const user of users)
				{
					user.profile = profile;
				}
			}
			return users;
		}
	}


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

	public get avatarBase64()
	{
		return `data:image/png;base64,${this.avatar.toString("base64")}`;
	}

	protected updateDiscordUser()
	{
		this.discordGuildMember = DiscordBot.Utils.getGuildMemberFromId(this.discordId);
		if(!!this.discordGuildMember) this.discordUsername = this.discordGuildMember.user.username;
	}


	/**
	 * Re-orders the Site Users in a give group.
	 * 
	 * @param {string} group The group to re-order
	 * @param {string} splitUser The UUID of the element to being re-ordering from
	 */
	public static async reorder(group : string, splitUserUuid : string)
	{
		const users = await SiteUser.find({
			where: {
				group: group
			},
			select: [
				"uuid",
				"position"
			]
		});

		const splitUser = users.find((u) => u.uuid == splitUserUuid);
		if(!splitUser) return;

		const splitPosition = splitUser.position;

		const sortedUsers = users.filter((u) => u.uuid != splitUserUuid && u.position >= splitUser.position);
		for(const sortedUser of sortedUsers)
		{
			sortedUser.position += 1;
		}

		await SiteUser.save(sortedUsers);
	}
}