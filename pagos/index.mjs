import axios from 'axios';
import { DynamoDBClient, UpdateItemCommand  } from "@aws-sdk/client-dynamodb";
const ddb = new DynamoDBClient({region: "sa-east-1"});

async function update_dynmamodb(ddb, sub, payer_id, subscription_id){
 // UPDATE DYNAMODB 
  let params = {
    TableName: 'unimart_pagos',
    Key: {
      sub: {S: sub}
    },
    UpdateExpression: 'set payer_id = :r, subscription_id = :q',
    ExpressionAttributeValues: {
      ':r': {S: payer_id},
      ':q': {S: subscription_id}
    },
    ReturnValues: 'NONE'
  };
    
    await ddb.send(new UpdateItemCommand(params));
}


async function mp_api_call(back_url, payer_email){

    // API post setup
    const url = "https://api.mercadopago.com/preapproval";
    const body = {
      reason: "Suscripción a Unimart Pro",
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: 100,
        currency_id: "ARS"
      },
      back_url: back_url,
      payer_email: payer_email
    };

  return await axios.post(url, body,
  { headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer TEST-5181856037989405-112608-1d0704a57fdd650d731f57a96b8743ed-1247054484`
    }
  });
}

export const handler = async(event) => {
  const event_body = JSON.parse(event.body);
  const resp = {
      'statusCode': 200,
      'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
      'body': ""
  }

  if(event_body.payer_email && event_body.back_url && event_body.sub){

    let subscription;
    try{
      subscription = await mp_api_call(event_body.back_url, event_body.payer_email);
    } catch(error){
      if(error.response){
        resp.statusCode = 400; resp.body = error.response.data.message
        
        return resp;
      }
      else{
        resp.statusCode = 400; resp.body = error.message
        return resp;
      }
    }
    
    // if(!subscription || !subscription.data|| !subscription.data.payer_id || subscription.data.id){
    //   resp.statusCode = 400; resp.body = "Error with MP"
    //   return resp;
    // }
    
  console.log(subscription)
    
    
  try{
      await update_dynmamodb(ddb, event_body.sub, subscription.data.payer_id.toString(10), subscription.data.id);
  }
  catch(e) {
    console.log(e)
    resp.statusCode = 400; resp.body = "Error updating record in DB"
    return resp;
            
  }
    
    resp.statusCode = 200; resp.body = subscription.data.init_point;
    return resp;
    
  }
  
  resp.statusCode = 400; resp.body ="Error: You must provide a payer_email, back_url and sub";
  return resp;
};