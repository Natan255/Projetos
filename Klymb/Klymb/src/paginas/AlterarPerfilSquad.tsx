import { useParams, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { db } from "../firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "./AlterarPerfil.css";
import { useAlerta } from "../componentes/AlertaProvider";

function AlterarPerfilSquad() {
    const { id, campo } = useParams();
    const { exibirAlerta } = useAlerta();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [valor, setValor] = useState(""); 
    const [arquivoFoto, setArquivoFoto] = useState<File | null>(null); 
    const [previewFoto, setPreviewFoto] = useState<string>(""); 
    const [carregando, setCarregando] = useState(false);


    const configs: Record<string, { titulo: string; tipo: string; campoBanco: string }> = {
        nome: { titulo: "Nome do Squad", tipo: "text", campoBanco: "nome" },
        descricao: { titulo: "Descrição do Squad", tipo: "text", campoBanco: "descricao" }, 
        mural: { titulo: "Mural do Squad", tipo: "text", campoBanco: "mural" },
        
        fotoBanner: { titulo: "Imagem de Fundo (Capa) do Squad", tipo: "file", campoBanco: "fotoCapa" },
        fotoCapa: { titulo: "Imagem de Fundo (Capa) do Squad", tipo: "file", campoBanco: "fotoCapa" },

        fotoPerfil: { titulo: "Foto de Perfil do Squad", tipo: "file", campoBanco: "fotoPerfil" }
    };

    const atual = configs[campo || "nome"] || configs.nome;

    // Detecta dinamicamente se o campo atual na URL trabalha com upload de arquivo
    const ehCampoDeArquivo = atual.tipo === "file";

    useEffect(() => {
        setValor("");
        setArquivoFoto(null);
        setPreviewFoto("");
    }, [campo]);

    const handleArquivoMudou = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setArquivoFoto(file);
            setPreviewFoto(URL.createObjectURL(file));
        }
    };

    const handleSalvar = async () => {
        if (!ehCampoDeArquivo && !valor.trim()) return;
        if (ehCampoDeArquivo && !arquivoFoto) return alert("Por favor, selecione uma imagem!");

        setCarregando(true);
        try {
            const squadRef = doc(db, "squads", id);

            if (!ehCampoDeArquivo) {
                // Salva dinamicamente no campo de texto correto (nome, descricao ou mural)
                await updateDoc(squadRef, { [atual.campoBanco]: valor });
            } else {
                const storage = getStorage();
                
                // Organiza os arquivos no Storage em subpastas dinâmicas (ex: fotoSquad/fotoPerfil/id_squad)
                const arquivoRef = ref(storage, `fotoSquad/${atual.campoBanco}/${id}`);

                const snapshot = await uploadBytes(arquivoRef, arquivoFoto!);
                const urlDownload = await getDownloadURL(snapshot.ref);

                // Salva a URL exatamente no campo correto do banco (fotoPerfil, fotoBanner ou fotoCapa)
                await updateDoc(squadRef, { [atual.campoBanco]: urlDownload });
            }

            exibirAlerta("Sucesso", `${atual.titulo} atualizado com sucesso!`);
            
            setValor("");
            setArquivoFoto(null);
            setPreviewFoto("");
        } catch (error: any) {
            console.error("Erro ao atualizar o squad:", error);
            alert("Erro: " + error.message);
        } finally {
            setCarregando(false);
        }
    };

    const botaoDesativado = ehCampoDeArquivo ? !arquivoFoto : !valor.trim();

    return (
        <div className="alterar-pagina-container">
            <h1>Alterar {atual.titulo}</h1>
            
            {ehCampoDeArquivo ? (
                // Se for fotoPerfil, fotoBanner ou fotoCapa, renderiza a área de upload
                <div className="upload-foto-wrapper">
                    {previewFoto && (
                        <div className="preview-foto-container">
                            <img src={previewFoto} alt={`Preview de ${atual.titulo}`} />
                        </div>
                    )}
                    
                    <input 
                        type="file" 
                        accept="image/*" 
                        ref={fileInputRef}
                        onChange={handleArquivoMudou}
                        style={{ display: "none" }}
                        disabled={carregando}
                    />

                    <button 
                        type="button"
                        className="btn-escolher-arquivo"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={carregando}
                    >
                        {arquivoFoto ? "Trocar Arquivo Selecionado" : `Selecionar Novo ${atual.titulo}`}
                    </button>

                    {arquivoFoto && <p className="nome-arquivo-selecionado">Selecionado: {arquivoFoto.name}</p>}
                </div>
            ) : campo === "mural" ? (
                <textarea
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    placeholder={`Digite a nova ${atual.titulo}...`}
                    disabled={carregando}
                    rows={4}
                    className="alterar-textarea"
                />
            ) : (
                <input 
                    type={atual.tipo} 
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    placeholder={`Digite o novo ${atual.titulo}...`}
                    disabled={carregando}
                    className="alterar-input"
                />
            )}

            <div className="botoes-acoes">
                <button 
                    onClick={handleSalvar} 
                    disabled={carregando || botaoDesativado}
                    className="btn-salvar"
                >
                    {carregando ? "Salvando..." : "Salvar"}
                </button>
                <button 
                    onClick={() => navigate(-1)} 
                    disabled={carregando}
                    className="btn-cancelar"
                >
                    Cancelar
                </button>
            </div>
        </div>
    );
}

export default AlterarPerfilSquad;