import { Transform } from "class-transformer";

export const RemoveSpaceBeforeDiscriminator : PropertyDecorator = Transform((u : string) => u.trim().replace(/[ ]*#/, "#"));