const bodyParser = require('body-parser')
const dotenv = require('dotenv')
const express = require('express')
const cors = require('cors')
const Mailchimp = require('mailchimp-api-v3')
const CryptoJS = require('crypto-js')

const startExpress = async () => {
  // Read in the environment vars
  dotenv.config()

  if (!process.env.MAILCHIMP_APIKEY) {
    throw new Error('Missing MAILCHIMP_APIKEY from environment')
  }
  if (!process.env.MAILCHIMP_LISTID) {
    throw new Error('Missing MAILCHIMP_LISTID from environment')
  }

  // Create the Express server with middleware
  const app = express()
  app.use(cors())

  // Allow the body of requests to be json
  app.use(bodyParser.json())

  // Connect the routes
  app.post('/batch', async (request, response, next) => {
    if (!request.body.emails || !request.body.tag) {
      response.status(500).send(`Invalid body. Missing 'emails' or 'tag'`)
      return
    }

    let operations

    try {
      // Create a list of MailChimp Batch commands
      // These are POSTs to create tags
      // Convert the email to its MD5 hash to use as a URL param
      operations = request.body.emails.map((e) => {
        return {
          method: 'post',
          path: `/lists/${process.env.MAILCHIMP_LISTID}/members/${CryptoJS.MD5(e).toString()}/tags`,
          body: {
            tags: [
              {
                name: request.body.tag,
                status: 'active',
              },
            ],
          },
        }
      })
    } catch (err) {
      response.status(500).send(`There was an creating the operations with the emails/tag: ${err}`)
      return
    }

    try {
      const mailchimp = new Mailchimp(process.env.MAILCHIMP_APIKEY)

      const batchResult = await mailchimp.batch(operations, {
        wait: true,
        interval: 2000,
        unpack: true,
      })
      console.log(batchResult)

      // If any of the results come back with a `type` param, it is reporting an error
      if (batchResult.filter((r) => r.type).length) {
        response
          .status(500)
          .send(`One or more of the operations reported back with errors. See the server log for details`)
        return
      }

      response.sendStatus(200)
    } catch (err) {
      response.status(500).send(`There was an error submitting to Mailchimp: ${err}`)
    }
  })

  // so route not found errors don't respond with the default html
  app.use('/', (request, response) => response.sendStatus(404))

  // start express server
  app.listen(3002)

  // tslint:disable-next-line: no-console
  console.log(`Mailchimp server listening on port 3002`)

  module.exports = app
}

startExpress()
