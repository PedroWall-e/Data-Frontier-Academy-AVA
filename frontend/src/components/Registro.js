import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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
      const resposta = await fetch('http://localhost:5000/api/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha })
      });
      const dados = await resposta.json();
      
      if (!resposta.ok) throw new Error(dados.erro);
      
      alert(dados.mensagem);
      navigate('/login'); // Manda para o login após criar conta

    } catch (err) {
      setErro(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#1a1a2e' }}>
      <form onSubmit={efetuarRegistro} style={{ background: '#16213e', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', width: '350px', display: 'flex', flexDirection: 'column', gap: '15px', color: 'white' }}>
        <h2 style={{ textAlign: 'center', margin: '0 0 10px 0', color: '#0f3460' }}><span style={{ color: '#e94560' }}>Data Frontier</span> Academy</h2>
        <p style={{ textAlign: 'center', margin: '0 0 20px 0', color: '#ccc' }}>Crie a sua conta de aluno</p>
        
        {erro && <div style={{ padding: '10px', background: 'rgba(255,0,0,0.1)', color: '#ff4d4d', borderRadius: '4px', fontSize: '14px', textAlign: 'center', border: '1px solid #ff4d4d' }}>{erro}</div>}
        
        <input type="text" placeholder="Nome Completo" value={nome} onChange={e => setNome(e.target.value)} required style={{ padding: '12px', border: 'none', borderRadius: '6px', background: '#0f3460', color: 'white', outline: 'none' }} />
        <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: '12px', border: 'none', borderRadius: '6px', background: '#0f3460', color: 'white', outline: 'none' }} />
        <input type="password" placeholder="Palavra-passe" value={senha} onChange={e => setSenha(e.target.value)} required style={{ padding: '12px', border: 'none', borderRadius: '6px', background: '#0f3460', color: 'white', outline: 'none' }} />
        
        <button type="submit" style={{ padding: '14px', background: '#e94560', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginTop: '10px', transition: '0.3s' }}>Venha aprender connosco</button>
        
        <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px' }}>
            <span style={{ color: '#ccc' }}>Já tem conta? </span>
            <Link to="/login" style={{ color: '#e94560', textDecoration: 'none', fontWeight: 'bold' }}>Faça Login</Link>
        </div>
      </form>
    </div>
  );
}