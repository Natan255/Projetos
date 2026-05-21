import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";
import "./Prova.css";
import { useAlerta } from "../componentes/AlertaProvider";

function Prova({ usuario, squads }) {
    const { exibirAlerta } = useAlerta();
    const { id } = useParams(); 
    const navigate = useNavigate();
    const squadAtual = squads.find(s => s.id === id);

    const [formData, setFormData] = useState({
        valorAcao: "",
        fotoUrl: "",
        resumo: "",
        github: "",
        comentario: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    if (!squadAtual) return <div className="error-msg">Squad não encontrado.</div>;

    const handleSubmitProva = async (e) => {
        e.preventDefault();
        try {
            if (usuario.uid !== squadAtual.membros.find(m => m.uid === usuario.uid)?.uid) {
                exibirAlerta("Erro", "Você precisa ser membro do squad para enviar uma prova.");
            }

            const pendProvaRef = doc(db, "squads", id, "solicitacao_prova", usuario.uid);

            // 1. Criamos a estrutura base que serve para ambos os estilos
            const dadosParaEnviar = {
                uid: usuario.uid,
                nome: usuario.displayName || "Usuário",
                fotoPerfil: usuario.photoURL || "",
                valorAcao: Number(formData.valorAcao), // Garante que salva como número
                status: "pendente",
                timestamp: serverTimestamp()
            };

            // 2. Inserimos os dados específicos baseados no estilo do Squad
            if (squadAtual.estilo === "Votacao") {
                dadosParaEnviar.comentario = formData.comentario;
            } else {
                dadosParaEnviar.provas = {
                    foto: formData.fotoUrl,
                    resumo: formData.resumo,
                    github: formData.github
                };
            }

            // 3. Enviamos o objeto montado para o Firestore
            await setDoc(pendProvaRef, dadosParaEnviar);

            navigate(-1);
        } catch (error) {
            console.error("Erro ao enviar a prova/votação:", error);
        }
    };

    return (
        <div className="container-prova">
            <form className="form-prova" onSubmit={handleSubmitProva}>
                
                <div className="input-group">
                    <label>Prova do squad</label>
                
                </div>
                {squadAtual.estilo === "Votacao" && (
                    <div className="input-group">
                        <input type="text" placeholder="Comentario (opcional dps botar arquivo aqui)" name="comentario" value={formData.comentario} onChange={handleChange} />
                    </div>
                    
                )}
                {squadAtual.estilo === "Pontos" && (
                    <>
                        <div className="input-group">
                            <input type="number" name="valorAcao" onChange={(e) => handleChange(e)}/>
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
                    </>
                )}
                

                <button type="submit" className="btn-enviar-prova">Enviar Prova</button>
            </form>
        </div>
    );
}

export default Prova;