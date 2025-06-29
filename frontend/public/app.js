import { api } from './api.js';

const API_BASE = 'http://https://trabalho2-mashup-apis-gabfca-backend.onrender.com/api';

// DOM Elements
export const elements = {
    movieNameInput: document.getElementById('movieName'),
    searchTrailerBtn: document.getElementById('searchTrailerBtn'),
    trailerDiv: document.getElementById('trailer'),
    songNameInput: document.getElementById('songName'),
    searchSongBtn: document.getElementById('searchSongBtn'),
    songPreviewDiv: document.getElementById('songPreview'),
    segmentSelector: document.getElementById('segmentSelector'),
    mixedTrailerContainer: document.getElementById('mixedTrailerContainer'),
    playMixedBtn: document.getElementById('playMixedBtn'),
    downloadMixedBtn: document.getElementById('downloadMixedBtn'),
    mixedPlayerDiv: document.getElementById('mixedPlayer'),
    startTimeSlider: document.getElementById('startTimeSlider'),
    endTimeSlider: document.getElementById('endTimeSlider'),
    startTimeLabel: document.getElementById('startTimeLabel'),
    endTimeLabel: document.getElementById('endTimeLabel'),
    audioStartSlider: document.getElementById('audioStartSlider'),
    audioEndSlider: document.getElementById('audioEndSlider'),
    audioStartLabel: document.getElementById('audioStartLabel'),
    audioEndLabel: document.getElementById('audioEndLabel'),
    profileBtn: document.getElementById('profileBtn'),
    profileModal: document.getElementById('profileModal'),
    closeProfileBtn: document.getElementById('closeProfileBtn'),
    myMixesList: document.getElementById('myMixesList'),
    publicMixesList: document.getElementById('publicMixesList'),
    saveCurrentMixBtn: document.getElementById('saveCurrentMixBtn'),
    tabButtons: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    logoutBtn: document.getElementById('logoutBtn'),
    welcomeMessage: document.getElementById('welcomeMessage'),
    authSection: document.getElementById('authSection'),
    errorMsg: document.getElementById('errorMsg'),
    successMsg: document.getElementById('successMsg')
};

// State
export let state = {
    currentTrailer: null,
    currentTrack: null,
    trailerDuration: 120,
    trackDuration: 30,
    mediaPlayers: {
        trailerIframe: null,
        audioPlayer: null
    },
    isPlaying: false,
    currentUser: null,
    userMixes: [],    
    publicMixes: []   
};

import { utils } from './utils.js'

// Auth Functions
const auth = {
    checkSession: async () => {
        try {
            const res = await fetch(`${API_BASE}/session`, {
                method: 'GET',
                credentials: 'include'
            });
            
            if (res.ok) {
                const data = await res.json();
                if (data.user && data.user.username) {
                    auth.setLoggedIn(data.user.username);
                    return true;
                }
            }
            auth.setLoggedOut();
            return false;
        } catch {
            auth.setLoggedOut();
            return false;
        }
    },
    
    setLoggedIn: (username) => {
        state.currentUser = username;
        if (elements.authSection) elements.authSection.style.display = 'none';
        if (elements.welcomeMessage) {
            elements.welcomeMessage.textContent = `Welcome, ${username}!`;
            elements.welcomeMessage.style.display = 'block';
        }
        if (elements.logoutBtn) elements.logoutBtn.style.display = 'block';
        if (elements.profileBtn) elements.profileBtn.style.display = 'block';
    },
    
    setLoggedOut: () => {
        state.currentUser = null;
        if (elements.authSection) elements.authSection.style.display = 'block';
        if (elements.welcomeMessage) elements.welcomeMessage.style.display = 'none';
        if (elements.logoutBtn) elements.logoutBtn.style.display = 'none';
        if (elements.profileBtn) elements.profileBtn.style.display = 'none';
    },
    
    logout: async () => {
        try {
            const res = await fetch(`${API_BASE}/logout`, {
                method: 'POST',
                credentials: 'include'
            });

            if (res.ok) {
                auth.setLoggedOut();
                window.location.href = 'index.html';
            } else {
                const data = await res.json();
                utils.showError(data.error || 'Logout failed. Please try again.');
            }
        } catch (err) {
            utils.showError('Network error during logout.');
        }
    }
};


