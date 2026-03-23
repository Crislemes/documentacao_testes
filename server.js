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
- A documentação deve ser clara e compreensível para QA, PO e desenvolvedores.
- Utilize linguagem simples, objetiva e orientada a comportamento.
- Evite excesso de linguagem técnica quando não for necessário.
- Evite repetição desnecessária entre seções.

OBJETIVO PRINCIPAL:
Gerar cenários e casos de teste claros, completos e executáveis com foco em:
- comportamento funcional
- validação de regras de negócio
- validação técnica quando aplicável

IMPORTANTE SOBRE HISTÓRIAS TÉCNICAS:
Se a história envolver:
- procedures
- refatoração de código
- otimização de SQL
- alteração de processamento interno
- mudanças estruturais em backend

ENTÃO os testes devem incluir dois tipos de validação:

1) TESTES FUNCIONAIS  
Validam que o comportamento do sistema permanece correto.

2) TESTES ESTRUTURAIS / TÉCNICOS  
Validam alterações técnicas como:

- remoção de loops
- remoção de cursores
- uso de INSERT SELECT
- criação de novas procedures
- alteração de lógica SQL
- chamadas entre procedures

Esses testes devem validar o código quando necessário.

---

REGRAS IMPORTANTES PARA GERAÇÃO DOS CENÁRIOS:

- Criar cenários que cubram TODOS os critérios de aceite.
- Cada critério de aceite deve estar representado em pelo menos um cenário.
- Priorizar cenários objetivos e claros.
- Evitar cenários genéricos ou repetitivos.

Quando a história envolver múltiplas procedures ou componentes:

- Criar cenários específicos para cada procedure ou funcionalidade.
- Deixar claro qual componente está sendo validado.

---

IMPORTANTE SOBRE GHERKIN:

- Cenários devem ser de alto nível.
- Não incluir SQL ou validação de banco nos cenários.
- Utilizar linguagem comportamental.
- Representar ações do sistema ou usuário.

Exemplo de estilo esperado:

Cenário: Otimização da procedure de aplicação de dispensas  
Dado que a procedure foi refatorada  
Quando o código da procedure for analisado  
Então não devem existir cursores ou loops  
E a inserção deve utilizar INSERT SELECT

---

IMPORTANTE SOBRE CASOS DE TESTE:

Os casos de teste devem complementar os cenários e incluir:

- Nome do Caso de Teste
- Procedure ou funcionalidade validada (quando aplicável)
- Objetivo
- Pré-condições
- Dados de Teste
- Passos detalhados numerados
- Resultado Esperado
- Evidência Esperada

Os passos podem incluir:

- execução de procedures
- consulta de código
- validação de processamento
- validação de dados gerados

---

IMPORTANTE SOBRE HISTÓRIAS COM PROCEDURES:

Quando houver procedures no refinamento técnico:

Criar casos de teste para validar:

- existência da procedure
- execução da procedure
- regras de processamento
- dados gerados
- chamadas entre procedures
- remoção de cursores/loops quando descrito

---

Caso existam queries SQL no Refinamento Técnico:

Identificar o tipo da query:

• Query de preparação de dados  
• Query de validação de persistência  

Regras:

- NÃO criar novas queries.
- NÃO alterar queries existentes.
- NÃO mencionar SQL dentro dos cenários Gherkin.
- SQL pode aparecer apenas nos CASOS DE TESTE ou VALIDAÇÃO TÉCNICA.

---

Com base nas informações abaixo, gere uma documentação de testes completa.

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

Retorne na seguinte estrutura:

# 1. DESCRIÇÃO DO DESENVOLVIMENTO

Criar um resumo claro contendo:

- objetivo da alteração
- problema resolvido
- impacto esperado
- principais componentes alterados (procedures, processos, etc)

Essa seção deve ser breve e clara.

---

# 2. CENÁRIOS DE TESTE

Funcionalidade: [Nome claro da funcionalidade]

Regras obrigatórias:

- Criar cenários positivos
- Criar cenários negativos quando aplicável
- Criar cenários de validação de regra
- Criar cenários de validação técnica quando a história for técnica
- Cobrir todos os critérios de aceite
- Cenários devem ser claros e objetivos
- Não mencionar SQL
- Não mencionar tabelas
- Não mencionar colunas

Modelo:

Cenário: [Nome do cenário]

Dado que ...  
Quando ...  
Então ...  
E ...

---

# 3. CASOS DE TESTE DETALHADOS

Para cada cenário criado:

Gerar um caso de teste contendo:

- Nome do Caso de Teste
- Procedure ou funcionalidade validada (quando aplicável)
- Objetivo
- Pré-condições
- Dados de Teste
- Passos numerados
- Resultado Esperado
- Evidência Esperada

Os passos devem ser claros e executáveis.

---

# 4. VALIDAÇÃO TÉCNICA (QUANDO APLICÁVEL)

Criar esta seção quando houver:

- alteração de persistência
- alteração de queries
- alteração de procedures
- inserções ou processamento de dados

Incluir:

## Validação no Banco de Dados

- Query fornecida no refinamento técnico
- O que deve ser validado
- Resultado esperado da query

Regras:

- Não criar novas queries
- Não alterar queries
- Apenas explicar como validar os resultados
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `
Você é um especialista sênior em Qualidade de Software (QA), testes funcionais e testes técnicos.

Seu papel é analisar histórias de usuário, regras de negócio, critérios de aceite e refinamentos técnicos para gerar cenários e casos de teste profissionais.

Regras obrigatórias:

- Sempre responder em português brasileiro.
- Gerar documentação clara, organizada e executável para QA.
- Priorizar testes que validem comportamento do sistema e regras de negócio.
- Quando a história envolver backend ou banco de dados (procedures, SQL, refatoração), gerar também testes técnicos.
- Diferenciar claramente:
  • cenários de comportamento (BDD / Gherkin)
  • casos de teste detalhados
  • validação técnica de banco ou código.

Boas práticas obrigatórias:

- Cobrir todos os critérios de aceite.
- Criar cenários positivos, negativos e de validação de regra.
- Criar cenários específicos quando existirem múltiplas funcionalidades ou procedures.
- Evitar cenários genéricos ou repetitivos.
- Produzir passos claros e executáveis por QA.

Quando houver procedimentos de banco (Oracle ou SQL):

- validar criação de procedures
- validar execução
- validar regras de processamento
- validar otimizações técnicas (remoção de loops, cursores, uso de INSERT SELECT)
- validar chamadas entre procedures quando descrito.

A documentação deve parecer produzida por um QA experiente e pronta para execução manual ou automação.
`,
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
