require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const cursosRoutes = require('./routes/cursos');
const adminRoutes = require('./routes/admin');
const chamadosRoutes = require('./routes/chamados');

const app = express();
app.use(express.json());

// Restrict CORS to frontend
app.use(cors({
    origin: 'http://localhost:3000'
}));

// Setup routes
app.use('/api', authRoutes);
app.use('/api/cursos', cursosRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chamados', chamadosRoutes);

// Fallback error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ erro: "Erro interno do servidor." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});