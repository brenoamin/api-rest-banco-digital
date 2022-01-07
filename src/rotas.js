const express=require("express");
const banco= require("./controladores/banco")
const rotas=express();

rotas.post("/contas", banco.criarConta)
rotas.post("/transacoes/depositar", banco.depositar)
rotas.post("/transacoes/sacar", banco.sacar)
rotas.post("/transacoes/transferir", banco.transferir)
rotas.get("/contas", banco.listarContas)
rotas.get("/contas/saldo",banco.saldo)
rotas.get("/contas/extrato",banco.extrato)
rotas.put("/contas/:numeroConta/usuario", banco.atualizaConta)
rotas.delete("/contas/:numeroConta", banco.excluirConta)
module.exports=rotas;