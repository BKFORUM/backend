import { Module } from "@nestjs/common";
import { DatabaseModule } from "src/database";
import { ForumController } from "./forum.controller";
import { ForumService } from "./forum.service";


@Module({
  imports: [DatabaseModule],
  controllers: [ForumController],
  providers: [ForumService],
  exports: [ForumService],
})
export class ForumModule {}
