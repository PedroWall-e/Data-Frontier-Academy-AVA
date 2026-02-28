import React, { useState, useEffect } from 'react';
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
  Users,
  ChevronRight,
  TrendingUp,
  Briefcase,
  BookOpen,
  Quote,
  Building2
} from 'lucide-react';

// Cores da Marca baseadas no Manual de Identidade Visual
const colors = {
  dark: '#2B2B2B',
  blue: '#3347FF',
  peach: '#FFE3D6',
  rawhide: '#B2624F',
  lightBg: '#F9F8F6',
  white: '#FFFFFF'
};

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

const dbCategoriasDestaque = [
  { nome: "Programação e Cloud", icon: <Code className="w-6 h-6" />, cursos: "1.240" },
  { nome: "Ciência de Dados", icon: <TrendingUp className="w-6 h-6" />, cursos: "850" },
  { nome: "Engenharia 3D", icon: <Box className="w-6 h-6" />, cursos: "420" },
  { nome: "Odontologia Digital", icon: <Microscope className="w-6 h-6" />, cursos: "310" },
  { nome: "Gestão e Negócios", icon: <Briefcase className="w-6 h-6" />, cursos: "950" },
  { nome: "Soft Skills", icon: <Users className="w-6 h-6" />, cursos: "620" },
  { nome: "Design de Produto", icon: <MonitorPlay className="w-6 h-6" />, cursos: "540" },
  { nome: "Marketing Digital", icon: <Globe className="w-6 h-6" />, cursos: "780" },
];

const dbTrilhas = [
  { titulo: "Especialista em Inteligência Artificial", modulos: 12, horas: 140, alunos: "12k", bg: "bg-blue-50", text: "text-[#3347FF]" },
  { titulo: "Arquiteto de Soluções em Nuvem", modulos: 8, horas: 95, alunos: "8k", bg: "bg-orange-50", text: "text-[#B2624F]" },
  { titulo: "Mestre em Odontologia Digital", modulos: 6, horas: 60, alunos: "4k", bg: "bg-gray-100", text: "text-[#2B2B2B]" },
];

