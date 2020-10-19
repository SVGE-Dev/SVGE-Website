import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from "typeorm";
import { IsString } from "class-validator";
import { File } from "../../config/_configs";
import { cropAndResize } from "../../utils/cropAndResize";



@Entity()
export class GmodImage extends BaseEntity
{
	constructor(screenshot : Buffer, mimeType : string)
	{
		super();
		this.screenshot = screenshot;
		this.mimeType = mimeType;
	}

	public static async Create(file : File) : Promise<GmodImage>
	{
		const screenshot = await cropAndResize(1920, 1080, file.buffer);
		return new GmodImage(await screenshot.getBufferAsync(file.mimetype), file.mimetype);
	}

    @PrimaryGeneratedColumn("uuid")
    uuid : string;

    @Column({ type: "mediumblob" })
	screenshot : Buffer;

	@Column({ type: "varchar", length: 16 })
	mimeType : string;
	
	public get screenshotBase64() { return `data:${this.mimeType};base64,${this.screenshot.toString("base64")}`; }
}