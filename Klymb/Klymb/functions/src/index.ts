import * as functions from "firebase-functions";
import axios from "axios";

// ATENÇÃO: Substitua pelo seu token real do Tracker Network
const TRACKER_API_KEY = "0dc4fcd9-379d-4f56-83f2-e982869840c9"; 

export const getPlayerStats = functions.https.onRequest(async (req, res) => {
  // Permite que seu app React (rodando no localhost ou web) acesse o backend sem erro de CORS
  res.set("Access-Control-Allow-Origin", "*");
  
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Methods", "GET");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.status(204).send("");
    return;
  }

  try {
    // Pega os parâmetros enviados pelo React (ex: ?platform=origin&nickname=Shroud)
    const { platform, nickname } = req.query;

    if (!platform || !nickname) {
      res.status(400).json({ error: "Plataforma e Nickname são obrigatórios." });
      return;
    }

    // Altere a URL abaixo caso o jogo não seja Apex Legends (ex: /valorant/v1/..., /csgo/v1/...)
    const trackerUrl = `https://public-api.tracker.gg/v2/apex/standard/profile/${platform}/${nickname}`;

    const response = await axios.get(trackerUrl, {
      headers: {
        "TRN-Api-Key": TRACKER_API_KEY,
        "Accept": "application/json",
      },
    });

    // Retorna os dados oficiais da Tracker Network direto para o seu React
    res.status(200).json(response.data);
  } catch (error: any) {
    console.error("Erro ao chamar a API do Tracker:", error.message);
    res.status(500).json({ error: "Erro ao buscar dados no servidor do Tracker." });
  }
});