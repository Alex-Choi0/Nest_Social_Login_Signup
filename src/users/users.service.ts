import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto) {
    let email = '';

    try {
      if (dto.token.length <= 0) {
        throw new HttpException(
          '소셜로그인 Access 토큰이 비어있습니다. 확인 부탁드립니다.',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (dto.platform === 'naver') {
        email = await this.naverSocial(dto.token);
      }

      console.log('email : ', email);

      if (!email) {
        throw new HttpException(
          `해당 플랫폼(${dto.platform})에 email을 요청했는데 비어있습니다. 확인 부탁드립니다.`,
          HttpStatus.GONE,
        );
      }

      await this.userRepository.save(
        this.userRepository.create({
          email,
          plateform: dto.platform,
        }),
      );

      return true;
    } catch (err) {
      console.log('Error 발생 : ', err);
      throw new HttpException(err, err.status ? err.status : 500);
    }
  }

  async login(dto: LoginUserDto) {
    try {
      let email = '';

      if (dto.token.length <= 0) {
        throw new HttpException(
          '소셜로그인 Access 토큰이 비어있습니다. 확인 부탁드립니다.',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (dto.platform === 'naver') {
        email = await this.naverSocial(dto.token);
      }

      console.log('email : ', email);

      if (!email) {
        throw new HttpException(
          `해당 플랫폼(${dto.platform})에 email을 요청했는데 비어있습니다. 확인 부탁드립니다.`,
          HttpStatus.GONE,
        );
      }

      const userData = await this.userRepository.findOne({
        email,
      });

      console.log('error1');

      if (!userData) {
        throw new HttpException(
          `해당 플랫폼(${dto.platform})에 대한 email정보가 존재하지 않습니다. 소셜 회원가입을 진행해 주시기 바랍니다.`,
          HttpStatus.GONE,
        );
      }

      return true;
    } catch (err) {
      console.log('Error 발생(social login) : ', err);
      throw new HttpException(err['response'], err.status ? err.status : 500);
    }
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  // 네이버 소셜로그인
  async naverSocial(token: string) {
    console.log('request naverSocial');
    return await axios // Axios으로 GET요청
      .get('https://openapi.naver.com/v1/nid/me', {
        headers: {
          Authorization: `Bearer ${token}`, // 프런트에서 받은 토큰
        },
      })
      .then((response) => {
        console.log('response : ', response.data);
        // 해당 소셜 유저의 Email을 확인한다.
        return response.data['response']['email'];
      })
      .catch((err) => {
        console.log('naver auth error : ', err['response']['data']['message']);
        throw new HttpException(err['response']['data']['message'], 500);
      })
      .finally(() => {
        console.log('naver oauth request finish');
      });
  }
}
