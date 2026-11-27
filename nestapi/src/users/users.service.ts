import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/User.js';

@Injectable()
export class UsersService {
  public constructor(
    @InjectRepository(User)
    private repository: Repository<User>,
  ) {}
  findByEmail(email: string) {
    return this.repository.findOneBy({ email });
  }
  create(data: Omit<User, 'id'>) {
    return this.repository.save(this.repository.create(data));
  }
}
