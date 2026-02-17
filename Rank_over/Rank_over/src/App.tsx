import './App.css'
import Home from './paginas/Home'
import Navbar from './paginas/Navbar'
import Squads from './paginas/Squads' // Importe o componente de Squads
import { useState } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

function App() {
  const [pesquisaQuery, setPesquisa] = useState("");

  const squads = [
    { id: 1, nome: "Enem", info: "Focado em estudo e aprendizagem", url: "https://picsum.photos/seed/enem/400/600" },
    { id: 2, nome: "Iron Man", info: "Determinado em vencer desafios", url: "https://picsum.photos/seed/ironman/400/600" },
    { id: 3, nome: "League of Legends", info: "Estratégia e combate em Summoner's Rift", url: "https://picsum.photos/seed/lol/400/600" },
    { id: 4, nome: "Cyber Junkies", info: "Especialistas em rush noturno e táticas rápidas", url: "https://picsum.photos/seed/cyber/400/600" },
    { id: 5, nome: "Golden Eagles", info: "Domínio aéreo e precisão a longa distância", url: "https://picsum.photos/seed/eagle/400/600" },
    { id: 6, nome: "Shadow Walkers", info: "Infiltração silenciosa e foco em sobrevivência", url: "https://picsum.photos/seed/shadow/400/600" },
    { id: 7, nome: "Red Chaos", info: "Puro poder de fogo e agressividade no mapa", url: "https://picsum.photos/seed/chaos/400/600" },
    { id: 8, nome: "Arctic Wolves", info: "Resistência extrema em condições adversas", url: "https://picsum.photos/seed/wolves/400/600" },
    { id: 9, nome: "Neon Strike", info: "Velocidade e tecnologia em combates urbanos", url: "https://picsum.photos/seed/neon/400/600" },
    { id: 10, nome: "Desert Kings", info: "Os mestres do posicionamento em campo aberto", url: "https://picsum.photos/seed/desert/400/600" },
    { id: 11, nome: "Valhalla", info: "Honra e glória nos torneios de elite", url: "https://picsum.photos/seed/viking/400/600" },
    { id: 12, nome: "Void Walkers", info: "Táticas imprevisíveis e controle de território", url: "https://picsum.photos/seed/void/400/600" },
    { id: 13, nome: "Bullet Rain", info: "Especialistas em suporte e cobertura pesada", url: "https://picsum.photos/seed/bullets/400/600" },
  ];

  return (
    <Router>
      <Navbar squads={squads} setPesquisa={setPesquisa} pesquisaQuery={pesquisaQuery} />

      <Routes>
        {/* Rota principal: Home */}
        <Route path="/" element={
          <Home squads={squads} pesquisaQuery={pesquisaQuery} />
        } />

        {/* Rota da lista completa de Squads */}
        <Route path="/squads" element={
          <Squads squads={squads} />
        } />

        {/* Rota do Perfil (você pode criar o componente depois) */}
        <Route path="/perfil" element={<h1>Página de Perfil em construção</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
