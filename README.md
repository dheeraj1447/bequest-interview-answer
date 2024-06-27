# Tamper Proof Data

At Bequest, we require that important user data is tamper proof. Otherwise, our system can incorrectly distribute assets if our internal server or database is breached. 

**1. How does the client ensure that their data has not been tampered with?**
<br />
**2. If the data has been tampered with, how can the client recover the lost data?**


Edit this repo to answer these two questions using any technologies you'd like, there any many possible solutions. Feel free to add comments.

### To run the apps:
```npm run start``` in both the frontend and backend

## To make a submission:
1. Clone the repo
2. Make a PR with your changes in your repo
3. Email your github repository to robert@bequest.finance

## Answer Explanation

This example demonstrates basic data integrity checks and some security best practices using Express.js.

helmet: Middleware for setting various HTTP security headers to help protect the app.
morgan: Middleware for logging HTTP requests.
crypto: Node.js built-in module for handling cryptographic operations.

### Hashing Function:

hashData: Uses SHA-256 to create a hash of the user data to ensure data integrity.


