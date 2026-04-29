// src/pages/Login.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserPlus, LogIn } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    let result;
    if (isLogin) {
      result = await signIn(email, password);
    } else {
      if (!fullName.trim()) {
        setError('Nome completo é obrigatório');
        setLoading(false);
        return;
      }
      result = await signUp(email, password, fullName);
    }
    
    if (result.error) {
      setError(result.error.message);
      setLoading(false);
    } else {
      if (!isLogin && result.data?.user) {
        await signIn(email, password);
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-card border border-border rounded-2xl shadow-lg">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-3xl">$</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Finanças Pessoais</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isLogin ? 'Faça login para continuar' : 'Crie sua conta gratuitamente'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-950/30 border border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
          
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nome Completo
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                placeholder="Seu nome completo"
                required={!isLogin}
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              placeholder="seu@email.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              placeholder={isLogin ? "••••••••" : "Mínimo 6 caracteres"}
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{isLogin ? 'Entrando...' : 'Cadastrando...'}</span>
              </div>
            ) : (
              <>
                {isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                <span>{isLogin ? 'Entrar' : 'Cadastrar'}</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setFullName('');
            }}
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            {isLogin ? (
              <>Não tem uma conta? <span className="font-semibold">Cadastre-se</span></>
            ) : (
              <>Já tem uma conta? <span className="font-semibold">Faça login</span></>
            )}
          </button>
        </div>

        <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border">
          <p>Gerencie suas finanças de forma simples e eficiente</p>
        </div>
      </div>
    </div>
  );
}