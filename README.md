
# 💬 Chat IA Generativa com Memória (Gemini + LangChain + React + FastAPI + MySQL)

Este projeto é um **sistema completo de IA generativa** com **frontend em React**, **backend em Python (FastAPI)** e **banco de dados MySQL**.  
A aplicação utiliza o **Google Gemini** como modelo de linguagem e o **LangChain** para orquestração e memória das conversas.  

---

## 🚀 Tecnologias Utilizadas

### 🧠 IA & Backend
- **Python 3.10+**
- **FastAPI**
- **LangChain**
- **Google Generative AI (Gemini)**
- **SQLAlchemy**
- **MySQL**
- **Uvicorn**

### 💻 Frontend
- **React.js**
- **Axios**
- **TailwindCSS (opcional para estilização)**

---

## ⚙️ Estrutura do Projeto

```
chat_bot/
├── backend/
│   ├── app.py                # Backend principal (FastAPI)
│   ├── database.py           # Conexão e modelos do banco de dados
│   ├── models.py             # Estrutura das tabelas
│   ├── requirements.txt      # Dependências Python
│   └── venv/                 # Ambiente virtual Python
└── frontend/
    ├── src/
    │   ├── App.js            # Lógica principal do chat (frontend)
    │   └── components/       # Componentes do React
    ├── package.json          # Dependências Node
    └── public/
```

---

## 🛠️ Instalação e Configuração

### 1️⃣ Clonar o Repositório
```bash
git clone https://github.com/seuusuario/chat-ia-generativa.git
cd chat-ia-generativa
```

---

### 2️⃣ Configurar o Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # (Windows)
pip install -r requirements.txt
```

#### Configurar as variáveis de ambiente
Crie um arquivo `.env` dentro da pasta `backend` com:

```
GEMINI_API_KEY=YOUR_API_KEY_HERE
MYSQL_USER=root
MYSQL_PASSWORD=senha
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=chatbot
```

#### Rodar o servidor
```bash
uvicorn app:app --reload --port 8000
```

O backend estará disponível em:  
👉 **http://127.0.0.1:8000**

---

### 3️⃣ Configurar o Frontend
```bash
cd ../frontend
npm install
npm start
```

O frontend estará em:  
👉 **http://localhost:3000**

---

## 💾 Banco de Dados (MySQL)

A tabela principal é `messages`, com a seguinte estrutura:

| Campo            | Tipo        | Descrição                        |
|------------------|-------------|----------------------------------|
| id               | INT (PK)    | Identificador único              |
| conversation_id  | INT         | ID da conversa                   |
| user_input       | TEXT        | Mensagem do usuário              |
| bot_response     | TEXT        | Resposta gerada pelo modelo      |

Para limpar as mensagens:
```sql
DELETE FROM messages;
```

---

## 🧩 Fluxo de Funcionamento

1. O usuário envia uma mensagem via **frontend**.
2. O **backend (FastAPI)** recebe a mensagem e busca o histórico da conversa.
3. O **LangChain + Gemini** gera a resposta com base no contexto.
4. A conversa é salva no **MySQL**.
5. O frontend atualiza a tela em tempo real.

---



## 🧠 Exemplos de Prompt
```bash
Usuário: Olá, tudo bem?
IA: Tudo ótimo! Em que posso te ajudar hoje?

Usuário: Resuma o que é LangChain.
IA: O LangChain é um framework que facilita a criação de aplicações que usam modelos de linguagem, adicionando memória, ferramentas e controle de fluxo.
```

---



## 🧑‍💻 Autor
**Rafael Cestari**  
Projeto acadêmico com integração entre **IA generativa**, **LangChain** e **frontend reativo**.  
