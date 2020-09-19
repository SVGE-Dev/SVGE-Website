import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";
import { IsString, IsBoolean, IsPositive, IsNumber } from "class-validator";



@Entity()
export class Committee extends BaseEntity
{
    @PrimaryGeneratedColumn("uuid")
    private id : string;



    /*** Committee Position Info ***/

    @Column({type: "varchar", length: 32})
    @IsString()
    posName : string;

    @Column({type: "varchar", length: 256})
    @IsString()
    posDesc : string;

    @Column({type: "tinyint"})
    @IsNumber()
    @IsPositive()
    posOrder : number;

    @Column({type: "boolean"})
    @IsBoolean()
    isMainCommitteePos : boolean;

    @Column({type: "mediumblob"})
    avatar : Buffer;

    @Column({type: "boolean"})
    @IsBoolean()
    customAvatar : boolean = false;



    /*** Committee Member Info ***/

    @Column({type: "varchar", length: 32})
    @IsString()
    discordId : string;

    @Column({type: "varchar", length: 32})
    @IsString()
    memberName : string;

    @Column({type: "varchar", length: 32})
    @IsString()
    username : string;



    // move all of the "new member" stuff into here, make "discordId" field private again (though this is needed for checking stuff... Maybe make a "check" member function here?)

    // have the "update" function in here too

    public PageInfo()
    {
        return {
            name: this.memberName,
            pos_name: this.posName,
            pos_desc: this.posDesc,
            username: this.username,
            user_id: this.discordId,
            avatar: `data:image/png;base64, ${this.avatar.toString("base64")}`
        };
    }
}