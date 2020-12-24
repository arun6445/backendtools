import * as bcrypt from 'bcrypt';

export const getHash = async (text: string) => await bcrypt.hash(text, 10);

export const compareTextWithHash = async (
  text: string,
  hash: string,
): Promise<boolean> => {
  return bcrypt.compare(text, hash);
};
