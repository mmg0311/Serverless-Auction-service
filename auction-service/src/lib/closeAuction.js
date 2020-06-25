import AWS from 'aws-sdk';

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();

export async function closeAuction(auction) {
   const params = {
      TableName: process.env.AUCTIONS_TABLE_NAME,
      Key: { id: auction.id },
      UpdateExpression: 'set #status = :status',
      ExpressionAttributeValues: {
         ':status': 'CLOSED',
      },
      ExpressionAttributeNames: {
         '#status': 'status',
      },
   };
   await dynamoDB.update(params).promise();
   const { title, seller, highestBid } = auction;
   const { amount, bidder } = highestBid;

   if (amount === 0) {
      await sqs.sendMessage({
         QueueUrl: process.env.MAIL_QUEUE_URL,
         MessageBody: JSON.stringify({
            subject: 'Your auction is not sold :(',
            recipient: seller,
            body: `we are very sorry to inform you that your auction titled ${title} is not sold. Try again later.s`
         }),
      }).promise();
      return;
   }

   const notifySeller = sqs.sendMessage({
      QueueUrl: process.env.MAIL_QUEUE_URL,
      MessageBody: JSON.stringify({
         subject: 'Your Item has been sold',
         recipient: seller,
         body: `Your item is sold for Rs.${amount}.`
      }),
   }).promise();
   const notifyBidder = sqs.sendMessage({
      QueueUrl: process.env.MAIL_QUEUE_URL,
      MessageBody: JSON.stringify({
         subject: 'You won action',
         recipient: bidder,
         body: `Great!! you got ${title} in auction for Rs.${amount}`
      }),
   }).promise();
   return Promise.all([notifySeller, notifyBidder]);
}