import { Profile as DiscordProfile } from 'passport-discord';
import { NoSeoIndexing } from "../middlewares/NoSeoIndexing.mdlw";
import { SiteUser } from "../entities/siteUser.ent";
import { DiscordBot } from '../../services/_services';
import { File, imgUploadOptions } from '../../config/_configs';
import {
	JsonController,
	Get,
	Render,
	CurrentUser,
	UseBefore,
	Post,
	Authorized,
	UploadedFiles,
	Body,
	BadRequestError,
	UploadedFile, Redirect
} from "routing-controllers";

/*** Render Data ***/
import { CommitteeRender } from './render_interfaces/CommitteeRender';

/*** Request Bodies ***/
import { UserAddRequest } from "./request_bodies/UserAddRequest";
import { UserUpdateRequest } from "./request_bodies/UserUpdateRequest";
import { UserDeleteRequest } from "./request_bodies/UserDeleteRequest";

/*** Response Bodies ***/
import { UserAddResponse } from "./response_bodies/UserAddResponse";
import { UserUpdateResponse } from "./response_bodies/UserUpdateResponse";
import { UserDeleteResponse } from "./response_bodies/UserDeleteResponse";
import { UserImageResetRequest } from './request_bodies/UserImageResetRequest';




@JsonController("/committee")
@UseBefore(NoSeoIndexing)
export class CommitteeController
{
    @Get("/")
    @Render("committee")
    private async getCommittee(@CurrentUser({ required: false }) currentUser : DiscordProfile) : Promise<CommitteeRender>
    {
		const committee = await SiteUser.find({
			where: {
				group: "committee"
			},
			order: {
				"position": "ASC"
			}
		});

		let isCommittee = false;
		if(!!currentUser)
		{
			isCommittee = DiscordBot.Utils.CheckForRole(currentUser.id, process.env.DISCORD_GUILD_ID, [
				process.env.ADMIN_ROLE_NAME,
				process.env.COMMITTEE_ROLE_NAME
			]);
		}

        return {
			page: "committee",
            tab_title: "SVGE | Committee",
            page_title: "Committee",
			page_subtitle: "Meet the SVGE Committee",
			people: committee.map((c) => {
				return {
					user: c,
					avatar: c.avatarBase64
				};
			}),
			canEditAll: isCommittee,
			canEditSelf: undefined, // committee can edit all committee so unneeded
			peopleGroup: "Committee Member",
			endpoint: "/committee"
        };
    }

	@Post("/")
	@Redirect("/committee") // Redirect is relative to site root
	@Authorized([ process.env.COMMITTEE_ROLE_NAME, process.env.ADMIN_ROLE_NAME ])
	private async addCommittee(
		@Body() newCommittee : UserAddRequest,
		@UploadedFile("avatar", { required: false, options: imgUploadOptions }) avatar : File)
		: Promise<UserAddResponse>
	{
		console.log(`Adding committee member with username "${newCommittee.username}"!`);
		const committeeProfile = DiscordBot.Utils.getGuildMemberFromName(newCommittee.username);
		let committeeMember = await SiteUser.findOne({
			where: {
				discordId: committeeProfile.id,
				group: "committee"
			}
		});

		if(!!committeeMember) throw new BadRequestError("That user is already registered as a committee member.");

		committeeMember = await new SiteUser().newUser(newCommittee, avatar, "committee", committeeProfile.id);
		await committeeMember.save();
		await SiteUser.reorder("committee", committeeMember.uuid);

		return {
			uuid : committeeMember.uuid,
			discordUsername : committeeMember.discordUsername,
			name : committeeMember.name,
			position : committeeMember.position,
			title : committeeMember.title,
			desc : committeeMember.desc,
			message : committeeMember.message || "",
			avatarBase64 : committeeMember.avatarBase64
		};
	}

