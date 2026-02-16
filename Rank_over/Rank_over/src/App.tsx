import './App.css'
import Home from './paginas/Home'
import Navbar from './paginas/Navbar'
import {useState} from "react"

function App() {

  const [pesquisaQuery, setPesquisa] = useState("");
  const squads = [
    { id: 1, nome: "Squad 1", info: "Informações do Squad 1" },
    { id: 2, nome: "Quad 2", info: "Informações do Squad 2" },
    { id: 3, nome: "Uad 3", info: "Informações do Squad 3" },
  ]

  return (

    <>
      <Navbar squads={squads}setPesquisa={setPesquisa} pesquisaQuery={pesquisaQuery}/>
      <Home squads={squads} pesquisaQuery={pesquisaQuery} />
    </>
  )

}


export default App;
