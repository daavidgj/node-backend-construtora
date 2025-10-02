import mongoose from "mongoose";
/*
numero: req.body.numero,
            andar: req.body.numero.charAt(0),
            metragem: req.body.metragem,
            quartos: req.body.quartos,
            banheiros: req.body.banheiros,
            garagem: req.body.garagem || 1,
            condominio: req.params.id || 650,
            idBloco: req.params.idBloco, 
*/
const apartamentoSchema = new mongoose.Schema({
    numero: Number,
    andar: Number,
    metragem: Number,
    quartos: Number,
    banheiros: Number,
    garagem: Number,
    valorCondominio: Number,
    idBloco: { type: mongoose.Schema.Types.ObjectId, ref: "Bloco" },
});

export default mongoose.model("Apartamento", apartamentoSchema);