	@Post("/edit")
	@Redirect("/committee") // Redirect is relative to site root
	@Authorized([ process.env.COMMITTEE_ROLE_NAME, process.env.ADMIN_ROLE_NAME ])
	private async updateCommittee(
		@Body() updateCommittee : UserUpdateRequest,
		@UploadedFile("avatar", { required: false, options: imgUploadOptions }) avatar : File)
		: Promise<UserUpdateResponse>
	{
		console.log(`Updating committee member with uuid "${updateCommittee.uuid}".`);
		let committee = await SiteUser.findOne({
			where: {
				group: "committee",
				uuid: updateCommittee.uuid
			}
		});
		if(!committee) throw new BadRequestError("That committee member does not exist. Please stop probing our API.");

		// could move this lot into the SiteUser class
		let changed = false;
		if(!!updateCommittee.name && committee.name != updateCommittee.name)
		{
			changed = true;
			committee.name = updateCommittee.name;
		}
		let positionChanged = false;
		if(!!updateCommittee.position && committee.position != updateCommittee.position)
		{
			changed = true;
			positionChanged = true;
			committee.position = updateCommittee.position;
		}
		if(!!updateCommittee.title && committee.title != updateCommittee.title)
		{
			changed = true;
			committee.title = updateCommittee.title;
		}
		if(!!updateCommittee.desc && committee.desc != updateCommittee.desc)
		{
			changed = true;
			committee.desc = updateCommittee.desc;
		}
		if(!!updateCommittee.message && committee.message != updateCommittee.message)
		{
			changed = true;
			committee.message = updateCommittee.message;
		}
		if(committee.show != updateCommittee.show)
		{
			changed = true;
			committee.show = updateCommittee.show;
		}
		if(!!avatar)
		{
			changed = true;
			committee.setAvatar(avatar);
		}

		if(changed)
		{
			await committee.save();
			if(positionChanged)
			{
				await SiteUser.reorder("committee", committee.uuid);
			}
		}

		return {
			uuid: committee.uuid,
			discordUsername: committee.discordUsername,
			name: committee.name,
			position: committee.position,
			title: committee.title,
			desc: committee.desc,
			message: committee.message,
			avatarBase64: committee.avatarBase64
		};
	}

	@Post("/del")
	@Redirect("/committee") // Redirect is relative to site root
	@Authorized([ process.env.COMMITTEE_ROLE_NAME, process.env.ADMIN_ROLE_NAME ])
	private async deleteCommittee(
		@Body() delCommittee : UserDeleteRequest,
		/**
		 * The form includes files when invoked from the page so the data is received with enctype="multipart/form-data"
		 * we have to include the UploadedFiles decorator here to make sure it's parsed correctly
		 */ 
		@UploadedFiles("", { required: false}) imgs : File[])
		: Promise<UserDeleteResponse>
	{
		console.log(`Deleting committee member with uuid:`);
		console.log(delCommittee.uuid);
		const committee = await SiteUser.findOne({
			where: {
				group: "committee",
				uuid: delCommittee.uuid
			}
		});
		if(!committee) throw new BadRequestError("That committee member does not exist. Please stop probing our API.");

		await committee.remove();
		await SiteUser.reorder("committee");

		return;
	}

	@Post("/reset-image")
	@Redirect("/committee")
	@Authorized([ process.env.COMMITTEE_ROLE_NAME, process.env.ADMIN_ROLE_NAME ])
	private async resetPicture(
		@Body() user : UserImageResetRequest,
		@UploadedFiles("", { required: false}) imgs : File[]
	) : Promise<void>
	{
		console.log(`Resetting image for committee member with uuid:`);
		console.log(user.uuid);

		const committee = await SiteUser.findOne({
			where: {
				group: "committee",
				uuid: user.uuid
			}
		});
		if(!committee) throw new BadRequestError("That committee member does not exist. Please stop probing our API.");

		await committee.setAvatar();
		await committee.save();

		return;
	}
}

