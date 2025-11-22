import mongoose from "mongoose";

const visitanteSchema = new mongoose.Schema({
    nome: String,
    telefone: String,
    cpf: { type: String, unique: true },
    dataCadastro: { type: Date, default: Date.now },
    idApartamento: [{ type: mongoose.Schema.Types.ObjectId, ref: "Apartamento" }],
});

export default mongoose.model("Visitante", visitanteSchema);
