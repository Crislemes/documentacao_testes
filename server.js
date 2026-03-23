import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/processar-requisitos", async (req, res) => {
  try {
    const { narrativa = '', premissas = '', regras = '', criteriosAceite = '', refinamentoTecnico = '' } = req.body || {};

    if (!narrativa && !premissas && !regras && !criteriosAceite && !refinamentoTecnico) {
      return res.status(400).json({ error: 'Nenhum campo foi preenchido' });
    }

    let promptText = `
IMPORTANTE:
- Responda SEMPRE em português brasileiro.
- Utilize TODAS as informações fornecidas.
- Caso existam queries SQL no Refinamento Técnico, elas DEVEM ser utilizadas para validação nos casos de teste.
- Não seja excessivamente técnico. Priorize clareza, organização e objetividade.
- Não inventar queries SQL se não existirem no refinamento técnico.

Com base nas informações abaixo, gere uma documentação completa, estruturada e orientada a testes funcionais e técnicos.

---

### 📌 Narrativa
${narrativa || 'Não informado'}

### 📌 Premissas
${premissas || 'Não informado'}

### 📌 Regras de Negócio
${regras || "Não informado"}

### 📌 Critérios de Aceite
${criteriosAceite || "Não informado"}

### 📌 Refinamento Técnico
${refinamentoTecnico || "Não informado"}

---

Retorne preferencialmente na estrutura abaixo.
Adapte a forma de apresentação quando isso deixar os testes mais executáveis e objetivos.

# 1. DESCRIÇÃO DO DESENVOLVIMENTO

- Resumo claro do que foi implementado
- Objetivo da funcionalidade
- Problema que resolve
- Impacto esperado no sistema

# 2. REGRAS DE NEGÓCIO REFINADAS
- Lista organizada
- Escritas de forma clara e objetiva

# 3. REQUISITOS

## 3.1 Requisitos Funcionais
- Lista numerada

## 3.2 Requisitos Não Funcionais
- Lista numerada

# 4. CENÁRIOS DE TESTE (PADRÃO GHERKIN)

Funcionalidade: [Nome da funcionalidade]

Cenário: [Nome do cenário]
Dado que ...
Quando ...
Então ...

---

# 3. CASOS DE TESTE DETALHADOS

Para cada cenário Gherkin, criar:

- ID do Caso de Teste
- Nome do Caso
- Objetivo
- Pré-condições
- Dados de teste
- Passos detalhados numerados
- Resultado esperado
- Evidência esperada

Quando houver persistência de dados:
- Incluir seção "Validação no Banco de Dados"
- Informar a query SQL a ser executada
- Informar o que deve ser validado no retorno da query
- Se houver INSERT, validar com SELECT
- Se houver UPDATE, validar alteração de dados
- Se houver DELETE, validar ausência do registro

# 6. ESTRATÉGIA DE AUTOMAÇÃO

- Indicar quais cenários são candidatos à automação
- Indicar se a automação deve ser via UI, API ou Banco
- Informar pontos críticos para validação automatizada
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Você é um especialista em qualidade de software e geração de cenários de teste. Sempre responda em português brasileiro."
        },
        {
          role: "user",
          content: promptText,
        },
      ],
      max_tokens: 4000,
      temperature: 0.7,
    });

    res.json({ resultado: response.choices[0].message.content });
  } catch (error) {
    console.error("Erro ao processar requisitos:", error);
    res
      .status(500)
      .json({ error: error.message || "Erro ao processar requisitos" });
  }
});

app.listen(3000, () => console.log("API rodando na porta 3000"));



