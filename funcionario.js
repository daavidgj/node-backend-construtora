import mongoose from "mongoose";

const funcionarioSchema = new mongoose.Schema({
    nome: String,
    cpf: { type: String, unique: true },
    cargo: String,
    dataDeAdmissao: Date,
    ativo: { type: Boolean, default: true },
    dadosFinanceiros: [
        {
            salarioBase: Number,
            valeTransporte: { type: Number, default: 0 },
            valeAlimentacao: { type: Number, default: 0 },
            valeRefeicao: { type: Number, default: 0 },
            custoTotal: Number,
        },
    ],
    idCondominio: { type: mongoose.Schema.Types.ObjectId, ref: "Condominio" },
});

export default mongoose.model("Funcionario", funcionarioSchema);
