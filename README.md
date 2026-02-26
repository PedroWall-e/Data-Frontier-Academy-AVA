# Data Frontier Academy - AVA

Bem-vindo ao Ambiente Virtual de Aprendizagem (AVA) da **Data Frontier Academy**. Esta plataforma foi desenvolvida para oferecer uma experiência de ensino premium, moderna e altamente personalizável (White-Label).

## 🎨 Identidade Visual
O projeto utiliza uma identidade visual exclusiva baseada no conceito **Data Frontier**, focada em:
- **Cores Principais:** Azul Frontier (#3347FF) e Dark Graphite (#1C1D1F).
- **Tipografia:** Plus Jakarta Sans & Inter.
- **Tecnologia:** Tailwind CSS para estilização utilitária e responsiva.

---

## 🚀 Como Iniciar a Aplicação

### Pré-requisitos
- **Node.js** (v18+)
- **Docker Desktop** (para o banco de dados)

### 1. Iniciar o Banco de Dados (MySQL)
Na raiz do projeto, execute:
```bash
docker compose up -d db
```

### 2. Configurar e Iniciar o Backend
Navegue até a pasta `backend`, instale as dependências e rode as migrações iniciais:
```bash
cd backend
npm install
node migrate.js
node server.js
```
O servidor estará rodando em `http://localhost:5000`.

### 3. Iniciar o Frontend
Navegue até a pasta `frontend`, instale as dependências e inicie o servidor de desenvolvimento:
```bash
cd frontend
npm install
npm start
```
Acesse a aplicação em `http://localhost:3000` (ou `http://127.0.0.1:3000`).

---

## 🔑 Credenciais de Acesso Inicial

### 👑 Painel Admin (Master)
Utilize este acesso para gerenciar usuários, cursos e dar matrículas manuais.
- **Login:** `admin@admin.com`
- **Senha:** `admin123`

### 👤 Fluxo de Aluno / Produtor
Para testar como aluno ou produtor:
1. Vá até a tela de login.
2. Clique em **"Registrar"**.
3. Após criar a conta, você terá acesso ao seu painel pessoal.

---

## 🛠️ Tecnologias Utilizadas
- **Frontend:** React.js, Tailwind CSS, Lucide React, Axios.
- **Backend:** Node.js, Express.
- **Banco de Dados:** MySQL (Docker).
- **Segurança:** JWT (JSON Web Tokens) e Bcrypt para hashing de senhas.

---

## 📁 Estrutura do Projeto
- `/frontend`: Aplicação React com todos os componentes da interface.
- `/backend`: API REST em Node.js e scripts de migração de banco de dados.
- `/db`: Scripts SQL iniciais.
- `docker-compose.yml`: Orquestração do banco de dados MySQL.

---

© 2026 Data Frontier Academy. Todos os direitos reservados.
