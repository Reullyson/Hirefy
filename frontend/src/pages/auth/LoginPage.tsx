import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { FaEye, FaEyeSlash, FaMapMarkerAlt, FaUserEdit, FaChartLine, FaHandshake, FaPaperPlane } from 'react-icons/fa';
import { GoogleLogin } from '@react-oauth/google';
import Alert from './components/Alert';
import LoadingOverlay from './components/LoadingOverlay';
import { authService } from '@/services/api';
import { toast } from 'sonner';

const LoginPage = () => {
    const [, setLocation] = useLocation();
    
    const [userType, setUserType] = useState('aluno');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [alert, setAlert] = useState<{ message: string; type: 'error' | 'success' | 'info' } | null>(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email || !password) {
            setAlert({ message: 'Por favor, preencha e-mail e senha', type: 'error' });
            return;
        }
        
        setLoading(true);
        setAlert(null);
        
        try {
            const response = await authService.login({ email, password });
            const { access, refresh } = response.data;
            
            localStorage.setItem('hirefy_access_token', access);
            localStorage.setItem('hirefy_refresh_token', refresh);
            
            toast.success('Bem-vindo ao Hirefy!');
            window.location.href = "/";
        } catch (err: any) {
            const errorMsg = err.response?.data?.detail || 'Erro ao realizar login. Verifique suas credenciais.';
            setAlert({ message: errorMsg, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        setLoading(true);
        setAlert(null);
        
        try {
            const response = await authService.googleLogin(credentialResponse.credential);
            const { access, refresh } = response.data;
            
            localStorage.setItem('hirefy_access_token', access);
            localStorage.setItem('hirefy_refresh_token', refresh);
            
            toast.success('Bem-vindo ao Hirefy!');
            window.location.href = "/";
        } catch (err: any) {
            const errorMsg = err.response?.data?.detail || 'Erro ao realizar login com Google.';
            setAlert({ message: errorMsg, type: 'error' });
            
            if (err.response?.status === 404) {
                // Se não existir, sugere cadastro e passa dados se houver
                const googleData = err.response.data.google_data;
                if (googleData) {
                    sessionStorage.setItem('hirefy_google_data', JSON.stringify(googleData));
                    setTimeout(() => setLocation('/cadastro'), 3000);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const features = [
        { icon: FaMapMarkerAlt, title: 'Oportunidades Locais e Externas', description: 'Vagas nativas e integração com Gupy para mais possibilidades.' },
        { icon: FaUserEdit, title: 'Gestão de Perfil', description: 'Destaque suas competências, experiências e conquistas acadêmicas.' },
        { icon: FaChartLine, title: 'Processo Simplificado', description: 'Acompanhe todas as etapas da sua candidatura em um só lugar.' },
        { icon: FaHandshake, title: 'Conexão com Empresas', description: 'Empresas parceiras do IFCE buscando talentos como você.' }
    ];

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <LoadingOverlay visible={loading} message="Entrando..." />
            
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', flex: 1, width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, background: 'linear-gradient(135deg, #059669 0%, #0F172A 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                        <FaPaperPlane /> Hirefy
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Conectando talentos a oportunidades</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                    {/* Lado Esquerdo - Informações */}
                    <div className="hidden md:block">
                        <h2 style={{ fontSize: '2rem', color: '#0F172A', marginBottom: '1rem' }}>Bem-vindo ao Hirefy</h2>
                        <p style={{ color: '#475569', lineHeight: 1.6, marginBottom: '2rem' }}>A plataforma oficial de vagas e candidaturas do IFCE Campus Cedro. Conectamos estudantes de Sistemas de Informação às melhores oportunidades do mercado.</p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            {features.map((feature, index) => (
                                <div key={index} style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                                    <div style={{ width: '40px', height: '40px', background: '#05966910', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                        <feature.icon style={{ fontSize: '1.25rem', color: '#059669' }} />
                                    </div>
                                    <h4 style={{ fontSize: '1rem', color: '#0F172A', marginBottom: '0.5rem' }}>{feature.title}</h4>
                                    <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Lado Direito - Formulário */}
                    <div style={{ background: '#F8FAFC', padding: '2rem', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ fontSize: '1.5rem', color: '#0F172A', marginBottom: '0.5rem' }}>Entrar na sua conta</h3>
                        <div style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Acesse sua conta para continuar</div>

                        {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}

                        {/* Botões Aluno/Empresa/Admin */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: '#f1f5f9', padding: '0.25rem', borderRadius: '0.5rem' }}>
                            <button type="button" onClick={() => setUserType('aluno')} style={{ flex: 1, padding: '0.625rem', cursor: 'pointer', borderRadius: '0.4rem', fontSize: '0.85rem', fontWeight: 600, background: userType === 'aluno' ? '#059669' : 'transparent', color: userType === 'aluno' ? '#F8FAFC' : '#64748b', border: 'none' }}>Aluno</button>
                            <button type="button" onClick={() => setUserType('empresa')} style={{ flex: 1, padding: '0.625rem', cursor: 'pointer', borderRadius: '0.4rem', fontSize: '0.85rem', fontWeight: 600, background: userType === 'empresa' ? '#059669' : 'transparent', color: userType === 'empresa' ? '#F8FAFC' : '#64748b', border: 'none' }}>Empresa</button>
                            <button type="button" onClick={() => setUserType('admin')} style={{ flex: 1, padding: '0.625rem', cursor: 'pointer', borderRadius: '0.4rem', fontSize: '0.85rem', fontWeight: 600, background: userType === 'admin' ? '#059669' : 'transparent', color: userType === 'admin' ? '#F8FAFC' : '#64748b', border: 'none' }}>Admin</button>
                        </div>

                        {/* Botão Google */}
                        <div style={{ marginBottom: '1rem' }}>
                            <GoogleLogin 
                                onSuccess={handleGoogleSuccess}
                                onError={() => setAlert({ message: 'Falha na autenticação com Google.', type: 'error' })}
                                useOneTap
                                theme="outline"
                                width="100%"
                                text="continue_with"
                            />
                        </div>

                    <div style={{ textAlign: 'center', margin: '1rem 0', color: '#94a3b8', fontSize: '0.75rem' }}>ou</div>

                        <form onSubmit={handleLogin}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.375rem' }}>
                                    {userType === 'aluno' ? 'E-mail institucional' : userType === 'empresa' ? 'E-mail corporativo' : 'E-mail administrativo'}
                                </label>
                                <input 
                                    type="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    placeholder={userType === 'aluno' ? 'seu.email@aluno.ifce.edu.br' : userType === 'empresa' ? 'contato@empresa.com' : 'admin@hirefy.com'} 
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.875rem', background: '#F8FAFC', color: '#0F172A' }} 
                                    required 
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.375rem' }}>Senha</label>
                                <div style={{ position: 'relative' }}>
                                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Sua senha" style={{ width: '100%', padding: '0.75rem', paddingRight: '2.5rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.875rem', background: '#F8FAFC', color: '#0F172A' }} required />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', background: 'none', border: 'none', color: '#64748b' }}>{showPassword ? <FaEyeSlash /> : <FaEye />}</button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem 0 1.5rem', fontSize: '0.875rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#475569' }}><input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} style={{ accentColor: '#059669' }} /> Lembrar-me</label>
                                <button type="button" onClick={() => setAlert({ message: 'Recuperação de senha em desenvolvimento!', type: 'info' })} style={{ color: '#059669', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Esqueceu sua senha?</button>
                            </div>

                            <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.75rem', background: '#059669', color: '#F8FAFC', border: 'none', borderRadius: '0.5rem', fontWeight: 700, cursor: 'pointer', marginBottom: '1rem' }}>Entrar</button>
                        </form>

                        <div style={{ textAlign: 'center', fontSize: '0.875rem', color: '#64748b' }}>Ainda não tem uma conta? <Link href="/cadastro" style={{ color: '#059669', textDecoration: 'none', fontWeight: 700 }}>Cadastre-se</Link></div>
                    </div>
                </div>
            </div>

            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.75rem', borderTop: '1px solid #e2e8f0', marginTop: '3rem' }}>© 2024 Hirefy - IFCE Campus Cedro. Todos os direitos reservados.</div>
        </div>
    );
};

export default LoginPage;