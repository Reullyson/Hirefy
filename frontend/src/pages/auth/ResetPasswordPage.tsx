import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { FaEye, FaEyeSlash, FaRocket, FaShieldAlt } from 'react-icons/fa';
import { userService } from '@/services/api';
import Alert from './components/Alert';

const ResetPasswordPage = () => {
    const [location, setLocation] = useLocation();
    const searchParams = new URLSearchParams(window.location.search);
    const uid = searchParams.get('uid');
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

    useEffect(() => {
        if (!uid || !token) {
            setAlert({
                message: 'Link de recuperação inválido ou incompleto.',
                type: 'error'
            });
        }
    }, [uid, token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setAlert({ message: 'As senhas não coincidem.', type: 'error' });
            return;
        }

        if (password.length < 8) {
            setAlert({ message: 'A senha deve ter no mínimo 8 caracteres.', type: 'error' });
            return;
        }

        setLoading(true);
        setAlert(null);

        try {
            await userService.resetPasswordConfirm({
                uid,
                token,
                password,
                confirm_password: confirmPassword
            });
            
            setAlert({
                message: 'Sua senha foi redefinida com sucesso! Você será redirecionado para o login.',
                type: 'success'
            });
            
            setTimeout(() => {
                setLocation('/login');
            }, 3000);

        } catch (error: any) {
            setAlert({
                message: error.response?.data?.detail || 'Erro ao redefinir senha. O link pode ter expirado.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                    <div className="bg-primary p-8 text-white text-center relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <FaRocket size={80} />
                        </div>
                        <h1 className="text-3xl font-bold mb-2 text-white">Hirefy</h1>
                        <p className="text-green-50">Redefina sua senha de acesso</p>
                    </div>

                    <div className="p-8">
                        {alert && <Alert message={alert.message} type={alert.type} />}

                        {(!uid || !token) ? (
                            <div className="text-center py-4">
                                <Link href="/login" className="text-primary hover:underline font-medium">
                                    Ir para a página de login
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        <FaShieldAlt className="text-primary" />
                                        Nova Senha
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                            placeholder="Mínimo 8 caracteres"
                                            required
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
                                        Confirme a Nova Senha
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                        placeholder="Repita sua senha"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-all transform active:scale-[0.98] shadow-lg shadow-green-900/10 flex justify-center items-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? 'Salvando...' : 'Redefinir Senha'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
