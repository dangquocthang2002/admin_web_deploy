export interface LoginData {
  username: string;
  password: string;
}

export interface ChangePassWordData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileData {
  name: string;
  email: string;
  phoneNumber: string;
}

export interface IAccount {
  _id: string;
  userName: string;
  email: string;
}

export interface IRole {
  _id: string;
  roleName: string;
}

export interface IUser {
  _id: number;
  account?: IAccount;
  Roles: IRole[];
  gender: boolean;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  Address: string;
  dayOfBirth: string;
  firstName: string;
  isActive: "ACTIVE";
  lastName: string;
  phone: string | number;
  profilePicture: string;
}

export interface ICredential {
  token: string;
}
