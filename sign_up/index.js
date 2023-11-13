var AmazonCognitoIdentity = require('amazon-cognito-identity-js');
var CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
var CognitoUserAttribute = AmazonCognitoIdentity.CognitoUserAttribute;

exports.handler = async (event, context, callback) => {
  let body;
  const resp = {
      "statusCode": 200,
      "headers": {"Content-Type": "application/json", 'Access-Control-Allow-Origin': '*'},
      "body": ""
  }

  if (event.body && (body = JSON.parse(event.body)) && body.email && body.password && body.givenname 
      && body.familyname && body.birthdate){
    
    var poolData = {
      "UserPoolId": "sa-east-1_qCLXmA2ne",
      "ClientId": "1o94ivikek103hv4f30t2procj"
    };
    var userPool = new CognitoUserPool(poolData);
  
    // Define User Attributes
    var attributeList = [];
    var dataEmail = {
      "Name": "email",
      "Value": body.email
    };
    
    var dataGivenName = {
      "Name": "name",
      "Value": body.givenname
    };
    
    var dataFamilyName = {
      "Name": "family_name",
      "Value": body.familyname
    };
    
    var dataDate = {
      "Name": "birthdate",
      "Value": body.birthdate
    };
    
    var attributeEmail = new CognitoUserAttribute(dataEmail);
    attributeList.push(attributeEmail);
    var attributeGivenName = new CognitoUserAttribute(dataGivenName);
    attributeList.push(attributeGivenName);
    var attributeFamilyName = new CognitoUserAttribute(dataFamilyName);
    attributeList.push(attributeFamilyName);
    var attributeDate = new CognitoUserAttribute(dataDate);
    attributeList.push(attributeDate);
    
    const response = new Promise((resolve, reject)=> {
        
        userPool.signUp(body.email, body.password, attributeList, null, function(err, result) {
          if(err) {
            
            resp.statusCode = 400
            resp.body = JSON.stringify(err)
            resolve(resp);
          } 
          else {
            console.log('result:',result);
            var cognitoUser = result.user;
            console.log('user name is ' + cognitoUser.getUsername());
              resp.statusCode = 200
              resp.body = JSON.stringify(result)
              resolve(resp);
          }
        });
    });
    
    return response;
  }
  
  resp.statusCode = 400
  resp.body = "Missing or invalid parameters"
  return resp;
};