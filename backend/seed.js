require('dotenv').config();
const db = require('./config/db');

async function seed() {
    try {
        console.log("Iniciando seed de dados...");

        // 1. Atualizar o perfil do Admin para parecer um autor real
        await db.execute(`
            UPDATE usuarios 
            SET 
                nome = 'Prof. Admin Carvalho',
                foto_url = 'https://i.pravatar.cc/300?img=11',
                titulo_profissional = 'Especialista em EdTech e Engenheiro de Software',
                biografia = 'Trabalho há mais de 10 anos na vanguarda da tecnologia e educação, ajudando milhares de alunos a acelerarem as suas carreiras. Acredito que a prática supera sempre a teoria, por isso os meus cursos são focados em projetos reais.',
                redes_sociais = '{"linkedin":"https://linkedin.com", "instagram":"https://instagram.com"}'
            WHERE id = 1
        `);
        console.log("Perfil do Admin atualizado.");

        const cursosSeed = [
            {
                titulo: "Bootcamp Analista de Dados e Business Intelligence 2026",
                descricao: "Mergulhe profundamente na análise de dados, Python, SQL, Tableau e Power BI. Aprenda a tomar decisões orientadas a dados e liderar projetos de BI na sua empresa.",
                preco: 197.00,
                requisitos: "Nenhum conhecimento prévio exigido. Vontade de aprender e entender lógica básica.",
                publico_alvo: "Profissionais que querem transitar de carreira para a área de dados, ou líderes que precisam entender os números.",
                checkout_video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ" // Rick roll as placeholder
            },
            {
                titulo: "Impressão 3D na Odontologia Digital: Do Escaneamento à Resina",
                descricao: "Descubra como transformar a rotina clínica da sua clínica utilizando o fluxo digital completo, do escaneamento intraoral à impressão 3D em resina.",
                preco: 349.00,
                requisitos: "Conhecimento básico em Odontologia. Ter interesse em fluxo digital.",
                publico_alvo: "Dentistas, protéticos e profissionais da área odontológica.",
                checkout_video_url: ""
            },
            {
                titulo: "Desenvolvimento Fullstack Master: React, Node.js e Cloud",
                descricao: "Aprenda a construir aplicações web completas, escaláveis e robustas do zero até ao deploy na cloud usando AWS e Firebase.",
                preco: 120.00,
                requisitos: "Noções de lógica de programação (seja qual for a linguagem).",
                publico_alvo: "Aspirantes a programadores, desenvolvedores junior que querem subir de nível.",
                checkout_video_url: ""
            },
            {
                titulo: "Modelação CAD para Usinagem de Precisão e Caldeiraria",
                descricao: "Transforme sua visão espacial numa ferramenta valiosa para a indústria pesada e de precisão, usando os principais softwares CAD de modelação 3D.",
                preco: 450.00,
                requisitos: "Experiência prévia em ambiente industrial ajuda, mas não é estritamente necessária.",
                publico_alvo: "Engenheiros mecânicos, projetistas, técnicos de desenho industrial.",
                checkout_video_url: ""
            },
            {
                titulo: "Guia Cirúrgico Guiado: Planeamento em Software Livre",
                descricao: "Aumente a previsibilidade dos seus implantes desenvolvendo as suas próprias guias cirúrgicas através de softwares livres sem custos de licença abusivos.",
                preco: 250.00,
                requisitos: "Obrigatório ter licença em Medicina Dentária (Odontologia).",
                publico_alvo: "Cirurgiões-dentistas e implantologistas.",
                checkout_video_url: ""
            }
        ];

        for (let curso of cursosSeed) {
            // Check if course already exists to avoid dupes
            const [existente] = await db.execute('SELECT id FROM cursos WHERE titulo = ?', [curso.titulo]);
            if (existente.length === 0) {
                const [resultado] = await db.execute(
                    `INSERT INTO cursos (produtor_id, titulo, descricao, preco, requisitos, publico_alvo, checkout_video_url) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [1, curso.titulo, curso.descricao, curso.preco, curso.requisitos, curso.publico_alvo, curso.checkout_video_url]
                );

                // Add some mock modules to make the page look good
                const cursoId = resultado.insertId;
                await db.execute('INSERT INTO modulos (curso_id, titulo, ordem) VALUES (?, ?, ?)', [cursoId, 'Fundamentos Básicos', 1]);
                const [mod] = await db.execute('SELECT LAST_INSERT_ID() as id');
                const modId = mod[0].id;
                await db.execute('INSERT INTO aulas (modulo_id, titulo, tipo, ordem) VALUES (?, ?, ?, ?)', [modId, 'Introdução ao Tema', 'video', 1]);
                await db.execute('INSERT INTO aulas (modulo_id, titulo, tipo, ordem) VALUES (?, ?, ?, ?)', [modId, 'Instalando as Ferramentas', 'video', 2]);
                await db.execute('INSERT INTO aulas (modulo_id, titulo, tipo, ordem) VALUES (?, ?, ?, ?)', [modId, 'Apostila Completa em PDF', 'texto', 3]);

                await db.execute('INSERT INTO modulos (curso_id, titulo, ordem) VALUES (?, ?, ?)', [cursoId, 'Colocando a Mão na Massa', 2]);

                console.log(`Curso criado: ${curso.titulo}`);
            } else {
                console.log(`Curso já existe, ignorado: ${curso.titulo}`);
            }
        }

        console.log("Seed concluído!");
        process.exit(0);
    } catch (err) {
        console.error("Erro crítico no seed:", err);
        process.exit(1);
    }
}

seed();
