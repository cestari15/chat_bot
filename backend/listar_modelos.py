import google.generativeai as genai

# Configure sua API key
genai.configure(api_key="AIzaSyCKHPTSEmw3V5oOt5SO9thE7E5tibrjKuk")

# Lista todos os modelos disponíveis
for model in genai.list_models():
    print(f"- {model.name}")
