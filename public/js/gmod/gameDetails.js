// https://wiki.facepunch.com/gmod/Loading_URL

/*
Called at the start, when the loading screen finishes loading all assets:

	serverName - Server's name.
		Convar: hostname
		For exmaple: "Garry's Mod Server"

	serverURL - URL for the loading screen. 
		Convar: sv_loadingurl
		For example: "http://mywebsite.com/myloadingscreen.html"

	mapName - The name of the map the server is playing. 
		For example: "cs_office"
		
	maxPlayers - Maximum number of players for the server.
		Convar: maxplayers

	steamID - 64-bit, numeric Steam community ID of the client joining. 
		For example: 76561198012345678

	gamemode - The gamemode the server is currently playing. 
		Convar: gamemode
		For example: "deathrun"
*/
function GameDetails(servername, serverurl, mapname, maxplayers, steamid, gamemode) {

}