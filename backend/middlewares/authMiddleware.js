const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ erro: "Acesso negado. Faça login." });
    }

    const token = authHeader.split(' ')[1];

    try {
        const dadosDecodificados = jwt.verify(token, process.env.CHAVE_SECRETA);
        req.usuarioLogado = dadosDecodificados;
        next();
    } catch (erro) {
        return res.status(403).json({ erro: "Token inválido ou expirado. Faça login novamente." });
    }
}

module.exports = { verificarToken };
