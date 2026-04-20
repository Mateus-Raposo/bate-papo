import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';

const host = '0.0.0.0';
const porta = 3000;

var listaUsuarios = [];
var listaMensagens = [];
var listaAssuntos = ["Futebol", "Games", "Carros", "Música", "Tecnologia"];

const server = express();

server.use(session({
  secret: 'segredo123',
  resave: true,
  saveUninitialized: true,
  cookie: { 
    maxAge: 1000 * 60 * 30 
  }
}));

server.use(express.urlencoded({ extended: true }));
server.use(cookieParser());

function verificarUsuarioLogado(requisicao, resposta, proximo) {
  if(requisicao.session?.dadosLogin?.logado){
    proximo();
  } else {
    resposta.redirect("/login");
  }
}

server.get("/", verificarUsuarioLogado, (req, res) => {
  let ultimoAcesso = req.cookies?.ultimoAcesso;
  const data = new Date();
  res.cookie("ultimoAcesso", data.toLocaleString());

  res.send(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Menu - Bate-Papo</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
<style>
  body { background-color: #f8f9fa; }
  a.nav-link { font-size: 15px; white-space: nowrap; margin-right: 15px; }
</style>
</head>
<body>
<nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
  <div class="container-fluid">
    <a class="navbar-brand">Super Chat WEB</a>
    <div class="collapse navbar-collapse" id="nav">
      <ul class="navbar-nav">
        <li class="nav-item"><a class="nav-link active" href="/">Início</a></li>
        <li class="nav-item"><a class="nav-link" href="/cadastrarUsuario">Cadastro de Usuários</a></li>
        <li class="nav-item"><a class="nav-link" href="/listarUsuarios">Lista de Usuários</a></li>
        <li class="nav-item"><a class="nav-link text-warning" href="/escolherAssunto">Entrar no Bate-Papo</a></li>
        <li class="nav-item"><a class="nav-link text-danger" href="/logout">Sair</a></li>
      </ul>
    </div>
  </div>
  <div class="container text-white text-end">
    <small>Último acesso: ${ultimoAcesso || "Primeiro acesso"}</small>
  </div>
</nav>
<div class="container text-center mt-5">
    <h2>Bem-vindo ao Bate-Papo WEB!</h2>
    <p class="mb-4">Utilize o menu superior para navegar.</p>
</div>
</body>
</html>
  `);
});

server.get("/cadastrarUsuario", verificarUsuarioLogado, (req, res) => {
  let opcoesAssuntos = "";
  for (let i = 0; i < listaAssuntos.length; i++) {
    opcoesAssuntos += `<option value="${listaAssuntos[i]}">${listaAssuntos[i]}</option>`;
  }

  res.send(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Cadastrar Usuário</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="p-4 bg-light">
<div class="card p-4 mx-auto" style="max-width: 600px;">
  <h2 class="text-center mb-3">Cadastro de Usuário</h2>
  <form method="POST" action="/cadastrarUsuario" class="row g-3">
    <div class="col-12">
      <label>Nome Completo</label>
      <input type="text" class="form-control" name="nome" required>
    </div>
    <div class="col-12">
      <label>Data de Nascimento</label>
      <input type="date" class="form-control" name="dataNascimento" required>
    </div>
    <div class="col-12">
      <label>Nickname (Apelido)</label>
      <input type="text" class="form-control" name="nick" required>
    </div>
    <div class="col-12">
      <label>Assunto Preferido</label>
      <select class="form-control" name="assunto" required>
        <option value="">Selecione...</option>
        ${opcoesAssuntos}
      </select>
    </div>
    <div class="text-center mt-4">
      <button class="btn btn-primary">Cadastrar</button>
      <a href="/" class="btn btn-outline-secondary">Voltar</a>
    </div>
  </form>
</div>
</body>
</html>
  `);
});

server.post("/cadastrarUsuario", verificarUsuarioLogado, (req, res) => {
  const { nome, dataNascimento, nick, assunto } = req.body;
  
  if (nome && dataNascimento && nick && assunto) {
    listaUsuarios.push({ nome, dataNascimento, nick, assunto });
    res.redirect("/listarUsuarios");
  } else {
    res.send("Erro: Preencha todos os campos. <a href='/cadastrarUsuario'>Voltar</a>");
  }
});

server.get("/listarUsuarios", verificarUsuarioLogado, (req, res) => {
  let tabela = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Usuários</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="p-4 bg-light">
<h2 class="mb-3">Usuários Cadastrados</h2>
<a href="/" class="btn btn-secondary btn-sm mb-3">Menu</a>
<a href="/cadastrarUsuario" class="btn btn-primary btn-sm mb-3">Cadastrar Usuário</a>
<table class="table table-striped">
  <thead class="table-dark">
    <tr>
      <th>Nome</th>
      <th>Data de Nascimento</th>
      <th>Nickname</th>
      <th>Assunto Preferido</th>
    </tr>
  </thead>
  <tbody>`;

  for (let i = 0; i < listaUsuarios.length; i++) {
    tabela += `
    <tr>
      <td>${listaUsuarios[i].nome}</td>
      <td>${listaUsuarios[i].dataNascimento}</td>
      <td>${listaUsuarios[i].nick}</td>
      <td>${listaUsuarios[i].assunto}</td>
    </tr>`;
  }

  tabela += `</tbody></table></body></html>`;
  res.send(tabela);
});

server.get("/escolherAssunto", verificarUsuarioLogado, (req, res) => {
  let opcoes = "";
  for (let i = 0; i < listaAssuntos.length; i++) {
    opcoes += `<option value="${listaAssuntos[i]}">${listaAssuntos[i]}</option>`;
  }
  res.send(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="p-5">
<div class="card p-4 mx-auto" style="max-width: 400px;">
  <form method="GET" action="/batepapo">
    <label>Escolha a sala de conversa:</label>
    <select class="form-control mt-2 mb-3" name="assunto" required>
        <option value="">Selecione...</option>
        ${opcoes}
    </select>
    <button class="btn btn-success w-100">Entrar</button>
  </form>
</div>
</body>
</html>`);
});

