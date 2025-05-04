import { Client, Account } from 'appwrite';

export const client = new Client();

client
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('67fd15500033a79bba77'); 

export const account = new Account(client);
export { ID } from 'appwrite';
