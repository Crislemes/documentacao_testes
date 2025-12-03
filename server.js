import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/processar-requisitos", async (req, res) => {
  try {
    const { narrativa, regras, criteriosAceite, refinamentoTecnico } = req.body;

    const prompt = `
      IMPORTANTE: Responda SEMPRE em português brasileiro.
      
      Gere um Refinamento Completo com base nos dados abaixo:

      ### Narrativa
      ${narrativa}

      ### Regras de Negócio
      ${regras}

      ### Critérios de Aceite
      ${criteriosAceite}

      ### Refinamento Técnico
      ${refinamentoTecnico}

      Retorne em português brasileiro:
      - Narrativa reescrita
      - Critérios de aceite no padrão Gherkin
      - Regras de negócio refinadas
      - Requisitos funcionais e não funcionais
      - Estrutura de cenários de testes
      - Passos para automação
    `;

    const response = await client.chat.completions.create({
      model: "gpt-4o", 
      messages: [{ role: "user", content: prompt }]
    });

    res.json({ resultado: response.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log("API rodando na porta 3000"));
