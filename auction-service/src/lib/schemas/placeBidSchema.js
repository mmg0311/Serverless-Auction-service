const schema = {
   properties: {
      body: {
         type: 'object',
         properties: {
            amount: {
               type: 'number',
            },
         },
         required: ['amount']
      }
   },
   required: [
      'body',
   ],
};

export default schema;
//FOR AUTH0 CONNECTION PASTE THIS IN THE TERMINAL
// curl --location --request POST "https://YOUR_AUTH0_DOMAIN/oauth/token" 
// --header "Content-Type: application/x-www-form-urlencoded" 
// --data-urlencode "client_id=YOUR_AUTH0_CLIENT_ID" 
// --data-urlencode "username=YOUR_USERNAME" 
// --data-urlencode "password=YOUR_PASSWORD" 
// --data-urlencode "grant_type=password" 
// --data-urlencode "scope=openid"
//curl --location --request POST "https://aws-auth.eu.auth0.com/oauth/token" --header "Content-Type: application/x-www-form-urlencoded" --data-urlencode "client_id=f9hGr04RiFKhDM0FujbbuGm6Hik0IQtq" --data-urlencode "username=mohakgadge@gmail.com" --data-urlencode "password=Naruto@Hokage" --data-urlencode "grant_type=password" --data-urlencode "scope=openid"