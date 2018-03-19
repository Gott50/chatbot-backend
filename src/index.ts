import {DialogflowFirebaseFulfillment} from '../functions/src/dialogflowFirebaseFulfillment';
import bodyParser = require('body-parser');
import express = require('express');
const app = express();

app.use(bodyParser);
app.set('port', process.env.PORT || 5000);

// Load environment variables from .env file
if (process.env.NODE_ENV !== "production") {
    const dotenv = require('dotenv');
    dotenv.load();
}
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

app.post('/', (req, res) => new DialogflowFirebaseFulfillment(PAGE_ACCESS_TOKEN).run(req, res));


// Start server
// Webhooks must be available via SSL with a certificate signed by a valid
// certificate authority.
app.listen(app.get('port'), () => {
    console.log('Node app is running on port', app.get('port'));
});