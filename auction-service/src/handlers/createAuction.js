import { v4 as uuid } from 'uuid';
import AWS from 'aws-sdk';
import validator from '@middy/validator';
import commonMiddleware from '../lib/commonMiddleware';
import createError from 'http-errors';
import auctionSchema from '../lib/schemas/createAuctionSchema';

const dynamoDB = new AWS.DynamoDB.DocumentClient;

async function createAuction(event, context) {
   const { title } = event.body;
   const { email } = event.requestContext.authorizer;//from jwt
   const now = new Date();
   const endDate = new Date();
   endDate.setHours(now.getHours() + 1);
   const auction = {
      id: uuid(),
      title,
      status: 'OPEN',
      endingAt: endDate.toISOString(),
      createdAt: now.toISOString(),
      highestBid: {
         amount: 0
      },
      seller: email
   };
   try {
      await dynamoDB.put({
         TableName: process.env.AUCTIONS_TABLE_NAME,
         Item: auction
      }).promise();
   }
   catch (error) {
      console.log(error);
      throw new createError.InternalServerError(error)
   }
   return {
      statusCode: 201,
      body: JSON.stringify(auction),
   };
}

export const handler = commonMiddleware(createAuction)
   .use(validator({ inputSchema: auctionSchema }));


