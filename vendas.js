import mongoose from "mongoose";

const vendaMensalSchema = new mongoose.Schema({
    mes: Number,
    valorVendido: Number,
});

export default mongoose.model("VendaMensal", vendaMensalSchema);
