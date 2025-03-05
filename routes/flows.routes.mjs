import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import { decryptRequest, encryptResponse, FlowEndpointException } from "./../flows/encryption.mjs";
import {getNextScreenTurnos} from './../flows/turno-flow.mjs'
import crypto from "crypto";

dotenv.config();

const router = express.Router();

const { APP_SECRET, PRIVATE_KEY, PASSPHRASE = "", PORT = "3000" } = process.env;


router.post("/turnos-flow", async (req, res) => {
   if (!PRIVATE_KEY) {
      throw new Error(
        'Private key is empty. Please check your env variable "PRIVATE_KEY".'
      );
    }
  
    if(!isRequestSignatureValid(req)) {
      // Return status code 432 if request signature does not match.
      // To learn more about return error codes visit: https://developers.facebook.com/docs/whatsapp/flows/reference/error-codes#endpoint_error_codes
      return res.status(432).send();
    }
  
    let decryptedRequest = null;
    try {
      decryptedRequest = decryptRequest(req.body, PRIVATE_KEY, PASSPHRASE);
    } catch (err) {
      console.error(err);
      if (err instanceof FlowEndpointException) {
        return res.status(err.statusCode).send();
      }
      return res.status(500).send();
    }
  
    const { aesKeyBuffer, initialVectorBuffer, decryptedBody } = decryptedRequest;
    console.log("💬 Decrypted Request:", decryptedBody);
  
    // TODO: Uncomment this block and add your flow token validation logic.
    // If the flow token becomes invalid, return HTTP code 427 to disable the flow and show the message in `error_msg` to the user
    // Refer to the docs for details https://developers.facebook.com/docs/whatsapp/flows/reference/error-codes#endpoint_error_codes
  
    /*
    if (!isValidFlowToken(decryptedBody.flow_token)) {
      const error_response = {
        error_msg: `The message is no longer available`,
      };
      return res
        .status(427)
        .send(
          encryptResponse(error_response, aesKeyBuffer, initialVectorBuffer)
        );
    }
    */
  
    const screenResponse = await getNextScreenTurnos(decryptedBody);
    console.log("👉 Response to Encrypt:", screenResponse);
  
    res.send(encryptResponse(screenResponse, aesKeyBuffer, initialVectorBuffer));
})

function isRequestSignatureValid(req) {
   if(!APP_SECRET) {
     console.warn("App Secret is not set up. Please Add your app secret in /.env file to check for request validation");
     return true;
   }
 
   const signatureHeader = req.get("x-hub-signature-256");
   const signatureBuffer = Buffer.from(signatureHeader.replace("sha256=", ""), "utf-8");
 
   const hmac = crypto.createHmac("sha256", APP_SECRET);
   const digestString = hmac.update(req.rawBody).digest('hex');
   const digestBuffer = Buffer.from(digestString, "utf-8");
 
   if ( !crypto.timingSafeEqual(digestBuffer, signatureBuffer)) {
     console.error("Error: Request Signature did not match");
     return false;
   }
   return true;
 }

export default router;