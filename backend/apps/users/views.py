from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserSerializer
from .google_auth import verify_google_token
from django.contrib.auth import get_user_model

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