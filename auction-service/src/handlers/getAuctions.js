import AWS from 'aws-sdk';
import validator from '@middy/validator';
import commonMiddleware from '../lib/commonMiddleware';
import getAuctionsSchema from '../lib/schemas/getAuctionsSchema';
import createError from 'http-errors';


const dynamoDB = new AWS.DynamoDB.DocumentClient;

async function getAuctions(event, context) {
   let auctions;
   const { status } = event.queryStringParameters;
   const params = {
      TableName: process.env.AUCTIONS_TABLE_NAME,
      IndexName: 'StatusAndEndDate',
      KeyConditionExpression: '#status= :status',
      ExpressionAttributeValues: {
         ':status': status
      },
      ExpressionAttributeNames: {
         '#status': 'status'
      }
   };
   try {
      const result = await dynamoDB.query(params).promise();
      auctions = result.Items;
   } catch (error) {
      console.log(error);
      throw new createError.InternalServerError(error);
   }
   return {
      statusCode: 200,
      body: JSON.stringify(auctions),
   };
}

export const handler = commonMiddleware(getAuctions)
   .use(validator({ inputSchema: getAuctionsSchema, useDefaults: true }));