const dbDepoimentos = [
  { nome: "Carlos Eduardo", cargo: "Engenheiro de Software Sênior", texto: "Os cursos da Data Frontier me ajudaram a transicionar para a área de IA aplicada. A didática dos professores, que atuam no mercado, faz toda a diferença." },
  { nome: "Amanda Albuquerque", cargo: "Dentista Especialista", texto: "A formação em Odontologia 3D transformou a minha clínica. Hoje produzo meus próprios guias cirúrgicos com precisão milimétrica e economia." },
  { nome: "Felipe Mendes", cargo: "Data Analyst na TechCorp", texto: "Plataforma incrível, com conteúdo que vai direto ao ponto. Consegui minha promoção 3 meses após finalizar o Bootcamp de Business Intelligence." },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [cursos, setCursos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const categorias = ['Todos', 'Data Science', 'Odontologia 3D', 'Programação', 'Engenharia'];

  const mapCategoriaEIcone = (titulo) => {
    const t = titulo?.toLowerCase() || '';
    if (t.includes('dados') || t.includes('software') || t.includes('react') || t.includes('node') || t.includes('javascript') || t.includes('python'))
      return { cat: 'Programação', icon: <Code className="w-12 h-12 text-[#3347FF]" />, bg: '#F0F3FF' };
    if (t.includes('odontologia') || t.includes('cirúrgico') || t.includes('resina') || t.includes('dental'))
      return { cat: 'Odontologia 3D', icon: <Microscope className="w-12 h-12 text-[#B2624F]" />, bg: '#FFF5F2' };
    if (t.includes('cad') || t.includes('usinagem') || t.includes('modelação') || t.includes('engenharia'))
      return { cat: 'Engenharia', icon: <Box className="w-12 h-12 text-[#2B2B2B]" />, bg: '#F3F3F3' };

    return { cat: 'Data Science', icon: <MonitorPlay className="w-12 h-12 text-[#3347FF]" />, bg: '#F0F3FF' };
  };

  useEffect(() => {
    fetch('http://localhost:5000/api/cursos/publicos')
      .then(res => res.json())
      .then(data => {
        const cursosEnriquecidos = data.map(c => {
          const visual = mapCategoriaEIcone(c.titulo);
          return {
            ...c,
            categoria: visual.cat,
            icon: visual.icon,
            bg: visual.bg,
            rating: (Math.random() * (5.0 - 4.5) + 4.5).toFixed(1),
            reviews: Math.floor(Math.random() * 2000) + 100,
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

  const cursosFiltrados = cursos.filter(curso => {
    const matchCat = activeTab === 'Todos' || curso.categoria === activeTab;
    const matchSearch = curso.titulo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const Navbar = () => (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-4 h-16 flex items-center justify-between gap-4 md:gap-8">
        <div className="flex items-center gap-4">
          <button className="md:hidden text-gray-600 hover:text-[#3347FF]">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
            <div className="w-8 h-8 rounded-lg bg-[#F9F8F6] p-1 border border-gray-100 flex-shrink-0">
              <LogoDataFrontier className="w-full h-full" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-[#2B2B2B] hidden sm:block">
              data <span className="text-[#3347FF] font-medium">academy</span>
            </span>
          </div>
          <button className="hidden lg:flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-[#3347FF] ml-4 group">
            Explorar <ChevronRight className="w-4 h-4 group-hover:rotate-90 transition-transform" />
          </button>
        </div>

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

        <div className="flex items-center gap-3 md:gap-5">
          <button className="hidden md:block text-sm font-medium text-gray-600 hover:text-[#3347FF]">
            Para Empresas
          </button>
          <button className="text-gray-600 hover:text-[#3347FF] relative">
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-1.5 -right-1.5 bg-[#3347FF] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">0</span>
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
        {/* HERO SECTION */}
        <section className="bg-[#F9F8F6] border-b border-gray-200 relative overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#3347FF]/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] bg-[#B2624F]/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-[1400px] mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center gap-12 relative z-10">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm mb-2">
                <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                <span className="text-xs font-bold text-gray-600">Mais de 100.000 alunos formados</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#2B2B2B] leading-[1.1]">
                Aprenda com quem <br />
                <span className="text-[#3347FF] relative">
                  molda a indústria.
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#FFE3D6] -z-10" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5 L 100 10 L 0 10 Z" fill="currentColor"></path></svg>
                </span>
              </h1>
              <p className="text-lg text-gray-600 max-w-xl leading-relaxed">
                Desenvolva habilidades altamente demandadas com cursos práticos ministrados por especialistas ativos nas maiores empresas do mercado.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button onClick={() => document.getElementById('cursos').scrollIntoView({ behavior: 'smooth' })} className="bg-[#3347FF] text-white font-bold px-8 py-3.5 rounded-lg hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20">
                  Explorar Formações
                </button>
                <button className="bg-white border border-gray-300 text-[#2B2B2B] font-bold px-8 py-3.5 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  <PlayCircle className="w-5 h-5 text-[#B2624F]" /> Conhecer a Metodologia
                </button>
              </div>
            </div>

            <div className="flex-1 w-full flex justify-center md:justify-end">
              <div className="relative w-full max-w-lg">
                <div className="absolute top-0 right-0 w-full h-full bg-[#FFE3D6] rounded-2xl transform translate-x-4 translate-y-4"></div>

                <div className="absolute -left-8 top-12 bg-white p-3 rounded-xl shadow-lg border border-gray-100 flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s' }}>
                  <div className="bg-green-100 p-2 rounded-lg text-green-600"><Check className="w-5 h-5" /></div>
                  <div className="text-sm font-bold">Certificado Ouro</div>
                </div>

                <div className="absolute -right-6 bottom-16 bg-white p-3 rounded-xl shadow-lg border border-gray-100 flex items-center gap-3 z-20">
                  <div className="bg-blue-100 p-2 rounded-lg text-[#3347FF]"><Star className="w-5 h-5 fill-current" /></div>
                  <div className="text-sm font-bold">4.8/5 Média</div>
                </div>

                <div className="relative bg-white rounded-2xl border border-gray-200 shadow-xl p-8 z-10 flex flex-col gap-6">
                  <div className="flex justify-between items-start border-b border-gray-100 pb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-[#3347FF]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#2B2B2B]">Especialização em Cloud</h4>
                        <p className="text-xs text-gray-500">Módulo Prático Avançado</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">Aula Ao Vivo</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Progresso do Aluno</span> <span>78%</span></div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#3347FF] w-[78%] rounded-full"></div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex gap-4">
                    <div className="flex-1 bg-gray-50 p-3 rounded-lg text-center">
                      <div className="text-xl font-bold text-[#2B2B2B]">12h</div>
                      <div className="text-[10px] text-gray-500 uppercase font-semibold">Assistidas</div>
                    </div>
                    <div className="flex-1 bg-gray-50 p-3 rounded-lg text-center">
                      <div className="text-xl font-bold text-[#2B2B2B]">4</div>
                      <div className="text-[10px] text-gray-500 uppercase font-semibold">Projetos</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SOCIAL PROOF BANNER */}
        <section className="bg-white border-b border-gray-100 py-10">
          <div className="max-w-[1400px] mx-auto px-4 text-center">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">Nossos alunos trabalham nas empresas mais inovadoras do mundo</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500 items-center">
              <div className="text-2xl font-black font-serif tracking-tighter">AcmeCorp</div>
              <div className="text-xl font-bold uppercase tracking-widest border-2 border-current p-1">GlobalTech</div>
              <div className="text-2xl font-bold italic">Innovate.io</div>
              <div className="text-2xl font-black">NEXUS</div>
              <div className="text-xl font-bold flex items-center gap-1"><Building2 /> DataSys</div>
            </div>
          </div>
        </section>

        {/* CATEGORIAS EM DESTAQUE */}
        <section className="max-w-[1400px] mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-[#2B2B2B] mb-8">Explore por Categoria</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {dbCategoriasDestaque.map((cat, idx) => (
              <div key={idx} className="border border-gray-200 hover:border-[#3347FF] hover:shadow-md transition-all rounded-xl p-4 flex items-center gap-4 cursor-pointer group bg-white">
                <div className="bg-gray-50 p-3 rounded-lg group-hover:bg-blue-50 group-hover:text-[#3347FF] transition-colors text-gray-600">
                  {cat.icon}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#2B2B2B]">{cat.nome}</h3>
                  <p className="text-xs text-gray-500">{cat.cursos} cursos</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* TRILHAS / FORMAÇÕES */}
        <section className="bg-[#F9F8F6] py-16 border-y border-gray-200">
          <div className="max-w-[1400px] mx-auto px-4">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-bold text-[#2B2B2B] mb-2">Formações Completas</h2>
                <p className="text-gray-600 text-lg">Trilhas estruturadas para você dominar uma nova profissão do zero.</p>
              </div>
              <button className="hidden md:flex items-center gap-2 text-[#3347FF] font-bold hover:underline">
                Ver todas as formações <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {dbTrilhas.map((trilha, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-shadow cursor-pointer flex flex-col h-full">
                  <div className={`w-14 h-14 rounded-lg mb-6 flex items-center justify-center ${trilha.bg} ${trilha.text}`}>
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-[#2B2B2B] mb-4 leading-tight">{trilha.titulo}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6 mt-auto">
                    <span className="flex items-center gap-1.5"><Box className="w-4 h-4" /> {trilha.modulos} Módulos</span>
                    <span className="flex items-center gap-1.5"><PlayCircle className="w-4 h-4" /> {trilha.horas}h de conteúdo</span>
                    <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {trilha.alunos} alunos</span>
                  </div>
                  <div className="border-t border-gray-100 pt-4 flex items-center justify-between font-bold text-[#3347FF]">
                    Ver grade curricular <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECÇÃO DE CURSOS */}
        <section id="cursos" className="max-w-[1400px] mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-[#2B2B2B] mb-2">Cursos em Alta</h2>
          <p className="text-gray-600 mb-8 max-w-2xl text-lg">
            Atualize suas habilidades com os cursos mais vendidos da semana.
          </p>

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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {carregando ? (
              <div className="col-span-full py-12 text-center text-gray-500 font-bold">Carregando cursos reais de nossa API...</div>
            ) : cursosFiltrados.length > 0 ? (
              cursosFiltrados.map(curso => (
                <div key={curso.id} className="flex flex-col cursor-pointer group" onClick={() => navigate(`/curso/${curso.id}`)}>
                  <div className="h-36 mb-3 rounded-lg flex items-center justify-center relative border border-black/5 transition-opacity group-hover:opacity-90" style={{ backgroundColor: curso.bg }}>
                    {curso.capa_url ? (
                      <img src={curso.capa_url} alt={curso.titulo} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      curso.icon
                    )}
                  </div>

                  <div className="flex flex-col flex-grow">
                    <h3 className="font-bold text-[#2B2B2B] leading-tight mb-1 group-hover:text-[#3347FF] transition-colors line-clamp-2">
                      {curso.titulo}
                    </h3>
                    <p className="text-xs text-gray-500 mb-1 line-clamp-1">{curso.instrutor || "Data Frontier"}</p>

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

                    <div className="mt-auto pt-1 flex items-center gap-3">
                      <span className="font-bold text-[#2B2B2B] text-lg">R$ {curso.preco}</span>
                    </div>
                    {curso.bestseller && (
                      <div className="mt-2">
                        <span className="bg-[#FFE3D6] text-[#8a4231] text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wide">
                          Mais vendido
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-gray-500 font-medium">
                Nenhum curso encontrado para "{searchQuery}" nesta categoria.
              </div>
            )}
          </div>
        </section>

        {/* DEPOIMENTOS */}
        <section className="bg-white py-16 border-t border-gray-200">
          <div className="max-w-[1400px] mx-auto px-4">
            <h2 className="text-3xl font-bold text-[#2B2B2B] mb-10 text-center">O que nossos alunos dizem</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {dbDepoimentos.map((dep, idx) => (
                <div key={idx} className="bg-[#F9F8F6] p-8 rounded-2xl relative">
                  <Quote className="w-10 h-10 text-gray-200 absolute top-6 right-6" />
                  <div className="flex text-[#B2624F] mb-4">
                    <Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" />
                  </div>
                  <p className="text-gray-700 mb-6 italic">"{dep.texto}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold">
                      {dep.nome.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#2B2B2B]">{dep.nome}</h4>
                      <p className="text-xs text-gray-500">{dep.cargo}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHY US SECTION */}
        <section className="bg-white py-16 border-t border-gray-200">
          <div className="max-w-[1400px] mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-10">Por que aprender na Data Frontier Academy?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-[#F9F8F6] rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <PlayCircle className="w-8 h-8 text-[#3347FF]" />
                </div>
                <h3 className="font-bold text-lg mb-2">Aprenda no seu ritmo</h3>
                <p className="text-gray-600 text-sm">Acesso vitalício aos conteúdos. Assista em qualquer dispositivo, quando e onde quiser.</p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-[#F9F8F6] rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Star className="w-8 h-8 text-[#B2624F]" />
                </div>
                <h3 className="font-bold text-lg mb-2">Especialistas da Indústria</h3>
                <p className="text-gray-600 text-sm">Professores que vivenciam a realidade do mercado corporativo e clínico diariamente.</p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-[#F9F8F6] rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Award className="w-8 h-8 text-[#2B2B2B]" />
                </div>
                <h3 className="font-bold text-lg mb-2">Certificação Válida</h3>
                <p className="text-gray-600 text-sm">Obtenha certificados reconhecidos que impulsionam o seu currículo e perfil profissional.</p>
              </div>
            </div>
          </div>
        </section>

        {/* B2B BANNER */}
        <section className="bg-[#1C1D1F] text-white py-16">
          <div className="max-w-[1400px] mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="max-w-2xl text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start mb-4">
                <LogoDataFrontier className="w-6 h-6 text-[#1C1D1F] bg-white rounded-sm p-0.5" />
                <span className="font-bold text-xl tracking-tight">data frontier <span className="text-[#3347FF] font-medium">business</span></span>
              </div>
              <h2 className="text-3xl font-bold mb-4">Capacite a sua equipe com as melhores habilidades do mercado.</h2>
              <p className="text-gray-400 mb-8">Ofereça acesso ilimitado aos melhores cursos para a sua equipe técnica. Dashboards de acompanhamento, relatórios de progresso e trilhas customizadas.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <button className="bg-white text-[#1C1D1F] font-bold px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors">Solicitar Demonstração</button>
                <button className="border border-white text-white font-bold px-6 py-3 rounded-lg hover:bg-white/10 transition-colors">Saiba mais sobre planos B2B</button>
              </div>
            </div>
            <div className="hidden md:block flex-1 border border-gray-700 bg-gray-800 rounded-xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#3347FF] blur-[100px]"></div>
              <div className="relative z-10 flex flex-col gap-4 opacity-80">
                <div className="h-4 w-1/3 bg-gray-600 rounded"></div>
                <div className="h-10 w-full bg-gray-700 rounded-lg"></div>
                <div className="h-10 w-full bg-gray-700 rounded-lg"></div>
                <div className="h-10 w-5/6 bg-gray-700 rounded-lg"></div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-[#1C1D1F] text-white py-12 border-t border-gray-800">
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 border-b border-gray-800 pb-12">
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
              <button className="flex items-center gap-2 border border-gray-600 px-4 py-2 hover:bg-white hover:text-black transition-colors text-sm font-bold rounded">
                <Globe className="w-4 h-4" /> Português
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-white p-1">
                <LogoDataFrontier className="w-full h-full text-[#1C1D1F]" />
              </div>
              <span className="font-extrabold text-lg text-white">
                data frontier
              </span>
            </div>
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} Data Frontier. Tecnologia única como você.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}