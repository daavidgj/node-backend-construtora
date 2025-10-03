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

//CRUD Construtora
//Listar Todas as Construtoras
app.get("/construtora/all", async (req, res) => {
    const construtoras = await Construtora.find();
    res.status(200).json(construtoras);
});

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

        res.status(200).json(response);
    } catch (error) {
        console.log("Erro ao buscar Construtora", error);
        return res.status(500).json({ error: "Erro interno do servidor" });
    }
});

app.post("/construtora", async (req, res) => {
    try {
        const novaConstrutora = await Construtora.create(req.body);
        res.status(201).json(novaConstrutora);
    } catch (error) {
        console.log("Erro ao criar construtora", error);
        return res.status(500).json({ error: "Erro interno do servidor" });
    }
});

//CRUD Condomínios
//---Listar Todos Condomínios

app.get("/construtora/:id/condominio/all", async (req, res) => {
    const condominio = await Condominio.find({ idConstrutora: req.params.id.toString() });
    console.log("lenght cond", condominio.length);
    if (condominio.length === 0) {
        return res.json("Sem Condomínios Cadastrados");
    }
    res.status(200).json(condominio);
});
//---Listar Condomínio Específico
app.get("/condominio/:id", async (req, res) => {
    const condominio = await Condominio.findOne({ _id: req.params.id });
    const condominioId = condominio._id.toString();
    const blocos = await Bloco.find({ idCondominio: condominioId });
    const response = {
        nome: condominio.nome,
        endereço: condominio.endereco,
        quantidadeBlocos: blocos.length,
        blocos: blocos.map((b) => ({
            nome: b.nome,
            andares: b.andares,
            elevadores: b.elevadores,
            escadas: b.escada,
            id: b._id,
        })),
    };
    res.status(200).json(response);
});
//---Criar Condomínio
app.post("/construtora/:id/condominio", async (req, res) => {
    try {
        const condominioCriado = await Condominio.create({
            nome: req.body.nome,
            endereco: req.body.endereco,
            idConstrutora: req.params.id,
        });
        res.status(201).json(condominioCriado);
    } catch (error) {
        console.log("Erro ao criar condominio", error);
        return res.status(500).json({ error: "Erro interno do servidor" });
    }
});
//CRUD Bloco
//---Listar Blocos do Condomínio
app.get("/condominio/:id/bloco/all", async (req, res) => {
    const blocos = await Bloco.find({ idCondominio: req.params.id });
    res.status(200).json(blocos);
});
//---Criar Bloco
app.post("/condominio/:id/bloco", async (req, res) => {
    try {
        const blocoCriado = await Bloco.create({
            nome: req.body.nome,
            andares: req.body.andares,
            elevadores: req.body.elevadores,
            escada: req.body.escada,
            idCondominio: req.params.id,
        });
        res.status(201).json(blocoCriado);
    } catch (error) {
        console.log("Erro ao criar bloco", error);
        return res.status(500).json({ error: "Erro interno do servidor" });
    }
});
//Crud Apartamentos
//---Listar Apartamento
app.get("/condominio/bloco/apartamento/:id", async (req, res) => {
    const apartamento = await Apartamento.findOne(req.params.id);
    //Corrigiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiir
    const bloco = await Bloco.findOne({ _id: i.idBloco });
    const condominio = await Condominio.findOne({ _id: bloco.idCondominio });
    const responseApartamento = await apartamento(async (i) => {
        const responseEndereco = {
            endereco: condominio.endereco,
            condominio: condominio.nome,
            bloco: bloco.nome,
            andar: i.andar,
        };
        return {
            numero: i.numero,
            metragem: i.metragem,
            quartos: i.quartos,
            banheiros: i.banheiros,
            garagem: i.garagem,
            endereco: responseEndereco,
        };
    });
    res.status(200).json(responseApartamento);
});
//---Cadastrar Apartamento
app.post("/condominio/bloco/:idBloco/apartamento", async (req, res) => {
    try {
        const { numero, metragem, quartos, banheiros, garagem } = req.body;
        if (!numero) return res.status(400).json({ erro: "Campo 'numero' é obrigatório" });
        if (!metragem) return res.status(400).json({ erro: "Campo 'metragem' é obrigatório" });
        if (!quartos) return res.status(400).json({ erro: "Campo 'quartos' é obrigatório" });
        if (!banheiros) return res.status(400).json({ erro: "Campo 'banheiros' é obrigatório" });
        if (!garagem) return res.status(400).json({ erro: "Campo 'garagem' é obrigatório" });

        const apartamentoCriado = await Apartamento.create({
            numero: req.body.numero,
            andar: req.body.numero.toString().charAt(0),
            metragem: req.body.metragem,
            quartos: req.body.quartos,
            banheiros: req.body.banheiros,
            garagem: req.body.garagem,
            idBloco: req.params.idBloco,
        });
        res.status(201).json(apartamentoCriado);
    } catch (error) {
        console.log("Erro ao criar apartamento", error);
        return res.status(500).json({ error: "Erro interno do servidor" });
    }
});

//Crud Morador
app.get("/morador/:cpf", async (req, res) => {
    const morador = await Morador.findOne({ cpf: req.params.cpf });
    const apartamentos = await Apartamento.find({ _id: morador.idApartamento });
    const responseApartamentos = await Promise.all(
        apartamentos.map(async (i) => {
            const bloco = await Bloco.findOne({ _id: i.idBloco });
            const condominio = await Condominio.findOne({ _id: bloco.idCondominio });
            const responseEndereco = {
                endereco: condominio.endereco,
                condominio: condominio.nome,
                bloco: bloco.nome,
                andar: i.andar,
            };
            return {
                numero: i.numero,
                metragem: i.metragem,
                quartos: i.quartos,
                banheiros: i.banheiros,
                garagem: i.garagem,
                endereco: responseEndereco,
            };
        })
    );

    const response = {
        nome: morador.nome,
        telefone: morador.telefone,
        cpf: morador.cpf,
        quantidadeApartamentos: morador.idApartamento.length,
        apartamentos: responseApartamentos,
    };
    return res.status(200).json(response);
});
//---Cadastrar Morador
app.post("/condominio/bloco/apartamento/:idApartamento/morador", async (req, res) => {
    try {
        const { nome, telefone, cpf } = req.body;
        if (!nome) return res.status(400).json({ erro: "Campo 'nome' é obrigatório" });
        if (!cpf) return res.status(400).json({ erro: "Campo 'cpf' é obrigatório" });
        if (!telefone) return res.status(400).json({ erro: "Campo 'telefone' é obrigatório" });
        const morador = await Morador.findOne({ cpf: req.body.cpf });
        if (morador) {
            const idsApartamentos = morador.idApartamento.map((i) => i.toString());
            if (!idsApartamentos.includes(req.params.idApartamento)) {
                morador.idApartamento.push(req.params.idApartamento);
                await morador.save();
                console.log("Morador Atualizado", morador);
            }

            return res.status(200).json(morador);
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
        return res.status(500).json({ error: "Erro interno do servidor" });
    }
});

//Middle wares
//---404 NOt Found
app.use((req, res, next) => {
    res.status(404).json({ error: "Rota não encontrada" });
});
//---500 Server Error
/*app.use((err, req, res, next) => {
    res.status(500).json({ error: "Erro interno do servidor" });
});*/

//Iniciar Servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
