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
Você é um Analista de QA Sênior especialista em testes de integração de dados, ETL e banco de dados.

Pense como um QA experiente que precisa garantir cobertura total, evitar falhas em produção e validar regras de negócio críticas.

Sua tarefa é analisar a documentação fornecida (narrativa, regras de negócio, critérios de aceite e refinamento técnico) e gerar uma documentação de testes completa, estruturada, técnica e detalhada.

⚠️ IMPORTANTE:
Você DEVE utilizar o refinamento técnico como base para entender o comportamento real da implementação.
Considere métodos, fluxo de execução, staging, inserts, updates, uso de hash, integrações e detalhes técnicos descritos.
Os cenários e casos de teste devem refletir exatamente como a solução foi implementada, e não apenas regras funcionais.

⚠️ A resposta DEVE seguir EXATAMENTE o formato abaixo, sem alterar títulos ou estrutura:

# 🎯 FUNCIONALIDADE
Nome claro e objetivo da funcionalidade baseada na narrativa

# 🧪 CENÁRIOS DE TESTE
Para cada cenário, informar:
- Nome do cenário
- Objetivo claro
- Regras de negócio relacionadas (ex: RN-01, RN-02)

⚠️ Os cenários devem cobrir 100% das regras de negócio e critérios de aceite.

# 🧾 CASOS DE TESTE

Para cada cenário, criar casos de teste detalhados:

## CTXX – Nome do caso de teste
Cenário relacionado: Nome do cenário

Passos:
1. Descrever ação clara e executável
2. Descrever ação no banco ou sistema
3. Executar consulta SQL quando aplicável
4. Validar dados retornados
5. Considerar fluxo técnico (staging, inserts, updates, etc.)

⚠️ Sempre que possível, incluir SQL realista, como:
- SELECT para validação
- INSERT para preparação de dados
- DELETE/UPDATE quando necessário

⚠️ Os passos devem refletir o fluxo técnico descrito (ex: limpar staging, inserir staging, upsert no destino, inativação lógica).

Resultado esperado:
- Descrever exatamente o comportamento esperado
- Informar quais regras foram validadas
- Refletir o comportamento técnico (ex: uso de hash, ON CONFLICT, indicador_ativo)

---

📌 REGRAS IMPORTANTES:
- Não gerar conteúdo genérico
- Não pular etapas
- Não resumir demais
- Garantir rastreabilidade entre regra → cenário → caso de teste
- Usar linguagem técnica
- Priorizar clareza e execução prática
- Considerar o fluxo completo (origem → staging → destino)
- Utilizar o refinamento técnico como principal fonte para construção dos testes

---

📥 DOCUMENTAÇÃO DE ENTRADA:

### 📌 Narrativa
${narrativa || "Não informado"}

### 📌 Regras de Negócio
${regras || "Não informado"}

### 📌 Critérios de Aceite
${criteriosAceite || "Não informado"}

### 📌 Refinamento Técnico
${refinamentoTecnico || "Não informado"}

---

Antes de gerar a resposta, analise todas as regras e garanta que nenhuma fique sem cobertura de teste.

Gere a documentação completa seguindo rigorosamente o formato.
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "Você é um Analista de QA Sênior especialista em testes de integração de dados e banco de dados. ",
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
