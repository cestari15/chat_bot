import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

load_dotenv()

def get_connection():
    try:
        connection = mysql.connector.connect(
            host=os.getenv("MYSQL_HOST"),
            user=os.getenv("MYSQL_USER"),
            password=os.getenv("MYSQL_PASSWORD"),
            database=os.getenv("MYSQL_DATABASE")
        )
        return connection
    except Error as e:
        print("Erro ao conectar ao MySQL:", e)
        return None

def save_message(role, content):
    connection = get_connection()
    if connection:
        cursor = connection.cursor()
        query = "INSERT INTO memory (role, content) VALUES (%s, %s)"
        cursor.execute(query, (role, content))
        connection.commit()
        cursor.close()
        connection.close()

def get_conversation_history():
    connection = get_connection()
    history = []
    if connection:
        cursor = connection.cursor()
        cursor.execute("SELECT role, content FROM memory ORDER BY id ASC")
        history = cursor.fetchall()
        cursor.close()
        connection.close()
    return history
