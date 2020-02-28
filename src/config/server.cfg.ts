import { RoutingControllersOptions, Action } from "routing-controllers";
import { Auth } from "../services/auth.service";

export namespace server
{
	export const port = parseInt(process.env.EXPRESS_PORT);
	export const settings : RoutingControllersOptions = {
		controllers: [__dirname + "/../api/controllers/**/*.ctrl.ts"],
		middlewares: [__dirname + "/../api/middlewares/**/*.mdlw.ts"],
		cors: true,
		authorizationChecker: Auth.authCheck,
		currentUserChecker: Auth.userCheck
	};
}