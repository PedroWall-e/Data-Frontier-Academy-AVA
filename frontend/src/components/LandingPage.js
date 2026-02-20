import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  const [cursos, setCursos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/cursos/publicos')
      .then(res => res.json())
      .then(dados => {
        setCursos(dados);
        setCarregando(false);
      });
  }, []);

  return (
    <div style={{ backgroundColor: 'var(--cor-fundo-dark)', color: 'var(--cor-texto-claro)', minHeight: '100vh' }}>
      
      {/* NAVBAR OFICIAL DATA FRONTIER */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 50px', background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Aqui você pode colocar a tag <img src="/logo.png" /> quando tiver a logo exportada */}
            <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '900', letterSpacing: '-1px' }}>
            Data Frontier<span style={{ color: 'var(--cor-primaria)' }}>.</span>
            </h1>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <Link to="/login">
            <button style={{ padding: '10px 20px', background: 'transparent', color: 'var(--cor-texto-claro)', border: '1px solid var(--cor-texto-mutado)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' }}>
              Entrar na Plataforma
            </button>
          </Link>
          <Link to="/registro">
            <button style={{ padding: '10px 20px', background: 'var(--cor-primaria)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
              Criar Conta
            </button>
          </Link>
        </div>
      </nav>

      {/* CHAMARIZ (HERO SECTION) COM SLOGAN OFICIAL */}
      <header style={{ padding: '120px 20px', textAlign: 'center', background: 'linear-gradient(180deg, var(--cor-fundo-dark) 0%, rgba(59, 130, 246, 0.1) 100%)' }}>
        <h2 style={{ fontSize: '64px', margin: '0 0 20px 0', fontWeight: '900', lineHeight: '1.1' }}>
          Data Frontier
        </h2>
        {/* O SLOGAN RETIRADO DO SEU MANUAL: */}
        <p style={{ fontSize: '28px', color: 'var(--cor-primaria)', fontWeight: '300', margin: '0 auto 40px auto' }}>
          Tecnologia única como você
        </p>
        <Link to="/registro">
            <button style={{ padding: '18px 40px', fontSize: '18px', background: 'var(--cor-secundaria)', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)', transition: 'transform 0.2s' }}>
              🚀 Venha Aprender Com A Gente
            </button>
        </Link>
      </header>

      {/* VITRINE DE CURSOS */}
      <main style={{ padding: '60px 50px', maxWidth: '1200px', margin: '0 auto' }}>
        {carregando ? (
            <div style={{ textAlign: 'center', padding: '50px', color: 'var(--cor-texto-mutado)' }}>A carregar vitrine de cursos...</div>
        ) : (
            <>
                {/* Lançamentos */}
                <div style={{ marginBottom: '60px' }}>
                    <h3 style={{ fontSize: '28px', borderLeft: '4px solid var(--cor-primaria)', paddingLeft: '15px', marginBottom: '30px' }}>🔥 Lançamentos</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
                        {cursos.slice(0, 4).map(curso => (
                            <div key={curso.id} style={{ background: 'var(--cor-fundo-card)', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ height: '160px', background: 'linear-gradient(45deg, var(--cor-primaria), var(--cor-secundaria))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>
                                    💻
                                </div>
                                <div style={{ padding: '25px' }}>
                                    <h4 style={{ margin: '0 0 10px 0', fontSize: '20px' }}>{curso.titulo}</h4>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                                        <span style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--cor-secundaria)' }}>€ {curso.preco}</span>
                                        <Link to="/login" style={{ textDecoration: 'none' }}>
                                            <span style={{ color: 'var(--cor-primaria)', fontWeight: 'bold', fontSize: '14px' }}>Comprar →</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </>
        )}
      </main>

      <footer style={{ background: '#020617', padding: '40px 0', textAlign: 'center', color: 'var(--cor-texto-mutado)' }}>
          <p>© 2026 Data Frontier. Tecnologia única como você.</p>
      </footer>
    </div>
  );
}