import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import VendaMensal from "./vendas.js";
import Construtora from "./construtora.js";
import Condominio from "./condominio.js";
import Bloco from "./bloco.js";
import Apartamento from "./apartamento.js";
import Morador from "./morador.js";

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
app.get("/construtora", async (req, res) => {
    const Construtoras = await Construtora.find();
    res.json(Construtoras);
});
//CRUD Construtora Específica
app.get("/construtora/:id", async (req, res) => {
    try {
        //Encontra Construtora pelo param na url
        const construtora = await Construtora.findById(req.params.id);
        //Encontra Condomínios da Construtora e pega ses Ids
        const condominiosConstrutora = await Condominio.find({ idConstrutora: req.params.id });
        const condominiosConstrutoraIds = condominiosConstrutora.map((i) => i._id);
        //Encontra blocos com id do condomínio da construtora
        const blocosCondominiosConstrutora = await Bloco.find({ idCondominio: { $in: condominiosConstrutoraIds } });

        //Apresentação
        const responseCondominiosConstrutora = condominiosConstrutora.map((i) => {
            const responseBlocos = blocosCondominiosConstrutora.filter((bloco) => bloco.idCondominio.toString() == i._id.toString());
            return {
                _id: i._id,
                nome: i.nome,
                andares: i.andares,
                elevadores: i.elevadores,
                escada: i.escada,
                blocos: responseBlocos,
            };
        });

        const response = {
            nome: construtora.nome,
            telefone: construtora.telefone,
            ativo: construtora.ativo,
            _id: construtora._id,
            numeroCondominios: condominiosConstrutora.length,
            condominios: responseCondominiosConstrutora,
        };

        res.json(response);
        console.log("Condomínio ID", condominiosConstrutoraIds);
        console.log("Construtora encontrada");
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
//CRUD Bloco
app.post("/condominio/:id/bloco", async (req, res) => {
    try {
        const blocoCriado = await Bloco.create({
            nome: req.body.nome,
            andares: req.body.andares,
            elevadores: req.body.elevadores,
            escada: req.body.escada,
            idCondominio: req.params.id,
        });
        res.json(blocoCriado);
    } catch (error) {
        console.log("Erro ao criar bloco", error);
    }
});
//Crud Apartamentos
app.post("/condominio/bloco/:idBloco/apartamento", async (req, res) => {
    try {
        const apartamentoCriado = await Apartamento.create({
            numero: req.body.numero,
            andar: req.body.numero.toString().charAt(0),
            metragem: req.body.metragem,
            quartos: req.body.quartos,
            banheiros: req.body.banheiros,
            garagem: req.body.garagem || 1,
            valorCondominio: req.body.valorCondominio || 650,
            idBloco: req.params.idBloco,
        });
        res.json(apartamentoCriado);
    } catch (error) {
        console.log("Erro ao criar apartamento", error);
    }
});

//Crud Morador
app.post("/condominio/bloco/apartamento/:idApartamento/morador", async (req, res) => {
    try {
        const morador = await Morador.findOne({ cpf: req.body.cpf });
        if (morador) {
            const idsApartamentos = morador.idApartamento.map((i) => i.toString());
            if (!idsApartamentos.includes(req.params.idApartamento)) {
                morador.idApartamento.push(req.params.idApartamento);
                await morador.save();
                console.log("Morador Atualizado", morador);
            }

            return res.json(morador);
        } else {
            const moradorCriado = await Morador.create({
                nome: req.body.nome,
                telefone: req.body.telefone,
                cpf: req.body.cpf,
                idApartamento: [req.params.idApartamento],
            });
            console.log("Morador Criado", moradorCriado);
            return res.status(201).json(moradorCriado);
        }
    } catch (error) {
        console.log("Erro ao criar morador", error);
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
