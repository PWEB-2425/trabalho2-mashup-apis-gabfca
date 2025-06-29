import { elements } from './app.js';
import { state } from './app.js';
import { utils } from './utils.js';

export const playback = {
  syncPlayback: () => {
    if (!state.mediaPlayers.audioPlayer || !state.mediaPlayers.trailerIframe) return;

    const audioCurrentTime = state.mediaPlayers.audioPlayer.currentTime;
    const videoStartTime = parseFloat(elements.startTimeSlider.value);
    const audioStartTime = parseFloat(elements.audioStartSlider.value);

    const videoTime = videoStartTime + (audioCurrentTime - audioStartTime);
    utils.postToYouTubeIframe(state.mediaPlayers.trailerIframe, 'seekTo', [videoTime, true]);

    if (state.mediaPlayers.audioPlayer.paused) {
      state.mediaPlayers.audioPlayer
        .play()
        .then(() => {
          utils.postToYouTubeIframe(state.mediaPlayers.trailerIframe, 'playVideo');
          state.isPlaying = true;
        })
        .catch(error => {
          utils.showMessage(`Playback error: ${error.message}`);
        });
    }
  },

  stopPlayback: () => {
    if (state.mediaPlayers.audioPlayer) {
      state.mediaPlayers.audioPlayer.pause();
      state.mediaPlayers.audioPlayer.currentTime = parseFloat(elements.audioStartSlider.value);
    }

    if (state.mediaPlayers.trailerIframe) {
      utils.postToYouTubeIframe(state.mediaPlayers.trailerIframe, 'pauseVideo');
      utils.postToYouTubeIframe(state.mediaPlayers.trailerIframe, 'seekTo', [parseFloat(elements.startTimeSlider.value), true]);
    }

    state.isPlaying = false;
  }
};

export const ui = {
  resetMediaPlayers: () => {
    if (state.mediaPlayers.trailerIframe) {
      utils.postToYouTubeIframe(state.mediaPlayers.trailerIframe, 'stopVideo');
    }
    if (state.mediaPlayers.audioPlayer) {
      state.mediaPlayers.audioPlayer.pause();
    }
    state.isPlaying = false;
  },

  updateSliderControls: () => {
    elements.startTimeSlider.max = state.trailerDuration;
    elements.endTimeSlider.max = state.trailerDuration;
    if (parseFloat(elements.endTimeSlider.value) > state.trailerDuration) {
      elements.endTimeSlider.value = state.trailerDuration;
    }
    elements.audioStartSlider.max = state.trackDuration;
    elements.audioEndSlider.max = state.trackDuration;
    if (parseFloat(elements.audioEndSlider.value) > state.trackDuration) {
      elements.audioEndSlider.value = state.trackDuration;
    }
    ui.updateTimeLabels();
  },

  updateTimeLabels: () => {
    elements.startTimeLabel.textContent = utils.formatTime(elements.startTimeSlider.value);
    elements.endTimeLabel.textContent = utils.formatTime(elements.endTimeSlider.value);
    elements.audioStartLabel.textContent = utils.formatTime(elements.audioStartSlider.value);
    elements.audioEndLabel.textContent = utils.formatTime(elements.audioEndSlider.value);
  },

  showMixedPlayer: () => {
    elements.mixedPlayerDiv.innerHTML = `
      <div class="player-container card">
        <iframe id="mixedTrailer" width="400%" height="315" frameborder="0" allowfullscreen></iframe>
        <audio id="mixedAudio" controls style="width:400%; margin-top:10px;"></audio>
        <div class="player-controls" style="margin-top:10px; display:flex; gap:10px; justify-content:flex-end;">
          <button id="syncPlaybackBtn" style="display:none;" class="btn btn-secondary">Sync Playback</button>
          <button id="stopPlaybackBtn" class="btn btn-primary">Stop</button>
        </div>
      </div>
    `;

    state.mediaPlayers.trailerIframe = document.getElementById('mixedTrailer');
    state.mediaPlayers.audioPlayer = document.getElementById('mixedAudio');

    const videoStart = parseFloat(elements.startTimeSlider.value);
    state.mediaPlayers.trailerIframe.src = utils.createYouTubeEmbed(
      state.currentTrailer.youtubeVideoId,
      videoStart,
      false
    );

    state.mediaPlayers.audioPlayer.src = state.currentTrack.previewUrl;
    state.mediaPlayers.audioPlayer.currentTime = parseFloat(elements.audioStartSlider.value);

    document.getElementById('syncPlaybackBtn').addEventListener('click', playback.syncPlayback);
    document.getElementById('stopPlaybackBtn').addEventListener('click', playback.stopPlayback);

    state.mediaPlayers.audioPlayer.addEventListener('play', () => {
      state.isPlaying = true;
      utils.postToYouTubeIframe(state.mediaPlayers.trailerIframe, 'playVideo');
    });

    state.mediaPlayers.audioPlayer.addEventListener('pause', () => {
      state.isPlaying = false;
      utils.postToYouTubeIframe(state.mediaPlayers.trailerIframe, 'pauseVideo');
    });

    state.mediaPlayers.audioPlayer.addEventListener('timeupdate', () => {
      if (state.isPlaying) {
        const videoTime =
          parseFloat(elements.startTimeSlider.value) +
          state.mediaPlayers.audioPlayer.currentTime -
          parseFloat(elements.audioStartSlider.value);
        utils.postToYouTubeIframe(state.mediaPlayers.trailerIframe, 'seekTo', [videoTime, true]);
      }
    });
  },

  enableMixControls: () => {
    if (state.currentTrailer && state.currentTrack) {
      elements.segmentSelector.style.display = 'block';
      elements.mixedTrailerContainer.style.display = 'block';
      elements.playMixedBtn.disabled = false;
      elements.downloadMixedBtn.disabled = false;
    } else {
      elements.segmentSelector.style.display = 'none';
      elements.mixedTrailerContainer.style.display = 'none';
      elements.playMixedBtn.disabled = true;
      elements.downloadMixedBtn.disabled = true;
    }
  },

  renderMixCard: (mix) => {
    return `
      <article class="mix-card card">
        <div class="mix-thumb">
          <img src="${mix.thumbnailUrl || 'placeholder.jpg'}" alt="Thumbnail for ${mix.title}" loading="lazy" />
        </div>
        <div class="mix-info">
          <h3 class="mix-title">${mix.title}</h3>
          <p class="mix-description">${mix.description || 'No description available.'}</p>
          <div class="mix-meta">
            <span>By: ${mix.author}</span>
            <span>${mix.likes || 0} Likes</span>
          </div>
          <button class="btn btn-primary play-mix-btn" data-mix-id="${mix.id}">Play</button>
        </div>
      </article>
    `;
  },

  // Call this function to render mixes into a container element
  renderMixList: (mixes, containerElement) => {
    if (!mixes || mixes.length === 0) {
      containerElement.innerHTML = `<p class="empty-msg">No mixes found.</p>`;
      return;
    }
    containerElement.innerHTML = mixes.map(mix => ui.renderMixCard(mix)).join('');
  }
};
