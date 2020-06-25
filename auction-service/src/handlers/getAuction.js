import AWS from 'aws-sdk';
import commonMiddleware from '../lib/commonMiddleware';
import createError from 'http-errors';

const dynamoDB = new AWS.DynamoDB.DocumentClient;

export async function getAuctionById(id) {
   let auction;
   try {
      const result = await dynamoDB.get({
         TableName: process.env.AUCTIONS_TABLE_NAME,
         Key: { id }
      }).promise();
      auction = result.Item;
   } catch (error) {
      throw new createError.InternalServerError(error);
   }
   if (!auction) {
      throw new createError.NotFound(`Auction with ${id} not found`);
   }
   return auction;
}

async function getAuction(event, context) {
   let auction;
   const { id } = event.pathParameters;
   auction = await getAuctionById(id);
   return {
      statusCode: 200,
      body: JSON.stringify(auction),
   };
}

export const handler = commonMiddleware(getAuction);


