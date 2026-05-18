import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";
import "./Prova.css";

function Prova({ usuario, squads }) {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const squadAtual = squads.find(s => s.id === id);

    const [formData, setFormData] = useState({
        valorAcao: "",
        fotoUrl: "",
        resumo: "",
        github: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    if (!squadAtual) return <div className="error-msg">Squad não encontrado.</div>;

    const handleSubmitProva = async (e) => {
        e.preventDefault();
        try {
            const pendProvaRef = doc(db, "squads", id, "solicitacao_prova", usuario.uid);

            await setDoc(pendProvaRef, {
                uid: usuario.uid,
                nome: usuario.displayName || "Usuário",
                fotoPerfil: usuario.photoURL || "",
                valorAcao: formData.valorAcao,
                provas: {
                    foto: formData.fotoUrl,
                    resumo: formData.resumo,
                    github: formData.github
                },
                status: "pendente",
                timestamp: serverTimestamp()
            });

            navigate(-1);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="container-prova">
            <form className="form-prova" onSubmit={handleSubmitProva}>
                
                <div className="input-group">
                    <label>Quantidade de {squadAtual.metrica}</label>
                    <input 
                        name="valorAcao"
                        type="number" 
                        required 
                        value={formData.valorAcao} 
                        onChange={handleChange} 
                    />
                </div>

                {squadAtual.regras?.exigirFoto && (
                    <div className="input-group">
                        <label>Foto da Prova</label>
                        <input 
                            name="fotoUrl"
                            type="text" 
                            value={formData.fotoUrl} 
                            onChange={handleChange} 
                            placeholder="Link da imagem" 
                        />
                    </div>
                )}
                
                {squadAtual.regras?.exigirResumo && (
                    <div className="input-group">
                        <label>Resumo do Estudo</label>
                        <textarea 
                            name="resumo"
                            value={formData.resumo} 
                            onChange={handleChange} 
                            placeholder="O que você aprendeu?" 
                        />
                    </div>
                )}

                {squadAtual.regras?.exigirGithub && (
                    <div className="input-group">
                        <label>Link do GitHub</label>
                        <input 
                            name="github"
                            type="text" 
                            value={formData.github} 
                            onChange={handleChange} 
                            placeholder="Link do repositorio" 
                        /> 
                    </div>
                )}

                <button type="submit" className="btn-enviar-prova">Enviar Prova</button>
            </form>
        </div>
    );
}

export default Prova;