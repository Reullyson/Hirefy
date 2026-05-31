from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings

def verify_google_token(token):
    print(f"Iniciando validação de token Google... [Token: {token[:10]}...]")
    try:
        # Puxar CLIENT_ID das configurações se disponível
        client_id = getattr(settings, 'GOOGLE_OAUTH2_CLIENT_ID', None)
        print(f"Usando Client ID: {client_id}")
        
        # O id_token.verify_oauth2_token valida a assinatura e a expiração do token
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), client_id)
        
        print("Token validado com sucesso!")
        # Retorna o dicionário com as informações do usuário se o token for válido
        return idinfo
    except Exception as e:
        print(f"Erro crítico na validação do token Google: {str(e)}")
        return None