import { ui } from './ui.js'



// Event Handlers
const handlers = {
    handleTrailerSearch: async () => {
        if (!state.currentUser) {
            utils.showMessage('Please log in to search for trailers');
            return;
        }

        const movieName = elements.movieNameInput.value.trim();
        if (!movieName) return utils.showMessage('Please enter a movie name');

        try {
            elements.searchTrailerBtn.disabled = true;
            elements.trailerDiv.innerHTML = '<p>Searching for trailers...</p>';

            const response = await api.searchTrailer(movieName);
            const trailers = response.results;

            if (!Array.isArray(trailers) || trailers.length === 0) {
                elements.trailerDiv.innerHTML = '<p>No trailers found.</p>';
                return;
            }

            const list = document.createElement('ul');
            list.className = 'selection-list';

            trailers.forEach(trailer => {
                const item = document.createElement('li');
                item.style.cursor = 'pointer';

                const releaseYear = trailer.releaseDate ? trailer.releaseDate.split('-')[0] : 'N/A';
                item.textContent = `${trailer.movieTitle} (${releaseYear})`;

                item.addEventListener('click', () => {
                    state.currentTrailer = trailer;
                    state.trailerDuration = 120;

                    elements.trailerDiv.innerHTML = `
                        <iframe width="560" height="315"
                          src="${utils.createYouTubeEmbed(trailer.youtubeVideoId)}"
                          frameborder="0" allowfullscreen></iframe>
                    `;

                    ui.updateSliderControls();
                    ui.enableMixControls();
                });

                list.appendChild(item);
            });

            elements.trailerDiv.innerHTML = '';
            elements.trailerDiv.appendChild(list);

        } catch (err) {
            utils.showMessage(`Error searching trailers: ${err.message}`);
            elements.trailerDiv.innerHTML = '';
        } finally {
            elements.searchTrailerBtn.disabled = false;
        }
    },

    handleTrackSearch: async () => {
        if (!state.currentUser) {
            utils.showMessage('Please log in to search for tracks');
            return;
        }

        const songName = elements.songNameInput.value.trim();
        if (!songName) return utils.showMessage('Please enter a song name');

        try {
            elements.searchSongBtn.disabled = true;
            elements.songPreviewDiv.innerHTML = '<p>Searching for tracks...</p>';
            
            const tracks = await api.searchTrack(songName);

            if (!Array.isArray(tracks) || tracks.length === 0) {
                elements.songPreviewDiv.innerHTML = '<p>No tracks found.</p>';
                return;
            }

            const list = document.createElement('ul');
            list.className = 'selection-list';
            
            tracks.forEach(track => {
                const item = document.createElement('li');
                item.textContent = `${track.trackName} by ${track.artistName} (${utils.formatTime(track.duration || 0)})`;
                item.style.cursor = 'pointer';
                item.addEventListener('click', () => {
                    state.currentTrack = track;
                    state.trackDuration = track.duration || 30;
                    elements.songPreviewDiv.innerHTML = `<audio controls src="${track.previewUrl}"></audio>`;
                    ui.updateSliderControls();
                    ui.enableMixControls();
                });
                list.appendChild(item);
            });

            elements.songPreviewDiv.innerHTML = '';
            elements.songPreviewDiv.appendChild(list);

        } catch (err) {
            utils.showMessage(`Error searching tracks: ${err.message}`);
            elements.songPreviewDiv.innerHTML = '';
        } finally {
            elements.searchSongBtn.disabled = false;
        }
    },

    handlePlayMixed: () => {
        if (!state.currentUser) {
            utils.showMessage('Please log in to play mixes');
            return;
        }

        if (!state.currentTrailer || !state.currentTrack) {
            utils.showMessage('Select both a trailer and a track first.');
            return;
        }
        ui.showMixedPlayer();
    },

    handleDownloadMixed: async () => {
        if (!state.currentUser) {
            utils.showMessage('Please log in to download mixes');
            return;
        }

        if (!state.currentTrailer || !state.currentTrack) {
            utils.showMessage('Select both a trailer and a track before downloading.');
            return;
        }

        try {
            elements.downloadMixedBtn.disabled = true;
            elements.downloadMixedBtn.textContent = 'Exporting...';

            const payload = {
                youtubeVideoId: state.currentTrailer.youtubeVideoId,
                videoStart: parseFloat(elements.startTimeSlider.value),
                videoEnd: parseFloat(elements.endTimeSlider.value),
                audioPreviewUrl: state.currentTrack.previewUrl,
                audioStart: parseFloat(elements.audioStartSlider.value),
                audioEnd: parseFloat(elements.audioEndSlider.value)
            };

            const blob = await api.exportMix(payload);

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${state.currentTrailer.movieTitle.replace(/\s+/g, '_')}_mix.mp4`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);

            utils.showMessage('Download started!', 'success');
        } catch (err) {
            utils.showMessage(`Download failed: ${err.message}`);
        } finally {
            elements.downloadMixedBtn.disabled = false;
            elements.downloadMixedBtn.textContent = 'Download Mix';
        }
    },

    handleSegmentSliderChange: () => {
        let startVal = parseFloat(elements.startTimeSlider.value);
        let endVal = parseFloat(elements.endTimeSlider.value);
        if (startVal >= endVal) {
            if (elements.startTimeSlider === document.activeElement) {
                elements.endTimeSlider.value = startVal + 1;
            } else {
                elements.startTimeSlider.value = endVal - 1;
            }
        }

        let aStart = parseFloat(elements.audioStartSlider.value);
        let aEnd = parseFloat(elements.audioEndSlider.value);
        if (aStart >= aEnd) {
            if (elements.audioStartSlider === document.activeElement) {
                elements.audioEndSlider.value = aStart + 1;
            } else {
                elements.audioStartSlider.value = aEnd - 1;
            }
        }
        ui.updateTimeLabels();
    },

    handleProfileClick: () => {
        if (!state.currentUser) {
            utils.showMessage('Please log in to view your profile');
            return;
        }
    
        // Show profile modal
        elements.profileModal.style.display = 'block';
    
        // Set the profile username
        const usernameDisplay = elements.profileModal.querySelector('.profile-username');
        if (usernameDisplay) {
            usernameDisplay.textContent = state.currentUser.username || 'Unnamed User';
        }
    
        // Clear both mix lists before loading
        elements.myMixesList.innerHTML = '';
        elements.publicMixesList.innerHTML = '';
    
        // Load user mixes
        handlers.loadUserMixes();
    
        // Load public mixes
        handlers.loadPublicMixes();
    
        // Ensure both sections are visible (just in case)
        elements.myMixesList.style.display = 'block';
        elements.publicMixesList.style.display = 'block';
    },
    
    handleCloseProfile: () => {
        elements.profileModal.style.display = 'none';
    },
    
    handleTabSwitch: (e) => {
        const tabId = e.target.dataset.tab;
        
        elements.tabButtons.forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
        });
        e.target.classList.add('active');
        e.target.setAttribute('aria-selected', 'true');
        
        elements.tabContents.forEach(content => {
            content.classList.remove('active');
            content.hidden = true;
        });
        
        const activeTab = document.getElementById(tabId);
        activeTab.classList.add('active');
        activeTab.hidden = false;
        
        if (tabId === 'public-mixes') {
            handlers.loadPublicMixes();
        } else if (tabId === 'my-mixes' && state.currentUser) {
            handlers.loadUserMixes();
        }
    },

    loadUserMixes: async () => {
        try {
            elements.myMixesList.innerHTML = '<div class="loading-spinner"></div>';
            const mixes = await api.getMyMixes();
            state.userMixes = mixes;
            console.log(mixes);
            if (mixes.length === 0) {
                elements.myMixesList.innerHTML = '<p class="no-mixes">You haven\'t saved any mixes yet.</p>';
                return;
            }
            
            elements.myMixesList.innerHTML = '';
            mixes.forEach(mix => {
                const mixCard = handlers.createMixCard(mix, true);
                elements.myMixesList.appendChild(mixCard);
            });
        } catch (err) {
            utils.showMessage(`Failed to load your mixes: ${err.message}`);
            elements.myMixesList.innerHTML = '<p class="error-message">Error loading mixes.</p>';
        }
    },
    
    loadPublicMixes: async () => {
        try {
            elements.publicMixesList.innerHTML = '<div class="loading-spinner"></div>';
            const mixes = await api.getPublicMixes();
            state.publicMixes = mixes;
            
            if (mixes.length === 0) {
                elements.publicMixesList.innerHTML = '<p class="no-mixes">No public mixes available yet.</p>';
                return;
            }
            
            elements.publicMixesList.innerHTML = '';
            mixes.forEach(mix => {
                const mixCard = handlers.createMixCard(mix, false);
                elements.publicMixesList.appendChild(mixCard);
            });
        } catch (err) {
            utils.showMessage(`Failed to load public mixes: ${err.message}`);
            elements.publicMixesList.innerHTML = '<p class="error-message">Error loading public mixes.</p>';
        }
    },
    
    createMixCard: (mix, isOwner) => {
        const card = document.createElement('div');
        card.className = 'mix-card social-post';
    
        card.innerHTML = `
            <div class="post-header">
                <div class="post-author">
                    <strong>${mix.ownerUsername || 'Unknown user'}</strong>
                </div>
            </div>
    
            <div class="post-content">
                <h4 class="mix-title">${mix.title || 'Untitled Mix'}</h4>
    
                <div class="mix-details">
                    <p><strong>🎬 Video:</strong> ${mix.videoStart}s → ${mix.videoEnd}s</p>
                    <p><strong>🎧 Audio:</strong> ${mix.audioStart}s → ${mix.audioEnd}s</p>
                </div>
            </div>
    
            <div class="mix-actions">
                <button class="mix-btn load-mix-btn" data-id="${mix.mixId}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Load
                </button>
    
                ${isOwner ? `
                <button class="mix-btn delete-mix-btn" data-id="${mix.mixId}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Delete
                </button>
                ` : ''}
            </div>
        `;
    
        // Apply background styles and box shadow
        card.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
        card.style.borderRadius = '10px';
        card.style.padding = '15px';
        card.style.marginBottom = '1rem'; // Space between cards
        card.style.transition = 'all 0.3s ease'; // Smooth hover transition
    
        // Hover effect to enhance the card when interacted with
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'scale(1.05)';
            card.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
        });
    
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'scale(1)';
            card.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
        });
    
        return card;
    },
    handleSaveCurrentMix: async () => {
        if (!state.currentUser) {
            utils.showMessage('Please log in to save mixes');
            return;
        }

        if (!state.currentTrailer || !state.currentTrack) {
            utils.showMessage('You need to create a mix before saving it');
            return;
        }
        
        try {
            elements.saveCurrentMixBtn.disabled = true;
            elements.saveCurrentMixBtn.innerHTML = '<div class="loading-spinner"></div> Saving...';
            
            const mixData = {
                youtubeVideoId: state.currentTrailer.youtubeVideoId,
                videoStart: parseFloat(elements.startTimeSlider.value),
                videoEnd: parseFloat(elements.endTimeSlider.value),
                audioPreviewUrl: state.currentTrack.previewUrl,
                audioStart: parseFloat(elements.audioStartSlider.value),
                audioEnd: parseFloat(elements.audioEndSlider.value),
                title: `${state.currentTrailer.movieTitle} x ${state.currentTrack.trackName}`,
                description: `Mix of ${state.currentTrailer.movieTitle} trailer with ${state.currentTrack.trackName} by ${state.currentTrack.artistName}`,
                isPublic: true
            };
            
            const savedMix = await api.saveMix(mixData);
            console.log(savedMix);
            utils.showMessage('Mix saved successfully!', 'success');
            handlers.loadUserMixes();
        } catch (err) {
            utils.showMessage(`Failed to save mix: ${err.message}`);
        } finally {
            elements.saveCurrentMixBtn.disabled = false;
            elements.saveCurrentMixBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                Post VibeClip!
            `;
        }
    },
    
    handleLoadMix: async (mixId) => {
        try {
            let mix = state.userMixes.find(m => m.mixId.toString() === mixId);
            
            if (!mix) {
                mix = state.publicMixes.find(m => m.mixId.toString() === mixId);
            }
            
            if (!mix) {
                throw new Error('Mix not found');
            }
            
            state.currentTrailer = {
                youtubeVideoId: mix.youtubeVideoId,
                movieTitle: mix.title.split(' x ')[0] || 'Unknown Movie'
            };
            
            state.currentTrack = {
                previewUrl: mix.audioPreviewUrl,
                trackName: mix.title.split(' x ')[1] || 'Unknown Track',
                artistName: mix.description?.split(' by ')[1] || 'Unknown Artist',
                duration: mix.audioEnd
            };
            
            elements.trailerDiv.innerHTML = `
                <iframe width="960" height="315"
                  src="${utils.createYouTubeEmbed(mix.youtubeVideoId, false)}"  
                  frameborder="0" allowfullscreen></iframe>
            `;
            
            elements.songPreviewDiv.innerHTML = `<audio controls src="${mix.audioPreviewUrl}"></audio>`;
            
            elements.startTimeSlider.value = mix.videoStart;
            elements.endTimeSlider.value = mix.videoEnd;
            elements.audioStartSlider.value = mix.audioStart;
            elements.audioEndSlider.value = mix.audioEnd;
            
            state.trailerDuration = mix.videoEnd;
            state.trackDuration = mix.audioEnd;
            
            ui.updateSliderControls();
            ui.enableMixControls();
            
            utils.showMessage('Mix loaded successfully!', 'success');
            
            // 👇 Optional: Auto-show the mixed player (but don't autoplay yet)
            ui.showMixedPlayer();
        } catch (err) {
            utils.showMessage(`Failed to load mix: ${err.message}`);
        }
    },
    
    handleDeleteMix: async (mixId) => {
        if (confirm('Are you sure you want to delete this mix? This cannot be undone.')) {
            try {
                await api.deleteMix(mixId);
                utils.showMessage('Mix deleted successfully!', 'success');
                handlers.loadUserMixes();
            } catch (err) {
                utils.showMessage(`Failed to delete mix: ${err.message}`);
            }
        }
    }
};

