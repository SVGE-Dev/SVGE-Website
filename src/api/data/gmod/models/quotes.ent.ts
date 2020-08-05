import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from "typeorm";
import { IsString } from "class-validator";



@Entity({ database: "svge-gmod"})
export class GmodQuote extends BaseEntity
{
    @PrimaryGeneratedColumn()
    id : number;

    @Column({type: "varchar", length: 32})
    @IsString()
    author : string;

    @Column({type: "varchar", length: 128})
    @IsString()
    quote : string;
}