import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { doc, setDoc, serverTimestamp, collection, addDoc} from "firebase/firestore";
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
            const ehMembro = squadAtual?.membros?.includes(usuario.uid);
            if (!ehMembro) {
                return exibirAlerta("Erro", "Você precisa ser membro do squad para enviar uma prova.");
            }

            // 1. Em vez de criar um DOC com ID fixo, apontamos para a COLLECTION
            const pendProvaColecaoRef = collection(db, "squads", id, "solicitacao_prova");

            // 2. Estrutura base universal (o uid do usuário vai DENTRO dos dados)
            const dadosParaEnviar = {
                uid: usuario.uid, // Mantemos o UID aqui dentro para o ADM saber de quem é
                nome: usuario.displayName || "Usuário",
                fotoPerfil: usuario.photoURL || "",
                valorAcao: Number(formData.valorAcao) || 0, 
                status: "pendente",
                timestamp: serverTimestamp()
            };

            // 3. Inserção de dados baseada no estilo do Squad
            if (squadAtual.estilo === "Votacao") {
                dadosParaEnviar.comentario = formData.comentario;
            } else if (squadAtual.estilo === "Colecao") {
                dadosParaEnviar.provas = {
                    foto: formData.fotoUrl,
                    resumo: formData.comentario, 
                    github: ""
                };
            } else {
                dadosParaEnviar.provas = {
                    foto: formData.fotoUrl,
                    resumo: formData.resumo,
                    github: formData.github
                };
            }

            // 4. MUDANÇA CRUCIAL: Usamos addDoc para gerar um ID único e aleatório para CADA envio
            await addDoc(pendProvaColecaoRef, dadosParaEnviar);

            exibirAlerta("Sucesso", "Sua publicação foi enviada para moderação!");
            navigate(-1);
        } catch (error) {
            console.error("Erro ao enviar a prova/votação:", error);
        }
    };

    return (
        <div className="container-prova">
            <form className="form-prova" onSubmit={handleSubmitProva}>
                <div className="input-group">
                    <label>Publicar no Squad: {squadAtual.nome}</label>
                </div>

                {/* INTERFACE PARA ESTILO COLEÇÃO */}
                {squadAtual.estilo === "Colecao" && (
                    <>  
                        <div className="input-group">
                            <label>Link da Imagem do Item</label>
                            <input 
                                name="fotoUrl"
                                type="text" 
                                value={formData.fotoUrl} 
                                onChange={handleChange} 
                                placeholder="https://linkdaimagem.com/foto.jpg" 
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Descrição do Item</label>
                            <input 
                                type="text" 
                                placeholder="Ex: Edição especial de colecionador..." 
                                name="comentario" 
                                value={formData.comentario} 
                                onChange={handleChange} 
                                required
                            />
                        </div>
                    </>
                )}

                {/* INTERFACE PARA ESTILO VOTAÇÃO */}
                {squadAtual.estilo === "Votacao" && (
                    <div className="input-group">
                        <label>Motivo / Comentário da Votação</label>
                        <input 
                            type="text" 
                            placeholder="Descreva o motivo da votação..." 
                            name="comentario" 
                            value={formData.comentario} 
                            onChange={handleChange} 
                            required
                        />
                    </div>
                )}

                {/* INTERFACE PARA ESTILO PONTOS */}
                {squadAtual.estilo === "Pontos" && (
                    <>
                        <div className="input-group">
                            <label>Quantidade ({squadAtual.metrica || "Unidades"})</label>
                            <input 
                                type="number" 
                                name="valorAcao" 
                                value={formData.valorAcao} 
                                onChange={handleChange} 
                                required
                            />
                        </div>

                        {squadAtual.regras?.exigirFoto && (
                            <div className="input-group">
                                <label>Foto da Evidência</label>
                                <input 
                                    name="fotoUrl"
                                    type="text" 
                                    value={formData.fotoUrl} 
                                    onChange={handleChange} 
                                    placeholder="Link da imagem da prova" 
                                />
                            </div>
                        )}
                        
                        {squadAtual.regras?.exigirResumo && (
                            <div className="input-group">
                                <label>Resumo do que foi feito</label>
                                <textarea 
                                    name="resumo"
                                    value={formData.resumo} 
                                    onChange={handleChange} 
                                    placeholder="O que você praticou/aprendeu?" 
                                />
                            </div>
                        )}

                        {squadAtual.regras?.exigirGithub && (
                            <div className="input-group">
                                <label>Link do Repositório GitHub</label>
                                <input 
                                    name="github"
                                    type="text" 
                                    value={formData.github} 
                                    onChange={handleChange} 
                                    placeholder="https://github.com/..." 
                                /> 
                            </div>
                        )}
                    </>
                )}
                
                <button type="submit" className="btn-enviar-prova">
                    {squadAtual.estilo === "Colecao" ? "Enviar para Vitrine" : "Enviar Prova"}
                </button>
            </form>
        </div>
    );
}

export default Prova;