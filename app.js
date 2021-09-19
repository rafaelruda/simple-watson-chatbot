require('dotenv').config();
const AssistantV2 = require('ibm-watson/assistant/v2');
const { IamAuthenticator } = require('ibm-watson/auth');
const express = require('express');
const cors = require('cors');

const port = 3000;
const app = express();
app.use(express.json());
app.use(cors({
  origin: '*',
}));
app.use(express.static('./public'));

const assistant = new AssistantV2({
  version: '2019-02-28',
  authenticator: new IamAuthenticator({ apikey: process.env.ASSISTANT_IAM_APIKEY }),
});
const assistantId = process.env.ASSISTANT_ID;

app.post('/conversation', (req, res) => {
  const { text, sessionId } = req.body;

  assistant.message({
    input: { messageType: 'text', text },
    assistantId,
    sessionId,
  }).then((response) => {
    res.json({ message: response.result.output.generic[0] });
  }).catch((err) => {
    res.status(500).json(err);
  });
});

app.get('/session', (req, res) => assistant.createSession({
  assistantId,
}).then((response) => {
  res.json(response);
}).catch((err) => {
  res.status(500).json(err);
}));

// eslint-disable-next-line no-console
app.listen(port, () => console.log(`Running on port ${port}`));
