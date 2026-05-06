import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { FaUserShield, FaEye, FaEyeSlash, FaPaperPlane } from 'react-icons/fa';
import { authService } from '@/services/api';
import { toast } from 'sonner';

const AdminLoginPage = () => {
    const [, setLocation] = useLocation();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email || !password) {
            setError('Por favor, preencha e-mail e senha');
            return;
        }
        
        setLoading(true);
        setError(null);
        
        try {
            const response = await authService.login({ email, password });
            const { access, refresh } = response.data;
            
            localStorage.setItem('hirefy_access_token', access);
            localStorage.setItem('hirefy_refresh_token', refresh);
            
            toast.success('Bem-vindo ao painel administrativo!');
            window.location.href = '/admin';
        } catch (err: any) {
            const errorMsg = err.response?.data?.detail || 'Erro ao realizar login. Verifique suas credenciais.';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-900">
            <div style={{ maxWidth: '420px', margin: '0 auto', padding: '2rem', flex: 1, width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#F8FAFC', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                        <FaUserShield /> Hirefy Admin
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Painel Administrativo</div>
                </div>

                <div style={{ background: '#1E293B', padding: '2rem', borderRadius: '1rem', border: '1px solid #334155' }}>
                    <h3 style={{ fontSize: '1.25rem', color: '#F8FAFC', marginBottom: '0.5rem' }}>Acesso Restrito</h3>
                    <div style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Apenas para administradores do sistema</div>

                    {error && (
                        <div style={{ background: '#7F1D1D', color: '#FECACA', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem', marginBottom: '1rem' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#F8FAFC', marginBottom: '0.375rem' }}>E-mail Admin</label>
                            <input 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                placeholder="admin@hirefy.com" 
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #334155', borderRadius: '0.5rem', fontSize: '0.875rem', background: '#0F172A', color: '#F8FAFC' }} 
                                required 
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#F8FAFC', marginBottom: '0.375rem' }}>Senha</label>
                            <div style={{ position: 'relative' }}>
                                <input 
                                    type={showPassword ? 'text' : 'password'} 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    placeholder="••••••••" 
                                    style={{ width: '100%', padding: '0.75rem', paddingRight: '2.5rem', border: '1px solid #334155', borderRadius: '0.5rem', fontSize: '0.875rem', background: '#0F172A', color: '#F8FAFC' }} 
                                    required 
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)} 
                                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', background: 'none', border: 'none', color: '#94a3b8' }}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            style={{ width: '100%', padding: '0.75rem', background: '#059669', color: '#F8FAFC', border: 'none', borderRadius: '0.5rem', fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
                        >
                            {loading ? 'Entrando...' : 'Acessar Painel'}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', fontSize: '0.875rem', color: '#64748b', marginTop: '1.5rem' }}>
                        <Link href="/login" style={{ color: '#059669', textDecoration: 'none', fontWeight: 600 }}>Voltar ao login padrão</Link>
                    </div>
                </div>
            </div>

            <div style={{ textAlign: 'center', padding: '2rem', color: '#475569', fontSize: '0.75rem' }}>© 2024 Hirefy - IFCE. Todos os direitos reservados.</div>
        </div>
    );
};

export default AdminLoginPage;