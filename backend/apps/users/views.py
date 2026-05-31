from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserSerializer, InviteRecruiterSerializer, AcceptInviteSerializer
from .google_auth import verify_google_token
from django.contrib.auth import get_user_model
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.conf import settings

User = get_user_model()

class GoogleLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({'detail': 'Token do Google é obrigatório.'}, status=status.HTTP_400_BAD_REQUEST)

        google_data = verify_google_token(token)
        if not google_data:
            return Response({'detail': 'Token do Google inválido ou expirado.'}, status=status.HTTP_400_BAD_REQUEST)

        email = google_data.get('email')
        
        # Validar domínio acadêmico
        if not email.endswith('@aluno.ifce.edu.br'):
            return Response({'detail': 'Apenas e-mails @aluno.ifce.edu.br são permitidos.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            user = User.objects.get(email=email)
            
            if not user.is_active:
                return Response({'detail': 'Sua conta está desativada. Entre em contato com o administrador.'}, status=status.HTTP_403_FORBIDDEN)
                
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response({
                'detail': 'Usuário não cadastrado. Por favor, realize o cadastro primeiro.',
                'google_data': {
                    'email': email,
                    'nome': google_data.get('name')
                }
            }, status=status.HTTP_404_NOT_FOUND)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    @action(detail=False, methods=['get', 'put', 'delete'], url_path='me')
    def me(self, request):
        user = request.user

        if request.method == 'GET':
            serializer = self.get_serializer(user)
            return Response(serializer.data)

        elif request.method == 'PUT':
            serializer = self.get_serializer(
                user,
                data=request.data,
                partial=True
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)

        elif request.method == 'DELETE':
            user.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['patch'], url_path='toggle-active')
    def toggle_active(self, request, pk=None):
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()

        return Response({
            "id": user.id,
            "is_active": user.is_active
        })

    @action(detail=False, methods=['post'], url_path='invite-recruiter', permission_classes=[permissions.IsAdminUser])
    def invite_recruiter(self, request):
        serializer = InviteRecruiterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Criar o usuário como RECRUTADOR e inativo
        data = serializer.validated_data
        user_data = {
            'email': data['email'],
            'nome': data['nome'],
            'user_type': 'RECRUTADOR',
            'is_active': False,
            'company_name': data['company_name'],
            'cnpj': data['cnpj']
        }
        
        user_serializer = UserSerializer(data=user_data)
        user_serializer.is_valid(raise_exception=True)
        user = user_serializer.save()
        
        # Gerar token
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # Enviar email
        # No ambiente de dev, isso vai para o console
        invite_link = f"{settings.FRONTEND_URL}/aceitar-convite?uid={uid}&token={token}"
        
        subject = 'Convite para a Plataforma Hirefy'
        message = f'Olá {user.nome},\n\nVocê foi convidado para se cadastrar como recrutador na plataforma Hirefy pela empresa {data["company_name"]}.\n\nPara completar seu cadastro e definir sua senha, acesse o link abaixo:\n\n{invite_link}\n\nAtenciosamente,\nEquipe Hirefy'
        
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
        except Exception as e:
            # Em caso de erro no envio do email, podemos opcionalmente remover o usuário ou apenas logar
            return Response({'detail': f'Erro ao enviar e-mail: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        return Response({'detail': 'Convite enviado com sucesso.'}, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='accept-invite', permission_classes=[permissions.AllowAny])
    def accept_invite(self, request):
        serializer = AcceptInviteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        uidb64 = serializer.validated_data['uid']
        token = serializer.validated_data['token']
        password = serializer.validated_data['password']
        
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None
            
        if user is not None and default_token_generator.check_token(user, token):
            user.set_password(password)
            user.is_active = True
            user.save()
            return Response({'detail': 'Cadastro finalizado com sucesso. Você já pode fazer login.'}, status=status.HTTP_200_OK)
        else:
            return Response({'detail': 'Link de convite inválido ou expirado.'}, status=status.HTTP_400_BAD_REQUEST)