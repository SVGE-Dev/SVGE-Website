import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, getConnection } from "typeorm";
import { IsString } from "class-validator";

@Entity()
export class GmodQuote extends BaseEntity
{
    constructor()
    {
        super();
        GmodQuote.useConnection(getConnection("gmod"));
    }

    @PrimaryGeneratedColumn()
    id : number;

    @Column({type: "varchar", length: 32})
    @IsString()
    author : string;

    @Column({type: "varchar", length: 128})
    @IsString()
    quote : string;
}