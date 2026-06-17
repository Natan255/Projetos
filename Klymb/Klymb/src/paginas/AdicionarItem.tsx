import CardItem from "../componentes/CardItem";
import { useState, ChangeEvent } from "react";
import { collection, addDoc, serverTimestamp, updateDoc, doc, arrayUnion } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Importações do Storage
import { db, storage } from "../firebaseConfig"; // Certifique-se de exportar 'storage' no seu firebaseConfig
import type { User } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./AdicionarItem.css"; 

interface AdicionarItemProps {
    usuario: User | null;
}

function AdicionarItem({ usuario }: AdicionarItemProps) {
    const navigate = useNavigate();
    const [nome, setNome] = useState("");
    const [info, setInfo] = useState("");
    
    // Estados para o arquivo de imagem e a URL de preview local
    const [imagemArquivo, setImagemArquivo] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [carregando, setCarregando] = useState(false);

    // Função para lidar com a seleção da imagem e gerar o preview local
    const handleImagemChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const arquivo = e.target.files[0];
            setImagemArquivo(arquivo);
            
            // Cria uma URL temporária para o CardItem conseguir mostrar o preview na hora
            setPreviewUrl(URL.createObjectURL(arquivo));
        }
    };

    const adicionar = async () => {
        if (!nome || !imagemArquivo || !info) {
            alert("Por favor, preencha todos os campos e selecione uma imagem!");
            return;
        }

        if (!usuario?.uid) {
            alert("Usuário não autenticado!");
            return;
        }

        try {
            setCarregando(true);

            // 1. Criar a referência no Firebase Storage (organizado por ID do usuário e timestamp)
            const nomeArquivo = `${Date.now()}_${imagemArquivo.name}`;
            const storageRef = ref(storage, `banners_times/${usuario.uid}/${nomeArquivo}`);

            // 2. Fazer o upload do arquivo binário
            const snapshot = await uploadBytes(storageRef, imagemArquivo);

            // 3. Pegar a URL pública gerada pelo Firebase
            const urlDownload = await getDownloadURL(snapshot.ref);
            
            console.log("Upload concluído. URL da foto:", urlDownload);
            
            // 4. Salvar no Firestore com a URL real da foto
            const colecaoRef = collection(db, "colecaoItens");
            const userRef = doc(db, "usuarios", usuario.uid);
            
            const docRef = await addDoc(colecaoRef, {
                nome: nome,
                fotoBanner: urlDownload, // <--- Aqui entra a URL pública do Storage
                info: info,
                idAutor: usuario.uid,
                nomeAutor: usuario.displayName || "Membro",
                criadoEm: serverTimestamp()
            });

            // 5. Vincular o item ao usuário
            await updateDoc(userRef, {
                colecao: arrayUnion(docRef.id)
            });

            // Limpar estados
            setNome("");
            setInfo("");
            setImagemArquivo(null);
            setPreviewUrl("");
            
            navigate(-1);
        } catch (error) {
            console.error("Erro ao adicionar item:", error);
            alert("Houve um erro ao salvar o item.");
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="add-item-container">
            <h1 className="add-item-titulo">Adicionar Item à Vitrine</h1>

            <div className="add-item-workspace">
                {/* FORMULÁRIO DE INPUTS */}
                <div className="add-item-form">
                    <input 
                        type="text" 
                        placeholder="Nome do Item" 
                        value={nome} 
                        onChange={(e) => setNome(e.target.value)} 
                        className="add-item-input"
                        disabled={carregando}
                    />
                    
                    {/* Input de arquivo customizado/escondido ou padrão */}
                    <div className="file-input-container">
                        <label htmlFor="foto-banner" className="file-input-label">
                            {imagemArquivo ? `✓ ${imagemArquivo.name}` : "Selecionar Foto do Banner"}
                        </label>
                        <input 
                            id="foto-banner"
                            type="file" 
                            accept="image/*"
                            onChange={handleImagemChange} 
                            className="add-item-input-file"
                            disabled={carregando}
                            style={{ display: 'none' }} // Esconde o input feio do navegador
                        />
                    </div>

                    <textarea 
                        placeholder="Informações sobre o Item" 
                        value={info} 
                        onChange={(e) => setInfo(e.target.value)} 
                        className="add-item-textarea"
                        rows={4}
                        disabled={carregando}
                    />
                    
                    <button 
                        onClick={adicionar} 
                        className="add-item-btn" 
                        disabled={carregando}
                    >
                        {carregando ? "Enviando..." : "Adicionar Item"}
                    </button>
                </div>

                {/* PREVIEW EM TEMPO REAL */}
                <div className="add-item-preview">
                    <h3 className="preview-label">Pré-visualização</h3>
                    <CardItem 
                        nome={nome || "Nome do seu Item"} 
                        // Usa a URL local temporária se houver, senão usa o placeholder
                        fotoBanner={previewUrl || "https://via.placeholder.com/220x330?text=Rank+Over"} 
                        info={info || "As informações que você digitar vão aparecer aqui no verso do card."} 
                        id="preview" 
                    />
                </div>
            </div>
        </div>
    );
}

export default AdicionarItem;