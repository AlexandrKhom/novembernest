import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';
import { UserEntity } from '../shared/db/entities/users/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { sign } from 'jsonwebtoken';
import { JWT_SECRET } from '../config';
import { UserResponseInterface } from './types/userResponse.interface';
import { LoginUserDto } from './dto/loginUser.dto';
import { compare } from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const userEmail = await this.userRepository.findOne({
      email: createUserDto.email,
    });
    const userUserName = await this.userRepository.findOne({
      username: createUserDto.username,
    });

    if (userEmail || userUserName) {
      throw new HttpException(
        'email or username r taken',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const newUser = new UserEntity();
    Object.assign(newUser, createUserDto);
    return await this.userRepository.save(newUser);
  }

  async login(loginUserDto: LoginUserDto): Promise<UserEntity> {
    const user = await this.userRepository.findOne(
      {
        email: loginUserDto.email,
      },
      { select: ['id', 'image', 'email', 'username', 'password'] },
    );
    if (!user) {
      throw new HttpException('not valid', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const userPassword = await compare(loginUserDto.password, user.password);
    if (!userPassword) {
      throw new HttpException('not valid', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    // delete user.password;
    return user;
  }

  findById(id: number): Promise<UserEntity> {
    return this.userRepository.findOne(id);
  }

  generateJwt(user: UserEntity): string {
    return sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      JWT_SECRET,
    );
  }

  buildUserResponse(user: UserEntity): UserResponseInterface {
    delete user.password;
    return {
      user: {
        ...user,
        token: this.generateJwt(user),
      },
    };
  }
}
