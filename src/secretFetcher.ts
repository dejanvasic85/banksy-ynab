import { SecretsManager } from 'aws-sdk';
import { UserConfig } from './types';

const client = new SecretsManager({
  region: 'ap-southeast-2',
});

export const getSecret = async (secretName: string): Promise<string> => {
  console.log(`Fetching secret [${secretName}] please wait...`);
  try {
    const data = await client.getSecretValue({ SecretId: secretName }).promise();
    return data.SecretString;
  } catch (err) {
    console.error(`Failed fetching secret.`, err);
    return null;
  }
};

export const getUserConfigSecret = async (username: string) : Promise<UserConfig> => {
  const data = await getSecret(username);
  const userConfig : UserConfig = JSON.parse(data);
  return userConfig;
}