export type JwtPayload = {
  sub: string;
  username: string;
};

export type RequestUser = {
  id: string;
  fullName: string;
  roles: string[];
};
