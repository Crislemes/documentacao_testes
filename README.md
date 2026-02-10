# 🧪 Gerador de Cenários de Teste

Uma aplicação web que utiliza IA para gerar cenários de teste automatizados baseados em requisitos de software.

## 🚀 Funcionalidades

- **Interface intuitiva** com design moderno
- **Campos de entrada** para:
  - 📖 Narrativa de Usuário
  - 📋 Regras de Negócio  
  - ✅ Critérios de Aceite
  - ⚙️ Refinamento Técnico
- **Geração automática** de cenários de teste estruturados
- **Formato Gherkin** para critérios de aceite
- **Sugestões de automação** específicas

## 🛠️ Configuração

1. **Instale as dependências:**
```bash
npm install
```

2. **Configure a API Key da OpenAI:**
Renomeie `.env.exemplo` para `.env` e adicione sua chave:
```
OPENAI_API_KEY=sua_chave_aqui
```

3. **Execute a aplicação:**
```bash
npm start
# OU clique em: executar.bat
```

4. **Acesse no navegador:**
```
http://localhost:3000
```

## 📋 Como Usar

1. Preencha pelo menos um dos campos de requisitos (texto)
2. Clique em "Gerar Cenários de Teste"
3. Aguarde o processamento da IA
4. Visualize os cenários gerados no painel direito

## 🎨 Design

- Interface responsiva com gradiente roxo
- Layout em duas colunas (formulário + resultado)
- Feedback visual durante o processamento
- Tratamento de erros integrado

## 🔧 Tecnologias

- **Backend:** Node.js + Express
- **Frontend:** HTML5 + CSS3 + JavaScript
- **IA:** OpenAI GPT-4
- **Estilo:** CSS Grid + Flexbox
