const dados = require("../bancodedados");
const fs = require("fs/promises");
let numb = 1;

function verificaSingular(conta) {
  const verificaCPF = dados.contas.find(
    (item) => item.usuario.cpf === conta.usuario.cpf
  );
  const verificaEmail = dados.contas.find(
    (item) => item.usuario.email === conta.usuario.email
  );
  if (verificaCPF) {
    return "O seu CPF já está cadastrado em outra conta na nossa agência";
  }
  if (verificaEmail) {
    return "O seu email já está cadastrado em outra conta na nossa agência";
  }
}

function tratarConta(conta) {
  if (!conta.nome) {
    return "O campo nome é obrigatório.";
  }
  if (!conta.cpf) {
    return "O campo cpf é obrigatório.";
  }
  if (!conta.data_nascimento) {
    return "O campo data de nascimento é obrigatório.";
  }
  if (!conta.telefone) {
    return "O campo telefone é obrigatório.";
  }
  if (!conta.email) {
    return "O campo email é obrigatório.";
  }
  if (!conta.senha) {
    return "O campo senha é obrigatório.";
  }
  if (typeof conta.nome !== "string") {
    return "O campo nome deve ser preenchido com um texto.";
  }
  if (typeof conta.cpf !== "string") {
    return "O campo cpf deve ser preenchido com um texto.";
  }
  if (typeof conta.data_nascimento !== "string") {
    return "O campo data_nascimento deve ser preenchido com um texto.";
  }
  if (typeof conta.telefone !== "string") {
    return "O campo telefone deve ser preenchido com um texto.";
  }
  if (typeof conta.email !== "string") {
    return "O campo email deve ser preenchido com um texto.";
  }
  if (typeof conta.senha !== "string") {
    return "O campo senha deve ser preenchido com um texto.";
  }
}

function verificaDeposito(conta) {
  if (conta.numero === undefined || conta.valor === undefined) {
    return "Preencha o numero da conta e/ou valor de depósito";
  }
  if (conta.valor <= 0) {
    return "Preencha o valor com um número positivo ou diferente de zero";
  }
  if (!dados.contas.find((item) => item.numero === Number(conta.numero))) {
    return "A conta fornecida não existe. Por favor, forneça um número válido";
  }
}

function verificaSaque(conta) {
  const contaAtual = dados.contas.find(
    (item) => item.numero === Number(conta.numero)
  );
  if (
    conta.numero === undefined ||
    conta.valor === undefined ||
    conta.senha === undefined
  ) {
    return "Número da conta, valor a ser sacado e senha são campos obrigatórios. Preencha-os!";
  }
  if (!contaAtual) {
    return "A conta fornecida não existe. Por favor, forneça um número válido";
  }
  if (conta.senha !== contaAtual.usuario.senha) {
    return "A senha fornecida não condiz com a senha da conta. Por favor, forneça a senha correta!";
  }
  if (conta.valor > contaAtual.saldo) {
    return "O valor de saque é maior do que o saldo presente na conta. Ajuste o valor do saque!";
  }
}

function verificaTransferencia(conta) {
  const contaDestino = dados.contas.find(
    (item) => item.numero === Number(conta.numero_conta_destino)
  );
  const contaOrigem = dados.contas.find(
    (item) => item.numero === Number(conta.numero_conta_origem)
  );
  if (
    conta.numero_conta_origem === undefined ||
    conta.numero_conta_destino === undefined ||
    conta.valor === undefined ||
    conta.senha === undefined
  ) {
    return "Número da conta (destino e origem), valor a ser sacado e senha são campos obrigatórios. Preencha-os!";
  }
  if (!contaOrigem) {
    return "Conta de origem não existe. Informe uma conta de origem válida!";
  }
  if (!contaDestino) {
    return "Conta de destino não existe. Informe uma conta de destino válida!";
  }
  if (conta.senha !== contaOrigem.usuario.senha) {
    return "A senha fornecida não condiz com a senha da conta. Por favor, forneça a senha correta!";
  }
  if (contaOrigem.saldo <= 0) {
    return "A conta não apresenta saldo suficiente para realizar transações.";
  }
  if (conta.valor > contaOrigem.saldo) {
    return "O valor da transferência é maior do que o saldo presente na conta. Ajuste o valor da transferência!";
  }
}

function verificaSaldoExtrato(conta) {
  const contaSaldo = dados.contas.find(
    (item) => item.numero === Number(conta.numero_conta)
  );
  if (conta.numero_conta === undefined || conta.senha === undefined) {
    return "Informe senha e conta.";
  }
  if (
    !dados.contas.find((item) => item.numero === Number(conta.numero_conta))
  ) {
    return "A conta informada não existe";
  }
  if (conta.senha != contaSaldo.usuario.senha) {
    return "A senha fornecida não condiz com a senha da conta. Por favor, forneça a senha correta!";
  }
}

function criarConta(req, res) {
  const erro = tratarConta(req.body);
  const unico = verificaSingular(req.body);
  if (erro) {
    res.status(400);
    res.json({ erro });
    return;
  }
  if (unico) {
    res.status(400);
    res.json({ unico });
    return;
  }
  const novaConta = {
    numero: numb,
    saldo: 0,
    usuario: {
      nome: req.body.usuario.nome,
      cpf: req.body.usuario.cpf,
      data_nascimento: req.body.usuario.data_nascimento,
      telefone: req.body.usuario.telefone,
      email: req.body.usuario.email,
      senha: req.body.usuario.senha,
    },
  };
  dados.contas.push(novaConta);
  numb += 1;
  res.status(201);
  res.json();
}

