import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from "typeorm";
import { IsString } from "class-validator";



@Entity()
export class GmodQuote extends BaseEntity
{
    @PrimaryGeneratedColumn("uuid")
    uuid : string;

    @Column({type: "varchar", length: 32})
    @IsString()
    author : string;

    @Column({type: "varchar", length: 128})
    @IsString()
    quote : string;
}