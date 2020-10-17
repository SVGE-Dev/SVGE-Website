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
    private async getCommittee(@CurrentUser({ required: false }) currentUser? : DiscordProfile) : Promise<CommitteeRender>
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
			endpoint: "/committee",
			user_logged_in: !!currentUser,
			canonical: `${process.env.DOMAIN || "https://svge.uk"}/committee`,
			desc: "The University of Southampton Video Games and Esports Society's committee are committed to providing our members with the absolute best gaming experience.",
			ogImage: `${process.env.DOMAIN || "https://svge.uk"}/images/hero_bg_1.jpg`
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
		let commMember = await SiteUser.findOne({
			where: {
				discordId: committeeProfile.id,
				group: "committee"
			}
		});

		if(!!commMember) throw new BadRequestError("That user is already registered as a committee member.");

		commMember = await new SiteUser().newUser(newCommittee, avatar, "committee", committeeProfile.id);
		await commMember.save();
		await commMember.reorderAroundUser();

		return {
			uuid : commMember.uuid,
			discordUsername : commMember.discordUsername,
			name : commMember.name,
			position : commMember.position,
			title : commMember.title,
			desc : commMember.desc,
			message : commMember.message || "",
			avatarBase64 : commMember.avatarBase64
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
		let commMember = await SiteUser.findOne({
			where: {
				group: "committee",
				uuid: updateCommittee.uuid
			}
		});
		if(!commMember) throw new BadRequestError("That committee member does not exist. Please stop probing our API.");

		commMember = await commMember.UpdateFromForm(updateCommittee, avatar);

		return {
			uuid: commMember.uuid,
			discordUsername: commMember.discordUsername,
			name: commMember.name,
			position: commMember.position,
			title: commMember.title,
			desc: commMember.desc,
			message: commMember.message,
			avatarBase64: commMember.avatarBase64
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
		await SiteUser.reorderGroup("committee");

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

