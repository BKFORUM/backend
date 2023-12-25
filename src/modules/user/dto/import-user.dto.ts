import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class ImportUserDto {
  @IsArray()
  @ValidateNested()
  @ArrayMinSize(1)
  @IsNotEmpty()
  entities: CreateUserDto[];
}
