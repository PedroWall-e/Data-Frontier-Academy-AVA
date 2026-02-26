import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const efetuarLogin = async (e) => {
    e.preventDefault();
    setErro('');

    try {
      const resposta = await api.post('/login', { email, senha });

      const { token } = resposta.data;

      login(token);

      const tokenDecodificado = JSON.parse(atob(token.split('.')[1]));
      const papel = tokenDecodificado.papel;

      if (papel === 'admin') navigate("/master");
      else if (papel === 'produtor') navigate("/admin");
      else if (papel === 'suporte') navigate("/suporte");
      else navigate("/painel");

    } catch (err) {
      if (err.response && err.response.data && err.response.data.erro) {
        setErro(err.response.data.erro);
      } else {
        setErro(err.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] font-sans flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-gray-100 p-8 md:p-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold text-[#2B2B2B]">Bem-vindo de volta</h2>
          <p className="text-sm text-gray-500 mt-2">Faça o login para continuar o seu aprendizado</p>
        </div>

        <form onSubmit={efetuarLogin} className="space-y-5">
          {erro && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium text-center">{erro}</div>}

          <div>
            <label className="block text-sm font-bold text-[#2B2B2B] mb-1">E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3347FF]/30 transition-all font-medium" placeholder="O seu e-mail de acesso" />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#2B2B2B] mb-1">Senha</label>
            <input type="password" value={senha} onChange={e => setSenha(e.target.value)} required className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3347FF]/30 transition-all font-medium" placeholder="••••••••" />
          </div>

          <button type="submit" className="w-full bg-[#3347FF] hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 mt-2">
            Entrar na Plataforma
          </button>
        </form>

        <div className="mt-8 text-center text-sm">
          <span className="text-gray-500">Ainda não tem conta? </span>
          <button onClick={() => navigate('/registro')} className="font-bold text-[#3347FF] hover:underline">Cadastre-se</button>
        </div>

        <div className="mt-4 text-center">
          <button onClick={() => navigate('/')} className="text-xs font-medium text-gray-400 hover:text-[#3347FF] transition-colors">Voltar para o Início</button>
        </div>
      </div>
    </div>
  );
}