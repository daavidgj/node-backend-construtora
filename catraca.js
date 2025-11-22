import mongoose from "mongoose";

const catracaSchema = new mongoose.Schema({
    data: { type: Date, default: Date.now },
    tipo: { type: String, default: "Indefinido" },
    acao: { type: String, default: "Indefinido" },
    catraca: Number,
    manutencao: { type: Boolean, default: false },
    dadosPessoa: [],
    idCondominio: { type: mongoose.Schema.Types.ObjectId, ref: "Condominio" },
});

export default mongoose.model("Catraca", catracaSchema);
