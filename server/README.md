## Setup

1. Create an `.env` file (check `.env-example` and adapt)
   1. `DB_CONNECT` - the connection string for the mongodb database
   2. `TOKEN_SECRET` - the secret to use to create tokens for authentication
   3. `PORT` - default is 8000
   4. `ORIGIN` - UI App origin for CORS - default is http://localhost:5173
   5. `TOKEN_SECRET` - access token secret 
   6. `REFRESH_SECRET` - refresh token secret
   7. `STRIPE_SECRET_KEY` - Stripe secret for payments
   8. `STRIPE_PUBLISHABLE_KEY` - Stripe publishable secret for payments

2. Install dependencies
```shell
  npm install
```

## Run in dev mode
Start the server in dev:
```shell
  npm run dev
```

## Format files
Server uses prettier to format files:
```shell
  npm run format
```
