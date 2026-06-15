import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { FaEye, FaEyeSlash, FaRocket, FaShieldAlt } from 'react-icons/fa';
import Alert from './components/Alert';
import LoadingOverlay from './components/LoadingOverlay';
import { userService } from '@/services/api';
import { toast } from 'sonner';

const AcceptInvitePage = () => {
    const [, setLocation] = useLocation();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [alert, setAlert] = useState<{ message: string; type: 'error' | 'success' | 'info' } | null>(null);
    const [loading, setLoading] = useState(false);

    // Pegar uid e token da URL
    const searchParams = new URLSearchParams(window.location.search);
    const uid = searchParams.get('uid');
    const token = searchParams.get('token');

    useEffect(() => {
        if (!uid || !token) {
            setAlert({ message: 'Convite inválido ou mal formatado. Por favor, verifique o link no seu e-mail.', type: 'error' });
        }
    }, [uid, token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAlert(null);

        if (!password || !confirmPassword) {
            setAlert({ message: 'Por favor, preencha todos os campos.', type: 'error' });
            return;
        }

        if (password !== confirmPassword) {
            setAlert({ message: 'As senhas não conferem.', type: 'error' });
            return;
        }

        if (password.length < 8) {
            setAlert({ message: 'A senha deve ter pelo menos 8 caracteres.', type: 'error' });
            return;
        }

        setLoading(true);

        try {
            await userService.acceptInvite({
                uid: uid!,
                token: token!,
                password,
                confirm_password: confirmPassword
            });
            
            toast.success('Cadastro finalizado com sucesso!');
            setAlert({ message: 'Sua conta foi ativada. Você será redirecionado para o login.', type: 'success' });
            
            setTimeout(() => {
                setLocation('/login?type=empresa');
            }, 3000);
        } catch (error: any) {
            const errorMsg = error.response?.data?.detail || 'Ocorreu um erro ao processar seu convite. O link pode ter expirado.';
            setAlert({ message: errorMsg, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center p-4">
            <LoadingOverlay visible={loading} />

            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                <div className="bg-primary p-8 text-white text-center relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <FaRocket size={80} />
                    </div>
                    <h1 className="text-3xl font-bold mb-2 text-white">Hirefy</h1>
                    <p className="text-green-50">Finalize seu cadastro de recrutador</p>
                </div>

                <div className="p-8">
                    {alert && <Alert message={alert.message} type={alert.type} />}

                    {(!uid || !token) ? (
                        <div className="text-center py-4">
                            <Link href="/" className="text-primary hover:underline font-medium">
                                Voltar para a página inicial
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <FaShieldAlt className="text-primary" />
                                    Defina sua Senha
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                        placeholder="No mínimo 8 caracteres"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">
                                    Confirme sua Senha
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                        placeholder="Repita sua senha"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-primary hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-all transform active:scale-[0.98] shadow-lg shadow-green-900/10 flex justify-center items-center gap-2"
                            >
                                Finalizar Cadastro
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AcceptInvitePage;
