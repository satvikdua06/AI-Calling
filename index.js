const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const axios = require('axios');
const { Configuration, OpenAIApi } = require('openai');

dotenv.config();
const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const VAPI_API_KEY = process.env.VAPI_API_KEY;

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.get('/', (req, res) => {
  res.send("Vapi + OpenAI callbot is running!");
});

app.post('/webhook', async (req, res) => {
  const { text, conversation_id } = req.body;

  console.log("User said:", text);

  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful phone assistant." },
        { role: "user", content: text }
      ]
    });

    const reply = response.data.choices[0].message.content;

    await axios.post(`https://api.vapi.ai/conversations/${conversation_id}/messages`, {
      type: "text",
      content: reply,
    }, {
      headers: {
        Authorization: `Bearer ${VAPI_API_KEY}`,
      }
    });

    res.sendStatus(200);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
