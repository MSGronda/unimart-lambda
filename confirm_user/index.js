var AmazonCognitoIdentity = require('amazon-cognito-identity-js');

exports.handler = async (event, context, callback) => {
    let body;
      const resp = {
          "statusCode": 200,
          "headers": {"Content-Type": "application/json", 'Access-Control-Allow-Origin': '*'},
          "body": ""
      }
    
    if (event.body && (body = JSON.parse(event.body)) && body.email && body.code){
        
        var poolData = {
          "UserPoolId": "sa-east-1_qCLXmA2ne",
          "ClientId": "1o94ivikek103hv4f30t2procj"
        };
            
        var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
        var userData = {
            Username: body.email,
            Pool: userPool,
        };
            
        var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
        
        const response = new Promise((resolve, reject) => {
            cognitoUser.confirmRegistration(body.code, true, function(err, result) {
            if (err) {
                resp.statusCode = 400
                resp.body = JSON.stringify(result)
                resolve(resp);
            }
            else{
                resp.statusCode = 200
                resp.body = JSON.stringify(result)
                resolve(resp);
            }});  
        });
        
        return response;
    }
    
    resp.statusCode = 400
    resp.body = "Missing or invalid parameters"
    return resp;
};