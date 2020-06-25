import AWS from 'aws-sdk'

const dynamoDB = new AWS.DynamoDB.DocumentClient();

export async function getEndedAuctions() {
   const now = new Date();
   const params = {
      TableName: process.env.AUCTIONS_TABLE_NAME,
      IndexName: 'StatusAndEndDate',
      KeyConditionExpression: '#status =  :status AND endingAt <= :endingAt',
      ExpressionAttributeValues: {
         ':status': 'OPEN',
         ':endingAt': now.toISOString(),
      },
      ExpressionAttributeNames: {
         '#status': 'status',
      },
   }

   const result = await dynamoDB.query(params).promise();
   return result.Items;
}