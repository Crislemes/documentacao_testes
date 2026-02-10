import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(express.json({ limit: '50mb' }));
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
    
    let promptText = `IMPORTANTE: Responda SEMPRE em português brasileiro.

Com base nas informações fornecidas, gere uma documentação completa:

### Narrativa
${narrativa || 'Não informado'}

### Regras de Negócio
${regras || 'Não informado'}

### Critérios de Aceite
${criteriosAceite || 'Não informado'}

### Refinamento Técnico
${refinamentoTecnico || 'Não informado'}

Retorne uma documentação estruturada em português brasileiro contendo:

## 1. DESCRIÇÃO DO DESENVOLVIMENTO
- Resumo do que foi desenvolvido
- Funcionalidades implementadas
- Objetivos alcançados

## 2. CENÁRIOS DE TESTE
- Cenários no padrão Gherkin em português
- Formato: Funcionalidade, Cenário, Dado, Quando, Então
- Cobertura de casos positivos e negativos

## 3. CASOS DE TESTE DETALHADOS
- Casos de teste com passos específicos
- Pré-condições, passos de execução e resultados esperados
- Dados de teste necessários`;
    
    const response = await client.chat.completions.create({
      model: "gpt-4o", 
      messages: [
        {
          role: "system", 
          content: "Você é um especialista em qualidade de software e geração de cenários de teste. Sempre responda em português brasileiro."
        },
        {
          role: "user", 
          content: promptText
        }
      ],
      max_tokens: 4000,
      temperature: 0.7
    });

    res.json({ resultado: response.choices[0].message.content });
  } catch (error) {
    console.error('Erro:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log("API rodando na porta 3000"));
