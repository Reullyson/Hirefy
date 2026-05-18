from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings

def verify_google_token(token):
    try:
        # Puxar CLIENT_ID das configurações se disponível
        client_id = getattr(settings, 'GOOGLE_OAUTH2_CLIENT_ID', None)
        
        # O id_token.verify_oauth2_token valida a assinatura e a expiração do token
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), client_id)
        
        # Retorna o dicionário com as informações do usuário se o token for válido
        return idinfo
    except Exception as e:
        print(f"Erro na validação do token Google: {str(e)}")
        return None
