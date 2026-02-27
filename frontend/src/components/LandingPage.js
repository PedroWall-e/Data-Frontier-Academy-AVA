import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  Menu,
  Star,
  MonitorPlay,
  Microscope,
  Code,
  Box,
  Check,
  PlayCircle,
  Award,
  Globe,
  Users
} from 'lucide-react';

// Componente da Logo Oficial Data Frontier
const LogoDataFrontier = ({ className }) => (
  <svg
    viewBox="0 0 837.24402 837.24402"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Logotipo da Data Frontier"
  >
    <defs>
      <clipPath id="clipPath20" clipPathUnits="userSpaceOnUse">
        <path d="M 0,627.933 H 627.933 V 0 H 0 Z" />
      </clipPath>
    </defs>
    <g transform="matrix(1.3333333,0,0,-1.3333333,0,837.244)">
      <g clipPath="url(#clipPath20)">
        <g transform="translate(238.6387,462.4807)">
          <path fill="#3347ff" d="M 0,0 0.001,-0.001 H 0 Z m -22.47,-207.322 0.182,-0.104 c 1.72,-0.988 3.565,-1.778 5.65,-2.412 l 1.892,-0.582 v 170.417 c 0,1.253 0.114,2.542 0.343,3.841 l 0.197,0.92 c 0.302,1.419 0.754,2.844 1.347,4.226 l 0.171,0.395 c 0.198,0.442 0.431,0.874 0.743,1.461 0.125,0.234 0.25,0.468 0.385,0.696 l 0.317,0.489 c 0.686,1.081 1.388,2.022 2.152,2.88 l 0.229,0.306 c 1.528,1.669 3.316,3.109 5.317,4.278 4.699,2.745 10.053,3.789 15.552,2.677 C 5.172,-28.136 1.424,-40.585 1.424,-53.138 V -208.85 l 19.627,11.487 v 144.376 c 0,15.62 8.114,29.877 21.177,37.201 12.729,7.142 27.922,7.1 40.642,-0.119 l 108.994,-61.834 0.291,2.141 c 1.606,11.742 -4.039,23.079 -14.372,28.885 L 92.553,1.159 C 73.16,12.163 50.165,11.877 31.021,0.4 29.69,-0.4 28.349,-1.299 26.852,-2.391 20.059,1.071 12.558,2.63 5.094,2.142 4.267,2.09 3.436,2.006 2.407,1.876 1.653,1.783 0.915,1.653 0.172,1.513 L -0.296,1.435 C -0.951,1.299 -1.611,1.144 -2.401,0.946 L -2.942,0.816 C -3.431,0.686 -3.909,0.535 -4.392,0.385 L -4.969,0.208 -5.588,0.01 c -0.478,-0.156 -0.946,-0.337 -1.486,-0.551 l -3.66,-1.58 c -0.311,-0.15 -0.618,-0.312 -0.92,-0.478 l -0.571,-0.307 -1.196,-0.649 c -0.67,-0.39 -1.336,-0.801 -1.98,-1.227 l -0.307,-0.213 c -0.624,-0.411 -1.227,-0.842 -1.819,-1.284 l -0.328,-0.25 c -8.119,-6.18 -13.686,-15.053 -15.676,-24.996 l -0.115,-1.455 h 0.005 c -0.488,-2.672 -0.733,-5.359 -0.733,-8.01 v -145.078 c 0,-8.831 4.564,-16.976 11.904,-21.254" />
        </g>
        <g transform="translate(393.5143,262.5085)">
          <path fill="#3347ff" d="m 0,0 c 7.724,4.522 12.527,12.683 12.527,21.498 -0.011,1.913 -0.25,3.857 -0.728,5.952 l -0.447,1.944 -147.016,-86.144 c -7.813,-4.585 -17.288,-4.107 -24.732,1.252 -3.337,2.407 -5.894,5.749 -7.469,9.752 1.336,-0.094 2.594,-0.141 3.8,-0.141 10.749,0 21.441,2.937 30.916,8.499 L 2.718,42.238 -17.127,53.346 -143.061,-20.464 c -13.02,-7.625 -28.593,-7.693 -41.676,-0.203 -13.083,7.506 -20.891,20.984 -20.891,36.058 v 146.632 l -1.944,-0.666 c -10.572,-3.633 -17.678,-13.592 -17.678,-24.773 V 16.545 c 0,-22.668 11.867,-43.496 30.964,-54.349 1.586,-0.905 3.306,-1.767 5.229,-2.63 1.227,-13.655 8.603,-25.854 19.856,-32.762 6.752,-4.148 14.403,-6.342 22.138,-6.342 7.407,0 14.783,2.027 21.321,5.858 z" />
        </g>
        <g transform="translate(459.6675,325.7353)">
          <path fill="#3347ff" d="m 0,0 c -0.104,15.261 -8.093,28.864 -21.368,36.395 l -124.967,70.899 c -7.563,4.294 -16.446,4.673 -23.76,1.05 -0.561,-0.275 -1.112,-0.571 -1.663,-0.894 -1.596,-0.93 -3.114,-2.058 -4.642,-3.456 l -1.486,-1.362 146.839,-83.301 c 7.095,-4.029 11.368,-11.305 11.425,-19.466 0.042,-5.515 -1.856,-10.687 -5.369,-14.772 -5.37,10.983 -13.889,20.001 -24.753,26.166 L -184.852,87.885 V 65.332 L -59.427,-5.811 c 13.062,-7.412 20.921,-20.797 21.025,-35.808 0.104,-15.017 -7.573,-28.516 -20.521,-36.105 l -144.797,-84.844 1.767,-1.321 c 4.99,-3.721 10.916,-5.608 16.867,-5.608 4.886,0 9.793,1.273 14.206,3.846 l 121.875,70.998 c 19.081,11.18 30.381,31.057 30.225,53.169 -0.015,1.84 -0.125,3.779 -0.343,5.889 C -7.028,-27.725 0.104,-14.486 0,0" />
        </g>
      </g>
    </g>
  </svg>
);