// Initialize Application
const init = async () => {
    // Setup event listeners
    elements.searchTrailerBtn.addEventListener('click', handlers.handleTrailerSearch);
    elements.searchSongBtn.addEventListener('click', handlers.handleTrackSearch);
    elements.playMixedBtn.addEventListener('click', handlers.handlePlayMixed);
    elements.downloadMixedBtn.addEventListener('click', handlers.handleDownloadMixed);

    elements.startTimeSlider.addEventListener('input', handlers.handleSegmentSliderChange);
    elements.endTimeSlider.addEventListener('input', handlers.handleSegmentSliderChange);
    elements.audioStartSlider.addEventListener('input', handlers.handleSegmentSliderChange);
    elements.audioEndSlider.addEventListener('input', handlers.handleSegmentSliderChange);

    elements.profileBtn.addEventListener('click', handlers.handleProfileClick);
    elements.closeProfileBtn.addEventListener('click', handlers.handleCloseProfile);
    elements.tabButtons.forEach(btn => {
        btn.addEventListener('click', handlers.handleTabSwitch);
    });
    elements.saveCurrentMixBtn.addEventListener('click', handlers.handleSaveCurrentMix);
    
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', auth.logout);
    }

    document.addEventListener('click', (e) => {
        if (e.target.closest('.load-mix-btn')) {
            const mixId = e.target.closest('.load-mix-btn').dataset.id;
            handlers.handleLoadMix(mixId);
        }
        
        if (e.target.closest('.delete-mix-btn')) {
            const mixId = e.target.closest('.delete-mix-btn').dataset.id;
            handlers.handleDeleteMix(mixId);
        }
    });

    // Check authentication state
    await auth.checkSession();

    await auth.checkSession();
if (state.currentUser) {
    handlers.loadUserMixes();
}

    // Initial UI state
    ui.enableMixControls();
    ui.updateTimeLabels();

    // Add style for selection lists
    const styleTag = document.createElement('style');
    styleTag.textContent = `
    .selection-list {
        list-style: none;
        padding-left: 0;
        max-height: 200px;
        overflow-y: auto;
        border: 1px solid #ccc;
        margin: 5px 0;
    }

    .selection-list li {
        padding: 8px 12px;
        border-bottom: 1px solid #eee;
    }

    .selection-list li:hover {
        background-color: #f0f0f0;
    }

    .no-mixes, .error-message {
        text-align: center;
        padding: 1rem;
        color: #aaa;
    }

    .error-message {
        color: #ff6b81;
    }
    `;
    document.head.appendChild(styleTag);

    
};



  
init();