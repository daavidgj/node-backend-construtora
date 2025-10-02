import mongoose from "mongoose";

const construtoraSchema = new mongoose.Schema({
    nome: String,
    telefone: String,
    ativo: Boolean,
});

export default mongoose.model("Construtora", construtoraSchema);
