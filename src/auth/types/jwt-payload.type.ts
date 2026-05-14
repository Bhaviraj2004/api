export type JwtPayload = {
  sub: number;
  email: string;
  role: 'CA' | 'CLIENT';
};
