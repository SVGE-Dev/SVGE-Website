import { RoutingControllersOptions } from "routing-controllers";
import { Auth } from "../services/auth.service";

export namespace server
{
	export const port = parseInt(process.env.EXPRESS_PORT || "3000");
	export const settings : RoutingControllersOptions = {
		controllers: [__dirname + "/../api/controllers/**/*.ctrl.{ts,js}"],
		//middlewares: [__dirname + "/../api/middlewares/**/*.mdlw.{ts,js}"],
		cors: true,
		authorizationChecker: Auth.authCheck,
		currentUserChecker: Auth.userCheck
	};
}