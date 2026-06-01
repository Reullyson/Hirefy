import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { FaEye, FaEyeSlash, FaRocket, FaUserGraduate, FaBuilding, FaShieldAlt } from 'react-icons/fa';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import Alert from './components/Alert';
import LoadingOverlay from './components/LoadingOverlay';
import { userService } from '@/services/api';
import { toast } from 'sonner';

const RegisterPage = () => {
    const [, setLocation] = useLocation();
    
    const [tipo, setTipo] = useState('aluno');
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [curso, setCurso] = useState('');
    const [matricula, setMatricula] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [nomeEmpresa, setNomeEmpresa] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmSenha, setConfirmSenha] = useState('');
    const [termos, setTermos] = useState(false);
    const [showSenha, setShowSenha] = useState(false);
    const [showConfirmSenha, setShowConfirmSenha] = useState(false);
    const [alert, setAlert] = useState<{ message: string; type: 'error' | 'success' | 'info' } | null>(null);
    const [loading, setLoading] = useState(false);
    const [isGoogleVerified, setIsGoogleVerified] = useState(false);

    useEffect(() => {
        // Verificar se há dados do Google vindos do Login
        const storedGoogleData = sessionStorage.getItem('hirefy_google_data');
        if (storedGoogleData) {
            const data = JSON.parse(storedGoogleData);
            setNome(data.nome);
            setEmail(data.email);
            setIsGoogleVerified(true);
            setTipo('aluno');
            sessionStorage.removeItem('hirefy_google_data');
            setAlert({ message: 'Dados do Google importados. Complete seu cadastro abaixo.', type: 'info' });
        }
    }, []);

    const handleGoogleSuccess = (credentialResponse: any) => {
        try {
            const decoded: any = jwtDecode(credentialResponse.credential);
            const googleEmail = decoded.email;
            const googleName = decoded.name;

            if (tipo === 'aluno' && !googleEmail.endsWith('@aluno.ifce.edu.br')) {
                setAlert({ message: 'Apenas e-mails @aluno.ifce.edu.br são permitidos para estudantes.', type: 'error' });
                return;
            }

            setNome(googleName);
            setEmail(googleEmail);
            setIsGoogleVerified(true);
            setAlert({ message: `Olá ${googleName.split(' ')[0]}! Nome e E-mail foram preenchidos. Agora informe sua matrícula e senha.`, type: 'success' });
        } catch (err) {
            setAlert({ message: 'Erro ao processar dados do Google.', type: 'error' });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!nome || !email || !senha || !confirmSenha) {
            setAlert({ message: 'Preencha todos os campos obrigatórios', type: 'error' });
            return;
        }
        
        if (tipo === 'aluno' && !email.endsWith('@aluno.ifce.edu.br')) {
            setAlert({ message: 'Alunos devem usar e-mail institucional @aluno.ifce.edu.br', type: 'error' });
            return;
        }
        
        if (senha !== confirmSenha) {
            setAlert({ message: 'As senhas não coincidem', type: 'error' });
            return;
        }
        
        if (senha.length < 8) {
            setAlert({ message: 'A senha deve ter pelo menos 8 caracteres', type: 'error' });
            return;
        }
        
        if (!termos) {
            setAlert({ message: 'Você precisa aceitar os Termos de Uso e Política de Privacidade', type: 'error' });
            return;
        }
        
        setLoading(true);
        setAlert(null);
        
        const dadosCadastro: any = { 
            nome, 
            email, 
            password: senha, 
            user_type: tipo === 'aluno' ? 'ALUNO' : 'RECRUTADOR'
        };

        if (tipo === 'aluno') {
            dadosCadastro.full_name = nome;
            dadosCadastro.enrollment = matricula;
            dadosCadastro.city = 'Cedro'; 
            dadosCadastro.semester = 1;
        } else {
            dadosCadastro.cnpj = cnpj;
            dadosCadastro.company_name = nomeEmpresa;
        }

        try {
            await userService.register(dadosCadastro);
            toast.success('Conta criada com sucesso!');
            setAlert({ message: 'Conta criada com sucesso! Redirecionando...', type: 'success' });
            setTimeout(() => setLocation('/login'), 2000);
        } catch (err: any) {
            const errorMsg = err.response?.data?.detail || JSON.stringify(err.response?.data) || err.message || 'Erro ao criar conta.';
            setAlert({ message: errorMsg, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white min-h-screen">
            <LoadingOverlay visible={loading} message="Criando sua conta..." />
            
            <div style={{ 
                maxWidth: '680px', 
                margin: '0 auto', 
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Banner Superior */}
                <div style={{ 
                    background: 'linear-gradient(105deg, #0F172A 0%, #059669 100%)', 
                    color: '#F8FAFC', 
                    padding: '2rem', 
                    textAlign: 'center', 
                    borderRadius: '2rem', 
                    marginBottom: '2rem',
                    boxShadow: '0 8px 20px rgba(15, 23, 42, 0.15)'
                }}>
                    <h1 style={{ fontSize: '1.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                        <FaRocket style={{ marginRight: '0.5rem', color: '#4CAF50' }} /> 
                        Crie sua conta no Hirefy
                    </h1>
                    <p style={{ fontSize: '0.95rem', opacity: 0.95, marginBottom: '1rem' }}>
                        Junte-se à plataforma que conecta você às melhores oportunidades profissionais.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1.8rem', flexWrap: 'wrap' }}>
                        <span style={{ background: 'rgba(255,255,255,0.15)', padding: '0.3rem 1rem', borderRadius: '40px', fontSize: '0.85rem' }}>
                            <FaUserGraduate style={{ marginRight: '0.25rem' }} /> Para Alunos
                        </span>
                        <span style={{ background: 'rgba(255,255,255,0.15)', padding: '0.3rem 1rem', borderRadius: '40px', fontSize: '0.85rem' }}>
                            <FaBuilding style={{ marginRight: '0.25rem' }} /> Para Empresas
                        </span>
                        <span style={{ background: 'rgba(255,255,255,0.15)', padding: '0.3rem 1rem', borderRadius: '40px', fontSize: '0.85rem' }}>
                            <FaShieldAlt style={{ marginRight: '0.25rem' }} /> Seguro e Confiável
                        </span>
                    </div>
                </div>

                {/* Formulário */}
                <div style={{ 
                    background: '#F8FAFC', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '2rem', 
                    padding: '2rem',
                    boxShadow: '0 20px 35px -12px rgba(15, 23, 42, 0.15)',
                    flex: 1
                }}>
                    <h2 style={{ fontSize: '1.7rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.25rem' }}>
                        Criar nova conta
                    </h2>
                    <div style={{ 
                        color: '#64748b', 
                        fontSize: '0.9rem', 
                        marginBottom: '1.8rem', 
                        borderLeft: '4px solid #059669', 
                        paddingLeft: '0.8rem' 
                    }}>
                        Preencha seus dados para começar
                    </div>

                    {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}

                    {/* Botão Google para preenchimento */}
                    {tipo === 'aluno' && !isGoogleVerified && (
                        <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.5rem' }}>
                            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem', textAlign: 'center' }}>Facilite seu cadastro com Google:</p>
                            <GoogleLogin 
                                onSuccess={handleGoogleSuccess}
                                onError={() => setAlert({ message: 'Falha ao obter dados do Google.', type: 'error' })}
                                theme="outline"
                                width="100%"
                                text="continue_with"
                            />
                        </div>
                    )}

                    {/* Tipo de conta */}
                    <div style={{ 
                        background: '#f1f5f9', 
                        padding: '1rem 1.5rem', 
                        borderRadius: '1.2rem', 
                        marginBottom: '1.8rem',
                        border: '1px solid #e2e8f0'
                    }}>
                        <label style={{ fontWeight: 600, color: '#0F172A', display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                            Tipo de conta
                        </label>
                        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: isGoogleVerified ? 'not-allowed' : 'pointer', fontWeight: 500, color: '#334155', opacity: isGoogleVerified && tipo !== 'aluno' ? 0.5 : 1 }}>
                                <input type="radio" value="aluno" checked={tipo === 'aluno'} onChange={() => !isGoogleVerified && setTipo('aluno')} disabled={isGoogleVerified} style={{ accentColor: '#059669' }} /> 
                                Aluno (Estudante)
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: isGoogleVerified ? 'not-allowed' : 'pointer', fontWeight: 500, color: '#334155', opacity: isGoogleVerified && tipo !== 'empresa' ? 0.5 : 1 }}>
                                <input type="radio" value="empresa" checked={tipo === 'empresa'} onChange={() => !isGoogleVerified && setTipo('empresa')} disabled={isGoogleVerified} style={{ accentColor: '#059669' }} /> 
                                Empresa (Recrutador)
                            </label>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1.2rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.375rem' }}>
                                Nome completo
                            </label>
                            <input 
                                type="text" 
                                value={nome} 
                                onChange={(e) => setNome(e.target.value)} 
                                placeholder="Seu nome completo" 
                                readOnly={isGoogleVerified}
                                style={{ 
                                    width: '100%', 
                                    padding: '12px 15px', 
                                    border: '1.5px solid #e2e8f0', 
                                    borderRadius: '18px', 
                                    fontSize: '0.95rem', 
                                    background: isGoogleVerified ? '#f1f5f9' : '#F8FAFC',
                                    transition: 'all 0.2s',
                                    outline: 'none',
                                    color: isGoogleVerified ? '#64748b' : '#0F172A'
                                }}
                                required 
                            />
                        </div>

                        <div style={{ marginBottom: '1.2rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.375rem' }}>
                                {tipo === 'aluno' ? 'E-mail institucional' : 'E-mail corporativo'}
                            </label>
                            <input 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                placeholder={tipo === 'aluno' ? 'seu.email@aluno.ifce.edu.br' : 'contato@empresa.com'} 
                                readOnly={isGoogleVerified}
                                style={{ 
                                    width: '100%', 
                                    padding: '12px 15px', 
                                    border: '1.5px solid #e2e8f0', 
                                    borderRadius: '18px', 
                                    fontSize: '0.95rem', 
                                    background: isGoogleVerified ? '#f1f5f9' : '#F8FAFC',
                                    transition: 'all 0.2s',
                                    outline: 'none',
                                    color: isGoogleVerified ? '#64748b' : '#0F172A'
                                }}
                                required 
                            />
                            {tipo === 'aluno' && <small style={{ fontSize: '0.7rem', color: '#64748b' }}>use @aluno.ifce.edu.br</small>}
                        </div>

                        {/* Campos Aluno */}
                        {tipo === 'aluno' && (
                            <>
                                <div style={{ marginBottom: '1.2rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.375rem' }}>
                                        Curso
                                    </label>
                                    <select 
                                        value={curso} 
                                        onChange={(e) => setCurso(e.target.value)} 
                                        style={{ 
                                            width: '100%', 
                                            padding: '12px 15px', 
                                            border: '1.5px solid #e2e8f0', 
                                            borderRadius: '18px', 
                                            fontSize: '0.95rem', 
                                            background: '#F8FAFC',
                                            transition: 'all 0.2s',
                                            outline: 'none',
                                            color: '#0F172A'
                                        }}
                                        required
                                    >
                                        <option value="">Selecionar seu curso</option>
                                        <option>Sistemas de Informação</option>
                                        <option>Análise e Desenvolvimento de Sistemas</option>
                                        <option>Ciência da Computação</option>
                                        <option>Engenharia de Software</option>
                                    </select>
                                </div>
                                <div style={{ marginBottom: '1.2rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.375rem' }}>
                                        Matrícula
                                    </label>
                                    <input 
                                        type="text" 
                                        value={matricula} 
                                        onChange={(e) => setMatricula(e.target.value)} 
                                        placeholder="Sua matrícula" 
                                        style={{ 
                                            width: '100%', 
                                            padding: '12px 15px', 
                                            border: '1.5px solid #e2e8f0', 
                                            borderRadius: '18px', 
                                            fontSize: '0.95rem', 
                                            background: '#F8FAFC',
                                            transition: 'all 0.2s',
                                            outline: 'none',
                                            color: '#0F172A'
                                        }}
                                        required 
                                    />
                                </div>
                            </>
                        )}

                        {/* Campos Empresa */}
                        {tipo === 'empresa' && (
                            <>
                                <div style={{ marginBottom: '1.2rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.375rem' }}>
                                        CNPJ
                                    </label>
                                    <input 
                                        type="text" 
                                        value={cnpj} 
                                        onChange={(e) => setCnpj(e.target.value)} 
                                        placeholder="00.000.000/0001-00" 
                                        style={{ 
                                            width: '100%', 
                                            padding: '12px 15px', 
                                            border: '1.5px solid #e2e8f0', 
                                            borderRadius: '18px', 
                                            fontSize: '0.95rem', 
                                            background: '#F8FAFC',
                                            transition: 'all 0.2s',
                                            outline: 'none',
                                            color: '#0F172A'
                                        }}
                                        required 
                                    />
                                </div>
                                <div style={{ marginBottom: '1.2rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.375rem' }}>
                                        Nome da Empresa
                                    </label>
                                    <input 
                                        type="text" 
                                        value={nomeEmpresa} 
                                        onChange={(e) => setNomeEmpresa(e.target.value)} 
                                        placeholder="Razão social" 
                                        style={{ 
                                            width: '100%', 
                                            padding: '12px 15px', 
                                            border: '1.5px solid #e2e8f0', 
                                            borderRadius: '18px', 
                                            fontSize: '0.95rem', 
                                            background: '#F8FAFC',
                                            transition: 'all 0.2s',
                                            outline: 'none',
                                            color: '#0F172A'
                                        }}
                                        required 
                                    />
                                </div>
                            </>
                        )}

                        <div style={{ marginBottom: '1.2rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.375rem' }}>
                                Senha
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input 
                                    type={showSenha ? 'text' : 'password'} 
                                    value={senha} 
                                    onChange={(e) => setSenha(e.target.value)} 
                                    placeholder="Crie uma senha segura" 
                                    style={{ 
                                        width: '100%', 
                                        padding: '12px 15px', 
                                        paddingRight: '40px',
                                        border: '1.5px solid #e2e8f0', 
                                        borderRadius: '18px', 
                                        fontSize: '0.95rem', 
                                        background: '#F8FAFC',
                                        transition: 'all 0.2s',
                                        outline: 'none',
                                        color: '#0F172A'
                                    }}
                                    required 
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowSenha(!showSenha)} 
                                    style={{ 
                                        position: 'absolute', 
                                        right: '12px', 
                                        top: '50%', 
                                        transform: 'translateY(-50%)', 
                                        background: 'none', 
                                        border: 'none', 
                                        cursor: 'pointer',
                                        color: '#94a3b8'
                                    }}
                                >
                                    {showSenha ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            <small style={{ fontSize: '0.7rem', color: '#64748b' }}>Mínimo 8 caracteres, com letra e número</small>
                        </div>

                        <div style={{ marginBottom: '1.2rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.375rem' }}>
                                Confirmar senha
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input 
                                    type={showConfirmSenha ? 'text' : 'password'} 
                                    value={confirmSenha} 
                                    onChange={(e) => setConfirmSenha(e.target.value)} 
                                    placeholder="Confirmar sua senha" 
                                    style={{ 
                                        width: '100%', 
                                        padding: '12px 15px', 
                                        paddingRight: '40px',
                                        border: '1.5px solid #e2e8f0', 
                                        borderRadius: '18px', 
                                        fontSize: '0.95rem', 
                                        background: '#F8FAFC',
                                        transition: 'all 0.2s',
                                        outline: 'none',
                                        color: '#0F172A'
                                    }}
                                    required 
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowConfirmSenha(!showConfirmSenha)} 
                                    style={{ 
                                        position: 'absolute', 
                                        right: '12px', 
                                        top: '50%', 
                                        transform: 'translateY(-50%)', 
                                        background: 'none', 
                                        border: 'none', 
                                        cursor: 'pointer',
                                        color: '#94a3b8'
                                    }}
                                >
                                    {showConfirmSenha ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        {isGoogleVerified && (
                             <button 
                             type="button" 
                             onClick={() => { setIsGoogleVerified(false); setNome(''); setEmail(''); }}
                             style={{ background: 'none', border: 'none', color: '#059669', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', marginBottom: '1rem', padding: 0 }}
                             >
                                 Alterar e-mail/nome (sair do modo Google)
                             </button>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '1rem 0 1.5rem' }}>
                            <input 
                                type="checkbox" 
                                checked={termos} 
                                onChange={(e) => setTermos(e.target.checked)} 
                                style={{ width: '18px', height: '18px', accentColor: '#059669', cursor: 'pointer' }} 
                                required 
                            />
                            <label style={{ fontSize: '0.85rem', color: '#64748b', cursor: 'pointer' }}>
                                Li e aceito os <a href="#" style={{ color: '#059669', textDecoration: 'none', fontWeight: 600 }}>Termos de Uso</a> e <a href="#" style={{ color: '#059669', textDecoration: 'none', fontWeight: 600 }}>Política de Privacidade</a>
                            </label>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading} 
                            style={{ 
                                width: '100%', 
                                padding: '14px', 
                                background: '#059669', 
                                color: '#F8FAFC', 
                                border: 'none', 
                                borderRadius: '40px', 
                                fontWeight: 700, 
                                fontSize: '1rem', 
                                cursor: 'pointer', 
                                marginBottom: '1rem',
                                transition: 'all 0.2s',
                                boxShadow: '0 4px 8px rgba(5, 150, 105, 0.2)'
                            }}
                        >
                            Criar conta
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', fontSize: '0.9rem', paddingTop: '1.2rem', borderTop: '1px solid #e2e8f0', color: '#64748b' }}>
                        Já tem uma conta? <Link href="/login" style={{ color: '#059669', textDecoration: 'none', fontWeight: 700 }}>Entrar</Link>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b', fontSize: '0.7rem', borderTop: '1px solid #e2e8f0', marginTop: '2rem' }}>
                    © 2024 Hirefy - IFCE Campus Cedro. Todos os direitos reservados.
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;