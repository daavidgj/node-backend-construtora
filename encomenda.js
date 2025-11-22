import mongoose from "mongoose";

const encomendaSchema = new mongoose.Schema({
    descricao: String,
    endereco: String,
    transportadora: String,
    dataCadastrado: { type: Date, default: Date.now },
    dataRetirada: { type: Date, default: null },
    recebido: { type: Boolean, default: false },

    idApartamento: { type: mongoose.Schema.Types.ObjectId, ref: "Apartamento" },
});

export default mongoose.model("Encomenda", encomendaSchema);
