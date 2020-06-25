import AWS from 'aws-sdk';
import commonMiddleware from '../lib/commonMiddleware';
import createError from 'http-errors';
import { getAuctionById } from './getAuction';
import validator from '@middy/validator';
import placeBidSchema from '../lib/schemas/placeBidSchema';
const dynamoDB = new AWS.DynamoDB.DocumentClient;

async function placeBid(event, context) {
   const { id } = event.pathParameters;
   const { amount } = event.body;
   const { email } = event.requestContext.authorizer;
   const auction = await getAuctionById(id);
   //Bid Identity validator
   if (email === auction.seller) {
      throw new createError.Forbidden('YOU CANNOT BID ON YOUR OWN AUCTION');
   }
   //Avoid double bidding
   if (email === auction.highestBid.bidder) {
      throw new createError.Forbidden('YOU ALREADY HAVE THE HIGHEST BID');
   }
   //Auction status validator
   if (auction.status !== 'OPEN') {
      throw new createError.Forbidden('YOU CANNOT BID ON CLOSE AUCITONS');
   }
   // Bid amount validator
   if (amount <= auction.highestBid.amount) {
      throw new createError.Forbidden(`YOUR BID AMOUNT MUST BE HIGHER THAN CURRENT ONE i.e ${auction.highestBid.amount}`);
   }
   const params = {
      TableName: process.env.AUCTIONS_TABLE_NAME,
      Key: { id },
      UpdateExpression: 'set highestBid.amount = :amount, highestBid.bidder = :bidder',
      ExpressionAttributeValues: {
         ':amount': amount,
         ':bidder': email,
      },
      ReturnValues: 'ALL_NEW',
   };
   let updatedAuction;
   try {
      const result = await dynamoDB.update(params).promise();
      updatedAuction = result.Attributes;
   } catch (error) {
      console.log(error);
      throw new createError.InternalServerError(error);
   }
   return {
      statusCode: 200,
      body: JSON.stringify(updatedAuction),
   };
}

export const handler = commonMiddleware(placeBid).use(validator({ inputSchema: placeBidSchema }));


