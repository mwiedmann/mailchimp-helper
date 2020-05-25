# Mailchimp Batch Processing
The purpose of this is to help automate some of the bulk processing in Mailchimp that is not available through their UI. For instance, adding existing Tags to members is not completely supported in bulk through their UI. You can only use their bulk UI to add NEW tags to members. There are other processes as well where it is easier to use their API.

## Mailchimp does not support CORS
The original plan was to just create a browser UI and submit requests to their API from there. I immediately learned that Mailchimp's API does not support CORS so there is a small Node Express server that acts as a proxy of sorts. It accepts requests from the browser, does some formatting, and makes the batch API call.

## Client
The client is a React/Bootstrap app. Start it with `yarn start` and hit http://localhost:3000 to start working.

## Server
The server is a Node Express server. Start it with `yarn start-server`. It listens on port 3002.

## Batch processing and errors
The server is configured to wait for the Mailchimp batch processing to complete. If there are errors in the batch, the batch ID and response for each command in the batch can be seen in the server console.
