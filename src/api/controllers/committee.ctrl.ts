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
	UseBefore, Post, Authorized, Body, BadRequestError, UploadedFile, Put, Delete
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



@JsonController("/committee")
@UseBefore(NoSeoIndexing)
export class CommitteeController
{
    @Get("/")
    @Render("committee")
    private async getCommittee(@CurrentUser({ required: false }) user : DiscordProfile) : Promise<CommitteeRender>
    {
		const committee = await SiteUser.find({
			where: {
				group: "committee"
			},
			order: {
				"position": "ASC"
			}
		});

		

		const isCommittee = !!user && !!committee.find((c) => c.discordId == user.id);

        return {
			page: "committee",
            tab_title: "SVGE | Committee",
            page_title: "Committee",
			page_subtitle: "Meet the SVGE Committee",
			committee: committee.map((c) => {
				return {
					user: c,
					avatar: c.avatarBase64
				}
			}),
			userIsCommittee: isCommittee,
            custom_css: [ "/css/jquery-sortable.css" ],
            custom_scripts: [ "/js/jquery-sortable.js" ]
        };
    }

	@Post("/")
	//@Authorized([ process.env.COMMITTEE_ROLE ])
	private async addCommittee(
		@Body() newCommittee : UserAddRequest,
		@UploadedFile("avatar", { required: false, options: imgUploadOptions }) avatar : File)
		: Promise<UserAddResponse>
	{
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
			message : committeeMember.message,
			avatarBase64 : committeeMember.avatarBase64
		};
	}

	@Put("/")
	@Authorized([ process.env.COMMITTEE_ROLE ])
	private async updateCommittee(
		@Body() updateCommittee : UserUpdateRequest,
		@UploadedFile("avatar", { required: false, options: imgUploadOptions }) avatar : File)
		: Promise<UserUpdateResponse>
	{
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
		if(updateCommittee.resetAvatar)
		{
			if(committee.avatarIsCustom)
			{
				changed = true;
				await committee.setAvatar(); // reset it
			}
		}
		else
		{
			if(!!avatar)
			{
				changed = true;
				await committee.setAvatar(avatar);
			}
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

	@Delete("/")
	@Authorized([ process.env.COMMITTEE_ROLE ])
	private async deleteCommittee(
		@Body() delCommittee : UserDeleteRequest)
		: Promise<UserDeleteResponse>
	{
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
}

