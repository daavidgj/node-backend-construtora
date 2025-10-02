import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import VendaMensal from "./vendas.js";
import Construtora from "./construtora.js";
import Condominio from "./condominio.js";
import construtora from "./construtora.js";

/*
Hierarquia -> 
Construtora> Condomínio> Bloco> Apartamento> Dono


*/
dotenv.config();
//Puxar Caminho Banco de Dados
process.env.MONGO_URI;

//Base
const app = express();
const port = 3000;
app.use(express.json());

const arrResponse = [
    { name: "Diego", idade: "32" },
    { name: "Cleiton", idade: "41" },
];

//Conectar ao banco de dados
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Conectado ao banco de dados");
    } catch (error) {
        console.log("Erro ao conectar ao bando de dados:", error);
    }
};

connectDB();

//CRUD Construtora Específica
app.get("/construtora/:id", async (req, res) => {
    try {
        const construtora = await Construtora.findById(req.params.id);
        const condominiosConstrutora = await Condominio.find({ idConstrutora: req.params.id });
        const response = {
            nome: construtora.nome,
            telefone: construtora.telefone,
            ativo: construtora.ativo,
            _id: construtora._id,
            numeroCondominios: condominiosConstrutora.length,
            condominios: condominiosConstrutora,
        };

        res.json(response);
        console.log("Construtora encontrada", response);
    } catch (error) {
        console.log("Erro ao buscar Construtora", error);
    }
});

app.post("/construtora", async (req, res) => {
    try {
        const novaConstrutora = await Construtora.create(req.body);
        res.json(novaConstrutora);
        console.log("Construtora Criada", novaConstrutora);
    } catch (error) {
        console.log("Erro ao criar construtora", error);
    }
});

//CRUD Condomínios

app.post("/construtora/:id/condominio", async (req, res) => {
    try {
        const condominioCriado = await Condominio.create({
            nome: req.body.nome,
            endereco: req.body.endereco,
            idConstrutora: req.params.id,
        });
        res.json(condominioCriado);
        console.log("Condominio Criado", condominioCriado);
    } catch (error) {
        console.log("Erro ao criar condominio", error);
    }
});

app.get("/", (req, res) => {
    res.json("Hello");
});

app.post("/vendas", async (req, res) => {
    try {
        const novaVendaMensal = await VendaMensal.create(req.body);
        res.json(novaVendaMensal);
        console.log("Venda Criada", novaVendaMensal);
    } catch (error) {
        console.log("Erro ao criar venda", error);
    }
});

app.put("/vendas/:id", async (req, res) => {
    try {
        const vendaAtualizada = await VendaMensal.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        res.json(vendaAtualizada);
    } catch (error) {
        console.log("Erro ao atualizar venda", error);
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
