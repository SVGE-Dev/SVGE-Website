import { RoutingControllersOptions } from "routing-controllers";
import { Auth } from "../services/auth.service";
import { AuthController } from "../api/controllers/auth.ctrl";
import { CommitteeController } from "../api/controllers/committee.ctrl";
import { GamesController } from "../api/controllers/games.ctrl";
import { GmodSplashController } from "../api/controllers/gmod.ctrl";
import { IndexController } from "../api/controllers/index.ctrl";
import { PacmanController } from "../api/controllers/pacman.ctrl";

export namespace server
{
	export const port = parseInt(process.env.EXPRESS_PORT || "3000");
	export const settings : RoutingControllersOptions = {
		controllers: [
			AuthController,
			CommitteeController,
			GamesController,
			GmodSplashController,
			IndexController,
			PacmanController
		],
		//middlewares: [__dirname + "/../api/middlewares/**/*.mdlw.{ts,js}"],
		//cors: true,
		cors: false,
		authorizationChecker: Auth.authCheck,
		currentUserChecker: Auth.userCheck
	};
}