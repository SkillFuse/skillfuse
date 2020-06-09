import { IsNotEmpty, IsString, IsUrl, IsArray, IsOptional, ValidateNested, IsDefined } from 'class-validator';
import { UpdateVideoDTO as IUpdateVideoDTO } from '@skillfuze/types';
import { Type } from 'class-transformer';
import { Category } from '../../categories/category.entity';

export class UpdateVideoDTO implements IUpdateVideoDTO {
  @IsNotEmpty({ message: 'Title should not be empty' })
  @IsString()
  public title: string;

  @IsString()
  @IsOptional()
  public description?: string;

  @IsUrl({}, { message: 'Thumbnail URL should be valid URL' })
  @IsOptional()
  public thumbnailURL?: string;

  @IsArray()
  @IsOptional()
  public tags?: string[];

  @IsDefined({ message: 'Category should not be empty' })
  @ValidateNested()
  @Type(() => Category)
  public category: Category;
}
