import mongoose from "mongoose";

const espacoSchema = new mongoose.Schema({
    nome: String,
    descricao: { type: String, default: "Sem descrição" },
    capacidade: Number,
    taxaReserva: Number,
    manutencao: { type: Boolean, default: false },
    idCondominio: { type: mongoose.Schema.Types.ObjectId, ref: "Condominio" },
});

export default mongoose.model("Espaco", espacoSchema);
