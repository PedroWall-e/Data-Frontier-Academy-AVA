import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import '../styles/Registro.css';

export default function Registro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const efetuarRegistro = async (e) => {
    e.preventDefault();
    setErro('');

    try {
      const resposta = await api.post('/registrar', { nome, email, senha });
      alert(resposta.data.mensagem);
      navigate('/login');

    } catch (err) {
      if (err.response && err.response.data && err.response.data.erro) {
        setErro(err.response.data.erro);
      } else {
        setErro(err.message);
      }
    }
  };

  return (
    <div className="registro-container">
      <form onSubmit={efetuarRegistro} className="registro-form">
        <h2 className="registro-titulo"><span>Data Frontier</span> Academy</h2>
        <p className="registro-subtitulo">Crie a sua conta de aluno</p>

        {erro && <div className="registro-erro">{erro}</div>}

        <input type="text" placeholder="Nome Completo" value={nome} onChange={e => setNome(e.target.value)} required className="registro-input" />
        <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} required className="registro-input" />
        <input type="password" placeholder="Palavra-passe" value={senha} onChange={e => setSenha(e.target.value)} required className="registro-input" />

        <button type="submit" className="registro-botao">Venha aprender connosco</button>

        <div className="registro-footer">
          <span>Já tem conta? </span>
          <Link to="/login" className="registro-link">Faça Login</Link>
        </div>
      </form>
    </div>
  );
}