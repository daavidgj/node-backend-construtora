import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import VendaMensal from "./vendas.js";
import Construtora from "./construtora.js";
import Condominio from "./condominio.js";
import Bloco from "./bloco.js";
import Apartamento from "./apartamento.js";
import Morador from "./morador.js";
import Encomenda from "./encomenda.js";
import Espaco from "./espaco.js";
import Funcionario from "./funcionario.js";
import Visitante from "./visitante.js";
import Catraca from "./catraca.js";
import * as yup from "yup";
import encomenda from "./encomenda.js";
import funcionario from "./funcionario.js";
/*
Hierarquia ->
Construtora> Condomínio> Bloco> Apartamento> Dono*/
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

//Yup Validações / 1 para cada Entidade

const schemaConstrutora = yup.object().shape({
    nome: yup.string().required('Campo "nome" obrigatório').min(3, "Campo 'nome' deve ter no mínimo 3 caracteres"),
    telefone: yup.string().required('Campo "telefone" obrigatório').min(9, "Campo 'telefone' deve ter no mínimo 3 caracteres"),
});
const schemaCondominio = yup.object().shape({
    nome: yup.string().required('Campo "nome" obrigatório').min(3, "Campo 'nome' deve ter no mínimo 3 caracteres"),
    endereco: yup.string().required('Campo "endereco" obrigatório').min(3, "Campo 'endereco' deve ter no mínimo 3 caracteres"),
});
const schemaBloco = yup.object().shape({
    nome: yup.string().required('Campo "nome" obrigatório').min(3, "Campo 'nome' deve ter no mínimo 3 caracteres"),
    andares: yup.number().required('Campo "andares" obrigatório'),
    elevadores: yup.number().required('Campo "elevadores" obrigatório'),
    escada: yup.boolean().default(true),
});
const schemaApartamento = yup.object().shape({
    numero: yup.string().required('Campo "numero" obrigatório'),
    metragem: yup.number().required('Campo "metragem" obrigatório'),
    quartos: yup.number().required('Campo "quartos" obrigatório'),
    banheiros: yup.number().required('Campo "banheiros" obrigatório').default(1),
    qtdGaragem: yup.number().default(0),
});
const schemaMorador = yup.object().shape({
    nome: yup.string().required('Campo "nome" obrigatório').min(3, "Campo 'nome' deve ter no mínimo 3 caracteres"),
    telefone: yup.string().required('Campo "telefone" obrigatório').min(9, "Campo 'telefone' deve ter no mínimo 9 caracteres"),
    cpf: yup.string().required('Campo "cpf" obrigatório').min(11, "Campo 'cpf' deve ter 11 caracteres").max(11, "Campo 'cpf' deve ter 11 caracteres"),
});
const schemaEncomenda = yup.object().shape({
    descricao: yup.string().required('Campo "descricao" obrigatório').min(3, "Campo 'descricao' deve ter no mínimo 3 caracteres"),
    transportadora: yup.string().required('Campo "transportadora" obrigatório').min(3, "Campo 'transportadora' deve ter no mínimo 3 caracteres"),
});
const schemaFuncionario = yup.object().shape({
    nome: yup.string().required('Campo "nome" obrigatório').min(3, "Campo 'nome' deve ter no mínimo 3 caracteres"),
    cargo: yup.string().required('Campo "cargo" obrigatório').min(3, "Campo 'cargo' deve ter no mínimo 3 caracteres"),
    cpf: yup.string().required('Campo "cpf" obrigatório').min(11, "Campo 'cpf' deve ter 11 caracteres").max(11, "Campo 'cpf' deve ter 11 caracteres"),
});
const schemaVisitante = yup.object().shape({
    nome: yup.string().required('Campo "nome" obrigatório').min(3, "Campo 'nome' deve ter no mínimo 3 caracteres"),
    telefone: yup.string().required('Campo "telefone" obrigatório').min(9, "Campo 'telefone' deve ter no mínimo 9 caracteres"),
});
const schemaCatraca = yup.object().shape({
    catraca: yup.string().required('Campo "numero" obrigatório'),
});
const schemaEspaco = yup.object().shape({
    descricao: yup.string().required('Campo "descricao" obrigatório').min(3, "Campo 'descricao' deve ter no mínimo 3 caracteres"),
});

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
//---Criar Construtora
app.post("/construtora", async (req, res) => {
    try {
        await schemaConstrutora.validate(req.body);

        const { nome, telefone } = req.body;
        const novaConstrutora = await Construtora.create(req.body);
        res.status(201).json(novaConstrutora);
    } catch (error) {
        console.log("Erro ao criar construtora", error);
        if (error instanceof yup.ValidationError) {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: "Erro interno do servidor" });
    }
});
//---Atualizar Construtora
app.put("/construtora/:id", async (req, res) => {
    try {
        await schemaConstrutora.validate(req.body);
        const construtoraAtualizada = await Construtora.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });

        res.status(200).json(construtoraAtualizada);
    } catch (error) {
        console.log("Erro ao atualizar construtora", error);
        return res.status(500).json({ error: "Erro interno do servidor" });
    }
});
//---Deletar Construtora
app.delete("/construtora/:id", async (req, res) => {
    try {
        const construtoraDeletada = await Construtora.findByIdAndDelete(req.params.id);
        if (!construtoraDeletada) {
            return res.status(404).json({ error: "Construtora não encontrada" });
        }
        res.status(200).json("Construtora deletada com sucesso");
    } catch (error) {
        console.log("Erro ao deletar construtora", error);
        return res.status(500).json({ error: "Erro interno do servidor" });
    }
});
//
//
//
//CRUD Condomínios
//
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
        await schemaCondominio.validate(req.body);
        const { nome, endereco } = req.body;
        if (!nome) return res.status(400).json({ erro: "Campo 'nome' é obrigatório" });
        if (!endereco) return res.status(400).json({ erro: "Campo 'endereco' é obrigatório" });
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
//---Atualizar Condomínio
app.put("/condominio/:id", async (req, res) => {
    try {
        await schemaCondominio.validate(req.body);
        const condominioAtualizado = await Condominio.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });

        res.status(200).json(condominioAtualizado);
    } catch (error) {
        console.log("Erro ao atualizar construtora", error);
        return res.status(500).json({ error: "Erro interno do servidor" });
    }
});
//---Deletar Condomínio
app.delete("/condominio/:id", async (req, res) => {
    try {
        const condominioDeletado = await Condominio.findByIdAndDelete(req.params.id);
        if (!condominioDeletado) {
            return res.status(404).json({ error: "Condomínio não encontrado" });
        }
        res.status(200).json("Condomínio deletado com sucesso");
    } catch (error) {
        console.log("Erro ao deletar condomínio", error);
        return res.status(500).json({ error: "Erro interno do servidor" });
    }
});
//CRUD Bloco
//---Listar Blocos do Condomínio
app.get("/condominio/:id/bloco/all", async (req, res) => {
    const blocos = await Bloco.find({ idCondominio: req.params.id });
    res.status(200).json(blocos);
});
//---Listar Bloco
app.get("/condominio/bloco/:id", async (req, res) => {
    const blocos = await Bloco.findOne({ idCondominio: req.params.id });
    const apartamentos = await Apartamento.find({ idBloco: req.params.id });
    const response = {
        nome: blocos.nome,
        andares: blocos.andares,
        elevadores: blocos.elevadores,
        escadas: blocos.escada,
        quantidadeApartamentos: apartamentos.length,
        apartamentos: apartamentos.length > 0 ? apartamentos : "Sem Apartamentos Cadastrados",
    };
    res.status(200).json(response);
});
//---Criar Bloco
app.post("/condominio/:id/bloco", async (req, res) => {
    try {
        await schemaBloco.validate(req.body);
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
//---Atualizar Bloco
app.put("/condominio/bloco/:id", async (req, res) => {
    try {
        await schemaBloco.validate(req.body);
        const blocoAtualizado = await Bloco.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        if (!blocoAtualizado) {
            return res.status(404).json({ error: "Bloco nao encontrado" });
        }

        res.status(200).json(blocoAtualizado);
    } catch (error) {
        console.log("Erro ao atualizar Bloco", error);
        return res.status(500).json({ error: "Erro interno do servidor" });
    }
});
//---Deletar Bloco
app.delete("/condominio/bloco/:id", async (req, res) => {
    try {
        const blocoDeletado = await Bloco.findByIdAndDelete(req.params.id);
        if (!blocoDeletado) {
            return res.status(404).json({ error: "Bloco não encontrado" });
        }
        res.status(200).json("Bloco deletado com sucesso");
    } catch (error) {
        console.log("Erro ao deletar bloco", error);
        return res.status(500).json({ error: "Erro interno do servidor" });
    }
});
//Crud Apartamentos
//---Listar Apartamento
app.get("/condominio/bloco/apartamento/:id", async (req, res) => {
    try {
        const apartamento = await Apartamento.findById(req.params.id);
        const morador = await Morador.find({ idApartamento: req.params.id });
        console.log(morador);
        if (!apartamento) {
            return res.status(404).json({ error: "Apartamento não encontrado" });
        }

        const bloco = await Bloco.findById(apartamento.idBloco);
        if (!bloco) {
            return res.status(404).json({ error: "Bloco não encontrado" });
        }

        const condominio = await Condominio.findById(bloco.idCondominio);
        if (!condominio) {
            return res.status(404).json({ error: "Condomínio não encontrado" });
        }

        const responseApartamento = {
            id: apartamento._id,
            numero: apartamento.numero,
            metragem: apartamento.metragem,
            quartos: apartamento.quartos,
            banheiros: apartamento.banheiros,
            garagem: apartamento.garagem,
            endereco: {
                endereco: condominio.endereco,
                condominio: condominio.nome,
                bloco: bloco.nome,
                andar: apartamento.andar,
            },
        };

        res.status(200).json(responseApartamento);
    } catch (error) {
        console.error("Erro ao buscar apartamento:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});

//---Cadastrar Apartamento
app.post("/condominio/bloco/:idBloco/apartamento", async (req, res) => {
    try {
        await schemaApartamento.validate(req.body);
        const { numero, metragem, quartos, banheiros, qtdGaragem } = req.body;
        const bloco = await Bloco.findById(req.params.idBloco);
        const apartamentos = await Apartamento.findOne({ idBloco: req.params.idBloco, numero: req.body.numero });
        if (apartamentos) {
            console.log("Apartamento Já existe", apartamentos.numero);
            return res.status(409).json({ error: "Apartamento ja cadastrado" });
        }
        const apartamentoCriado = await Apartamento.create({
            numero: req.body.numero,
            andar: req.body.numero.toString().charAt(0),
            metragem: req.body.metragem,
            quartos: req.body.quartos,
            banheiros: req.body.banheiros,
            qtdGaragem: req.body.qtdGaragem,
            idBloco: req.params.idBloco,
            garagem: qtdGaragem ? true : false,
        });
        res.status(201).json(apartamentoCriado);
    } catch (error) {
        console.log("Erro ao criar apartamento", error);
        return res.status(500).json({ error: "Erro interno do servidor" });
    }
});
//---Atualizar Apartamento
app.put("/condominio/bloco/apartamento/:id", async (req, res) => {
    try {
        await schemaApartamento.validate(req.body);
        const apartamentoAtualizado = await Apartamento.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        if (!apartamentoAtualizado) {
            return res.status(404).json({ error: "Apartamento não encontrado" });
        }

        res.status(200).json(apartamentoAtualizado);
    } catch (error) {
        console.log("Erro ao atualizar Bloco", error);
        return res.status(500).json({ error: "Erro interno do servidor" });
    }
});
//---Deletar Apartamento
app.delete("/condominio/bloco/apartamento/:id", async (req, res) => {
    try {
        const apartamentoDeletado = await Apartamento.findByIdAndDelete(req.params.id);
        if (!apartamentoDeletado) {
            return res.status(404).json({ error: "Apartamento não encontrado" });
        }
        res.status(200).json("Apartamento deletado com sucesso");
    } catch (error) {
        console.log("Erro ao deletar Apartamento", error);
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
                idApartamento: i._id,
            };
        })
    );

    const response = {
        nome: morador.nome,
        telefone: morador.telefone,
        cpf: morador.cpf,
        quantidadeApartamentos: morador.idApartamento.length,
        idMorador: morador._id,
        apartamentos: responseApartamentos,
    };
    return res.status(200).json(response);
});
//---Cadastrar Morador
app.post("/condominio/bloco/apartamento/:idApartamento/morador", async (req, res) => {
    try {
        await schemaMorador.validate(req.body);
        const { nome, telefone, cpf } = req.body;
        const idApartamento = req.params.idApartamento;

        const morador = await Morador.findOne({ cpf: req.body.cpf });
        const jaTemMorador = await Morador.findOne({ idApartamento: req.params.idApartamento });
        if (morador) {
            return res.status(409).json("Morador ja cadastrado");
        } else if (jaTemMorador) {
            return res.status(409).json("O apartamento já tem um morador cadastrado");
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
        return res.status(500).json({ error: { error } });
    }
});
//---Atualizar Morador
app.put("/morador/:cpf", async (req, res) => {
    try {
        const moradorAtualizado = await Morador.findOneAndUpdate({ cpf: req.params.cpf }, req.body, { new: true });

        if (!moradorAtualizado) {
            return res.status(404).json({ error: "Morador não encontrado" });
        }

        res.status(200).json(moradorAtualizado);
    } catch (error) {
        console.log("Erro ao atualizar morador", error);
        return res.status(500).json({ error: "Erro interno do servidor" });
    }
});
//---Deletar Morador
app.delete("/morador/:cpf", async (req, res) => {
    try {
        const moradorDeletado = await Morador.findOneAndDelete({ cpf: req.params.cpf });
        if (!moradorDeletado) {
            return res.status(404).json({ error: "Morador não encontrado" });
        }
        res.status(200).json("Morador deletado com sucesso");
    } catch (error) {
        console.log("Erro ao deletar morador", error);
        return res.status(500).json({ error: "Erro interno do servidor" });
    }
});
// -- Crud Encomendas
//Cadastrar Encomenda
app.post("/apartamento/:idApartamento/encomenda", async (req, res) => {
    try {
        await schemaEncomenda.validate(req.body);
        const { descricao, endereco, transportadora } = req.body;
        const apartamento = await Apartamento.findOne({ _id: req.params.idApartamento });
        if (!apartamento) {
            return res.status(404).json({ error: "Apartamento nao encontrado" });
        }

        const encomendaCriada = await Encomenda.create({
            descricao,
            endereco,
            transportadora,
            idApartamento: req.params.idApartamento,
        });
        console.log("Encomenda Criada", encomendaCriada);
        return res.status(201).json(encomendaCriada);
    } catch (error) {
        console.log("Erro ao criar encomenda", error);
        return res.status(500).json({ error: { error } });
    }
});
//---Atualizar Encomenda
app.put("/encomenda/:id", async (req, res) => {
    try {
        await schemaEncomenda.validate(req.body);
        const encomenda = await Encomenda.findOne({ _id: req.params.id });

        Object.assign(encomenda, req.body);
        if (encomenda.recebido == true && !encomenda.dataRetirada) {
            encomenda.dataRetirada = new Date();
        }
        const encomendaAtualizada = await encomenda.save();

        res.status(200).json(encomendaAtualizada);
    } catch (error) {
        console.log("Erro ao atualizar encomenda", error);
        return res.status(500).json({ error: "Erro interno do servidor" });
    }
});
// Mostrar Encomenda
app.get("/apartamento/:idApartamento/encomenda", async (req, res) => {
    try {
        const apartamento = await Apartamento.findOne({ _id: req.params.idApartamento });
        console.log("Apartamento", apartamento);
        const encomenda = await Encomenda.find({ idApartamento: apartamento._id, recebido: false });

        console.log("Encomenda", encomenda);
        if (!encomenda) {
            return res.status(404).json({ error: "Encomenda nao encontrada" });
        }
        res.status(200).json(encomenda);
    } catch (error) {
        console.log("Erro ao buscar encomenda", error);
        return res.status(500).json({ error: "Erro interno do servidor" });
    }
});
//---Deletar Encomenda
app.delete("/encomenda/:id", async (req, res) => {
    try {
        const encomendaDeletada = await Encomenda.findByIdAndDelete(req.params.id);
        res.status(200).json("Encomenda deletada com sucesso");
    } catch (error) {
        console.log("Erro ao deletar encomenda", error);
        return res.status(500).json({ error: "Erro interno do servidor" });
    }
});

//--- Crud Espaços
//Listar Espaço
app.get("/condominio/:id/espaco", async (req, res) => {
    const condominio = await Condominio.findOne({ _id: req.params.id });
    const espacos = await Espaco.find({ idCondominio: req.params.id });
    const response = {
        condominio,
        espacos,
    };
    if (espacos.length === 0) {
        return res.json("Sem Espaços Cadastrados");
    }
    res.status(200).json(response);
});
//Cadastrar Espaço
app.post("/condominio/:id/espaco", async (req, res) => {
    try {
        await schemaEspaco.validate(req.body);
        const { nome, descricao, capacidade, taxaReserva } = req.body;

        const espacoCriado = await Espaco.create({
            nome,
            descricao,
            capacidade,
            taxaReserva,
            idCondominio: req.params.id,
        });

        console.log("Espaço criado", espacoCriado);
        res.status(201).json(espacoCriado);
    } catch (error) {
        console.log("Erro ao criar bloco", error);
        return res.status(500).json({ error: "Erro interno do servidor" });
    }
});
//---Atualizar Espaço
app.put("/condominio/espaco/:id", async (req, res) => {
    try {
        await schemaEspaco.validate(req.body);
        const espacoAtualizado = await Espaco.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!espacoAtualizado) {
            return res.status(404).json({ error: "Espaço não encontrado" });
        }

        res.status(200).json(espacoAtualizado);
    } catch (error) {
        console.log("Erro ao atualizar Espaço", error);
        return res.status(500).json({ error: "Erro interno do servidor" });
    }
});
//---Deletar Espaço
app.delete("/condominio/espaco/:id", async (req, res) => {
    try {
        const espacoDeletado = await Espaco.findByIdAndDelete(req.params.id);
        if (!espacoDeletado) {
            return res.status(404).json({ error: "Espaço nao encontrado" });
        }
        res.status(200).json("Espaço deletado com sucesso");
    } catch (error) {
        console.log("Erro ao deletar Espaço", error);
        return res.status(500).json({ error: "Erro interno do servidor" });
    }
});
//--- CRUD Funcionarios
//Cadastrar Funcionario
app.post("/condominio/:id/funcionario", async (req, res) => {
    try {
        await schemaFuncionario.validate(req.body);
        const { nome, cargo, dataDeAdmissao, ativo, salarioBase, valeTransporte, valeAlimentacao, valeRefeicao, cpf } = req.body;
        const funcionarioVerificacao = await Funcionario.findOne({ idCondominio: req.params.id, cpf: req.body.cpf });

        if (funcionarioVerificacao) {
            console.log("Funcionario ja cadastrado");
            return res.status(409).json("Funcionario ja cadastrado");
        }
        const decimoTerceiro = salarioBase / 12; // 1/12 do 13º por mês
        const feriasProporcionais = (salarioBase / 12) * (1 + 1 / 3); // 1/12 do salário + 1/3 de férias
        const conta =
            Number(salarioBase) + Number(valeTransporte || 0) + Number(valeAlimentacao || 0) + Number(valeRefeicao || 0) + decimoTerceiro + feriasProporcionais;
        const custoTotal = parseFloat(conta.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));

        const funcionarioCriado = await Funcionario.create({
            nome,
            cpf,
            cargo,
            dataDeAdmissao,
            ativo,
            dadosFinanceiros: [{ salarioBase, valeTransporte, valeAlimentacao, valeRefeicao, custoTotal }],
            idCondominio: req.params.id,
        });

        console.log("Espaço criado", funcionarioCriado);
        res.status(201).json(funcionarioCriado);
    } catch (error) {
        console.log("Erro ao criar bloco", error);
        return res.status(500).json({ error: "Erro interno do servidor" });
    }
});
//---Atualizar Funcionario
app.put("/condominio/funcionario/:id", async (req, res) => {
    try {
        await schemaFuncionario.validate(req.body);
        const funcionario = await Funcionario.findById(req.params.id);
        if (!funcionario) {
            return res.status(404).json({ error: "Funcionário não encontrado" });
        }

        Object.assign(funcionario, req.body);

        if (req.body.dadosFinanceiros && req.body.dadosFinanceiros.length > 0) {
            const dados = req.body.dadosFinanceiros[0];
            const salarioBase = Number(dados.salarioBase || funcionario.dadosFinanceiros[0].salarioBase);
            const valeTransporte = Number(dados.valeTransporte ?? funcionario.dadosFinanceiros[0].valeTransporte);
            const valeAlimentacao = Number(dados.valeAlimentacao ?? funcionario.dadosFinanceiros[0].valeAlimentacao);
            const valeRefeicao = Number(dados.valeRefeicao ?? funcionario.dadosFinanceiros[0].valeRefeicao);

            const decimoTerceiro = salarioBase / 12;
            const feriasProporcionais = (salarioBase / 12) * (1 + 1 / 3);
            const custoTotal = Number((salarioBase + valeTransporte + valeAlimentacao + valeRefeicao + decimoTerceiro + feriasProporcionais).toFixed(2));

            funcionario.dadosFinanceiros[0] = { ...funcionario.dadosFinanceiros[0], salarioBase, valeTransporte, valeAlimentacao, valeRefeicao, custoTotal };
        }

        const funcionarioAtualizado = await funcionario.save();
        res.status(200).json(funcionarioAtualizado);
    } catch (error) {
        console.log("Erro ao atualizar funcionário", error);
        return res.status(500).json({ error: "Erro interno do servidor" });
    }
});
//Listar Todos os Funcionarios
app.get("/condominio/:id/funcionario", async (req, res) => {
    try {
        const condominio = await Condominio.findOne({ _id: req.params.id });
        const funcionarios = await Funcionario.find({ idCondominio: req.params.id });
        const response = {
            condominio,
            funcionarios,
        };
        if (funcionarios.length === 0) {
            return res.status(404).json({ error: "Nenhum funcionario cadastrado" });
        }
        res.status(200).json(response);
    } catch (error) {
        console.log("Erro ao listar funcionarios", error);
        return res.status(500).json({ error: "Erro interno do servidor" });
    }
});
//Deletar Funcionario
app.delete("/condominio/funcionario/:cpf", async (req, res) => {
    try {
        const funcionarioDeletado = await Funcionario.findOneAndDelete({ cpf: req.params.cpf });
        if (!funcionarioDeletado) {
            return res.status(404).json({ error: "Funcionario não encontrado" });
        }
        res.status(200).json("Funcionário Deletado com Sucesso!");
    } catch (error) {
        console.log("Erro ao deletar funcionario", error);
        return res.status(500).json({ error: "Erro interno do servidor" });
    }
});

//--- Entidade Visitantes
//Cadastrar Visitante
app.post("/apartamento/:idApartamento/visitante", async (req, res) => {
    try {
        await schemaVisitante.validate(req.body);
        const { nome, telefone, cpf } = req.body;
        const idApartamento = req.params.idApartamento;

        const morador = await Morador.findOne({ cpf: req.body.cpf });
        const visitante = await Visitante.findOne({ cpf: req.body.cpf });
        if (morador) {
            return res.status(409).json("Visitante já cadastrado como morador");
        } else if (visitante) {
            return res.status(409).json("Visitante ja cadastrado");
        } else {
            const visitanteCriado = await Visitante.create({
                nome: req.body.nome,
                telefone: req.body.telefone,
                cpf: req.body.cpf,
                idApartamento: req.params.idApartamento,
            });
            console.log("Visitante Criado", visitanteCriado);
            return res.status(201).json(visitanteCriado);
        }
    } catch (error) {
        console.log("Erro ao criar morador", error);
        return res.status(500).json({ error: { error } });
    }
});
//Atualizar Visitante
app.put("/visitante/:cpfVisitante", async (req, res) => {
    try {
        await schemaVisitante.validate(req.body);
        const visitante = await Visitante.findOne({ cpf: req.params.cpfVisitante });
        console.log(visitante);
        if (!visitante) {
            return res.status(404).json({ error: "Visitante nao encontrado" });
        }
        const visitanteAtualizado = await Visitante.findOneAndUpdate({ cpf: req.params.cpfVisitante }, req.body, { new: true });

        res.status(200).json(visitanteAtualizado);
    } catch (error) {
        console.log("Erro ao atualizar visitante", error);
        return res.status(500).json({ error: "Erro interno do servidor" });
    }
});
// Listar Visitante
app.get("/visitante/:cpfVisitante", async (req, res) => {
    try {
        const visitante = await Visitante.findOne({ cpf: req.params.cpfVisitante });
        const apartamentos = await Apartamento.find({ _id: visitante.idApartamento });
        const response = {
            visitante,
            apartamentosCadastrados: apartamentos,
        };
        if (!visitante) {
            return res.status(404).json({ error: "Visitante nao encontrado" });
        }

        res.status(200).json(response);
    } catch (error) {
        console.log("Erro ao listar visitante", error);
        return res.status(500).json({ error: "Erro interno do servidor" });
    }
});

//Deletar Visitante
app.delete("/visitante/:cpfVisitante", async (req, res) => {
    try {
        const visitanteDeletado = await Visitante.findOneAndDelete({ cpf: req.params.cpfVisitante });
        res.status(200).json("Visitante deletado com sucesso");
    } catch (error) {
        console.log("Erro ao deletar visitante", error);
        return res.status(500).json({ error: "Erro interno do servidor" });
    }
});
//--- Entidade Catraca
// Cadastrar Registro Catraca
app.post("/condominio/catraca/:idPessoa", async (req, res) => {
    try {
        await schemaCatraca.validate(req.body);
        const { entrou, catraca } = req.body;
        const morador = await Morador.findOne({ _id: req.params.idPessoa });
        const visitante = await Visitante.findOne({ _id: req.params.idPessoa });

        const catracaCriado = await Catraca.create({
            tipo: morador ? "Morador" : "Visitante",
            acao: entrou ? "Entrou" : "Saiu",
            catraca,
            dadosPessoa: morador ? morador : visitante,
            idPessoa: morador ? morador._id : visitante._id,
        });

        console.log("Registro Catraca criado", catracaCriado);
        res.status(201).json(catracaCriado);
    } catch (error) {
        console.log("Erro ao criar bloco", error);
        return res.status(500).json({ error: "Erro interno do servidor" });
    }
});

//Editar Registro Catraca
app.put("/condominio/catraca/:idCatraca", async (req, res) => {
    try {
        await schemaCatraca.validate(req.body);
        const catraca = await Catraca.findOne({ _id: req.params.idCatraca });
        if (!catraca) {
            return res.status(404).json({ error: "Catraca não encontrada" });
        }

        Object.assign(catraca, req.body);

        const catracaAtualizada = await catraca.save();
        res.status(200).json(catracaAtualizada);
    } catch (error) {
        console.log("Erro ao atualizar catraca", error);
        return res.status(500).json({ error: "Erro interno do servidor" });
    }
});
//Listar Catraca
app.get("/condominio/catraca/:idCpf", async (req, res) => {
    try {
        const morador = await Morador.findOne({ cpf: req.params.idCpf });
        const visitante = await Visitante.findOne({ cpf: req.params.idCpf });

        const catracas = await Catraca.find({ "dadosPessoa.cpf": req.params.idCpf });

        if (!catracas || catracas.length === 0) {
            return res.status(404).json({ error: "Catraca não encontrada" });
        }

        const response = {
            morador: morador ? morador : visitante ? visitante : "Indefinido",
            tipo: morador ? "Morador" : "Visitante",
            catracas: catracas.map((c) => ({
                acao: c.acao,
                catraca: c.catraca,
                data: c.data,
            })),
        };

        res.status(200).json(response);
    } catch (error) {
        console.log("Erro ao listar catraca", error);
        return res.status(500).json({ error: "Erro interno do servidor" });
    }
});

//Deletar registro catraca

app.delete("/condominio/catraca/:idCatraca", async (req, res) => {
    try {
        const catracaDeletada = await Catraca.findByIdAndDelete(req.params.idCatraca);
        res.status(200).json("Catraca deletada com sucesso");
    } catch (error) {
        console.log("Erro ao deletar catraca", error);
        return res.status(500).json({ error: "Erro interno do servidor" });
    }
});
//-------Fim Cruds
//
//
//
//
//
//
//----Middle wares
//
//
//
//
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
