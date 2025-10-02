import mongoose from "mongoose";

const blocoSchema = new mongoose.Schema({
    nome: String,
    andares: Number,
    elevadores: Number,
    escada: Boolean,
    idCondominio: { type: mongoose.Schema.Types.ObjectId, ref: "Condominio" },
});

export default mongoose.model("Bloco", blocoSchema);
