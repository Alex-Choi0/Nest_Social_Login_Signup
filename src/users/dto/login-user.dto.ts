import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

export class LoginUserDto {
  @IsString()
  @IsEnum(['naver'])
  @ApiProperty({
    required: true,
    description: '소셜 로그인한 플랫폼을 입력(naver)',
    example: 'naver',
  })
  platform: string;

  @IsString()
  @ApiProperty({
    required: true,
    description: '해당 소셜 로그인 토큰',
    example: 'token',
  })
  token: string;
}
