import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsUUID } from "class-validator";

export class ReplyCommentParam {
    @ApiProperty({ description: 'Id of comment' })
    @IsUUID()
    @IsNotEmpty()
    id: string;

    @ApiProperty({ description: 'Id of reply comment' })
    @IsUUID()
    @IsNotEmpty()
    replyId: string;
}
