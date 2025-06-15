// Interactive Community Features for Burni Token
class CommunityFeatures {
  constructor() {
    this.features = {
      socialFeed: true,
      voting: true,
      leaderboard: true,
      achievements: true,
    };

    this.userStats = this.loadUserStats();
    this.achievements = this.loadAchievements();
    this.votingTopics = this.loadVotingTopics();

    this.init();
  }

  init() {
    this.createCommunityHub();
    this.initSocialFeed();
    this.initVotingSystem();
    this.initAchievements();
    this.trackUserActivity();
  }

  createCommunityHub() {
    const hubHTML = `
      <div id="community-hub" class="fixed bottom-4 left-4 bg-white border border-gray-300 rounded-lg shadow-lg w-80 z-40">
        <div class="bg-gradient-to-r from-orange-500 to-red-500 text-white p-3 rounded-t-lg">
          <div class="flex justify-between items-center">
            <h3 class="font-bold">🔥 Community Hub</h3>
            <div class="flex space-x-1">
              <button id="toggle-community-hub" class="text-white hover:text-gray-200">−</button>
            </div>
          </div>
        </div>
        
        <div id="community-hub-content" class="p-4 max-h-96 overflow-y-auto">
          <!-- Community Stats -->
          <div class="mb-4 bg-gray-50 p-3 rounded">
            <h4 class="font-semibold mb-2">Your Stats</h4>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span class="text-gray-600">Points:</span>
                <span id="user-points" class="font-semibold text-orange-600">${this.userStats.points}</span>
              </div>
              <div>
                <span class="text-gray-600">Level:</span>
                <span id="user-level" class="font-semibold text-purple-600">${this.userStats.level}</span>
              </div>
              <div>
                <span class="text-gray-600">Streak:</span>
                <span id="user-streak" class="font-semibold text-green-600">${this.userStats.streak} days</span>
              </div>
              <div>
                <span class="text-gray-600">Rank:</span>
                <span id="user-rank" class="font-semibold text-blue-600">#${this.userStats.rank}</span>
              </div>
            </div>
          </div>

          <!-- Navigation Tabs -->
          <div class="flex mb-3 border-b">
            <button class="community-tab active px-3 py-1 text-sm border-b-2 border-orange-500" data-tab="feed">Feed</button>
            <button class="community-tab px-3 py-1 text-sm" data-tab="vote">Vote</button>
            <button class="community-tab px-3 py-1 text-sm" data-tab="achievements">Badges</button>
            <button class="community-tab px-3 py-1 text-sm" data-tab="leaderboard">Top</button>
          </div>

          <!-- Feed Tab -->
          <div id="tab-feed" class="community-tab-content">
            <div class="mb-3">
              <textarea id="new-post" placeholder="Share your thoughts about Burni..." class="w-full p-2 border rounded text-sm resize-none" rows="2"></textarea>
              <button id="post-btn" class="mt-1 bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600">Post</button>
            </div>
            <div id="social-feed" class="space-y-2">
              <!-- Posts will be dynamically loaded -->
            </div>
          </div>

          <!-- Voting Tab -->
          <div id="tab-vote" class="community-tab-content hidden">
            <div id="voting-topics" class="space-y-3">
              <!-- Voting topics will be loaded here -->
            </div>
          </div>

          <!-- Achievements Tab -->
          <div id="tab-achievements" class="community-tab-content hidden">
            <div id="achievements-grid" class="grid grid-cols-3 gap-2">
              <!-- Achievement badges will be loaded here -->
            </div>
          </div>

          <!-- Leaderboard Tab -->
          <div id="tab-leaderboard" class="community-tab-content hidden">
            <div id="leaderboard-list" class="space-y-2">
              <!-- Leaderboard will be loaded here -->
            </div>
          </div>
        </div>

        <!-- Achievement Notification -->
        <div id="achievement-notification" class="hidden fixed bottom-20 left-4 bg-yellow-100 border border-yellow-300 rounded-lg p-3 w-80 shadow-lg">
          <div class="flex items-center space-x-2">
            <span class="text-2xl">🏆</span>
            <div>
              <div class="font-semibold text-yellow-800">Achievement Unlocked!</div>
              <div id="achievement-text" class="text-sm text-yellow-700"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', hubHTML);
    this.setupEventListeners();
    this.loadCommunityContent();
  }

  setupEventListeners() {
    // Toggle hub
    document.getElementById('toggle-community-hub').addEventListener('click', () => {
      const content = document.getElementById('community-hub-content');
      const button = document.getElementById('toggle-community-hub');
      if (content.style.display === 'none') {
        content.style.display = 'block';
        button.textContent = '−';
      } else {
        content.style.display = 'none';
        button.textContent = '+';
      }
    });

    // Tab navigation
    document.querySelectorAll('.community-tab').forEach((tab) => {
      tab.addEventListener('click', (e) => {
        const tabName = e.target.dataset.tab;
        this.switchTab(tabName);
      });
    });

    // Post button
    document.getElementById('post-btn').addEventListener('click', () => {
      this.createPost();
    });

    // Enter key for posting
    document.getElementById('new-post').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        this.createPost();
      }
    });
  }

  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.community-tab').forEach((tab) => {
      tab.classList.remove('active', 'border-b-2', 'border-orange-500');
    });
    document
      .querySelector(`[data-tab="${tabName}"]`)
      .classList.add('active', 'border-b-2', 'border-orange-500');

    // Show/hide content
    document.querySelectorAll('.community-tab-content').forEach((content) => {
      content.classList.add('hidden');
    });
    document.getElementById(`tab-${tabName}`).classList.remove('hidden');

    // Load content if needed
    this.loadTabContent(tabName);
  }

  loadTabContent(tabName) {
    switch (tabName) {
      case 'vote':
        this.renderVotingTopics();
        break;
      case 'achievements':
        this.renderAchievements();
        break;
      case 'leaderboard':
        this.renderLeaderboard();
        break;
    }
  }

  initSocialFeed() {
    this.posts = this.loadPosts();
    this.renderSocialFeed();
  }

  loadPosts() {
    const saved = localStorage.getItem('community_posts');
    if (saved) {
      return JSON.parse(saved);
    }

    // Sample posts
    return [
      {
        id: 1,
        user: 'BurniEnthusiast',
        content: 'Just bought more BURNI! The burning mechanism is genius! 🔥',
        timestamp: Date.now() - 3600000,
        likes: 12,
        replies: 3,
      },
      {
        id: 2,
        user: 'CryptoTrader99',
        content: 'Love how transparent the tokenomics are. This is the future! 🚀',
        timestamp: Date.now() - 7200000,
        likes: 8,
        replies: 1,
      },
    ];
  }

  createPost() {
    const textarea = document.getElementById('new-post');
    const content = textarea.value.trim();

    if (!content) return;

    const post = {
      id: Date.now(),
      user: 'You',
      content,
      timestamp: Date.now(),
      likes: 0,
      replies: 0,
    };

    this.posts.unshift(post);
    this.savePosts();
    this.renderSocialFeed();

    textarea.value = '';

    // Award points for posting
    this.addUserPoints(10, 'Posted to community feed');
  }

  renderSocialFeed() {
    const container = document.getElementById('social-feed');
    if (!container) return;

    container.innerHTML = this.posts
      .slice(0, 5)
      .map(
        (post) => `
      <div class="post border rounded p-2 bg-gray-50">
        <div class="flex justify-between items-start mb-1">
          <span class="font-semibold text-sm text-orange-600">${post.user}</span>
          <span class="text-xs text-gray-500">${this.formatTime(post.timestamp)}</span>
        </div>
        <p class="text-sm mb-2">${post.content}</p>
        <div class="flex space-x-3 text-xs text-gray-600">
          <button onclick="window.communityFeatures.likePost(${post.id})" class="hover:text-red-500">
            ❤️ ${post.likes}
          </button>
          <span>💬 ${post.replies}</span>
        </div>
      </div>
    `,
      )
      .join('');
  }

  likePost(postId) {
    const post = this.posts.find((p) => p.id === postId);
    if (post) {
      post.likes++;
      this.savePosts();
      this.renderSocialFeed();
      this.addUserPoints(2, 'Liked a post');
    }
  }

  savePosts() {
    localStorage.setItem('community_posts', JSON.stringify(this.posts));
  }

  initVotingSystem() {
    this.renderVotingTopics();
  }

  loadVotingTopics() {
    const saved = localStorage.getItem('voting_topics');
    if (saved) {
      return JSON.parse(saved);
    }

    return [
      {
        id: 1,
        title: 'Should we implement a staking mechanism?',
        description: 'Vote on whether Burni should introduce token staking for rewards',
        options: [
          { id: 'yes', text: 'Yes, implement staking', votes: 45 },
          { id: 'no', text: 'No, keep it simple', votes: 12 },
        ],
        userVoted: null,
        endDate: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      },
      {
        id: 2,
        title: 'Next community feature priority?',
        description: 'What should we build next for the community?',
        options: [
          { id: 'nft', text: 'NFT Marketplace', votes: 28 },
          { id: 'games', text: 'Community Games', votes: 33 },
          { id: 'rewards', text: 'Loyalty Rewards', votes: 19 },
        ],
        userVoted: null,
        endDate: Date.now() + 5 * 24 * 60 * 60 * 1000, // 5 days
      },
    ];
  }

  renderVotingTopics() {
    const container = document.getElementById('voting-topics');
    if (!container) return;

    container.innerHTML = this.votingTopics
      .map((topic) => {
        const totalVotes = topic.options.reduce((sum, option) => sum + option.votes, 0);
        const isActive = Date.now() < topic.endDate;

        return `
        <div class="voting-topic border rounded p-3 ${isActive ? 'bg-white' : 'bg-gray-100'}">
          <h5 class="font-semibold mb-1">${topic.title}</h5>
          <p class="text-xs text-gray-600 mb-3">${topic.description}</p>
          
          <div class="space-y-2">
            ${topic.options
              .map((option) => {
                const percentage =
                  totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
                const isVoted = topic.userVoted === option.id;

                return `
                <div class="voting-option">
                  <button 
                    onclick="window.communityFeatures.vote(${topic.id}, '${option.id}')"
                    class="w-full text-left p-2 border rounded text-sm transition-colors
                           ${isVoted ? 'bg-orange-100 border-orange-300' : 'hover:bg-gray-50'}
                           ${!isActive ? 'cursor-not-allowed opacity-60' : ''}"
                    ${!isActive ? 'disabled' : ''}
                  >
                    <div class="flex justify-between items-center">
                      <span>${option.text}</span>
                      <span class="text-xs text-gray-500">${option.votes} votes (${percentage}%)</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-1 mt-1">
                      <div class="bg-orange-500 h-1 rounded-full transition-all" style="width: ${percentage}%"></div>
                    </div>
                  </button>
                </div>
              `;
              })
              .join('')}
          </div>
          
          <div class="text-xs text-gray-500 mt-2">
            ${isActive ? `Ends: ${new Date(topic.endDate).toLocaleDateString()}` : 'Voting ended'}
          </div>
        </div>
      `;
      })
      .join('');
  }

  vote(topicId, optionId) {
    const topic = this.votingTopics.find((t) => t.id === topicId);
    if (!topic || Date.now() >= topic.endDate || topic.userVoted) return;

    const option = topic.options.find((o) => o.id === optionId);
    if (option) {
      option.votes++;
      topic.userVoted = optionId;

      localStorage.setItem('voting_topics', JSON.stringify(this.votingTopics));
      this.renderVotingTopics();

      this.addUserPoints(25, `Voted on: ${topic.title}`);
    }
  }

  initAchievements() {
    this.checkAchievements();
  }

  loadAchievements() {
    const saved = localStorage.getItem('user_achievements');
    if (saved) {
      return JSON.parse(saved);
    }

    return {
      unlocked: [],
      available: [
        {
          id: 'first_visit',
          name: 'Welcome!',
          description: 'First visit to Burni',
          icon: '👋',
          points: 10,
        },
        {
          id: 'social_butterfly',
          name: 'Social Butterfly',
          description: 'Post 5 times',
          icon: '🦋',
          points: 50,
        },
        {
          id: 'voter',
          name: 'Democratic',
          description: 'Vote on 3 topics',
          icon: '🗳️',
          points: 75,
        },
        {
          id: 'streak_7',
          name: 'Week Warrior',
          description: '7-day streak',
          icon: '⚡',
          points: 100,
        },
        {
          id: 'point_collector',
          name: 'Point Collector',
          description: 'Earn 500 points',
          icon: '💎',
          points: 200,
        },
        {
          id: 'community_leader',
          name: 'Community Leader',
          description: 'Reach level 5',
          icon: '👑',
          points: 500,
        },
      ],
    };
  }

  renderAchievements() {
    const container = document.getElementById('achievements-grid');
    if (!container) return;

    container.innerHTML = this.achievements.available
      .map((achievement) => {
        const isUnlocked = this.achievements.unlocked.includes(achievement.id);

        return `
        <div class="achievement text-center p-2 border rounded ${isUnlocked ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-50 border-gray-200'}">
          <div class="text-2xl mb-1 ${isUnlocked ? '' : 'grayscale opacity-50'}">${achievement.icon}</div>
          <div class="text-xs font-semibold ${isUnlocked ? 'text-yellow-800' : 'text-gray-600'}">${achievement.name}</div>
          <div class="text-xs text-gray-500">${achievement.points}pts</div>
        </div>
      `;
      })
      .join('');
  }

  checkAchievements() {
    const stats = this.userStats;
    const newlyUnlocked = [];

    // Check each achievement
    this.achievements.available.forEach((achievement) => {
      if (this.achievements.unlocked.includes(achievement.id)) return;

      let shouldUnlock = false;

      switch (achievement.id) {
        case 'first_visit':
          shouldUnlock = true;
          break;
        case 'social_butterfly':
          shouldUnlock = this.posts.filter((p) => p.user === 'You').length >= 5;
          break;
        case 'voter':
          shouldUnlock = this.votingTopics.filter((t) => t.userVoted).length >= 3;
          break;
        case 'streak_7':
          shouldUnlock = stats.streak >= 7;
          break;
        case 'point_collector':
          shouldUnlock = stats.points >= 500;
          break;
        case 'community_leader':
          shouldUnlock = stats.level >= 5;
          break;
      }

      if (shouldUnlock) {
        this.achievements.unlocked.push(achievement.id);
        newlyUnlocked.push(achievement);
        this.addUserPoints(achievement.points, `Achievement: ${achievement.name}`);
      }
    });

    if (newlyUnlocked.length > 0) {
      localStorage.setItem('user_achievements', JSON.stringify(this.achievements));
      this.showAchievementNotification(newlyUnlocked[0]);
    }
  }

  showAchievementNotification(achievement) {
    const notification = document.getElementById('achievement-notification');
    const text = document.getElementById('achievement-text');

    if (notification && text) {
      text.textContent = achievement.name;
      notification.classList.remove('hidden');

      setTimeout(() => {
        notification.classList.add('hidden');
      }, 5000);
    }
  }

  renderLeaderboard() {
    const container = document.getElementById('leaderboard-list');
    if (!container) return;

    // Mock leaderboard data
    const leaderboard = [
      { rank: 1, user: 'BurniMaster', points: 2450, level: 8 },
      { rank: 2, user: 'TokenBurner', points: 1980, level: 7 },
      { rank: 3, user: 'CryptoFire', points: 1567, level: 6 },
      { rank: 4, user: 'You', points: this.userStats.points, level: this.userStats.level },
      { rank: 5, user: 'HODLer2024', points: 1234, level: 5 },
    ];

    container.innerHTML = leaderboard
      .map(
        (entry) => `
      <div class="leaderboard-entry flex justify-between items-center p-2 rounded ${entry.user === 'You' ? 'bg-orange-100' : 'bg-gray-50'}">
        <div class="flex items-center space-x-2">
          <span class="font-bold text-lg ${entry.rank <= 3 ? 'text-yellow-600' : 'text-gray-600'}">#${entry.rank}</span>
          <span class="font-semibold ${entry.user === 'You' ? 'text-orange-600' : ''}">${entry.user}</span>
        </div>
        <div class="text-right text-sm">
          <div class="font-semibold">${entry.points.toLocaleString()} pts</div>
          <div class="text-gray-500">Level ${entry.level}</div>
        </div>
      </div>
    `,
      )
      .join('');
  }

  loadUserStats() {
    const saved = localStorage.getItem('user_stats');
    if (saved) {
      return JSON.parse(saved);
    }

    return {
      points: 0,
      level: 1,
      streak: 1,
      rank: 156,
      lastActivity: Date.now(),
    };
  }

  addUserPoints(points, reason) {
    this.userStats.points += points;

    // Calculate level (every 100 points = 1 level)
    this.userStats.level = Math.floor(this.userStats.points / 100) + 1;

    // Update UI
    this.updateUserStatsUI();
    this.saveUserStats();

    // Check for new achievements
    this.checkAchievements();

    console.log(`+${points} points: ${reason}`);
  }

  updateUserStatsUI() {
    const pointsEl = document.getElementById('user-points');
    const levelEl = document.getElementById('user-level');

    if (pointsEl) pointsEl.textContent = this.userStats.points;
    if (levelEl) levelEl.textContent = this.userStats.level;
  }

  saveUserStats() {
    localStorage.setItem('user_stats', JSON.stringify(this.userStats));
  }

  trackUserActivity() {
    // Track various user activities
    document.addEventListener('click', () => {
      this.userStats.lastActivity = Date.now();
    });

    // Update streak daily
    const lastCheck = localStorage.getItem('last_streak_check');
    const today = new Date().toDateString();

    if (lastCheck !== today) {
      this.userStats.streak++;
      localStorage.setItem('last_streak_check', today);
      this.saveUserStats();
    }
  }

  loadCommunityContent() {
    // Initial load of all tabs
    this.renderSocialFeed();
    this.updateUserStatsUI();
  }

  formatTime(timestamp) {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }
}

// Initialize community features
window.communityFeatures = new CommunityFeatures();

// Keyboard shortcut to toggle community hub (Ctrl+Shift+C)
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'C') {
    const hub = document.getElementById('community-hub');
    if (hub) {
      hub.style.display = hub.style.display === 'none' ? 'block' : 'none';
    }
  }
});

export default CommunityFeatures;
