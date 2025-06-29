# Trailer Music Mixer

Uma aplicação web que permite misturar trailers de filmes com faixas de música para criar experiências audiovisuais personalizadas.

## Funcionalidades

* **Pesquisa de Trailers**: Encontre trailers de filmes no YouTube
* **Pesquisa de Música**: Descubra faixas no Apple Music
* **Edição de Precisão**:
  * Defina segundos de início/fim exatos para segmentos de vídeo
  * Defina segundos de início/fim exatos para segmentos de áudio

* **Pré-visualização em Tempo Real**: Reproduza a sua mistura antes de exportar
* **Opções de Exportação**: Descarregue a mix final em formato MP4
* **Contas de Utilizador**:
  * Guarde as suas misturas favoritas
  * Parilhe misturas com outros utilizadores

## Tecnologias Utilizadas

* **Frontend**:

  * JavaScript puro (ES6+)
  * HTML5/CSS3
  * YouTube IFrame API
  * 
* **Backend**:
  * Node.js com Express
  * MongoDB (para dados de utilizadores e misturas guardadas)
  * Apple Music API
  * TMDB API

## Instalação

### Pré-requisitos

* Node.js (v14+)
* MongoDB (v4+)
* Credenciais da Apple Music API
* Credenciais da TMDB API

### Configuração

1. ar o repositório:

   ```bash
   git clone https://github.com/yourusername/trailer-music-mixer.git
   cd trailer-music-mixer
   ```
2. Forneça as chaves da API necessárias no arquivo `.env`
