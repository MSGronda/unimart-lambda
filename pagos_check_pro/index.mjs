import axios from 'axios';
import { DynamoDBClient, GetItemCommand  } from "@aws-sdk/client-dynamodb";
const ddb = new DynamoDBClient({region: "sa-east-1"});
import zlib from 'zlib';


async function get_record(ddb, sub){
 // UPDATE DYNAMODB 
  let params = {
    TableName: 'unimart_pagos',
    Key: {
      sub: {S: sub}
    },
    // ProjectionExpression: "ATTRIBUTE_NAME"
  };
    
    return (await ddb.send(new GetItemCommand(params))).Item;
}


async function mp_api_get(id, resp){
        const url = "https://api.mercadopago.com/preapproval/search?payer_id=" + id;

        let user_subscriptions;
        try{
            user_subscriptions = await axios.get(
            url, 
            {   headers: {
                 Authorization: "Bearer TEST-5181856037989405-112608-1d0704a57fdd650d731f57a96b8743ed-1247054484",
                 Accept: 'application/json', 
                 'Accept-Encoding': 'identity' 
                }
            });
        } catch(error){
            if(error.response){
                resp.statusCode = error.response.data.status; resp.body = error.response.data.message
                return resp;
              }
              else{
                resp.statusCode = 400; resp.body = error.message
                return resp;
              }        
        }

        if(user_subscriptions.data.results == null || user_subscriptions.data.results == undefined || user_subscriptions.data.results.length === 0){
            resp.statusCode = 200; resp.body = "false"
            return resp;
        }
        if(!user_subscriptions.data.results.at(-1).summerized && user_subscriptions.data.results.at(-1).status == 'pending'){
            resp.statusCode = 200; resp.body = "true"
            return resp;
        }
        if(user_subscriptions.data.results.at(-1).summerized.semaphore == "blank"){
            resp.statusCode = 200; resp.body = "false"
            return resp;
        }
        else{
            resp.statusCode = 200; resp.body = "true"
            return resp;
        }
}

export const handler = async(event) => {
    const event_body = JSON.parse(event.body)
    const resp = {
      'statusCode': 200,
      'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
      'body': ""
    }
    
    if(event_body.sub){
        try{
            var record = await get_record(ddb, event_body.sub);
        }
        catch(e){
            console.log(e)
            resp.statusCode = 400; resp.body = "Error finding record in DB"
            return resp;
            
        }

        
        if(!record || !record.payer_id || !record.payer_id.S){
            resp.statusCode = 200; resp.body = "false"
            return resp;
        }
        
        return await mp_api_get(record.payer_id.S, resp)
       
    }
    
    resp.statusCode = 400; resp.body = "Missing arguments"
    return resp;
};
