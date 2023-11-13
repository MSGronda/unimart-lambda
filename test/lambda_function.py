import boto3
import json


def lambda_handler(event, context):
    # abro la tabla
    client = boto3.resource("dynamodb")
    table = client.Table('test-db')
    
    #pongo un item
    Item={"test-id": "aaa", "nombre" : "doritosssss", "precio" : 303330, "codigo": 123134323123}
    table.put_item(Item)
    
    
    
    
    
    
    
    
    
    
    #string = "no"
    
    # leo de la tabla
    #response = table.get_item(Key={"test-id": "1235"})
    #if "Item" in response:
    #    string = response["Item"]["lista"]
        
    #print(string)
    
    
    return None
