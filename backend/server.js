require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const cursosRoutes = require('./routes/cursos');
const adminRoutes = require('./routes/admin');
const chamadosRoutes = require('./routes/chamados');
const webhooksRoutes = require('./routes/webhooks');
const uploadRoutes = require('./routes/upload');
const certificadosRoutes = require('./routes/certificados');
const turmasRoutes = require('./routes/turmas');
const tarefasRoutes = require('./routes/tarefas');

const app = express();
app.use(express.json());
const path = require('path');

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Permissive CORS for development with multiple local origins
app.use(cors({
    origin: true,
    credentials: true
}));

// Setup routes
app.use('/api', authRoutes);
app.use('/api/cursos', cursosRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chamados', chamadosRoutes);
app.use('/api/webhooks', webhooksRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/certificados', certificadosRoutes);
app.use('/api/turmas', turmasRoutes);
app.use('/api/tarefas', tarefasRoutes);

// Fallback error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ erro: "Erro interno do servidor." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});