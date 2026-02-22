import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Box,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Chip
} from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import CodeIcon from '@mui/icons-material/Code';

// Criação de um Tema Moderno (Dark Mode + Cores Vibrantes)
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3b82f6', // Azul Moderno
    },
    secondary: {
      main: '#10b981', // Verde Esmeralda (Sucesso/Inovação)
    },
    background: {
      default: '#0f172a',
      paper: '#1e293b', // Cor dos Cards
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h2: {
      fontWeight: 900,
      letterSpacing: '-2px',
    },
  },
  shape: {
    borderRadius: 16, // Bordas mais arredondadas (Material You / M3)
  },
});

export default function LandingPage() {
  const [cursos, setCursos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/cursos/publicos')
      .then((res) => res.json())
      .then((dados) => {
        setCursos(dados);
        setCarregando(false);
      })
      .catch((err) => {
        console.error("Erro ao buscar cursos:", err);
        setCarregando(false);
      });
  }, []);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline /> {/* Reseta o CSS e aplica a cor de fundo do tema */}

      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* NAVBAR COM GLASSMORPHISM */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <Container maxWidth="lg">
            <Toolbar disableGutters sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
              <Typography
                variant="h5"
                component="div"
                sx={{ fontWeight: 800, letterSpacing: '-1px', display: 'flex', alignItems: 'center' }}
              >
                Data Frontier<Box component="span" sx={{ color: 'primary.main' }}>.</Box>
              </Typography>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  component={Link}
                  to="/login"
                  variant="outlined"
                  color="inherit"
                  sx={{ borderColor: 'rgba(255,255,255,0.2)', textTransform: 'none', fontWeight: 600 }}
                >
                  Entrar na Plataforma
                </Button>
                <Button
                  component={Link}
                  to="/registro"
                  variant="contained"
                  color="primary"
                  disableElevation
                  sx={{ textTransform: 'none', fontWeight: 600, boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)' }}
                >
                  Criar Conta
                </Button>
              </Box>
            </Toolbar>
          </Container>
        </AppBar>

        {/* HERO SECTION INOVADORA */}
        <Box
          component="header"
          sx={{
            pt: 15,
            pb: 12,
            textAlign: 'center',
            background: 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.15) 0%, rgba(15, 23, 42, 1) 70%)'
          }}
        >
          <Container maxWidth="md">
            <Typography
              variant="h2"
              gutterBottom
              sx={{
                background: 'linear-gradient(45deg, #3b82f6 30%, #10b981 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Data Frontier
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 6, fontWeight: 300 }}>
              Tecnologia <Box component="span" sx={{ color: 'secondary.main', fontWeight: 500 }}>única</Box> como você.
            </Typography>

            <Button
              component={Link}
              to="/registro"
              variant="contained"
              color="secondary"
              size="large"
              startIcon={<RocketLaunchIcon />}
              sx={{
                px: 5,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                textTransform: 'none',
                borderRadius: '50px',
                boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 15px 35px rgba(16, 185, 129, 0.4)' }
              }}
            >
              Venha Aprender Com A Gente
            </Button>
          </Container>
        </Box>

        {/* VITRINE DE CURSOS */}
        <Box component="main" sx={{ flexGrow: 1, py: 8, px: 2, backgroundColor: 'background.default' }}>
          <Container maxWidth="lg">

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 5 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, borderLeft: '4px solid #3b82f6', pl: 2 }}>
                🔥 Lançamentos
              </Typography>
            </Box>

            {carregando ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '20vh', flexDirection: 'column', gap: 2 }}>
                <CircularProgress color="primary" />
                <Typography color="text.secondary">A carregar vitrine de cursos...</Typography>
              </Box>
            ) : (
              <Grid container spacing={4}>
                {cursos.slice(0, 4).map(curso => (
                  <Grid item xs={12} sm={6} md={3} key={curso.id}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.3s, box-shadow 0.3s',
                        border: '1px solid rgba(255,255,255,0.05)',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                          borderColor: 'primary.main'
                        }
                      }}
                    >
                      {/* Área Visual do Card Simulando uma Imagem */}
                      <Box
                        sx={{
                          height: 140,
                          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderBottom: '1px solid rgba(255,255,255,0.05)'
                        }}
                      >
                        <CodeIcon sx={{ fontSize: 60, color: 'primary.main', opacity: 0.8 }} />
                      </Box>

                      <CardContent sx={{ flexGrow: 1, pt: 3 }}>
                        <Typography gutterBottom variant="h6" component="h2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                          {curso.titulo}
                        </Typography>
                        <Chip
                          label={`€ ${curso.preco}`}
                          color="secondary"
                          variant="outlined"
                          size="small"
                          sx={{ mt: 1, fontWeight: 'bold', border: 'none', background: 'rgba(16, 185, 129, 0.1)' }}
                        />
                      </CardContent>

                      <CardActions sx={{ p: 2, pt: 0 }}>
                        <Button
                          component={Link}
                          to={`/checkout/${curso.id}`}
                          size="small"
                          color="primary"
                          fullWidth
                          variant="contained"
                          disableElevation
                          sx={{ textTransform: 'none', fontWeight: 'bold', borderRadius: '8px' }}
                        >
                          Adquirir Agora →
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Container>
        </Box>

        {/* FOOTER */}
        <Box component="footer" sx={{ py: 4, backgroundColor: '#020617', textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Data Frontier. Tecnologia única como você.
          </Typography>
        </Box>

      </Box>
    </ThemeProvider>
  );
}