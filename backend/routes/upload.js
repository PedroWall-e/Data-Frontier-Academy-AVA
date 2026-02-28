const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { verificarToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Configuração do armazenamento local com multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, `${uuidv4()}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de ficheiro não permitido. Use JPG, PNG, GIF, WebP ou SVG.'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// POST /api/upload
// Recebe um campo "arquivo" e salva localmente
router.post('/', verificarToken, upload.single('arquivo'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ erro: 'Nenhum ficheiro enviado ou tipo não permitido.' });
    }

    const host = `${req.protocol}://${req.get('host')}`;
    const url = `${host}/uploads/${req.file.filename}`;

    res.json({ url, filename: req.file.filename });
});

module.exports = router;
