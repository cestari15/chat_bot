from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import mysql.connector
import google.generativeai as genai

# ==========================
# 🔹 Configuração do Gemini
# ==========================
genai.configure(api_key="")

# ==========================
# 🔹 Inicialização do FastAPI
# ==========================
app = FastAPI()

# Permitir acesso do React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================
# 🔹 Conexão com MySQL
# ==========================
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",  # insira sua senha
    database="chatdb"
)
cursor = db.cursor()

# Criação das tabelas se não existirem
cursor.execute("""
CREATE TABLE IF NOT EXISTS conversation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL
) ENGINE=InnoDB;
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS message (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL,
    user_input TEXT,
    bot_response TEXT,
    FOREIGN KEY (conversation_id) REFERENCES conversation(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;
""")
db.commit()

# ==========================
# 🔹 Modelos Pydantic
# ==========================
class ChatRequest(BaseModel):
    conversation_id: int
    message: str

class NewConversation(BaseModel):
    title: str

# ==========================
# 🔹 Endpoints
# ==========================

# Criar nova conversa
@app.post("/conversations")
def create_conversation(data: NewConversation):
    cursor.execute("INSERT INTO conversation (title) VALUES (%s)", (data.title,))
    db.commit()
    return {"id": cursor.lastrowid, "title": data.title}

# Listar todas as conversas
@app.get("/conversations")
def get_conversations():
    cursor.execute("SELECT id, title FROM conversation ORDER BY id DESC")
    rows = cursor.fetchall()
    return [{"id": row[0], "title": row[1]} for row in rows]

# Buscar mensagens de uma conversa específica
@app.get("/messages/{conversation_id}")
def get_messages(conversation_id: int):
    cursor.execute("SELECT user_input, bot_response FROM message WHERE conversation_id=%s ORDER BY id ASC", (conversation_id,))
    rows = cursor.fetchall()
    messages = []
    for row in rows:
        messages.append({"user": "Você", "content": row[0]})
        messages.append({"user": "Bot", "content": row[1]})
    return messages

@app.post("/chat")
def chat(data: ChatRequest):
    # 1️⃣ Verifica se a conversa existe
    cursor.execute("SELECT id FROM conversation WHERE id=%s", (data.conversation_id,))
    conv = cursor.fetchone()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversa não encontrada")

    # 2️⃣ Recupera histórico da conversa
    cursor.execute(
        "SELECT user_input, bot_response FROM message WHERE conversation_id=%s ORDER BY id ASC",
        (data.conversation_id,)
    )
    history = cursor.fetchall()

    # 3️⃣ Monta a lista de mensagens para o Gemini no formato correto
    messages = []
    for entry in history:
        messages.append({"role": "user", "parts": [entry[0]]})
        messages.append({"role": "model", "parts": [entry[1]]})

    # 4️⃣ Inicializa o modelo e a sessão de chat
    # Utilize um modelo apropriado para conversas, como 'gemini-2.5-flash'
    model = genai.GenerativeModel("gemini-2.5-flash")
    chat_session = model.start_chat(history=messages)

    # 5️⃣ Envia a nova mensagem do usuário para o chat
    response = chat_session.send_message(data.message)

    # 6️⃣ Captura a resposta do bot
    bot_message = response.text

    # 7️⃣ Salva no banco de dados
    cursor.execute(
        "INSERT INTO message (conversation_id, user_input, bot_response) VALUES (%s, %s, %s)",
        (data.conversation_id, data.message, bot_message)
    )
    db.commit()

    # 8️⃣ Retorna a resposta para o front
    return {"response": bot_message}


