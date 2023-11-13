var AmazonCognitoIdentity = require('amazon-cognito-identity-js');
var AWS = require('aws-sdk/global');



exports.handler = async (event, context, callback) => {
    let body;
    const resp = {
      "statusCode": 200,
      "headers": {"Content-Type": "application/json", 'Access-Control-Allow-Origin': '*'},
      "body": ""
    }
    
    if (event.body && (body = JSON.parse(event.body)) && body.email && body.password){
        var authenticationData = {
    	    Username: body.email,
    	    Password: body.password,
        };
        var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(
        	authenticationData
        );
        var poolData = {
        	UserPoolId: 'sa-east-1_qCLXmA2ne',
        	ClientId: '1o94ivikek103hv4f30t2procj',
        };
        var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
        var userData = {
        	Username: body.email,
        	Pool: userPool,
        };
        var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
        
        const response = new Promise((resolve, reject)=> {
            cognitoUser.authenticateUser(authenticationDetails, {
        	onSuccess: function(result) {
        	 
        		var accessToken = result.getAccessToken().getJwtToken();
        
        		//POTENTIAL: Region needs to be set if not already set previously elsewhere.
        		AWS.config.region = 'sa-east-1';
                
                /*
        		AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        			IdentityPoolId: '...', // your identity pool id here
        			Logins: {
        				// Change the key below according to the specific region your user pool is in.
        				'cognito-idp.<region>.amazonaws.com/<YOUR_USER_POOL_ID>': result
        					.getIdToken()
        					.getJwtToken(),
        			},
        		});
        		*/
        	
        		//refreshes credentials using AWS.CognitoIdentity.getCredentialsForIdentity()
        		AWS.config.credentials.refresh(error => {
        			if (error) {
        				console.error(error);
        			} else {
        				// Instantiate aws sdk service objects now that the credentials have been updated.
        				// example: var s3 = new AWS.S3();
        				console.log('Successfully logged!');
        			}
        		});
        		
        		
        		resp.statusCode = 200
        		resp.body = JSON.stringify(cognitoUser)
        		resolve(resp);
        	},
        
        	onFailure: function(err) {
        	    resp.statusCode = 400
        		resp.body = JSON.stringify(err)
        		resolve(resp);
        	},
            });
        });
        
        return response;
    }
    resp.statusCode = 400
    resp.body = "Missing or invalid parameters"
    
    return resp;
};
