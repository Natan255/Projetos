import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { serverTimestamp, collection, addDoc, getDoc, doc} from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"; // Adicione no topo do arquivo se usar Firebase Storage
import { db } from "../firebaseConfig";
import "./Prova.css";
import { useAlerta } from "../componentes/AlertaProvider";

function Prova({ usuario, squads }) {
    const { exibirAlerta } = useAlerta();
    const [searchParams] = useSearchParams(); 
    const rankAtivoId = searchParams.get("rankExtra");
    const { id } = useParams(); 
    const navigate = useNavigate();
    const squadAtual = squads.find(s => s.id === id);
    const [rankAtual, setRankAtual] = useState(null);
    const [carregandoFoto, setCarregandoFoto] = useState(false);


    const [formData, setFormData] = useState({
        valorAcao: "",
        fotoUrl: "",
        resumo: "",
        github: "",
        comentario: "",
        contaJg: "", 
        forest: ""   
    });


    const handleUploadFoto = async (e) => {
        const arquivo = e.target.files[0];
        if (!arquivo) return;

        try {
            setCarregandoFoto(true);
            exibirAlerta("Info", "Carregando imagem, aguarde...");

            // Cria uma referência única no Storage: squads/id_do_squad/usuario_id/timestamp-nome
            const storage = getStorage();
            const fotoRef = ref(storage, `squads/${id}/${usuario.uid}/${Date.now()}-${arquivo.name}`);
            
            // Faz o upload do arquivo
            const uploadTask = await uploadBytesResumable(fotoRef, arquivo);
            
            // Pega a URL pública gerada
            const urlPublica = await getDownloadURL(uploadTask.ref);

            // Salva a URL no seu formData existente, alimentando o resto da lógica perfeitamente
            setFormData(prev => ({ ...prev, fotoUrl: urlPublica }));
        } catch (error) {
            console.error("Erro ao fazer upload da imagem:", error);
            exibirAlerta("Erro", "Falha ao carregar a imagem. Tente novamente.");
        } finally {
            setCarregandoFoto(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Identificação dinâmica do rank ativo (O(1) sem loops perigosos)
    useEffect(() => {
        if (!squadAtual) return;

        const buscarRank = async () => {
            if (rankAtivoId) {
                try {
                    const rankDocRef = doc(db, "squads", id, "ranks_extra", rankAtivoId);
                    const rankSnap = await getDoc(rankDocRef);

                    if (rankSnap.exists()) {
                        const dadosDoRank = rankSnap.data();
                        
                        setRankAtual({
                            id: rankAtivoId,
                            nome: dadosDoRank.nome,
                            estilo: dadosDoRank.estilo || squadAtual.estilo,
                            metrica: dadosDoRank.metrica || squadAtual.metrica,
                            regras: dadosDoRank.regras || squadAtual.regras || {}
                        });
                        console.log("Rank Extra Ativo carregado:", dadosDoRank.nome);
                    } else {
                        console.warn("Esse ID de rank não existe na subcoleção do Firestore.");
                        setRankAtual({ 
                            nome: "Rank Extra Não Encontrado",
                            estilo: squadAtual.estilo,
                            regras: squadAtual.regras || {}
                        });
                    }
                } catch (error) {
                    console.error("Erro ao buscar o rank extra no Firestore:", error);
                    setRankAtual({ 
                        nome: "Erro ao carregar Rank",
                        estilo: squadAtual.estilo,
                        regras: squadAtual.regras || {}
                    });
                }
            } else {
                // Cenário sem query parameter: assume o Rank Principal e injeta as regras/estilo do próprio squad pai
                setRankAtual({
                    id: "principal",
                    nome: squadAtual.rankNome || "Rank Principal",
                    estilo: squadAtual.estilo,
                    metrica: squadAtual.metrica,
                    regras: squadAtual.regras || {}
                });
                console.log("Rank Principal Ativo");
            }
        };

        buscarRank();
    }, [squadAtual, rankAtivoId, id]);



    if (!squadAtual) return <div className="error-msg">Squad não encontrado.</div>;
    if (!rankAtual) return <div className="error-msg">Identificando o Rank...</div>;

    const regras = rankAtual.regras;
    const estiloAtual = rankAtual.estilo;
    const metricaAtual = rankAtual.metrica || "Unidades";

    const handleSubmitProva = async (e) => {
        e.preventDefault();
        try {
            const ehMembro = squadAtual?.membros?.includes(usuario.uid);
            if (!ehMembro) {
                return exibirAlerta("Erro", "Você precisa ser membro do squad para enviar uma prova.");
            }

            if (regras.exigirFoto && !formData.fotoUrl) {
                return exibirAlerta("Erro", "O link da foto da evidência é obrigatório.");
            }

            const pendProvaColecaoRef = collection(db, "squads", id, "solicitacao_prova");
            
            const dadosParaEnviar = {
                uid: usuario.uid,
                nome: usuario.displayName || "Usuário",
                fotoPerfil: usuario.photoURL || "",
                valorAcao: Number(formData.valorAcao) || 0, 
                status: "pendente",
                timestamp: serverTimestamp(),
                rankId: rankAtual?.id || "principal",
                rankNome: rankAtual?.nome || "Rank Principal", // Se for undefined, vira String

                provas: {
                    ...(regras.exigirFoto && { foto: formData.fotoUrl || "" }),
                    ...(regras.exigirResumo && { resumo: formData.resumo || "" }),
                    ...(regras.exigirGithub && { github: formData.github || "" }),
                    ...(regras.exigirContajg && { contaJg: formData.contaJg || "" }),
                    ...(regras.exigirForest && { forest: formData.forest || "" }),
                }
            };

            if (squadAtual.estilo === "Votacao" || squadAtual.estilo === "Colecao") {
                dadosParaEnviar.comentario = formData.comentario;
            }

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
                    <span className="badge-rank-atual">Rank: {rankAtual.nome}</span>
                </div>

                {/* --- Ajustado para olhar estiloAtual e metricaAtual --- */}
                {estiloAtual === "Pontos" && (
                    <div className="input-group">
                        <label>Quantidade ({metricaAtual})</label>
                        <input 
                            type="number" 
                            name="valorAcao" 
                            value={formData.valorAcao} 
                            onChange={handleChange} 
                            required
                        />
                    </div>
                )}

                {estiloAtual === "Colecao" && (
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
                )}

                {estiloAtual === "Votacao" && (
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

                {/* ----------------- CAMPOS GERADOS PELO MAPA DE REGRAS DINÂMICAS ----------------- */}

                {regras.exigirContajg !== undefined && regras.exigirContajg !== "" && regras.exigirContajg !== false && (
                    <div className="input-group">
                        <label>Conta Jg</label>
                        <input 
                            type="text"
                            name="contaJg"
                            value={formData.contaJg}
                            onChange={handleChange}
                            placeholder="Insira a sua conta Jg..."
                            required
                        />
                    </div>
                )}

                {regras.exigirForest && (
                    <div className="input-group">
                        <label>Link / Info do Forest</label>
                        <input 
                            type="text"
                            name="forest"
                            value={formData.forest}
                            onChange={handleChange}
                            placeholder="Dados da sua sessão do Forest..."
                            required
                        />
                    </div>
                )}

                {regras.exigirFoto && (
                    <div className="input-group">
                        <label>Evidência (Foto/Print)</label>
                        
                        <div className="upload-container">
                            {/* Input escondido para usarmos o estilo customizado do label/botão */}
                            <input 
                                id="file-upload"
                                type="file" 
                                accept="image/*"
                                onChange={handleUploadFoto} 
                                style={{ display: 'none' }}
                                required={!formData.fotoUrl} // Só é obrigatório se ainda não tiver a URL
                            />
                            
                            <label htmlFor="file-upload" className={`btn-upload ${carregandoFoto ? "carregando" : ""}`}>
                                {carregandoFoto ? "Enviando Imagem..." : "Selecionar Foto "}
                            </label>

                            {/* Preview ou aviso de que o arquivo já subiu */}
                            {formData.fotoUrl && (
                                <div className="preview-sucesso">
                                    <span>✓ Imagem pronta!</span>
                                    <a href={formData.fotoUrl} target="_blank" rel="noreferrer" className="link-preview">Ver imagem</a>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                
                {regras.exigirResumo && (
                    <div className="input-group">
                        <label>Resumo do que foi feito</label>
                        <textarea 
                            name="resumo"
                            value={formData.resumo} 
                            onChange={handleChange} 
                            placeholder="O que você praticou/aprendeu?" 
                            required
                        />
                    </div>
                )}

                {regras.exigirGithub && (
                    <div className="input-group">
                        <label>Link do Repositório GitHub</label>
                        <input 
                            name="github"
                            type="text" 
                            value={formData.github} 
                            onChange={handleChange} 
                            placeholder="https://github.com/..." 
                            required
                        /> 
                    </div>
                )}
                
                {/* --- O botão agora também muda dependendo do estilo do rank ativo --- */}
                <button type="submit" className="btn-enviar-prova">
                    {estiloAtual === "Colecao" ? "Enviar para avaliacao" : "Enviar Prova"}
                </button>
            </form>
        </div>
    );
}

export default Prova;