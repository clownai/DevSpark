// Import the dark game theme CSS files
import '../styles/dark-game-theme.css';
import '../styles/monaco-dark-game-theme.css';

// Apply dark game theme to Monaco Editor
function applyMonacoDarkGameTheme() {
  // Define the theme
  monaco.editor.defineTheme('darkGameTheme', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'FF5722', fontStyle: 'bold' },
      { token: 'string', foreground: '00FF9D' },
      { token: 'number', foreground: 'FFAA00' },
      { token: 'function', foreground: '00E5FF' },
      { token: 'variable', foreground: 'FFFFFF' },
      { token: 'type', foreground: '8A2BE2', fontStyle: 'bold' },
      { token: 'constant', foreground: 'FF3D71' },
      { token: 'operator', foreground: 'D4D4D4' },
      { token: 'delimiter', foreground: 'BBBBBB' },
      { token: 'tag', foreground: '569CD6' },
      { token: 'attribute.name', foreground: '9CDCFE' },
      { token: 'attribute.value', foreground: 'CE9178' }
    ],
    colors: {
      'editor.background': '#121212',
      'editor.foreground': '#FFFFFF',
      'editor.lineHighlightBackground': '#8A2BE21A',
      'editor.selectionBackground': '#8A2BE266',
      'editor.inactiveSelectionBackground': '#8A2BE233',
      'editorCursor.foreground': '#00E5FF',
      'editorWhitespace.foreground': '#FFFFFF1A',
      'editorIndentGuide.background': '#8A2BE21A',
      'editorIndentGuide.activeBackground': '#8A2BE280',
      'editor.selectionHighlightBackground': '#8A2BE233',
      'editor.wordHighlightBackground': '#8A2BE233',
      'editor.wordHighlightStrongBackground': '#FF57221A',
      'editor.findMatchBackground': '#FFAA0033',
      'editor.findMatchHighlightBackground': '#FFAA001A',
      'editorBracketMatch.background': '#8A2BE233',
      'editorBracketMatch.border': '#8A2BE2',
      'editorOverviewRuler.border': '#333333',
      'editorOverviewRuler.findMatchForeground': '#FFAA0080',
      'editorOverviewRuler.errorForeground': '#FF3D71',
      'editorOverviewRuler.warningForeground': '#FFAA00',
      'editorOverviewRuler.infoForeground': '#00E5FF',
      'editorError.foreground': '#FF3D71',
      'editorWarning.foreground': '#FFAA00',
      'editorInfo.foreground': '#00E5FF',
      'editorHint.foreground': '#8A2BE2',
      'editorLineNumber.foreground': '#666666',
      'editorLineNumber.activeForeground': '#BBBBBB',
      'editorGutter.background': '#121212',
      'editorGutter.modifiedBackground': '#FFAA00',
      'editorGutter.addedBackground': '#00FF9D',
      'editorGutter.deletedBackground': '#FF3D71',
      'editorWidget.background': '#1E1E1E',
      'editorWidget.border': '#333333',
      'editorSuggestWidget.background': '#1E1E1E',
      'editorSuggestWidget.border': '#333333',
      'editorSuggestWidget.foreground': '#FFFFFF',
      'editorSuggestWidget.highlightForeground': '#00E5FF',
      'editorSuggestWidget.selectedBackground': '#8A2BE233',
      'editorHoverWidget.background': '#1E1E1E',
      'editorHoverWidget.border': '#333333',
      'diffEditor.insertedTextBackground': '#00FF9D1A',
      'diffEditor.removedTextBackground': '#FF3D711A',
      'scrollbar.shadow': '#00000000',
      'scrollbarSlider.background': '#8A2BE233',
      'scrollbarSlider.hoverBackground': '#8A2BE266',
      'scrollbarSlider.activeBackground': '#8A2BE299'
    }
  });

  // Set the theme
  monaco.editor.setTheme('darkGameTheme');
}

// Add game-like UI elements and effects
function addGameLikeEffects() {
  // Add grid background effect to editor
  const editorElement = document.querySelector('.monaco-editor');
  if (editorElement) {
    editorElement.classList.add('game-background');
  }

  // Add glow effects to buttons
  const buttons = document.querySelectorAll('button, .button');
  buttons.forEach(button => {
    button.classList.add('glow-effect');
  });

  // Add terminal scan line effect
  const terminalElements = document.querySelectorAll('.terminal');
  terminalElements.forEach(terminal => {
    terminal.classList.add('scan-effect');
  });

  // Add achievement notification system
  setupAchievementSystem();

  // Add power-up animations for AI suggestions
  setupAIPowerUpEffects();

  // Add sound effects (optional, disabled by default)
  setupSoundEffects(false);
}