function listarContas(req, res) {
  const senhaAdmin = req.query.senha_banco;
  if (!senhaAdmin) {
    res.json({ erro: "Acesso restrito. Forneça uma senha!" });
  } else {
    if (senhaAdmin === dados.senha) {
      res.json(dados.contas);
    } else {
      res.status(401);
      res.json({ erro: "senha incorreta" });
    }
  }
}

function atualizaConta(req, res) {
  const newAccount = req.body;
  const contaBank = req.params.numeroConta;
  const conta = dados.contas.find(
    (conta) => conta.numero === Number(contaBank)
  );
  const erro = tratarConta(req.body);
  const unico = verificaSingular(req.body);
  if (unico) {
    res.status(400);
    res.json({ unico });
    return;
  }
  if (erro) {
    res.status(400);
    res.json({ erro });
    return;
  }
  if (conta) {
    if (req.body.numero !== Number(contaBank)) {
      res.status(400);
      res.json({
        erro: "O campo número deve ser igual na rota e no body da requisição.",
      });
      return;
    } else {
      Object.assign(conta, newAccount);
      res.json({ mensagem: "Conta atualizada com sucesso!" });
    }
  } else {
    res.json({ mensagem: "A conta em questão não existe." });
  }
}

function excluirConta(req, res) {
  const contaBank = req.params.numeroConta;
  const conta = dados.contas.find(
    (conta) => conta.numero === Number(contaBank)
  );
  const indice = dados.contas.indexOf(conta);
  if (isNaN(contaBank)) {
    res.status(400);
    res.json({ mensagem: "O número fornecido deve ser um número válido" });
  }
  if (conta) {
    if (conta.saldo == 0) {
      dados.contas.splice(indice, 1);
      res.json({ mensagem: "Conta excluída com sucesso!" });
      res.status(200);
    } else {
      res.json({
        mensagem: "A conta apresenta um saldo, retire-o antes de excluí-la",
      });
    }
  } else {
    res.status(404);
    res.json({
      mensagem: "Não existe conta a ser removida para o número informado.",
    });
  }
}

function depositar(req, res) {
  now = new Date();
  const erro = verificaDeposito(req.body);
  if (erro) {
    res.status(400);
    res.json({ erro });
    return;
  }
  const deposito = {
    data: now.toLocaleString(),
    numero_conta: req.body.numero,
    valor: req.body.valor,
  };
  dados.depositos.push(deposito);
  res.status(201);
  const conta = dados.contas.find(
    (item) => item.numero === Number(req.body.numero)
  );
  conta.saldo += req.body.valor;
  res.json({ mensagem: "Depósito realizado com sucesso." });
}

function sacar(req, res) {
  now = new Date();
  const erro = verificaSaque(req.body);
  if (erro) {
    res.status(400);
    res.json({ erro });
    return;
  }
  const saque = {
    data: now.toLocaleString(),
    valor: req.body.valor,
    numero_conta: req.body.numero,
  };
  dados.saques.push(saque);
  const conta = dados.contas.find(
    (item) => item.numero === Number(req.body.numero)
  );
  conta.saldo -= req.body.valor;
  res.json({ mensagem: "Saque realizado com sucesso." });
}

function transferir(req, res) {
  const erro = verificaTransferencia(req.body);
  const contaDestino = dados.contas.find(
    (item) => item.numero === Number(req.body.numero_conta_destino)
  );
  const contaOrigem = dados.contas.find(
    (item) => item.numero === Number(req.body.numero_conta_origem)
  );
  now = new Date();
  if (erro) {
    res.status(400);
    res.json({ erro });
    return;
  }
  const transferencias = {
    data: now.toLocaleString(),
    numero_conta_origem: req.body.numero_conta_origem,
    numero_conta_destino: req.body.numero_conta_destino,
    valor: req.body.valor,
  };
  dados.transferencias.push(transferencias);
  contaOrigem.saldo -= req.body.valor;
  contaDestino.saldo += req.body.valor;
  res.json({ mensagem: "Transferência realizada com sucesso." });
}

function saldo(req, res) {
  const contaSaldo = dados.contas.find(
    (item) => item.numero === Number(req.query.numero_conta)
  );
  const erro = verificaSaldoExtrato(req.query);
  if (erro) {
    res.status(400);
    res.json({ erro });
    return;
  }
  res.json({ saldo: contaSaldo.saldo });
}

function extrato(req, res) {
  const erro = verificaSaldoExtrato(req.query);
  if (erro) {
    res.status(400);
    res.json({ erro });
    return;
  }
  const historico = {
    depositos: [],
    saques: [],
    transferenciasEnviadas: [],
    transferenciasRecebidas: [],
  };
  for (i = 0; i < dados.depositos.length; i++) {
    if (dados.depositos[i].numero_conta == req.query.numero_conta) {
      historico.depositos.push(dados.depositos[i]);
    }
  }
  for (i = 0; i < dados.saques.length; i++) {
    if (dados.saques[i].numero_conta == req.query.numero_conta) {
      historico.saques.push(dados.saques[i]);
    }
  }
  for (i = 0; i < dados.transferencias.length; i++) {
    if (dados.transferencias[i].numero_conta_origem == req.query.numero_conta) {
      historico.transferenciasEnviadas.push(dados.transferencias[i]);
    }
    if (
      dados.transferencias[i].numero_conta_destino == req.query.numero_conta
    ) {
      historico.transferenciasRecebidas.push(dados.transferencias[i]);
    }
  }
  res.json(historico);
}

module.exports = {
  criarConta,
  listarContas,
  atualizaConta,
  excluirConta,
  depositar,
  sacar,
  transferir,
  saldo,
  extrato,
};
