export class UserResponse {
  id: number;
  name: string;
  email: string;
  emailVerified?: string;
  accessToken?: string;
  image?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export class ValidateUserRequest {
  name: string;
  email: string;
  emailVerified: boolean;
  image: string;
  accessToken: string;
  refreshToken?: string;
  provider: string;
  providerAccountId: string;
}

export class RegisterUserRequest {
  name: string;
  email: string;
  password: string;
}

export class LoginUserRequest {
  email: string;
  password: string;
}

export class UpdateUserRequest {
  name?: string;
  password?: string;
  image?: string;
  role?: UserRole;
}