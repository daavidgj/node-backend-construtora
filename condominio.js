import mongoose from "mongoose";

const condominioSchema = new mongoose.Schema({
    nome: String,
    endereco: String,
    idConstrutora: { type: mongoose.Schema.Types.ObjectId, ref: "Construtora" },
});

export default mongoose.model("Condominio", condominioSchema);
