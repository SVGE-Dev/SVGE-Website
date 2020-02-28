import * as Discord from 'discord.js';
const debug = require('debug')("discord");

export namespace DiscordBot
{
    const client = new Discord.Client();

    export const init = () => {
        client.on("ready", DiscordEventHandler.ready);
        client.on("message", DiscordEventHandler.message);

        client.login(process.env.DISCORD_BOT_TOKEN as string);
    };

    namespace DiscordEventHandler
    {
        export const ready = () => {
            debug(`Logged into Discord as ${client.user.tag}!`);
        };

        export const message = () => {};
    }

    export namespace Utils
    {
        export const CheckForRole = (userId : string, guildId : string, roles : string[]) : boolean =>
        {
            if(roles.length == 0) return true;

            const guild : Discord.Guild | undefined = client
                .guilds
                .get(guildId);
            if (!guild)
            {
                debug(`Client is not a member of the guild with ID ${guildId}.`);
                return false;
            }

            const user : Discord.GuildMember | undefined = guild
                .members
                .find((member : Discord.GuildMember) => member.id == userId);
            if(!user)
            {
                debug(`Guild with ID ${guildId} has no member with ID ${userId}`);
                return false;
            }
            const userRoles = Array.from(user.roles.values());

            const rolesRegex = new RegExp(roles.join("|"), "i"); // "i" flag means case-insensitive
            return userRoles.some((role : Discord.Role) =>
            {
                return rolesRegex.test(role.name);
            });
        };
    }
}
