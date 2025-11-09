
import axios from "axios";

export const parseInvoiceWithGroqLlama = async (pdfText) => {
  const endpoint = "https://api.groq.com/v1/chat/completions";
  const apiKey   = process.env.GROQ_API_KEY;

  const response = await axios.post(
    endpoint,
    {
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "user", content: `
Extract item names and prices from this invoice text.
Return JSON array of objects:
[{ "itemName": "...", "price": number }, ...]
Invoice text:
${pdfText}
        ` }
      ],
      max_tokens: 512,
      temperature: 0.0
    },
    {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type" : "application/json"
      }
    }
  );

  const text = response.data.choices[0].message.content;
  const items = JSON.parse(text);
  return items;  
};
