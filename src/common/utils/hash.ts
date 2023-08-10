import * as bcrypt from 'bcrypt';

export const hashPassword = async (password: string) => {
  const saltRounds = Number(process.env.SALT_ROUNDS);
  const salt = await bcrypt.genSalt(saltRounds);
  return await bcrypt.hash(password, salt);
};

export const compareHash = async (input: string, hashed: string) => {
  return await bcrypt.compare(input, hashed);
};
