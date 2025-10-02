import mongoose from "mongoose";

const moradorSchema = new mongoose.Schema({
    nome: String,
    telefone: String,
    cpf: { type: String, unique: true },
    idApartamento: [{ type: mongoose.Schema.Types.ObjectId, ref: "Apartamento" }],
});

export default mongoose.model("Morador", moradorSchema);
