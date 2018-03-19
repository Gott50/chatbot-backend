const express = require('express');
const app = express();

app.set('port', process.env.PORT || 5000);

// Load environment variables from .env file
if (process.env.NODE_ENV !== "production")
    loadEnvironmentVariables();
function loadEnvironmentVariables() {
    let dotenv = require('dotenv');
    dotenv.load();
}
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

app.get('/', (req, res) => res.send('Hello World!'));


// Start server
// Webhooks must be available via SSL with a certificate signed by a valid
// certificate authority.
app.listen(app.get('port'), () => {
    console.log('Node app is running on port', app.get('port'));
});