const express = require('express');
const app = express();

app.set('port', process.env.PORT || 5000);

app.get('/', (req, res) => res.send('Hello World!'));


// Start server
// Webhooks must be available via SSL with a certificate signed by a valid
// certificate authority.
app.listen(app.get('port'), () => {
    console.log('Node app is running on port', app.get('port'));
});