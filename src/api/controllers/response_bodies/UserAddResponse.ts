export interface UserAddResponse
{
	uuid : string;
	discordUsername : string;
	name : string;
	position : number;
	title : string;
	desc : string;
	message : string;
	avatarBase64 : string;
	// for use in redirects, if needed
	url? : string;
}