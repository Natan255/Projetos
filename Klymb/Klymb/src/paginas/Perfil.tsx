import "./Perfil.css"
import PostSquad from "../componentes/PostSquad";
import type { User } from "firebase/auth";
import { useNavigate, useParams} from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { useEffect, useState } from "react";
import { doc, onSnapshot,collection, query, where, getDocs, orderBy } from "firebase/firestore";

interface PerfilProps {
    usuario: User | null;
    squads: any[];
}

function Perfil({ usuario, squads }: PerfilProps) {
    const navigate = useNavigate();
    const { idUsuario } = useParams();
    const [dadosExtras, setDadosExtras] = useState<any>(null);
    const [meusPosts, setMeusPosts] = useState<any[]>([]);
    const [dadosUsuarioAlvo, setDadosUsuarioAlvo] = useState<any>(null);
    const idParaBuscar = idUsuario || usuario?.uid;
    const eMeuPerfil = !idUsuario || idUsuario === usuario?.uid;

    const buscarMeusPosts = async (userId) => {
        try {
            const postsRef = collection(db, "posts");
            const q = query(
                postsRef, 
                where("idAutor", "==", userId),
                orderBy("criadoEm", "desc")
            );

            const querySnapshot = await getDocs(q);
            const postsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
            }));

            return postsData;
        } catch (error) {
            console.error("Erro ao buscar posts: ", error);
        }
    };

    useEffect(() => {
        if (!idParaBuscar) return;

        const carregarPosts = async () => {
            const posts = await buscarMeusPosts(idParaBuscar);
            if (posts) setMeusPosts(posts);
        };

        carregarPosts();
    }, [idParaBuscar]);

    useEffect(() => {
        if (!idParaBuscar) return;

        const unsubscribe = onSnapshot(doc(db, "usuarios", idParaBuscar), (docSnap) => {
            if (docSnap.exists()) {
                setDadosExtras(docSnap.data());
            }
        });

        return () => unsubscribe();
    }, [idParaBuscar]);

    

    if (!idParaBuscar) return <h2>Carregando perfil...</h2>;
    const handleSair = async () => {
        try {
            await auth.signOut();
            navigate("/");
        } catch (error) {
            console.error("Erro ao sair:", error);
        }
    };

    if (!usuario) return <h2 style={{color: 'white', padding: '100px'}}>Carregando perfil...</h2>;

    return (
        <div className="perfil-container-user">
            <div className="perfil">
                <div className="perfil-header-user">
                    <div className="perfil-foto">
                        <img
                            src={dadosExtras?.fotoUrl || dadosExtras?.photoURL || "https://via.placeholder.com/150"}
                            alt="foto-user"
                            referrerPolicy="no-referrer"
                        />
                    </div>

                    <div className="perfil-bio">
                        <h1 className="perfil-nome-user">{dadosExtras?.nome || usuario.displayName}</h1>
                        <h3 className="perfil-bio-text">{dadosExtras?.bio || "Recruta do Rank Over"}</h3>
                    </div>
                    

                    <div className="perfil-squad-quant">
                        <p>{dadosExtras?.squads_seguindo?.length || 0}</p>
                        <span>Squads</span>
                    </div>
                    
                    {eMeuPerfil && (
                        <>
                            <button onClick={() => navigate("/paginas/PerfilConfig")} style={{fontSize: '2.3rem', background: 'none', border: 'none', cursor: 'pointer'}}>⚙️</button>
                            <button className="perfil-sair" onClick={handleSair}>Sair</button>
                        </>
                    )}
                </div>

                <div className="perfil-posts">
                    {meusPosts.length > 0 ? (
                        meusPosts.map((post) => (
                            <PostSquad 
                                key={post.id}
                                id={post.id}
                                idAutor={post.idAutor}
                                titulo={post.titulo}
                                texto={post.texto}
                                likes={post.likes}
                                comentarios={post.comentarios}
                                autor={post.nomeAutor}
                                fotoAutor={post.fotoAutor}
                                jaDeuLike={post.quemDeuLike?.includes(usuario?.uid)}
                                aoDarLike={() => console.log("Lógica de like aqui")} 
                            />
                        ))
                    ) : (
                        <p style={{color: 'gray', textAlign: 'center', marginTop: '20px', width: '100%'}}>
                            Este recruta ainda não fez publicações.
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Perfil;