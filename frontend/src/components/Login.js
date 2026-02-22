import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../AuthContext';
import '../styles/Login.css';

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
    <div className="login-container">
      <form onSubmit={efetuarLogin} className="login-form">
        <h2>Entrar na Plataforma</h2>
        {erro && <div className="login-erro">{erro}</div>}
        <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} required />
        <button type="submit">Login Inteligente</button>
      </form>
    </div>
  );
}