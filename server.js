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
    const {
      narrativa = "",
      premissas = "",
      regras = "",
      criteriosAceite = "",
      refinamentoTecnico = "",
    } = req.body || {};

    if (
      !narrativa &&
      !premissas &&
      !regras &&
      !criteriosAceite &&
      !refinamentoTecnico
    ) {
      return res.status(400).json({ error: "Nenhum campo foi preenchido" });
    }

    let promptText = `
IMPORTANTE:
- Responda SEMPRE em português brasileiro.
- Utilize TODAS as informações fornecidas.
- Não inventar regras ou queries SQL que não estejam descritas.
- A documentação deve ser clara e compreensível para QA e PO.
- Utilize linguagem simples, objetiva e orientada a comportamento.
- Evite termos técnicos de banco de dados quando não forem essenciais.
- Evite repetição desnecessária entre seções.
- Separe claramente comportamento funcional de validação técnica.
- Não seja excessivamente técnico nos cenários.
- Priorize testes executáveis de sistema (fluxo de ponta a ponta com o sistema em execução).
- Foque em passos observáveis na interface/API e resultados verificáveis pelo usuário.
- Reduza estrutura excessivamente documental e mantenha foco prático.
- Gere casos prontos para execução manual ou automatizada.

Caso existam queries SQL no Refinamento Técnico:
- Identificar o tipo da query:
  • Query de preparação ou extração de dados para teste
  • Query de validação de persistência (INSERT, UPDATE, DELETE)
- NÃO mencionar SQL nos passos Gherkin.
- NÃO criar novas queries.

Com base nas informações abaixo, gere uma documentação completa, estruturada e orientada a testes funcionais e técnicos.

---

### 📌 Narrativa
${narrativa || "Não informado"}

### 📌 Premissas
${premissas || "Não informado"}

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
- Público impactado (quando possível)

A descrição deve ser breve, clara e compreensível para áreas não técnicas.

---

# 2. CENÁRIOS DE TESTE (PADRÃO GHERKIN)

Funcionalidade: [Nome claro da funcionalidade]

Regras obrigatórias:
- Criar cenários positivos
- Criar cenários negativos
- Criar cenários de validação de regras
- Criar cenários de erro quando aplicável
- Representar ações reais do usuário
- Priorizar jornadas completas de sistema (início, processamento e resultado final)
- Incluir contexto mínimo de ambiente quando necessário (autenticação, permissão e dados iniciais)
- Utilizar linguagem simples e comportamental
- NÃO mencionar tabelas, colunas ou SQL
- NÃO incluir validação técnica nesta seção

Modelo sugerido:

Cenário: [Nome claro]
Dado que ...
Quando ...
Então ...

---

# 3. CASOS DE TESTE DETALHADOS

Para cada cenário Gherkin, criar:

- Nome do Caso de Teste
- Objetivo
- Pré-condições mínimas
- Dados de Teste essenciais
- Passos detalhados numerados (ações reais do usuário)
- Resultado Esperado
- Evidência Esperada

Se fizer sentido para execução prática, você pode agrupar ou simplificar campos sem perder clareza.

Quando houver queries de extração ou preparação de dados para teste:

## Query para Preparação/Consulta de Dados

- Informar a query SQL fornecida no refinamento técnico
- Explicar como ela deve ser utilizada (antes ou durante o teste)
- Informar qual dado deve ser extraído ou validado
- Explicar como o resultado impacta a execução do teste

Essas queries podem ser incluídas na seção de Pré-condições ou Dados de Teste.

Regras:
- Não repetir literalmente o Gherkin
- Complementar com detalhes práticos
- Manter foco no comportamento do usuário
- Evitar excesso de seções e texto estrutural desnecessário
- Priorizar instruções claras para execução rápida
- Não misturar com validação de persistência

---

# 4. VALIDAÇÃO TÉCNICA (QUANDO APLICÁVEL)

Criar apenas quando houver persistência de dados (INSERT, UPDATE ou DELETE).

## Validação no Banco de Dados

- Informar a query SQL fornecida no refinamento técnico
- Explicar o que deve ser validado no retorno
- Descrever claramente o resultado esperado

Regras:
- Se houver INSERT → validar existência do registro
- Se houver UPDATE → validar alteração correta dos dados
- Se houver DELETE → validar ausência do registro
- Não criar novas queries
- Não misturar validação técnica com comportamento funcional

---

Objetivo final:
Gerar material de teste claro, profissional e executável, separando quando fizer sentido:
- Comportamento do usuário
- Preparação de dados para teste
- Validação técnica de persistência
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "Você é um especialista em qualidade de software e geração de cenários de teste. Sempre responda em português brasileiro.",
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



