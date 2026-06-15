import { useState } from "react";


function AdicionarRankSquad() {

    const [metrica, setMetrica] = useState("Pontos");
    const [outraMetrica, setOutraMetrica] = useState("");
    const [categoria, setCategoria] = useState("Outros");  // tem que colocar aqui a categoria pra renderizar as regras de verificação específicas
    const metricaFinal = metrica === "Outros" ? outraMetrica : metrica;

    const [exigirFoto, setExigirFoto] = useState(false);
    const [exigirResumo, setExigirResumo] = useState(false);
    const [exigirGithub, setExigirGithub] = useState(false);
    const [exigirForest, setExigirForest] = useState(false)
    const [exigirContajg, setExigirContajg] = useState("")
    const [restritoAoSquad, setRestritoAoSquad] = useState(true)
    const [dataEncerramento, setDataEncerramento] = useState("")
    const [disputarRanking, setDisputarRanking] = useState("sim")
    const [estilo, setEstilo] = useState("Pontos")
    return (
        <div>
            <div className="input-group">
                        <p>Selecione o estilo do squad</p>
                        <select value={estilo} onChange={(e) => setEstilo(e.target.value)}>

                            <option value="Pontos">Pontos</option>
                            <option value="Votacao">Votacao</option>
                            <option value="Colecao">Colecao/Intusiasta</option>
                        </select>

                    </div>

                    {(estilo === "Colecao") && (
                        <>  
                            <div className="estilo-descricao-card">
                                <h4>🏆 Estilo Coleção / Vitrine</h4>
                                <p>Ideal para os membros exibirem seu acervo. Os itens postados podem ir direto para o feed e para a vitrine do perfil do usuário.</p>
                            </div>

                            <div className="input-group">
                                <p>Esse grupo terá Ranking competitivo?</p>
                                <select onChange={(e) => setDisputarRanking(e.target.value === "sim")}>
                                    <option value="sim">Sim, queremos um ranking pra vermos que é mais ativo e dedicado ao grupo </option>
                                    <option value="nao">Não, apenas um espaço para compartilhar e mostrar as coleções</option>
                                </select>
                            </div>

                            {disputarRanking && (
                                <>
                                    <div className="input-group">
                                        <p>O que tem que ser votado/Regras para pontuar no Rank</p>
                                        <input 
                                            type="text" 
                                            placeholder="Ex: Votar se o item é original e brabo..."
                                            onChange={(e) => setConteudoVotacao(e.target.value)} 
                                        />
                                    </div>

                                    <div className="input-group">
                                        <p>Quando a votação de um item deve encerrar?</p>
                                        <input 
                                            type="number" 
                                            placeholder="Ex: 5 (dias)"
                                            onChange={(e) => setDataEncerramento(e.target.value)} 
                                        />
                                    </div>

                                    <div className="input-group">
                                        <p>Personalizar botões de voto</p>
                                        <div className="votos-custom-inputs" style={{ display: 'flex', gap: '10px' }}>
                                            <input type="text" placeholder="Padrão: Recusar" onChange={(e) => setbotaoVotacaoN(e.target.value || "Recusar")} />
                                            <input type="text" placeholder="Padrão: Aprovar" onChange={(e) => setbotaoVotacaoP(e.target.value || "Aprovar")} />
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    )}
    
                    {(estilo === "Votacao" ) && (
                        <>  
                        <div className="estilo-descricao-card">
                            <h4>🗳️ Estilo Votação Tradicional</h4>
                            <p>Focado em tomada de decisões com votações gerais do grupo. Qualquer membro pode abrir uma votação baseada nas regras que você definir aqui, e o resultado final soma os pontos para o ranking geral do Squad.</p>
                        </div>
                            <div className="input-group">
                                <p>O que tem que ser votado/Regras (aparecerá isso para o membro)</p>
                                <input 
                                    type="text" 
                                    placeholder="Ex: Votar na melhor foto..."
                                    onChange={(e) => setConteudoVotacao(e.target.value)} 
                                />
                            </div>

                            <div className="input-group">
                                <p>Quando a votação deve encerrar?</p>
                                <input 
                                    type="number" 
                                    required
                                    onChange={(e) => setDataEncerramento(e.target.value)} 
                                />
                            </div>


                            <div className="input-group">
                                <p>Quem tem direito ao voto?</p>
                                <select onChange={(e) => setRestritoAoSquad(e.target.value === "squad")}>
                                    <option value="squad">Apenas membros do meu Squad</option>
                                    <option value="publico">Qualquer usuário da plataforma</option>
                                </select>
                            </div>

                            <div className="input-group">
                                <p>Personalizar botões de voto (Opcional)</p>
                                <div className="votos-custom-inputs" style={{ display: 'flex', gap: '10px' }}>
                                    <input 
                                        type="text" 
                                        placeholder="Padrão: Recusar (Botão Vermelho/Negativo)" 
                                        onChange={(e) => setbotaoVotacaoN(e.target.value || "Recusar")} 
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="Padrão: Aprovar (Botão Verde/Positivo)" 
                                        onChange={(e) => setbotaoVotacaoP(e.target.value || "Aprovar")} 
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {(estilo === "Pontos") &&(
                        <>
                            <div className="estilo-descricao-card">
                                <h4>📈 Estilo Pontos</h4>
                                <p>O modelo competitivo puro do Rank Over. Escolha uma métrica específica (como Horas, Kills ou Páginas lidas) e defina as regras de validação. Os membros sobem no ranking provando suas atividades através de fotos, commits do GitHub ou integrações.</p>
                            </div>
                            <div className="input-group">
                                <p>Métrica de Rank (O que define quem está no topo?)</p>
                                <div className="metrica-options">
                                    {["Kills", "Metros", "Segundos", "Horas", "Linhas", "Vitorias", "Repetição", "Pontos", "Outros"].map((m) => (
                                        <button 
                                            key={m} 
                                            type="button" 
                                            className={metrica === m ? "active" : ""} 
                                            onClick={() => setMetrica(m)}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                                {metrica === "Outros" && (
                                    <div className="input-outro">
                                        <input
                                            type="text"
                                            placeholder="Ex: Páginas lidas, Flexões..."
                                            value={outraMetrica}
                                            onChange={(e) => setOutraMetrica(e.target.value)}
                                            required
                                        />
                                    </div>

                                    
                                )}
                            </div>

                            <div className="input-prova-container">
                                <h3 className="titulo-sessao-pequeno">Regras de Verificação</h3>
                                
                                
                                {(categoria === "Estudos" ) && (
                                    <>
                                        
                                        
                                        <div className="input-group">
                                            <p>Resumo de conteúdo?</p>
                                            <select value={exigirResumo ? "Sim" : "Nao"} onChange={(e) => setExigirResumo(e.target.value === "Sim")}>
                                                <option value="Nao">Não</option>
                                                <option value="Sim">Sim</option>
                                            </select>
                                        </div>

                                        <div className="input-group">
                                            <p>Solicitar Foto/Print?</p>
                                            <select value={exigirFoto ? "Sim" : "Nao"} onChange={(e) => setExigirFoto(e.target.value === "Sim")}>
                                                <option value="Nao">Não</option>
                                                <option value="Sim">Sim (Obrigatório)</option>
                                            </select>
                                        </div>

                                        <div className="input-group">
                                            <p>Verificação de GitHub?</p>
                                            <select value={exigirGithub ? "Sim" : "Nao"} onChange={(e) => setExigirGithub(e.target.value === "Sim")}>
                                                <option value="Nao">Não</option>
                                                <option value="Sim">Sim (Validar Commits)</option>
                                            </select>
                                        </div>

                                        <div className="input-group">
                                            <p>Verificação de app Forest?</p>
                                            <select value={exigirForest ? "Sim" : "Nao"} onChange={(e) => setExigirForest(e.target.value === "Sim")}>
                                                <option value="Nao">Não</option>
                                                <option value="Sim">Sim</option>
                                            </select>
                                        </div>
                                    </>
                                )}

                                {categoria === "Esportes" && (
                                    <div className="input-prova-container">
                                        <div className="input-group">
                                            <p>Modalidade Esportiva</p>
                                            <input type="text" placeholder="Ex: Corrida, Ciclismo, Academia..." value={subCategoria} onChange={(e) => setSubCategoria(e.target.value)} />
                                        </div>
                                        <div className="input-group">
                                            <p>Solicitar Foto/Print?</p>
                                            <select value={exigirFoto ? "Sim" : "Nao"} onChange={(e) => setExigirFoto(e.target.value === "Sim")}>
                                                <option value="Nao">Não</option>
                                                <option value="Sim">Sim (Obrigatório)</option>
                                            </select>
                                        </div>
                        
                                        <div className="input-group">
                                            <p>Solicitar Localização (Check-in)?</p>
                                            <select>
                                                <option value="Nao">Não</option>
                                                <option value="Sim">Sim (Validar GPS)</option>
                                            </select>
                                        </div>

                                        <div className="input-group">
                                            <p>Sincronizar com Strava?</p>
                                            <select>
                                                <option value="Nao">Não</option>
                                                <option value="Sim">Sim (Validar Atividade)</option>
                                            </select>
                                        </div>

                                        <div className="input-group">
                                            <p>Verificar com Google Fit / Apple Health?</p>
                                            <select>
                                                <option value="Nao">Não</option>
                                                <option value="Sim">Sim (Validar Tempo de Treino)</option>
                                            </select>
                                        </div>


                                        <div className="input-group">
                                            <p>Validar Dieta (MyFitnessPal)?</p>
                                            <select>
                                                <option value="Nao">Não</option>
                                                <option value="Sim">Sim (Importar Macros)</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {categoria === "Outros" && (
                                    <>
                                        <div className="input-group">
                                            <p>Solicitar Foto/Print?</p>
                                            <select value={exigirFoto ? "Sim" : "Nao"} onChange={(e) => setExigirFoto(e.target.value === "Sim")}>
                                                <option value="Nao">Não</option>
                                                <option value="Sim">Sim (Obrigatório)</option>
                                            </select>
                                        </div>

                                        <div className="input-group">
                                            <p>Solicitar Localização (Check-in)?</p>
                                            <select>
                                                <option value="Nao">Não</option>
                                                <option value="Sim">Sim (Validar GPS)</option>
                                            </select>
                                        </div>

                                        <div className="input-group">
                                            <p>Sincronizar com Strava?</p>
                                            <select>
                                                <option value="Nao">Não</option>
                                                <option value="Sim">Sim (Validar Atividade)</option>
                                            </select>
                                        </div>

                                        <div className="input-group">
                                            <p>Verificar com Google Fit / Apple Health?</p>
                                            <select>
                                                <option value="Nao">Não</option>
                                                <option value="Sim">Sim (Validar Tempo de Treino)</option>
                                            </select>
                                        </div>


                                        <div className="input-group">
                                            <p>Validar Dieta (MyFitnessPal)?</p>
                                            <select>
                                                <option value="Nao">Não</option>
                                                <option value="Sim">Sim (Importar Macros)</option>
                                            </select>
                                        </div>

                                        <div className="input-group">
                                            <p>Solicitar Foto/Print?</p>
                                            <select value={exigirFoto ? "Sim" : "Nao"} onChange={(e) => setExigirFoto(e.target.value === "Sim")}>
                                                <option value="Nao">Não</option>
                                                <option value="Sim">Sim (Obrigatório)</option>
                                            </select>
                                        </div>

                                        <div className="input-group">
                                            <p>Verificação de GitHub?</p>
                                            <select value={exigirGithub ? "Sim" : "Nao"} onChange={(e) => setExigirGithub(e.target.value === "Sim")}>
                                                <option value="Nao">Não</option>
                                                <option value="Sim">Sim (Validar Commits)</option>
                                            </select>
                                        </div>

                                        <div className="input-group">
                                            <p>Verificação de app Forest?</p>
                                            <select value={exigirForest ? "Sim" : "Nao"} onChange={(e) => setExigirForest(e.target.value === "Sim")}>
                                                <option value="Nao">Não</option>
                                                <option value="Sim">Sim</option>
                                            </select>
                                        </div>

                                        <div className="input-group">
                                            <p>Caso seu jogo esteja nessa lista ele possui suporte para uma gestao dos membros mais facilitado</p>
                                            <select>
                                                <option value="Valorant">Valorant</option>
                                                <option value="League of Legends">League of Legends</option>
                                                <option value="Fortinite">Fortinite</option>
                                                <option value="The Finals">The Finals</option>
                                                <option value="Call of Duty">Call of Duty</option>
                                            </select>
                                        </div>
                                    
                                    </>
                                    
                                )}

                                

                                {categoria === "Gaming" && (
                                    <>
                                        <div className="input-group">
                                            <p>Jogo Principal do Squad</p>
                                            <input type="text" placeholder="CS2, Valorant, Fortinet..." value={subCategoria} onChange={(e) => setSubCategoria(e.target.value) } />
                                            
                                        </div>

                                        <div className="input-group">
                                            <p>Solicitar Foto/Print/Video?</p>
                                            <select value={exigirFoto ? "Sim" : "Nao"} onChange={(e) => setExigirFoto(e.target.value === "Sim")}>
                                                <option value="Nao">Não</option>
                                                <option value="Sim">Sim (Obrigatório)</option>
                                            </select>
                                        </div>
                                        
                                        <div className="input-group">
                                            <p>Caso seu jogo esteja nessa lista ele possui suporte para uma gestao dos membros mais facilitado</p>
                                            <select value={exigirContajg}  onChange={(e) => setExigirContajg(e.target.value)}>
                                                <option value="Outro">Outro</option>
                                                <option value="Valorant">Valorant</option>
                                                <option value="League of Legends">League of Legends</option>
                                                <option value="Fortinite">Fortinite</option>
                                                <option value="The Finals">The Finals</option>
                                                <option value="Call of Duty">Call of Duty</option>
                                            </select>
                                        </div>

                                    </>
                                )}
                            </div>
                        </>




                    )}
        </div>
    );
}
export default AdicionarRankSquad;