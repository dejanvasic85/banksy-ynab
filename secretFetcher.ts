import { SecretsManager } from 'aws-sdk';

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
