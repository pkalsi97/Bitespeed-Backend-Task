# Bitespeed-Backend-Task
## Identity Reconciliation

### cURL Command to Identify Contact
```sh
curl -X POST https://bitespeed-backend-task-gu0k.onrender.com/api/identify \
     -H "Content-Type: application/json" \
     -d '{
           "email": "test@example.com",
           "phoneNumber": "1234567890"
         }'
```



### Notes and Thought Process
#### Doc
1. Wants to save his friend; FluxCart sells parts needed to build his contraption.
2. Doc is using different emails and phone numbers for each of his purchases.

#### Flux Cart
1. Very serious about customer experience -> wants to reward and give personalized experience.
2. Integrates Bitespeed -> Collects contact details from shoppers for a personalized shopping experience.

#### Bitespeed
Bitespeed faces a unique challenge: linking different orders made with different contact information to the same person.
1. Needs a way to identify and track a customer's identity across multiple purchases.
2. An order from Flux Cart will have an email or phone number in the checkout event.
3. A relational database called `Contact` is used to store collected info.
4. One customer can have multiple contact rows in the database against them. All of the rows are linked together with the oldest one being treated as "primary” and the rest as “secondary”.
5. Contact rows are linked if they have either email or phone as common.

### Requirements
1. If no existing contact against an incoming request -> make one with `linkPrecedence="primary"`.
2. If contact exists -> link it to primary.
3. Can primary contacts turn into secondary?

### Input
Design a web service with an endpoint `/identify` that will receive HTTP POST requests with a JSON body in the following format:

```javaScript
{
	"email"?: string,
	"phoneNumber"?: number
}
```

### Output
The web service should return an HTTP 200 response with a JSON payload containing the consolidated contact.

```javaScript
{
	"contact": {
		"primaryContactId": number,
		"emails": string[], // first element being email of primary contact 
		"phoneNumbers": string[], // first element being phone number of primary contact
		"secondaryContactIds": number[] // Array of all Contact IDs that are "secondary" to the primary contact
	}
}
```