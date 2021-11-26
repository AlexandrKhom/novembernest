import { Request } from 'express';
import { UserEntity } from '../shared/db/entities/users/user.entity';

export interface ExpressRequestInterface extends Request {
  user?: UserEntity;
}
