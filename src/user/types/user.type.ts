import { UserEntity } from '../../shared/db/entities/users/user.entity';

export type UserType = Omit<UserEntity, 'hashPassword'>;
