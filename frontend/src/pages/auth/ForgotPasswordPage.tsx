import React, { useState } from 'react';
import { Link } from 'wouter';
import { FaArrowLeft, FaEnvelope, FaRocket } from 'react-icons/fa';
import { userService } from '@/services/api';
import Alert from './components/Alert';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setAlert(null);

        try {
            await userService.resetPasswordRequest(email);
            setAlert({
                message: 'Se o e-mail estiver cadastrado, você receberá um link de recuperação em breve.',
                type: 'success'
            });
            setEmail('');
        } catch (error: any) {
            setAlert({
                message: error.response?.data?.detail || 'Erro ao solicitar recuperação de senha.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-6">
                    <Link href="/login" className="flex items-center gap-2 text-primary hover:text-green-700 transition-colors font-semibold group">
                        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                        Voltar para o Login
                    </Link>
                </div>
                
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                    <div className="bg-primary p-8 text-white text-center relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <FaRocket size={80} />
                        </div>
                        <h1 className="text-3xl font-bold mb-2 text-white">Recuperar Senha</h1>
                        <p className="text-green-50">Enviaremos as instruções para o seu e-mail</p>
                    </div>

                    <div className="p-8">
                        {alert && <Alert message={alert.message} type={alert.type} />}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <FaEnvelope className="text-primary" />
                                    E-mail cadastrado
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                    placeholder="seu.email@exemplo.com"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-all transform active:scale-[0.98] shadow-lg shadow-green-900/10 flex justify-center items-center gap-2 disabled:opacity-50"
                            >
                                {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