server.get("/batepapo", verificarUsuarioLogado, (req, res) => {
  let assuntoEscolhido = req.query.assunto;
  let erro = req.query.erro;
  
  let opcoesUsuarios = "";
  for (let i = 0; i < listaUsuarios.length; i++) {
    opcoesUsuarios += `<option value="${listaUsuarios[i].nick}">${listaUsuarios[i].nick}</option>`;
  }

  let chatHTML = "";
  for (let j = 0; j < listaMensagens.length; j++) {
    if (listaMensagens[j].assunto === assuntoEscolhido) {
      chatHTML += `
      <div class="border p-2 mb-2 bg-white rounded">
        <strong class="text-primary">${listaMensagens[j].usuario}</strong>
        <span class="text-muted" style="font-size: 11px;"> - ${listaMensagens[j].dataHora}</span>
        <p class="mb-0">${listaMensagens[j].texto}</p>
      </div>`;
    }
  }

  res.send(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Sala: ${assuntoEscolhido}</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="p-4 bg-light">
<div class="container" style="max-width: 800px;">
  <h3>Sala: ${assuntoEscolhido}</h3>
  ${erro ? '<div class="alert alert-danger">Selecione o usuário e digite a mensagem!</div>' : ''}
  <div class="card p-3 mb-4" style="height: 350px; overflow-y: scroll; background-color: #eee;">
    ${chatHTML || "<p class='text-center text-muted'>Nenhuma mensagem.</p>"}
  </div>
  <form method="POST" action="/postarMensagem" class="row g-2">
    <input type="hidden" name="assunto" value="${assuntoEscolhido}">
    <div class="col-md-3">
      <select class="form-control" name="usuario">
        <option value="">Quem é você?</option>
        ${opcoesUsuarios}
      </select>
    </div>
    <div class="col-md-7">
      <input type="text" class="form-control" name="texto" placeholder="Mensagem...">
    </div>
    <div class="col-md-2">
      <button class="btn btn-success w-100">Enviar</button>
    </div>
  </form>
  <a href="/" class="btn btn-secondary mt-3">Voltar ao Menu</a>
  <a href="/escolherAssunto" class="btn btn-outline-primary mt-3 ms-2">Trocar de Sala</a>
</div>
</body>
</html>`);
});

server.post("/postarMensagem", verificarUsuarioLogado, (req, res) => {
  const { usuario, texto, assunto } = req.body;
  if (usuario && texto) {
    listaMensagens.push({
      usuario,
      texto,
      assunto,
      dataHora: new Date().toLocaleString("pt-BR")
    });
    res.redirect("/batepapo?assunto=" + assunto);
  } else {
    res.redirect("/batepapo?assunto=" + assunto + "&erro=1");
  }
});

server.get("/login", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Login</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="p-5 bg-light">
<div class="card p-4 mx-auto" style="max-width: 350px;">
  <h4 class="text-center">Acesso</h4>
  <form method="POST" action="/login">
    <input type="text" name="usuario" class="form-control mb-2" placeholder="Usuário">
    <input type="password" name="senha" class="form-control mb-3" placeholder="Senha">
    <button class="btn btn-primary w-100">Entrar</button>
  </form>
</div>
</body>
</html>`);
});

server.post("/login", (req, res) => {
  if(req.body.usuario === "admin" && req.body.senha === "admin") {
    req.session.dadosLogin = { logado: true };
    res.redirect("/");
  } else {
    res.send("Login incorreto. <a href='/login'>Voltar</a>");
  }
});

server.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

server.listen(porta, host, () => {
  console.log("Servidor rodando em http://" + host + ":" + porta);
});