// Achievement system
function setupAchievementSystem() {
  const achievements = [
    { id: 'first_code', title: 'First Code', description: 'Wrote your first line of code', icon: '🏆' },
    { id: 'bug_hunter', title: 'Bug Hunter', description: 'Fixed your first error', icon: '🐛' },
    { id: 'code_master', title: 'Code Master', description: 'Wrote 100 lines of code', icon: '⭐' },
    { id: 'ai_friend', title: 'AI Friend', description: 'Used AI assistance for the first time', icon: '🤖' },
    { id: 'git_wizard', title: 'Git Wizard', description: 'Made your first commit', icon: '🧙' },
    { id: 'deployer', title: 'Deployer', description: 'Deployed your first application', icon: '🚀' }
  ];

  // Store unlocked achievements
  let unlockedAchievements = [];

  // Function to unlock an achievement
  window.unlockAchievement = function(achievementId) {
    const achievement = achievements.find(a => a.id === achievementId);
    if (achievement && !unlockedAchievements.includes(achievementId)) {
      unlockedAchievements.push(achievementId);
      showAchievementNotification(achievement);
    }
  };

  // Show achievement notification
  function showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
      <div class="achievement-icon">${achievement.icon}</div>
      <div class="achievement-content">
        <div class="achievement-title">Achievement Unlocked: ${achievement.title}</div>
        <div class="achievement-description">${achievement.description}</div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Play achievement sound if enabled
    playSound('achievement');
    
    // Remove notification after 5 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        notification.remove();
      }, 500);
    }, 5000);
  }
}

// AI power-up effects
function setupAIPowerUpEffects() {
  // Add glow effect when AI is generating suggestions
  const aiAssistant = document.querySelector('.ai-assistant');
  if (aiAssistant) {
    // Add pulse animation when AI is thinking
    window.showAIThinking = function() {
      aiAssistant.classList.add('ai-thinking');
      playSound('ai-thinking');
    };
    
    // Add completion animation when AI provides a suggestion
    window.showAICompletion = function() {
      aiAssistant.classList.remove('ai-thinking');
      aiAssistant.classList.add('ai-completion');
      playSound('ai-completion');
      
      setTimeout(() => {
        aiAssistant.classList.remove('ai-completion');
      }, 1000);
    };
  }
  
  // Highlight code when AI suggests improvements
  window.highlightAISuggestion = function(lineStart, lineEnd) {
    const editor = window.editor; // Assuming editor is globally available
    if (editor) {
      const decoration = {
        range: new monaco.Range(lineStart, 1, lineEnd, 1),
        options: {
          isWholeLine: true,
          className: 'ai-suggestion-highlight',
          glyphMarginClassName: 'ai-suggestion-glyph'
        }
      };
      
      const decorations = editor.deltaDecorations([], [decoration]);
      
      // Remove decoration after a few seconds
      setTimeout(() => {
        editor.deltaDecorations(decorations, []);
      }, 5000);
      
      playSound('suggestion');
    }
  };
}

// Sound effects system
function setupSoundEffects(enabled = false) {
  const sounds = {
    'keypress': 'path/to/sounds/keypress.mp3',
    'achievement': 'path/to/sounds/achievement.mp3',
    'error': 'path/to/sounds/error.mp3',
    'success': 'path/to/sounds/success.mp3',
    'ai-thinking': 'path/to/sounds/ai-thinking.mp3',
    'ai-completion': 'path/to/sounds/ai-completion.mp3',
    'suggestion': 'path/to/sounds/suggestion.mp3'
  };
  
  // Audio context for sound effects
  let audioContext = null;
  let soundBuffers = {};
  let soundEnabled = enabled;
  
  // Initialize audio context
  function initAudio() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Load sound files
      Object.keys(sounds).forEach(soundName => {
        loadSound(soundName, sounds[soundName]);
      });
    }
  }
  
  // Load a sound file
  function loadSound(name, url) {
    if (!audioContext) return;
    
    fetch(url)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
      .then(audioBuffer => {
        soundBuffers[name] = audioBuffer;
      })
      .catch(error => console.error('Error loading sound:', error));
  }
  
  // Play a sound
  window.playSound = function(name) {
    if (!soundEnabled || !audioContext || !soundBuffers[name]) return;
    
    const source = audioContext.createBufferSource();
    source.buffer = soundBuffers[name];
    source.connect(audioContext.destination);
    source.start(0);
  };
  
  // Toggle sound on/off
  window.toggleSound = function() {
    soundEnabled = !soundEnabled;
    return soundEnabled;
  };
  
  // Initialize on user interaction to comply with autoplay policies
  document.addEventListener('click', () => {
    initAudio();
  }, { once: true });
}

// Initialize dark game theme
export function initDarkGameTheme() {
  // Apply the theme to the document
  document.body.classList.add('dark-game-theme');
  
  // Apply Monaco editor theme when editor is loaded
  if (window.monaco) {
    applyMonacoDarkGameTheme();
  } else {
    // If Monaco isn't loaded yet, wait for it
    window.addEventListener('monaco-ready', applyMonacoDarkGameTheme);
  }
  
  // Add game-like UI effects
  addGameLikeEffects();
  
  console.log('Dark Game Theme initialized');
}

// Export theme functions
export default {
  initDarkGameTheme,
  unlockAchievement: (id) => window.unlockAchievement(id),
  showAIThinking: () => window.showAIThinking(),
  showAICompletion: () => window.showAICompletion(),
  highlightAISuggestion: (start, end) => window.highlightAISuggestion(start, end),
  playSound: (name) => window.playSound(name),
  toggleSound: () => window.toggleSound()
};
