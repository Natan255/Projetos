import "./Perfil.css";
import PostSquad from "../componentes/PostSquad";
import type { User } from "firebase/auth";
import { useNavigate, useParams } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { useEffect, useState } from "react";
import { doc, onSnapshot, collection, query, where, orderBy, documentId, updateDoc, arrayRemove, deleteDoc } from "firebase/firestore";
import PostVotacaoSquad from "../componentes/VotoSquad";
import CardItem from "../componentes/CardItem";

interface PerfilProps {
    usuario: User | null;
    squads: any[];
}

type AbaPerfil = "postagens" | "votacoes" | "colecao";

function Perfil({ usuario, squads }: PerfilProps) {
    const navigate = useNavigate();
    const { idUsuario } = useParams();

    const [dadosExtras, setDadosExtras] = useState<any>(null);
    const [meusPosts, setMeusPosts] = useState<any[]>([]);
    const [itensDaColecao, setItensDaColecao] = useState<any[]>([]); 
    const [abaAtiva, setAbaAtiva] = useState<AbaPerfil>("postagens");
    
    // Define o ID correto para busca, priorizando o parâmetro da URL
    const idParaBuscar = idUsuario || usuario?.uid;
    
    // Blindagem 1: Validação de dono que funciona tanto na URL limpa quanto na URL com o próprio UID
    const eMeuPerfil = idParaBuscar === usuario?.uid;

    // 1. Escuta os posts normais e votações do usuário em tempo real
    useEffect(() => {
        // Blindagem 2: Não tenta rodar query se o Auth ainda não respondeu (previne query para 'undefined')
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

    // 2. Escuta os dados do perfil do usuário no Firestore em tempo real
    useEffect(() => {
        if (!idParaBuscar) return;

        const unsubscribeUser = onSnapshot(doc(db, "usuarios", idParaBuscar), (docSnap) => {
            if (docSnap.exists()) {
                setDadosExtras({ id: docSnap.id, ...docSnap.data() });
            } else {
                console.warn("Este perfil não possui documento de dados extras no Firestore.");
                setDadosExtras(null);
            }
        });

        return () => unsubscribeUser();
    }, [idParaBuscar]);

    // 3. BUSCA OS CARDS DA VITRINE REAIS BASEADO NOS IDs DO ARRAY DO USUÁRIO
    useEffect(() => {
        // Blindagem 3: SÓ roda a query se o array 'colecao' existir no dadosExtras e não estiver vazio.
        // O Firebase gera erro se tentar buscar com 'in' usando array vazio.
        if (!dadosExtras?.colecao || dadosExtras.colecao.length === 0) {
            setItensDaColecao([]);
            return;
        }

        const itensRef = collection(db, "colecaoItens");
        // Firebase limita queries com operador "in" a no máximo 30 itens de uma vez.
        const q = query(itensRef, where(documentId(), "in", dadosExtras.colecao));

        const unsubscribeItens = onSnapshot(q, (querySnapshot) => {
            const itensData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setItensDaColecao(itensData);
        }, (error) => {
            console.error("Erro ao buscar itens da coleção: ", error);
        });

        return () => unsubscribeItens();
        
    // Monitoramos idParaBuscar e o tamanho do array da coleção para rodar a query apenas quando necessário.
    }, [idParaBuscar, dadosExtras?.colecao?.length]);

    // Exibe tela de carregamento se o Auth ou o Firestore ainda não responderam
    if (!usuario || !idParaBuscar) {
        return <h2 style={{ color: "white", padding: "100px", textAlign: "center" }}>Conectando ao Rank Over...</h2>;
    }
    
    const handleSair = async () => {
        try {
            await auth.signOut();
            navigate("/");
        } catch (error) {
            console.error("Erro ao sair:", error);
        }
    };

    const handleDeletarItem = async (idItem: string) => {
        if (!usuario) return;
        const confirmar = window.confirm("Tem certeza que deseja apagar este item da sua coleção?");
        if (!confirmar) return;

        try {
            const userRef = doc(db, "usuarios", usuario.uid);
            await updateDoc(userRef, {
                colecao: arrayRemove(idItem)
            });

            if (dadosExtras?.itemFixadoId === idItem) {
                await updateDoc(userRef, { itemFixadoId: "" });
            }

            await deleteDoc(doc(db, "colecaoItens", idItem));
        } catch (error) {
            console.error("Erro ao deletar item:", error);
        }
    };

    const handleFixarItem = async (idItem: string) => {
        if (!usuario) return;

        try {
            const userRef = doc(db, "usuarios", usuario.uid);
            if (dadosExtras?.itemFixadoId === idItem) {
                await updateDoc(userRef, { itemFixadoId: "" });
            } else {
                await updateDoc(userRef, { itemFixadoId: idItem });
            }
        } catch (error) {
            console.error("Erro ao atualizar item fixado:", error);
        }
    };

    // Filtros de posts baseados na aba selecionada (travados para só rodar quando meusPosts existir)
    const postsNormaisEConquistas = meusPosts ? meusPosts.filter(p => p.tipo !== "conquistaVoto") : [];
    const postsDeVotacao = meusPosts ? meusPosts.filter(p => p.tipo === "conquistaVoto") : [];

    // Fallback de imagem de perfil: varre todas as propriedades possíveis do Firestore e do Auth
    const imagemPerfil = dadosExtras?.fotoUrl || dadosExtras?.fotoURL || dadosExtras?.photoURL || usuario?.photoURL || "https://via.placeholder.com/150";

    return (
        <div className="perfil-container-user">
            <div className="perfil">
                {/* CABEÇALHO DO PERFIL */}
                <div className="perfil-header-user">
                    <div className="perfil-foto">
                        <img
                            src={imagemPerfil}
                            alt="foto-user"
                            referrerPolicy="no-referrer"
                        />
                    </div>

                    <div className="perfil-bio">
                        <h1 className="perfil-nome-user">{dadosExtras?.nome || usuario.displayName || "Usuário"}</h1>
                        <h3 className="perfil-bio-text">{dadosExtras?.bio || "Recruta do Rank Over"}</h3>
                    </div>
                    
                    <div className="perfil-stats-group">
                        <div className="perfil-squad-quant">
                            <p>{dadosExtras?.squads_seguindo?.length || 0}</p>
                            <span>Squads</span>
                        </div>
                        <div className="perfil-squad-quant">
                            <p>{dadosExtras?.usuario_seguindo?.length || 0}</p>
                            <span>Seguindo</span>
                        </div>
                        <div className="perfil-squad-quant">
                            <p>{dadosExtras?.seguidores?.length || 0}</p>
                            <span>Seguidores</span>
                        </div>
                    </div>

                    <div className="perfil-acoes-group">
                        {/* Garante que o botão de seguir SÓ aparece se REALMENTE não for o meu perfil, comparando IDs logados */}
                        {!eMeuPerfil ? (
                            <>
                                {dadosExtras?.seguidores?.includes(usuario.uid) ? (
                                    <button className="perfil-seguir" onClick={() => {}}>
                                        Deixar de Seguir
                                    </button>
                                ) : (
                                    <button className="perfil-seguir" onClick={() => {}}>
                                        Seguir
                                    </button>
                                )}
                            </>
                        ) : (
                            <>
                                <button className="perfil-btn-config" onClick={() => navigate("/paginas/PerfilConfig")}>⚙️</button>
                                <button className="perfil-sair" onClick={handleSair}>Sair</button>
                            </>
                        )}
                    </div>
                </div>

                {/* --- MENU DE NAVEGAÇÃO DE ABAS --- */}
                <div className="perfil-abas-menu">
                    <button 
                        className={`perfil-aba-item ${abaAtiva === "postagens" ? "ativa" : ""}`}
                        onClick={() => setAbaAtiva("postagens")}
                    >
                        Postagens
                    </button>
                    <button 
                        className={`perfil-aba-item ${abaAtiva === "votacoes" ? "ativa" : ""}`}
                        onClick={() => setAbaAtiva("votacoes")}
                    >
                        Votações
                    </button>
                    <button 
                        className={`perfil-aba-item ${abaAtiva === "colecao" ? "ativa" : ""}`}
                        onClick={() => setAbaAtiva("colecao")}
                    >
                        Coleção
                    </button>
                </div>

                {/* --- CONTEÚDO DINÂMICO DAS ABAS --- */}
                <div className="Topicos">
                    <div className="mural-posts">
                        
                        {/* 1. ABA POSTAGENS */}
                        {abaAtiva === "postagens" && (
                            postsNormaisEConquistas.length > 0 ? (
                                postsNormaisEConquistas.map((post) => (
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
                                        conquista={post.tipo?.includes("conquista")}
                                        squadId={post.idSquad}
                                        usuarioId={usuario?.uid}
                                        quemDeuLike={post.quemDeuLike || []}
                                    />
                                ))
                            ) : (
                                <p className="sem-posts">Nenhuma postagem publicada ainda.</p>
                            )
                        )}

                        {/* 2. ABA VOTAÇÕES */}
                        {abaAtiva === "votacoes" && (
                            postsDeVotacao.length > 0 ? (
                                postsDeVotacao.map((post) => (
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
                                ))
                            ) : (
                                <p className="sem-posts">Nenhuma votação iniciada por este perfil.</p>
                            )
                        )}

                        {/* 3. ABA COLEÇÃO (VITRINE DE ITENS) */}
                        {abaAtiva === "colecao" && (
                            <div className="colecao-wrapper">
                                {/* O botão "Adicionar" agora só aparece se 'dadosExtras' existirem no Firestore */}
                                {eMeuPerfil && dadosExtras && (
                                    <button 
                                        className="add-item-trigger-btn"
                                        onClick={() => navigate("/paginas/AdicionarItem")}
                                    >
                                        + Adicionar
                                    </button>
                                )}

                                {itensDaColecao.length > 0 ? (
                                    <div className="perfil-grid-colecao">
                                        {itensDaColecao.map((item) => (
                                            <CardItem 
                                                key={item.id}
                                                id={item.id}
                                                nome={item.nome}
                                                fotoBanner={item.fotoBanner}
                                                info={item.info}
                                                eMeuPerfil={eMeuPerfil}
                                                fixado={dadosExtras?.itemFixadoId === item.id} // Envia se o item está fixado ou não
                                                onDeletar={handleDeletarItem} // Executa a remoção real
                                                onFixar={handleFixarItem}     // Executa a fixação real
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="sem-posts">Nenhum item adicionado à coleção ainda.</p>
                                )}
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}

export default Perfil;