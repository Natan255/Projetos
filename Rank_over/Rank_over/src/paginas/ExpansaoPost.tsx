import "./ExpansaoPost.css";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, increment } from "firebase/firestore";
import { db } from "../firebaseConfig";

function ExpansaoPost({ usuario }) {

    const { idPost } = useParams(); 
    const [dadosPost, setDadosPost] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [texto, setTexto] = useState("")

    const adicionarComentario = async () => {
        const comentRef = collection(db, "posts", idPost, "comentarios")
        await addDoc(comentRef, {

            autorId: usuario.uid,
            nomeAutor: usuario.displayName,
            fotoAutor: usuario.photoURL,
            texto: texto,
            criadoEm: serverTimestamp(),
            respondendoA: null

        })
        const postRef = doc(db, "posts", idPost);
        await updateDoc(postRef, {
            comentários: increment(1) 
        });

    }
    useEffect(() => {
        if (!idPost) return;

        const unsubscribe = onSnapshot(doc(db, "posts", idPost), (docSnap) => {
            if (docSnap.exists()) {
                setDadosPost({ id: docSnap.id, ...docSnap.data() });
            } else {
                console.log("Post não encontrado!");
            }
            setCarregando(false);
        });

        return () => unsubscribe();
    }, [idPost]);

    if (carregando) return <div className="loading">Carregando post...</div>;
    if (!dadosPost) return <div className="error">Post não encontrado ou removido.</div>;

    return (
        <div className="expansao-container">
            <div className="expansao-squadmembro">
                <img 
                    src={dadosPost.fotoAutor || "https://via.placeholder.com/40"} 
                    alt="foto perfil" 
                    className="avatar-membro"
                />
                <span className="nome-membro">{dadosPost.nomeAutor || "Membro"}</span>
                <span className="data-post">
                    • {dadosPost.criadoEm?.seconds 
                        ? new Date(dadosPost.criadoEm.seconds * 1000).toLocaleDateString() 
                        : "Data desconhecida"}
                </span>
            </div>

            <div className="expansao-conteudo">
                <h1 className="expansao-titulo">{dadosPost.titulo}</h1>
                <p className="expansao-texto-corpo">{dadosPost.texto}</p>
            </div>

            <hr className="divisor" />

            <div className="expansao-comentarios">

                <h3>Comentários ({dadosPost.comentários || 0})</h3>
                
                <div className="lista-comentarios">
                    <p className="sem-comentarios">Ainda não há comentários. Seja o primeiro!</p>
                </div>

                <div className="novo-comentario">
                    <img src={usuario?.photoURL || "https://via.placeholder.com/150"} alt="sua foto" />
                    <input type="text" placeholder="Escreva um comentário..." onChange={(e) => setTexto(e)}/>
                    <button onClick={() => adicionarComentario()}>Enviar</button>
                </div>
            </div>
        </div>
    );
}

export default ExpansaoPost;