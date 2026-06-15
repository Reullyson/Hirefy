import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { FaEye, FaEyeSlash, FaMapMarkerAlt, FaUserEdit, FaChartLine, FaHandshake, FaPaperPlane } from 'react-icons/fa';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import Alert from './components/Alert';
import LoadingOverlay from './components/LoadingOverlay';
import { userService } from '@/services/api';
import { toast } from 'sonner';

// ==================== FUNÇÕES DE VALIDAÇÃO ====================

// Validação de CNPJ (calcula dígitos verificadores)
const validarCNPJ = (cnpj: string): boolean => {
    // Remove caracteres especiais
    cnpj = cnpj.replace(/[^\d]/g, '');
    
    // Verifica se tem 14 dígitos
    if (cnpj.length !== 14) return false;
    
    // Verifica se todos os dígitos são iguais (ex: 11111111111111)
    if (/^(\d)\1+$/.test(cnpj)) return false;
    
    // Validação do primeiro dígito verificador
    let soma = 0;
    let peso = 5;
    for (let i = 0; i < 12; i++) {
        soma += parseInt(cnpj.charAt(i)) * peso;
        peso = peso === 2 ? 9 : peso - 1;
    }
    let resto = soma % 11;
    let digito1 = resto < 2 ? 0 : 11 - resto;
    if (parseInt(cnpj.charAt(12)) !== digito1) return false;
    
    // Validação do segundo dígito verificador
    soma = 0;
    peso = 6;
    for (let i = 0; i < 13; i++) {
        soma += parseInt(cnpj.charAt(i)) * peso;
        peso = peso === 2 ? 9 : peso - 1;
    }
    resto = soma % 11;
    let digito2 = resto < 2 ? 0 : 11 - resto;
    if (parseInt(cnpj.charAt(13)) !== digito2) return false;
    
    return true;
};

