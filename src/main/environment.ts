// These are set by webpack
declare var MAILCHIMP_APIKEY
declare var MAILCHIMP_LISTID

export const Environment = {
  apiKey: MAILCHIMP_APIKEY,
  listId: MAILCHIMP_LISTID,
}
