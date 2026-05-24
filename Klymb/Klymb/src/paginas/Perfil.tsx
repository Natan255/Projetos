import "./Perfil.css"
import PostSquad from "../componentes/PostSquad";
import type { User } from "firebase/auth";
import { useNavigate, useParams} from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { useEffect, useState } from "react";
import { doc, onSnapshot, collection, query, where, orderBy } from "firebase/firestore";
import PostVotacaoSquad from "../componentes/VotoSquad";

interface PerfilProps {
    usuario: User | null;
    squads: any[];
}

function Perfil({ usuario, squads }: PerfilProps) {
    const navigate = useNavigate();
    const { idUsuario } = useParams();
    const [dadosExtras, setDadosExtras] = useState<any>(null);
    const [meusPosts, setMeusPosts] = useState<any[]>([]);
    
    const idParaBuscar = idUsuario || usuario?.uid;
    const eMeuPerfil = !idUsuario || idUsuario === usuario?.uid;

    useEffect(() => {
        if (!idParaBuscar) return;

        const postsRef = collection(db, "posts");
        const q = query(
            postsRef, 
            where("idAutor", "==", idParaBuscar),
            orderBy("criadoEm", "desc")
        );
        
        const unsubscribePosts = onSnapshot(q, (querySnapshot) => {
            const postsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMeusPosts(postsData);
        }, (error) => {
            console.error("Erro ao escutar posts em tempo real: ", error);
        });

        return () => unsubscribePosts();
    }, [idParaBuscar]);

    // Escutando os Dados do Usuário em Tempo Real
    useEffect(() => {
        if (!idParaBuscar) return;

        const unsubscribeUser = onSnapshot(doc(db, "usuarios", idParaBuscar), (docSnap) => {
            if (docSnap.exists()) {
                setDadosExtras(docSnap.data());
            }
        });

        return () => unsubscribeUser();
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

                <div className="Topicos">
                    <div className="mural-posts">
                        {meusPosts.length > 0 ? (
                            meusPosts.map((post) => {
                                if (post.tipo === "conquistaVoto") {
                                    return (
                                        <PostVotacaoSquad 
                                            key={post.id}
                                            id={post.id}
                                            idAutor={post.idAutor}
                                            titulo={post.titulo}
                                            texto={post.texto}
                                            autor={post.nomeAutor}
                                            fotoAutor={post.fotoAutor}
                                            squadId={post.idSquad}
                                            votosPositivos={post.votosPositivos || []}
                                            votosNegativos={post.votosNegativos || []}
                                            statusVotacao={post.statusVotacao || "aberta"}
                                            usuario={usuario}
                                            likes={post.likes}
                                            comentarios={post.comentarios}
                                            encerraEm={post.encerraEm}
                                            rankingComputado={post.rankingComputado || false}
                                        />
                                    );
                                }

                                const conq = post.tipo?.includes("conquista");

                                return (
                                    <PostSquad
                                        key={post.id}
                                        id={post.id}
                                        idAutor={post.idAutor || post.idUsuario}
                                        titulo={post.titulo}
                                        texto={post.texto}
                                        likes={post.likes || 0}
                                        comentarios={post.comentarios || 0}
                                        autor={post.nomeAutor || "Membro"}
                                        fotoAutor={post.fotoAutor}
                                        conquista={conq}
                                        squadId={post.idSquad}
                                        usuarioId={usuario?.uid}
                                        quemDeuLike={post.quemDeuLike || []} // Repassando com segurança o array vindo do banco
                                    />
                                );
                            })
                        ) : (
                            <p className="sem-posts">Nenhum post ainda. Seja o primeiro!</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Perfil;