// Formata CNPJ automaticamente (XX.XXX.XXX/XXXX-XX)
const formatarCNPJ = (valor: string): string => {
    const cnpj = valor.replace(/[^\d]/g, '');
    if (cnpj.length <= 2) return cnpj;
    if (cnpj.length <= 5) return `${cnpj.slice(0, 2)}.${cnpj.slice(2)}`;
    if (cnpj.length <= 8) return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5)}`;
    if (cnpj.length <= 12) return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8)}`;
    return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8, 12)}-${cnpj.slice(12, 14)}`;
};

// Validação de e-mail institucional do IFCE
const validarEmailInstitucional = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@aluno\.ifce\.edu\.br$/;
    return emailRegex.test(email);
};

// Validação de e-mail corporativo (formato básico)
const validarEmailCorporativo = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
};

// Validação de matrícula (exatamente 14 dígitos)
const validarMatricula = (matricula: string): boolean => {
    const matriculaRegex = /^\d{14}$/;
    return matriculaRegex.test(matricula);
};

// Validação de senha forte
const validarSenhaForte = (senha: string): { valida: boolean; mensagem: string } => {
    if (senha.length < 8) {
        return { valida: false, mensagem: 'A senha deve ter pelo menos 8 caracteres' };
    }
    if (!/[a-z]/.test(senha)) {
        return { valida: false, mensagem: 'A senha deve conter pelo menos uma letra minúscula' };
    }
    if (!/[A-Z]/.test(senha)) {
        return { valida: false, mensagem: 'A senha deve conter pelo menos uma letra maiúscula' };
    }
    if (!/[0-9]/.test(senha)) {
        return { valida: false, mensagem: 'A senha deve conter pelo menos um número' };
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(senha)) {
        return { valida: false, mensagem: 'A senha deve conter pelo menos um caractere especial (!@#$%^&* etc.)' };
    }
    return { valida: true, mensagem: '' };
};

const RegisterPage = () => {
    const [, setLocation] = useLocation();
    
    // Estados dos campos
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
    
    // Estados de erro para validação em tempo real
    const [cnpjError, setCnpjError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [matriculaError, setMatriculaError] = useState('');
    const [senhaError, setSenhaError] = useState('');
    const [confirmSenhaError, setConfirmSenhaError] = useState('');

    useEffect(() => {
        const storedGoogleData = sessionStorage.getItem('hirefy_google_data');
        if (storedGoogleData) {
            const data = JSON.parse(storedGoogleData);
            setNome(data.nome);
            setEmail(data.email);
            setIsGoogleVerified(true);
            if (data.email && data.email.endsWith('@aluno.ifce.edu.br')) {
                setTipo('aluno');
            } else {
                setTipo('empresa');
            }
            sessionStorage.removeItem('hirefy_google_data');
            setAlert({ message: 'Dados do Google importados. Complete seu cadastro abaixo.', type: 'info' });
        }
    }, []);

    const handleGoogleSuccess = (credentialResponse: any) => {
        try {
            const decoded: any = jwtDecode(credentialResponse.credential);
            const googleEmail = decoded.email;
            const googleName = decoded.name;

            setNome(googleName);
            setEmail(googleEmail);
            
            if (googleEmail && googleEmail.endsWith('@aluno.ifce.edu.br')) {
                setTipo('aluno');
            } else {
                setTipo('empresa');
            }
            
            setIsGoogleVerified(true);
            setAlert({ message: `Olá ${googleName.split(' ')[0]}! Nome e E-mail foram preenchidos. Complete seu cadastro.`, type: 'success' });
        } catch (err) {
            setAlert({ message: 'Erro ao processar dados do Google.', type: 'error' });
        }
    };

    // Funções de validação em tempo real
    const handleCnpjChange = (valor: string) => {
        const apenasNumeros = valor.replace(/[^\d]/g, '');
        const formatado = formatarCNPJ(valor);
        setCnpj(formatado);
        
        if (apenasNumeros.length === 14) {
            if (!validarCNPJ(apenasNumeros)) {
                setCnpjError('CNPJ inválido. Verifique os dígitos.');
            } else {
                setCnpjError('');
            }
        } else if (apenasNumeros.length > 0 && apenasNumeros.length < 14) {
            setCnpjError(`CNPJ deve ter 14 dígitos (faltam ${14 - apenasNumeros.length})`);
        } else {
            setCnpjError('');
        }
    };

    const handleEmailChange = (emailValor: string) => {
        setEmail(emailValor);
        
        if (!emailValor) {
            setEmailError('');
            return;
        }
        
        if (tipo === 'aluno') {
            if (!validarEmailInstitucional(emailValor)) {
                setEmailError('E-mail inválido. Use o formato: nome@aluno.ifce.edu.br');
            } else {
                setEmailError('');
            }
        } else {
            if (!validarEmailCorporativo(emailValor)) {
                setEmailError('E-mail corporativo inválido. Exemplo: contato@empresa.com.br');
            } else {
                setEmailError('');
            }
        }
    };

    const handleMatriculaChange = (valor: string) => {
        const apenasNumeros = valor.replace(/[^\d]/g, '');
        setMatricula(apenasNumeros);
        
        if (apenasNumeros && !validarMatricula(apenasNumeros)) {
            setMatriculaError('Matrícula inválida. Deve conter exatamente 14 dígitos numéricos.');
        } else {
            setMatriculaError('');
        }
    };

    const handleSenhaChange = (senhaValor: string) => {
        setSenha(senhaValor);
        const resultado = validarSenhaForte(senhaValor);
        setSenhaError(resultado.valida ? '' : resultado.mensagem);
        
        if (confirmSenha && senhaValor !== confirmSenha) {
            setConfirmSenhaError('As senhas não coincidem');
        } else if (confirmSenha && senhaValor === confirmSenha) {
            setConfirmSenhaError('');
        }
    };

    const handleConfirmSenhaChange = (confirmValor: string) => {
        setConfirmSenha(confirmValor);
        
        if (senha !== confirmValor) {
            setConfirmSenhaError('As senhas não coincidem');
        } else {
            setConfirmSenhaError('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validação de CNPJ (se for empresa)
        if (tipo === 'empresa') {
            const cnpjNumeros = cnpj.replace(/[^\d]/g, '');
            if (!validarCNPJ(cnpjNumeros)) {
                setAlert({ message: 'CNPJ inválido. Verifique o número informado.', type: 'error' });
                return;
            }
        }
        
        // Validação de e-mail
        if (tipo === 'aluno' && !validarEmailInstitucional(email)) {
            setAlert({ message: 'E-mail inválido. Use @aluno.ifce.edu.br', type: 'error' });
            return;
        }
        
        if (tipo === 'empresa' && !validarEmailCorporativo(email)) {
            setAlert({ message: 'E-mail corporativo inválido.', type: 'error' });
            return;
        }
        
        // Validação de matrícula
        if (tipo === 'aluno' && !validarMatricula(matricula)) {
            setAlert({ message: 'Matrícula inválida. Deve conter exatamente 14 dígitos.', type: 'error' });
            return;
        }
        
        // Validação de senha forte
        const senhaValidation = validarSenhaForte(senha);
        if (!senhaValidation.valida) {
            setAlert({ message: senhaValidation.mensagem, type: 'error' });
            return;
        }
        
        if (!nome || !email || !senha || !confirmSenha) {
            setAlert({ message: 'Preencha todos os campos obrigatórios', type: 'error' });
            return;
        }
        
        if (senha !== confirmSenha) {
            setAlert({ message: 'As senhas não coincidem', type: 'error' });
            return;
        }
        
        if (!termos) {
            setAlert({ message: 'Você precisa aceitar os Termos de Uso e Política de Privacidade', type: 'error' });
            return;
        }
        
        if (tipo === 'aluno' && !matricula) {
            setAlert({ message: 'Preencha o campo de matrícula', type: 'error' });
            return;
        }
        
        if (tipo === 'empresa' && (!cnpj || !nomeEmpresa)) {
            setAlert({ message: 'Preencha todos os campos da empresa (CNPJ e Nome da Empresa)', type: 'error' });
            return;
        }
        
        setLoading(true);
        setAlert(null);
        
        const dadosCadastro: any = { 
            nome: tipo === 'empresa' ? nomeEmpresa : nome,
            email, 
            password: senha, 
            user_type: tipo === 'aluno' ? 'ALUNO' : 'RECRUTADOR'
        };

        if (tipo === 'aluno') {
            dadosCadastro.full_name = nome;
            dadosCadastro.enrollment = matricula;
            dadosCadastro.city = 'Cedro'; 
            dadosCadastro.semester = 1;
            dadosCadastro.course = curso;
        } else {
            dadosCadastro.cnpj = cnpj.replace(/[^\d]/g, '');
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

    const features = [
        { icon: FaMapMarkerAlt, title: 'Oportunidades Locais e Externas', description: 'Vagas nativas e integração com Gupy para mais possibilidades.' },
        { icon: FaUserEdit, title: 'Gestão de Perfil', description: 'Destaque suas competências, experiências e conquistas acadêmicas.' },
        { icon: FaChartLine, title: 'Processo Simplificado', description: 'Acompanhe todas as etapas da sua candidatura em um só lugar.' },
        { icon: FaHandshake, title: 'Conexão com Empresas', description: 'Empresas parceiras do IFCE buscando talentos como você.' }
    ];

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <LoadingOverlay visible={loading} message="Criando sua conta..." />
            
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', flex: 1, width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, background: 'linear-gradient(135deg, #059669 0%, #0F172A 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                        <FaPaperPlane /> Hirefy
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Conectando talentos a oportunidades</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                    {/* Lado Esquerdo */}
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
                        <h3 style={{ fontSize: '1.5rem', color: '#0F172A', marginBottom: '0.5rem' }}>Criar nova conta</h3>
                        <div style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Preencha seus dados para começar</div>

                        {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}

                        {/* Tipo de conta */}
                        <div style={{ 
                            background: '#f1f5f9', 
                            padding: '1rem', 
                            borderRadius: '0.75rem', 
                            marginBottom: '1.5rem',
                            border: '1px solid #e2e8f0'
                        }}>
                            <label style={{ fontWeight: 600, color: '#0F172A', display: 'block', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
                                Tipo de conta
                            </label>
                            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: isGoogleVerified ? 'not-allowed' : 'pointer', fontWeight: 500, color: '#334155', opacity: isGoogleVerified && tipo !== 'aluno' ? 0.5 : 1 }}>
                                    <input type="radio" value="aluno" checked={tipo === 'aluno'} onChange={() => !isGoogleVerified && setTipo('aluno')} disabled={isGoogleVerified} style={{ accentColor: '#059669' }} /> 
                                    🎓 Aluno (Estudante)
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: isGoogleVerified ? 'not-allowed' : 'pointer', fontWeight: 500, color: '#334155', opacity: isGoogleVerified && tipo !== 'empresa' ? 0.5 : 1 }}>
                                    <input type="radio" value="empresa" checked={tipo === 'empresa'} onChange={() => !isGoogleVerified && setTipo('empresa')} disabled={isGoogleVerified} style={{ accentColor: '#059669' }} /> 
                                    🏢 Empresa (Recrutador)
                                </label>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Nome ou Nome da Empresa */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.375rem' }}>
                                    {tipo === 'aluno' ? 'Nome completo' : 'Nome da Empresa'}
                                </label>
                                <input 
                                    type="text" 
                                    value={tipo === 'aluno' ? nome : nomeEmpresa} 
                                    onChange={(e) => {
                                        if (tipo === 'aluno') {
                                            setNome(e.target.value);
                                        } else {
                                            setNomeEmpresa(e.target.value);
                                        }
                                    }} 
                                    placeholder={tipo === 'aluno' ? 'Seu nome completo' : 'Nome da sua empresa'} 
                                    readOnly={isGoogleVerified && tipo === 'aluno'}
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.875rem', background: (isGoogleVerified && tipo === 'aluno') ? '#f1f5f9' : '#F8FAFC', color: (isGoogleVerified && tipo === 'aluno') ? '#64748b' : '#0F172A' }} 
                                    required 
                                />
                            </div>

                            {/* E-mail */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.375rem' }}>
                                    {tipo === 'aluno' ? 'E-mail institucional' : 'E-mail corporativo'}
                                </label>
                                <input 
                                    type="email" 
                                    value={email} 
                                    onChange={(e) => handleEmailChange(e.target.value)} 
                                    placeholder={tipo === 'aluno' ? 'seu.email@aluno.ifce.edu.br' : 'contato@empresa.com.br'} 
                                    readOnly={isGoogleVerified}
                                    style={{ width: '100%', padding: '0.75rem', border: `1px solid ${emailError ? '#ef4444' : '#e2e8f0'}`, borderRadius: '0.5rem', fontSize: '0.875rem', background: isGoogleVerified ? '#f1f5f9' : '#F8FAFC', color: isGoogleVerified ? '#64748b' : '#0F172A' }} 
                                    required 
                                />
                                {emailError && <small style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '0.25rem', display: 'block' }}>{emailError}</small>}
                                {!emailError && email && tipo === 'aluno' && !isGoogleVerified && <small style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>use @aluno.ifce.edu.br</small>}
                                {!emailError && email && tipo === 'empresa' && !isGoogleVerified && <small style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>use e-mail corporativo (ex: contato@empresa.com.br)</small>}
                            </div>

                            {/* Campos Aluno */}
                            {tipo === 'aluno' && (
                                <>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.375rem' }}>
                                            Curso
                                        </label>
                                        <select 
                                            value={curso} 
                                            onChange={(e) => setCurso(e.target.value)} 
                                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.875rem', background: '#F8FAFC', color: '#0F172A' }}
                                            required={tipo === 'aluno'}
                                        >
                                            <option value="">Selecionar seu curso</option>
                                            <option>Sistemas de Informação</option>
                                            <option>Análise e Desenvolvimento de Sistemas</option>
                                            <option>Ciência da Computação</option>
                                            <option>Engenharia de Software</option>
                                        </select>
                                    </div>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.375rem' }}>
                                            Matrícula
                                        </label>
                                        <input 
                                            type="text" 
                                            value={matricula} 
                                            onChange={(e) => handleMatriculaChange(e.target.value)} 
                                            placeholder="Sua matrícula (ex: 20240010001234)" 
                                            maxLength={14}
                                            style={{ width: '100%', padding: '0.75rem', border: `1px solid ${matriculaError ? '#ef4444' : '#e2e8f0'}`, borderRadius: '0.5rem', fontSize: '0.875rem', background: '#F8FAFC', color: '#0F172A' }}
                                            required={tipo === 'aluno'} 
                                        />
                                        {matriculaError && <small style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '0.25rem', display: 'block' }}>{matriculaError}</small>}
                                        {!matriculaError && matricula && matricula.length === 14 && <small style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '0.25rem', display: 'block' }}>✓ Matrícula válida</small>}
                                        <small style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>A matrícula deve conter exatamente 14 dígitos numéricos</small>
                                    </div>
                                </>
                            )}

                            {/* Campos Empresa */}
                            {tipo === 'empresa' && (
                                <>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.375rem' }}>
                                            CNPJ
                                        </label>
                                        <input 
                                            type="text" 
                                            value={cnpj} 
                                            onChange={(e) => handleCnpjChange(e.target.value)} 
                                            placeholder="00.000.000/0001-00" 
                                            style={{ width: '100%', padding: '0.75rem', border: `1px solid ${cnpjError ? '#ef4444' : '#e2e8f0'}`, borderRadius: '0.5rem', fontSize: '0.875rem', background: '#F8FAFC', color: '#0F172A' }}
                                            required={tipo === 'empresa'} 
                                            maxLength={18}
                                        />
                                        {cnpjError && <small style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '0.25rem', display: 'block' }}>{cnpjError}</small>}
                                        {!cnpjError && cnpj && cnpj.replace(/[^\d]/g, '').length === 14 && <small style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '0.25rem', display: 'block' }}>✓ CNPJ válido</small>}
                                    </div>
                                </>
                            )}

                            {/* Senha */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.375rem' }}>
                                    Senha
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        type={showSenha ? 'text' : 'password'} 
                                        value={senha} 
                                        onChange={(e) => handleSenhaChange(e.target.value)} 
                                        placeholder="Crie uma senha segura" 
                                        style={{ width: '100%', padding: '0.75rem', paddingRight: '2.5rem', border: `1px solid ${senhaError ? '#ef4444' : '#e2e8f0'}`, borderRadius: '0.5rem', fontSize: '0.875rem', background: '#F8FAFC', color: '#0F172A' }}
                                        required 
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowSenha(!showSenha)} 
                                        style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', background: 'none', border: 'none', color: '#64748b' }}
                                    >
                                        {showSenha ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                                {senhaError && <small style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '0.25rem', display: 'block' }}>{senhaError}</small>}
                                {!senhaError && senha && <small style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '0.25rem', display: 'block' }}>✓ Senha forte!</small>}
                                {!senhaError && !senha && <small style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>Mínimo 8 caracteres, com letra maiúscula, minúscula, número e caractere especial</small>}
                            </div>

                            {/* Confirmar Senha */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.375rem' }}>
                                    Confirmar senha
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        type={showConfirmSenha ? 'text' : 'password'} 
                                        value={confirmSenha} 
                                        onChange={(e) => handleConfirmSenhaChange(e.target.value)} 
                                        placeholder="Confirmar sua senha" 
                                        style={{ width: '100%', padding: '0.75rem', paddingRight: '2.5rem', border: `1px solid ${confirmSenhaError ? '#ef4444' : '#e2e8f0'}`, borderRadius: '0.5rem', fontSize: '0.875rem', background: '#F8FAFC', color: '#0F172A' }}
                                        required 
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowConfirmSenha(!showConfirmSenha)} 
                                        style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', background: 'none', border: 'none', color: '#64748b' }}
                                    >
                                        {showConfirmSenha ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                                {confirmSenhaError && <small style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '0.25rem', display: 'block' }}>{confirmSenhaError}</small>}
                                {!confirmSenhaError && confirmSenha && senha === confirmSenha && <small style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '0.25rem', display: 'block' }}>✓ Senhas coincidem</small>}
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

                            {/* Termos */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1rem 0 1.5rem' }}>
                                <input 
                                    type="checkbox" 
                                    checked={termos} 
                                    onChange={(e) => setTermos(e.target.checked)} 
                                    style={{ accentColor: '#059669', width: '1rem', height: '1rem', cursor: 'pointer' }} 
                                    required 
                                />
                                <label style={{ fontSize: '0.875rem', color: '#64748b', cursor: 'pointer' }}>
                                    Li e aceito os <a href="#" style={{ color: '#059669', textDecoration: 'none', fontWeight: 600 }}>Termos de Uso</a> e <a href="#" style={{ color: '#059669', textDecoration: 'none', fontWeight: 600 }}>Política de Privacidade</a>
                                </label>
                            </div>

                            {/* Botão Criar conta */}
                            <button 
                                type="submit" 
                                disabled={loading} 
                                style={{ width: '100%', padding: '0.75rem', background: '#059669', color: '#F8FAFC', border: 'none', borderRadius: '0.5rem', fontWeight: 700, cursor: 'pointer', marginBottom: '1rem' }}
                            >
                                Criar conta
                            </button>
                        </form>

                        {/* Botão Google */}
                        {!isGoogleVerified && (
                            <div style={{ marginTop: '1rem' }}>
                                <GoogleLogin 
                                    onSuccess={handleGoogleSuccess}
                                    onError={() => setAlert({ message: 'Falha ao obter dados do Google.', type: 'error' })}
                                    theme="outline"
                                    width="100%"
                                    text="continue_with"
                                />
                            </div>
                        )}

                        {/* Link para Login */}
                        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#64748b' }}>
                            Já tem uma conta? <Link href="/login" style={{ color: '#059669', textDecoration: 'none', fontWeight: 700 }}>Entrar</Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.75rem', borderTop: '1px solid #e2e8f0', marginTop: '3rem' }}>
                © 2024 Hirefy - IFCE Campus Cedro. Todos os direitos reservados.
            </div>
        </div>
    );
};

export default RegisterPage;