// Dados estruturados ao estilo Udemy
const dbCursos = [
  {
    id: 1,
    categoria: "Tecnologia",
    titulo: "Bootcamp Analista de Dados e Business Intelligence 2026",
    instrutor: "Prof. Marcos Almeida",
    rating: 4.8,
    reviews: "2.314",
    preco: "197,00",
    bestseller: true,
    icon: <MonitorPlay className="w-12 h-12 text-[#3347FF]" />,
    bg: '#F0F3FF'
  },
  {
    id: 2,
    categoria: "Odontologia 3D",
    titulo: "Impressão 3D na Odontologia Digital: Do Escaneamento à Resina",
    instrutor: "Dra. Juliana Costa",
    rating: 4.9,
    reviews: "1.150",
    preco: "349,00",
    bestseller: true,
    icon: <Microscope className="w-12 h-12 text-[#B2624F]" />,
    bg: '#FFF5F2'
  },
  {
    id: 3,
    categoria: "Programação",
    titulo: "Desenvolvimento Fullstack Master: React, Node.js e Cloud",
    instrutor: "Eng. Rafael Silva",
    rating: 4.7,
    reviews: "890",
    preco: "120,00",
    bestseller: false,
    icon: <Code className="w-12 h-12 text-[#3347FF]" />,
    bg: '#F0F3FF'
  },
  {
    id: 4,
    categoria: "Engenharia",
    titulo: "Modelação CAD para Usinagem de Precisão e Caldeiraria",
    instrutor: "Prof. Carlos Mendes",
    rating: 4.6,
    reviews: "420",
    preco: "450,00",
    bestseller: false,
    icon: <Box className="w-12 h-12 text-[#2B2B2B]" />,
    bg: '#F3F3F3'
  },
  {
    id: 5,
    categoria: "Odontologia 3D",
    titulo: "Guia Cirúrgico Guiado: Planeamento em Software Livre",
    instrutor: "Dra. Juliana Costa",
    rating: 4.9,
    reviews: "3.412",
    preco: "250,00",
    bestseller: true,
    icon: <Microscope className="w-12 h-12 text-[#B2624F]" />,
    bg: '#FFF5F2'
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [cursos, setCursos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Mapeamento de categorias e ícones padrão caso venham vazios do backend (já que a nossa BD base não tem categoria estrita)
  const mapCategoriaEIcone = (titulo) => {
    const t = titulo.toLowerCase();
    if (t.includes('dados') || t.includes('software') || t.includes('react') || t.includes('node'))
      return { cat: 'Programação', icon: <Code className="w-12 h-12 text-[#3347FF]" />, bg: '#F0F3FF' };
    if (t.includes('odontologia') || t.includes('cirúrgico') || t.includes('resina'))
      return { cat: 'Odontologia 3D', icon: <Microscope className="w-12 h-12 text-[#B2624F]" />, bg: '#FFF5F2' };
    if (t.includes('cad') || t.includes('usinagem') || t.includes('modelação'))
      return { cat: 'Engenharia', icon: <Box className="w-12 h-12 text-[#2B2B2B]" />, bg: '#F3F3F3' };

    return { cat: 'Tecnologia', icon: <MonitorPlay className="w-12 h-12 text-[#3347FF]" />, bg: '#F0F3FF' };
  };

  React.useEffect(() => {
    // Busca cursos do backend (rota pública)
    fetch('http://localhost:5000/api/cursos/publicos')
      .then(res => res.json())
      .then(data => {
        // Enriquecer dados backend com algumas props visuais para manter o design
        const cursosEnriquecidos = data.map(c => {
          const visual = mapCategoriaEIcone(c.titulo);
          return {
            ...c,
            categoria: visual.cat,
            icon: visual.icon,
            bg: visual.bg,
            rating: (Math.random() * (5.0 - 4.5) + 4.5).toFixed(1), // Mock rating
            reviews: Math.floor(Math.random() * 2000) + 100, // Mock reviews
            bestseller: Math.random() > 0.6
          };
        });
        setCursos(cursosEnriquecidos);
        setCarregando(false);
      })
      .catch(err => {
        console.error("Erro ao buscar cursos:", err);
        setCarregando(false);
      });
  }, []);

  const categorias = ['Todos', 'Tecnologia', 'Odontologia 3D', 'Programação', 'Engenharia'];

  const cursosFiltrados = cursos.filter(curso => {
    const matchCat = activeTab === 'Todos' || curso.categoria === activeTab;
    const matchSearch = curso.titulo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // NAVBAR - Estrutura "Search-first" típica de plataformas de ensino
  const Navbar = () => (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-4 h-16 flex items-center justify-between gap-4 md:gap-8">

        {/* Esquerda: Logo + Menu */}
        <div className="flex items-center gap-4">
          <button className="md:hidden text-gray-600 hover:text-[#3347FF]">
            <Menu className="w-6 h-6" />
          </button>
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="w-8 h-8 flex-shrink-0">
              <img src="/logo-frontier.svg" alt="Frontier Academy Logo" className="w-full h-full" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-[#2B2B2B] hidden sm:block">
              frontier <span className="text-[#3347FF] font-medium">academy</span>
            </span>
          </div>
          <button className="hidden lg:block text-sm font-medium text-gray-600 hover:text-[#3347FF] ml-4">
            Explorar
          </button>
        </div>

        {/* Centro: Barra de Pesquisa */}
        <div className="flex-1 max-w-3xl hidden md:flex items-center bg-[#F9F8F6] border border-black/10 rounded-full px-4 py-2 focus-within:bg-white focus-within:border-[#3347FF] focus-within:ring-2 focus-within:ring-[#3347FF]/20 transition-all">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar por cursos, habilidades ou softwares..."
            className="bg-transparent border-none outline-none w-full ml-3 text-sm text-[#2B2B2B] placeholder:text-gray-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Direita: Ações */}
        <div className="flex items-center gap-3 md:gap-5">
          <button className="hidden md:block text-sm font-medium text-gray-600 hover:text-[#3347FF]">
            Para Empresas
          </button>
          <button className="text-gray-600 hover:text-[#3347FF]">
            <ShoppingCart className="w-5 h-5" />
          </button>
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-bold text-[#2B2B2B] border border-gray-300 hover:bg-gray-50 px-5 py-2 rounded-lg transition-colors"
            >
              Entrar
            </button>
            <button
              onClick={() => navigate('/registro')}
              className="text-sm font-bold bg-[#2B2B2B] text-white hover:bg-black px-5 py-2 rounded-lg transition-colors"
            >
              Cadastre-se
            </button>
          </div>
        </div>

      </div>
    </header>
  );

  return (
    <div className="min-h-screen font-sans bg-white text-[#2B2B2B]">
      <Navbar />

      <main>
        {/* HERO SECTION - Foco direto no valor educacional */}
        <section className="bg-[#F9F8F6] border-b border-gray-200">
          <div className="max-w-[1400px] mx-auto px-4 py-12 md:py-20 flex flex-col md:flex-row items-center gap-12">

            <div className="flex-1 space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#2B2B2B] leading-tight">
                Aprenda com quem <br />
                <span className="text-[#3347FF]">molda a indústria.</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-xl leading-relaxed">
                Cursos práticos ministrados por especialistas ativos no mercado.
                De Engenharia 3D à Inteligência Artificial. Avance na sua carreira hoje.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => document.getElementById('cursos').scrollIntoView({ behavior: 'smooth' })}
                  className="bg-[#2B2B2B] text-white font-bold px-6 py-3.5 rounded-lg hover:bg-black transition-colors"
                >
                  Ver Cursos
                </button>
                <button
                  className="bg-white border border-gray-300 text-[#2B2B2B] font-bold px-6 py-3.5 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <PlayCircle className="w-5 h-5 text-[#B2624F]" /> Conhecer a Metodologia
                </button>
              </div>
            </div>

            {/* Imagem/Gráfico Hero sério e estruturado */}
            <div className="flex-1 w-full flex justify-center md:justify-end">
              <div className="relative w-full max-w-lg">
                <div className="absolute top-0 right-0 w-full h-full bg-[#FFE3D6] rounded-2xl transform translate-x-4 translate-y-4"></div>
                <div className="relative bg-white rounded-2xl border border-gray-200 shadow-xl p-8 z-10 flex flex-col gap-6">
                  <div className="flex justify-between items-start border-b border-gray-100 pb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Code className="w-6 h-6 text-[#3347FF]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#2B2B2B]">Engenharia de Software</h4>
                        <p className="text-xs text-gray-500">Módulo Prático Avançado</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">Ao vivo</span>
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 w-3/4 bg-gray-100 rounded-full"></div>
                    <div className="h-2 w-1/2 bg-gray-100 rounded-full"></div>
                    <div className="h-2 w-5/6 bg-gray-100 rounded-full"></div>
                  </div>
                  <div className="mt-2 bg-[#F9F8F6] p-4 rounded-lg flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-600">Progresso do Aluno</span>
                    <span className="text-sm font-bold text-[#3347FF]">78%</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* SOCIAL PROOF / TRUST BANNER */}
        <section className="bg-white border-b border-gray-100 py-8">
          <div className="max-w-[1400px] mx-auto px-4 text-center">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Metodologia confiável para profissionais em +10 países</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale">
              <div className="flex items-center gap-2 font-bold text-xl"><Globe className="w-6 h-6" /> Conexão Global</div>
              <div className="flex items-center gap-2 font-bold text-xl"><Award className="w-6 h-6" /> Certificação Ouro</div>
              <div className="flex items-center gap-2 font-bold text-xl"><Users className="w-6 h-6" /> Comunidade Ativa</div>
            </div>
          </div>
        </section>

        {/* SECÇÃO DE CURSOS (Estrutura Udemy) */}
        <section id="cursos" className="max-w-[1400px] mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-[#2B2B2B] mb-2">Uma ampla seleção de cursos</h2>
          <p className="text-gray-600 mb-8 max-w-2xl text-lg">
            Escolha entre centenas de formações em tecnologia, engenharia e odontologia digital com novas adições publicadas mensalmente.
          </p>

          {/* TABS DE CATEGORIA */}
          <div className="flex overflow-x-auto hide-scrollbar gap-6 border-b border-gray-200 mb-8 pb-2">
            {categorias.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`whitespace-nowrap font-bold pb-2 border-b-2 transition-colors ${activeTab === cat
                  ? 'border-[#3347FF] text-[#2B2B2B]'
                  : 'border-transparent text-gray-500 hover:text-[#2B2B2B]'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* GRID DE CURSOS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {cursosFiltrados.length > 0 ? (
              cursosFiltrados.map(curso => (
                <div
                  key={curso.id}
                  className="flex flex-col cursor-pointer group hover:bg-gray-50 p-2 rounded-xl transition-colors duration-200"
                  onClick={() => navigate(`/curso/${curso.id}`)}
                >
                  {/* Thumbnail Placeholder */}
                  <div
                    className="h-36 mb-3 rounded-lg flex items-center justify-center relative border border-black/5 transition-opacity group-hover:opacity-90"
                    style={{ backgroundColor: curso.bg }}
                  >
                    {curso.icon}
                  </div>

                  {/* Corpo do Curso */}
                  <div className="flex flex-col flex-grow px-1">
                    <h3 className="font-bold text-[#2B2B2B] leading-tight mb-1 group-hover:text-[#3347FF] transition-colors line-clamp-2">
                      {curso.titulo}
                    </h3>
                    <p className="text-xs text-gray-500 mb-1 line-clamp-1">{curso.instrutor}</p>

                    {/* Rating */}
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="font-bold text-[#B2624F] text-sm leading-none">{curso.rating}</span>
                      <div className="flex text-[#B2624F]">
                        <Star size={13} fill="currentColor" />
                        <Star size={13} fill="currentColor" />
                        <Star size={13} fill="currentColor" />
                        <Star size={13} fill="currentColor" />
                        <Star size={13} fill="currentColor" />
                      </div>
                      <span className="text-xs text-gray-400 leading-none">({curso.reviews})</span>
                    </div>

                    {/* Preço e Badges */}
                    <div className="mt-auto pt-1 flex items-center gap-3">
                      <span className="font-bold text-[#2B2B2B] text-lg">€ {curso.preco}</span>
                    </div>
                    {curso.bestseller && (
                      <div className="mt-2">
                        <span className="bg-[#FFE3D6] text-[#8a4231] text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wide inline-block">
                          Mais vendido
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-gray-500">
                Nenhum curso encontrado para "{searchQuery}" nesta categoria.
              </div>
            )}
          </div>
        </section>

        {/* WHY US SECTION - Abordagem Institucional */}
        <section className="bg-[#F9F8F6] py-16 border-t border-gray-200">
          <div className="max-w-[1400px] mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-10">Por que aprender na Frontier Academy by Data Frontier?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

              <div className="text-center p-6">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200 shadow-sm">
                  <PlayCircle className="w-6 h-6 text-[#3347FF]" />
                </div>
                <h3 className="font-bold text-lg mb-2">Aprenda no seu ritmo</h3>
                <p className="text-gray-600 text-sm">
                  Acesso vitalício aos conteúdos. Assista em qualquer dispositivo, quando e onde quiser.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200 shadow-sm">
                  <Star className="w-6 h-6 text-[#B2624F]" />
                </div>
                <h3 className="font-bold text-lg mb-2">Especialistas da Indústria</h3>
                <p className="text-gray-600 text-sm">
                  Professores que vivenciam a realidade do mercado corporativo e clínico diariamente.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200 shadow-sm">
                  <Check className="w-6 h-6 text-[#2B2B2B]" />
                </div>
                <h3 className="font-bold text-lg mb-2">Certificação Válida</h3>
                <p className="text-gray-600 text-sm">
                  Obtenha certificados reconhecidos que impulsionam o seu currículo e perfil profissional.
                </p>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* FOOTER SÉRIO (UDEMY STYLE) */}
      <footer className="bg-[#1C1D1F] text-white py-12">
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 border-b border-gray-700 pb-12">
            <div>
              <ul className="space-y-3 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Data Frontier Business</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Ensine na Academy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Baixe a aplicação</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Sobre nós</a></li>
              </ul>
            </div>
            <div>
              <ul className="space-y-3 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Carreiras</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Ajuda e Suporte</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Afiliado</a></li>
              </ul>
            </div>
            <div>
              <ul className="space-y-3 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Termos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Política de privacidade e cookies</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Configurações de cookies</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Acessibilidade</a></li>
              </ul>
            </div>
            <div className="flex md:justify-end items-start">
              <button className="flex items-center gap-2 border border-white px-4 py-2 hover:bg-white/10 transition-colors text-sm font-bold">
                <Globe className="w-4 h-4" /> Português
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-white p-1">
                <img src="/logo-frontier.svg" alt="Frontier Academy Logo" className="w-full h-full" />
              </div>
              <span className="font-extrabold text-lg text-white">
                frontier academy <span className="text-[10px] font-normal opacity-50 ml-1">by Data Frontier</span>
              </span>
            </div>
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} Data Frontier. Tecnologia única como você.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}