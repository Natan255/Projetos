import { useParams, useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { auth, db } from "../firebaseConfig";
import { updateProfile, updatePassword } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
// Importações necessárias para fazer o upload do arquivo no Firebase
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "./AlterarPerfil.css";
import AlertaMsg from "../componentes/AlertaProvider";

function AlterarPerfil() {
    const { campo } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null); // Referência para controlar o input de arquivo oculto

    const [valor, setValor] = useState(""); // Usado para nome, bio e senha
    const [arquivoFoto, setArquivoFoto] = useState<File | null>(null); // Guarda o arquivo da foto selecionada
    const [previewFoto, setPreviewFoto] = useState<string>(""); // Guarda o preview da imagem antes de salvar
    const [carregando, setCarregando] = useState(false);
    const [mostrarAlerta, setMostrarAlerta] = useState(false);

    const configs: Record<string, { titulo: string; tipo: string }> = {
        nome: { titulo: "Nome de Usuário", tipo: "text" },
        senha: { titulo: "Senha", tipo: "password" },
        bio: { titulo: "Biografia", tipo: "text" },
        foto: { titulo: "Foto de Perfil", tipo: "file" } // Mudado para tipo file
    };

    const atual = configs[campo || "nome"] || configs.nome;

    // Função que captura o arquivo quando o usuário seleciona pelo botão
    const handleArquivoMudou = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setArquivoFoto(file);
            
            // Cria uma URL local apenas para mostrar o preview na tela antes de salvar
            setPreviewFoto(URL.createObjectURL(file));
        }
    };

    const handleSalvar = async () => {
        const user = auth.currentUser;
        if (!user) return alert("Usuário não encontrado!");
        
        setCarregando(true);
        try {
            const userRef = doc(db, "usuarios", user.uid);

            if (campo === "nome") {
                await updateProfile(user, { displayName: valor });
                await updateDoc(userRef, { nome: valor });
            } 
            else if (campo === "bio") {
                await updateDoc(userRef, { bio: valor });
            } 
            else if (campo === "senha") {
                await updatePassword(user, valor);
            }
            else if (campo === "foto") {
                if (!arquivoFoto) return alert("Por favor, selecione um arquivo primeiro!");

                // Inicializa o storage e define o caminho do arquivo (ex: fotoPerfil/idDoUsuario.jpg)
                const storage = getStorage();
                const arquivoRef = ref(storage, `fotoPerfil/${user.uid}`);

                // Faz o upload do arquivo binário para o Storage
                const snapshot = await uploadBytes(arquivoRef, arquivoFoto);
                
                // Pega a URL pública gerada pelo Firebase
                const urlDownload = await getDownloadURL(snapshot.ref);

                // Atualiza o perfil de autenticação e o documento no Firestore com a URL gerada
                await updateProfile(user, { photoURL: urlDownload });
                await updateDoc(userRef, { fotoUrl: urlDownload });
            }

            setMostrarAlerta(true);
        } catch (error: any) {
            console.error("Erro ao atualizar:", error);
            alert("Erro: " + error.message);
        } finally {
            setCarregando(false);
        }
    };

    // Define se o botão de salvar deve ficar desativado
    const botaoDesativado = campo === "foto" ? !arquivoFoto : !valor;

    return (
        <div className="alterar-pagina-container">
            {mostrarAlerta && (
                <AlertaMsg 
                    MsgTitulo="Sucesso!" 
                    Msg={`${atual.titulo} atualizado com sucesso.`} 
                    textoBotao="Voltar ao Perfil"
                    aoClicar={() => navigate("/paginas/Perfil")}
                />
            )}

            <h1>Alterar {atual.titulo}</h1>
            
            {campo === "foto" ? (
                // RENDERIZAÇÃO SE FOR FOTO: Botão de upload e área de preview
                <div className="upload-foto-wrapper">
                    {previewFoto && (
                        <div className="preview-foto-container">
                            <img src={previewFoto} alt="Preview do novo perfil" />
                        </div>
                    )}
                    
                    {/* Input real escondido por CSS */}
                    <input 
                        type="file" 
                        accept="image/*" 
                        ref={fileInputRef}
                        onChange={handleArquivoMudou}
                        style={{ display: "none" }}
                        disabled={carregando}
                    />

                    {/* Botão estilizado que aciona o clique do input real */}
                    <button 
                        type="button"
                        className="btn-escolher-arquivo"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={carregando}
                    >
                        {arquivoFoto ? "Trocar Foto Selecionada" : "Selecionar Arquivo de Imagem"}
                    </button>

                    {arquivoFoto && <p className="nome-arquivo-selecionado">Selecionado: {arquivoFoto.name}</p>}
                </div>
            ) : (
                // RENDERIZAÇÃO PADRÃO (Nome, Bio, Senha): Input de texto normal
                <input 
                    type={atual.tipo} 
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    placeholder={`Digite seu novo ${atual.titulo}...`}
                    disabled={carregando}
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
                <button onClick={() => navigate(-1)} disabled={carregando}>
                    Cancelar
                </button>
            </div>
        </div>
    );
}

export default AlterarPerfil;