import React, { useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const efetuarLogin = async (e) => {
    e.preventDefault();
    setErro('');
    
    try {
      const resposta = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });
      
      const dados = await resposta.json();
      
      if (!resposta.ok) throw new Error(dados.erro);

      // Guarda o token
      localStorage.setItem('token', dados.token);
      
      // Decodifica o token para saber o papel (Mágica do Redirecionamento)
      const tokenDecodificado = JSON.parse(atob(dados.token.split('.')[1]));
      const papel = tokenDecodificado.papel;

      // Redireciona para o lugar certo de acordo com a regra de negócio
      if (papel === 'admin') window.location.href = "/master";
      else if (papel === 'produtor') window.location.href = "/admin";
      else if (papel === 'suporte') window.location.href = "/suporte";
      else window.location.href = "/painel"; // Aluno agora vai para o painel de estudos

    } catch (err) {
      setErro(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#2c3e50' }}>
      <form onSubmit={efetuarLogin} style={{ background: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', width: '320px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <h2 style={{ textAlign: 'center', margin: '0 0 20px 0', color: '#333' }}>Entrar na Plataforma</h2>
        {erro && <div style={{ padding: '10px', background: '#ffcccc', color: '#cc0000', borderRadius: '4px', fontSize: '14px', textAlign: 'center' }}>{erro}</div>}
        <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: '12px', border: '1px solid #ccc', borderRadius: '4px' }} />
        <input type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} required style={{ padding: '12px', border: '1px solid #ccc', borderRadius: '4px' }} />
        <button type="submit" style={{ padding: '12px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>Login Inteligente</button>
      </form>
    </div>
  );
}