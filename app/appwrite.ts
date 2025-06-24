import { Client, Account, Databases, Query } from 'appwrite';

export const client = new Client();

client
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('67fd15500033a79bba77'); 

export const databases = new Databases(client)
export const account = new Account(client);
export const query = new Account(client);
export { ID, Databases, Query } from 'appwrite';
