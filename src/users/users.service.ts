/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { RegisterDto } from 'src/jwt-auth/dto/create-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(private readonly db: DatabaseService) {}

  async createUser(data: RegisterDto, password: string) {
    const isUserExist = await this.db.user.findUnique({
      where: { email: data.email },
    });

    if (isUserExist)
      throw new ConflictException('User with this email already exists');

    try {
      const user = await this.db.user.create({
        data: {
          name: data.name,
          passwordHash: password,
          email: data.email,
        },
      });
      const { passwordHash, ...userWithoutPass } = user;
      return userWithoutPass;
    } catch (error) {
      this.logger.error('Error creating user', error.message);
    }
  }
  async findUserById(userId: string) {
    try {
      const user = await this.db.user.findUnique({
        where: {
          id: userId,
        },
      });
      if (!user) throw new NotFoundException('User not found');
      const { passwordHash, ...userWithoutPass } = user;
      return userWithoutPass;
    } catch (error) {
      this.logger.error('Error finding user', error.message);
    }
  }
  async findUserByEmail(email: string) {
    try {
      const user = await this.db.user.findUnique({
        where: {
          email: email,
        },
      });
      if (!user) throw new NotFoundException('Invalid email, user not found');

      return user;
    } catch (error) {
      this.logger.error('Error finging user', error.message);
    }
  }
}
