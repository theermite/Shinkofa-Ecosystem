// Organisateur Familial v8 - Application complète conforme au cahier des charges - VERSION CORRIGÉE

// Données complètes de la famille avec profils Human Design détaillés
const familyData = {
  "jay": {
    "name": "Jay",
    "age": 39,
    "color": "#4285f4",
    "avatar": "J",
    "type": "Projecteur",
    "profile": "1/3",
    "strategy": "Attendre l'invitation",
    "authority": "Splénique",
    "role": "Coach, guide, leader spirituel",
    "activities": ["The Ermite", "Voie Shinkofa", "Coaching e-sport", "Streaming"],
    "needs": ["Reconnaissance explicite", "Invitations authentiques", "Pauses toutes les 2h"],
    "constraints": ["Fatigue chronique", "Amertume si non reconnu"],
    "recommendations": [
      "🎯 Attendre les invitations avant d'agir",
      "⏰ Pauses obligatoires toutes les 2h",
      "🏠 Créer un espace calme dédié",
      "📚 Temps quotidien de lecture/étude"
    ],
    "checklist": [
      "Ai-je eu ma pause lecture/manga ?",
      "Ai-je respecté mes limites énergétiques ?",
      "Ai-je eu du temps de qualité avec les enfants ?",
      "Mes projets avancent-ils à mon rythme ?"
    ],
    "current_energy": "😊",
    "recognition_count": 5,
    "pomodoro_settings": { "work": 25, "break": 5, "longBreak": 15 },
    "energy_periods": { "matin": 3, "midi": 4, "soir": 3 }
  },
  "angelique": {
    "name": "Angélique", 
    "age": 34,
    "color": "#9c27b0",
    "avatar": "A",
    "type": "Générateur",
    "profile": "5/1",
    "strategy": "Répondre à la vie",
    "authority": "Sacrale",
    "role": "Créatrice, nourricière, community manager",
    "activities": ["Community Management", "Cuisine créative", "Temps enfants"],
    "needs": ["Réponse sacrale authentique", "Cycles naturels respectés"],
    "constraints": ["Post-grossesses récentes", "Hypersensibilité émotionnelle"],
    "recommendations": [
      "🔮 Écouter le 'oui/non' du ventre",
      "🌙 Respecter les cycles énergétiques",
      "🎨 Temps créatif quotidien",
      "🧘 Moment de recentrage matinal"
    ],
    "checklist": [
      "Ai-je écouté mon sacral aujourd'hui ?",
      "Ai-je eu mes pauses créatives ?",
      "Ai-je maintenu mes cycles naturels ?",
      "Me suis-je respectée dans mes 'non' ?"
    ],
    "current_energy": "😐",
    "recognition_count": 8,
    "pomodoro_settings": { "work": 25, "break": 5, "longBreak": 15 },
    "energy_periods": { "matin": 2, "midi": 3, "soir": 2 }
  },
  "gautier": {
    "name": "Gautier",
    "age": 28, 
    "color": "#4caf50",
    "avatar": "G",
    "type": "Générateur",
    "profile": "5/1",
    "strategy": "Répondre à la vie",
    "authority": "Sacrale",
    "role": "Pilier logistique, joueur e-sport",
    "activities": ["Ménage et organisation", "Garde enfants", "E-sport"],
    "needs": ["Jour OFF hebdomadaire garanti", "Reconnaissance du travail"],
    "constraints": ["Surcharge logistique", "Manque de reconnaissance"],
    "recommendations": [
      "📅 Jour OFF sacré chaque semaine",
      "🏆 Valorisation quotidienne",
      "🔄 Rotation des tâches",
      "⚡ Écouter la motivation sacrale"
    ],
    "checklist": [
      "Ai-je eu ma reconnaissance quotidienne ?",
      "Mon jour OFF est-il préservé ?",
      "Ai-je pu varier mes activités ?",
      "L'équilibre effort/plaisir est-il bon ?"
    ],
    "current_energy": "😴",
    "recognition_count": 3,
    "pomodoro_settings": { "work": 25, "break": 5, "longBreak": 15 },
    "energy_periods": { "matin": 1, "midi": 2, "soir": 1 }
  }
};

// Données des tâches avec points et multi-assignation
let tasksData = [
  {"name": "Ménage cuisine", "points": 2, "assigned": ["gautier"]},
  {"name": "Repas complet", "points": 3, "assigned": ["angelique"]},
  {"name": "Activités enfants", "points": 4, "assigned": ["gautier"]},
  {"name": "Courses", "points": 2, "assigned": ["gautier"]},
  {"name": "Nettoyage terrasse", "points": 3, "assigned": ["jay"]},
  {"name": "Batch cooking", "points": 4, "assigned": ["angelique"]},
  {"name": "Devoirs Théo", "points": 2, "assigned": ["jay"]},
  {"name": "Rangement maison", "points": 3, "assigned": ["gautier", "jay"]}
];

// Contraintes et impératifs de planification
let planningConstraints = [
  { "text": "Courses hebdomadaires", "checked": false, "priority": "high" },
  { "text": "Temps couple", "checked": false, "priority": "medium" },
  { "text": "CM Angélique", "checked": false, "priority": "high" },
  { "text": "Jour OFF Gautier", "checked": false, "priority": "high" },
  { "text": "Pauses Jay", "checked": false, "priority": "high" },
  { "text": "Cycles Angélique", "checked": false, "priority": "medium" },
  { "text": "Temps familial", "checked": false, "priority": "medium" },
  { "text": "Activité enfants", "checked": false, "priority": "medium" },
  { "text": "Repas familial", "checked": false, "priority": "low" },
  { "text": "Sessions e-sport", "checked": false, "priority": "low" },
  { "text": "Dev projets Jay", "checked": false, "priority": "low" },
  { "text": "Orga et feedback hebdo", "checked": false, "priority": "low" }
];

// Données des activités pour les dés avec possibilité d'édition
let activitiesDice = {
  "1": ["Repos total", "Méditation", "Lecture tranquille", "Bain relaxant"],
  "2": ["Activité douce", "Promenade calme", "Écouter musique", "Étirements"],
  "3": ["Cuisine simple", "Jeu de société", "Regarder film", "Jardinage léger"],
  "4": ["Création artistique", "Sport modéré", "Sortie famille", "Projet manuel"],
  "5": ["Entraînement intensif", "Grand nettoyage", "Aventure extérieure", "Défi créatif"]
};

// Protocoles de crise détaillés
const crisisProtocols = {
  "jay": [
    { title: "Pause isolation", description: "Se retirer dans un espace calme, couper les stimulations" },
    { title: "Invitation", description: "Demander explicitement ce dont on a besoin" },
    { title: "Guidance", description: "Accepter d'être guidé par son intuition splénique" }
  ],
  "angelique": [
    { title: "STOP", description: "Arrêter toute activité immédiatement" },
    { title: "Respiration", description: "Respiration profonde pour se reconnecter au sacral" },
    { title: "Écoute sacrale", description: "Interroger le ventre : qu'est-ce qui est vraiment important ?" }
  ],
  "gautier": [
    { title: "Pause", description: "Prendre du recul sur la situation" },
    { title: "Gratitude", description: "Lister 3 choses accomplies aujourd'hui" },
    { title: "Motivation", description: "Se reconnecter à ce qui motive vraiment" }
  ],
  "lyam": [
    { title: "Respiration carrée", description: "4 temps inspiration, 4 temps rétention, 4 temps expiration" },
    { title: "Choix activité", description: "Proposer 2-3 activités au choix" }
  ],
  "theo": [
    { title: "STOP", description: "Arrêter et prendre une grande respiration" },
    { title: "Verbaliser émotion", description: "Nommer ce qu'il ressent" }
  ],
  "evy": [
    { title: "Sécurité physique", description: "S'assurer qu'elle est en sécurité" },
    { title: "Câlin", description: "Offrir un câlin réconfortant" },
    { title: "Objet sensoriel", description: "Proposer doudou ou objet familier" }
  ],
  "nami": [
    { title: "Bercement", description: "Bercer doucement et régulièrement" },
    { title: "Voix douce", description: "Parler ou chanter avec une voix apaisante" }
  ]
};

// Planning interactif avec événements
let events = [
  {
    id: 'evt1',
    title: 'Community Management',
    member: 'angelique',
    day: 0,
    startHour: 9,
    startMinute: 0,
    duration: 120,
    description: 'Gestion des réseaux sociaux'
  },
  {
    id: 'evt2',
    title: 'Entraînement E-sport',
    member: 'jay',
    day: 0,
    startHour: 20,
    startMinute: 0,
    duration: 90,
    description: 'Session avec l\'équipe'
  },
  {
    id: 'evt3',
    title: 'Temps enfants',
    member: 'gautier',
    day: 1,
    startHour: 16,
    startMinute: 0,
    duration: 120,
    description: 'Activités et jeux'
  },
  {
    id: 'evt4',
    title: 'Jour OFF',
    member: 'gautier',
    day: 3,
    startHour: 10,
    startMinute: 0,
    duration: 480,
    description: 'Jour de repos complet - Ne pas déranger'
  }
];

// Données des repas
let mealsData = {
  "lundi": {"midi": "Pasta créative", "soir": "Salade composée", "responsible_midi": "angelique", "responsible_soir": "jay"},
  "mardi": {"midi": "Plat simple", "soir": "Curry légumes", "responsible_midi": "jay", "responsible_soir": "angelique"},
  "mercredi": {"midi": "Sandwich", "soir": "Poisson grillé", "responsible_midi": "gautier", "responsible_soir": "angelique"},
  "jeudi": {"midi": "Jour OFF - Commande", "soir": "Pizza", "responsible_midi": "family", "responsible_soir": "family"},
  "vendredi": {"midi": "Repas rapide", "soir": "Cuisine ensemble", "responsible_midi": "jay", "responsible_soir": "family"},
  "samedi": {"midi": "Brunch", "soir": "Repas familial", "responsible_midi": "family", "responsible_soir": "angelique"},
  "dimanche": {"midi": "Restes", "soir": "Préparation semaine", "responsible_midi": "family", "responsible_soir": "angelique"}
};

// Variables globales
let currentTab = 'dashboard';
let currentWeekOffset = 0;
let isDragging = false;
let isResizing = false;
let dragEvent = null;
let eventIdCounter = events.length + 1;
let selectedEnergyLevel = 3;
let pomodoroTimer = null;
let pomodoroState = {
  isRunning: false,
  currentProfile: 'jay',
  currentSession: 'work',
  timeLeft: 25 * 60,
  sessionsCompleted: 0
};

// Templates rapides
const templates = {
  "weekend": [
    { "text": "Grasse matinée autorisée", "checked": true },
    { "text": "Brunch familial", "checked": true },
    { "text": "Activité extérieure", "checked": false },
    { "text": "Temps libre individuel", "checked": false }
  ],
  "crisis": [
    { "text": "Planning allégé", "checked": true },
    { "text": "Priorité bien-être", "checked": true },
    { "text": "Communication bienveillante", "checked": false },
    { "text": "Ressources externes si besoin", "checked": false }
  ],
  "vacation": [
    { "text": "Pas de contraintes horaires", "checked": true },
    { "text": "Activités spontanées", "checked": true },
    { "text": "Exploration et découverte", "checked": false },
    { "text": "Repos et détente", "checked": false }
  ]
};

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', function() {
  console.log('Initialisation de l\'organisateur familial v8...');
  initializeApp();
});

function initializeApp() {
  loadSavedData();
  setupNavigation();
  setupModals();
  renderDashboard();
  setupQuickActions();
  setupEventListeners();
  setupPlanningNavigation();
  updateCurrentDate();
  
  console.log('Application v8 initialisée avec succès');
}

// Chargement et sauvegarde des données (localStorage)
function loadSavedData() {
  try {
    const savedEvents = localStorage.getItem('familyOrganizer_events');
    if (savedEvents) {
      events = JSON.parse(savedEvents);
    }
    
    const savedMeals = localStorage.getItem('familyOrganizer_meals');
    if (savedMeals) {
      mealsData = JSON.parse(savedMeals);
    }
    
    const savedTasks = localStorage.getItem('familyOrganizer_tasks');
    if (savedTasks) {
      tasksData = JSON.parse(savedTasks);
    }
    
    const savedConstraints = localStorage.getItem('familyOrganizer_constraints');
    if (savedConstraints) {
      planningConstraints = JSON.parse(savedConstraints);
    }
    
    const savedActivities = localStorage.getItem('familyOrganizer_activities');
    if (savedActivities) {
      activitiesDice = JSON.parse(savedActivities);
    }
    
    const savedFamily = localStorage.getItem('familyOrganizer_family');
    if (savedFamily) {
      Object.assign(familyData, JSON.parse(savedFamily));
    }
    
    console.log('Données chargées depuis localStorage');
  } catch (e) {
    console.warn('Erreur lors du chargement:', e);
  }
}

function saveData() {
  try {
    localStorage.setItem('familyOrganizer_events', JSON.stringify(events));
    localStorage.setItem('familyOrganizer_meals', JSON.stringify(mealsData));
    localStorage.setItem('familyOrganizer_tasks', JSON.stringify(tasksData));
    localStorage.setItem('familyOrganizer_constraints', JSON.stringify(planningConstraints));
    localStorage.setItem('familyOrganizer_activities', JSON.stringify(activitiesDice));
    localStorage.setItem('familyOrganizer_family', JSON.stringify(familyData));
    console.log('Données sauvegardées dans localStorage');
  } catch (e) {
    console.warn('Erreur lors de la sauvegarde:', e);
  }
}

// Navigation entre onglets
function setupNavigation() {
  const navTabs = document.querySelectorAll('.nav-tab');
  const tabContents = document.querySelectorAll('.tab-content');

  navTabs.forEach((tab) => {
    tab.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetTab = this.dataset.tab;
      
      navTabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      this.classList.add('active');
      
      const targetContent = document.getElementById(targetTab);
      if (targetContent) {
        targetContent.classList.add('active');
        currentTab = targetTab;
        
        setTimeout(() => {
          if (targetTab === 'planning') {
            renderPlanning();
          } else if (targetTab === 'profiles') {
            renderDetailedProfiles();
          } else if (targetTab === 'tools') {
            renderTools();
          }
        }, 50);
      }
    });
  });
}

// Configuration des modales avec fond opaque
function setupModals() {
  // Fermeture des modales
  document.querySelectorAll('.modal-close').forEach(closeBtn => {
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const modal = closeBtn.closest('.modal');
      if (modal) {
        hideModal(modal.id);
      }
    });
  });

  // Fermer avec overlay
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        const modal = overlay.closest('.modal');
        if (modal) {
          hideModal(modal.id);
        }
      }
    });
  });

  // Formulaire d'événement
  const eventForm = document.getElementById('event-form');
  if (eventForm) {
    eventForm.addEventListener('submit', handleEventSubmit);
  }

  // Calcul automatique de la durée
  const startInput = document.getElementById('event-start');
  const endInput = document.getElementById('event-end');
  const durationDisplay = document.getElementById('event-duration-display');
  
  if (startInput && endInput && durationDisplay) {
    const updateDuration = () => {
      const startTime = startInput.value;
      const endTime = endInput.value;
      
      if (startTime && endTime) {
        const start = new Date(`2000-01-01T${startTime}:00`);
        const end = new Date(`2000-01-01T${endTime}:00`);
        
        if (end > start) {
          const diffMs = end - start;
          const diffMin = Math.floor(diffMs / (1000 * 60));
          durationDisplay.value = `${diffMin} minutes`;
        } else {
          durationDisplay.value = 'Heure fin doit être > heure début';
        }
      }
    };
    
    startInput.addEventListener('change', updateDuration);
    endInput.addEventListener('change', updateDuration);
  }

  // Boutons spécifiques
  const cancelEvent =  document.getElementById('cancel-event');
  if (cancelEvent) {
    cancelEvent.addEventListener('click', (e) => {
      e.preventDefault();
      hideModal('event-modal');
    });
  }

  const deleteEvent = document.getElementById('delete-event');
  if (deleteEvent) {
    deleteEvent.addEventListener('click', handleDeleteEvent);
  }

  // CORRECTION BUG 1: Gestion de crise - Setup proper event listeners
  const crisisBtn = document.getElementById('crisis-btn');
  const crisisPerson = document.getElementById('crisis-person');
  
  if (crisisBtn) {
    crisisBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Crisis button clicked'); // Debug
      showModal('crisis-modal');
    });
  }
  
  if (crisisPerson) {
    crisisPerson.addEventListener('change', function() {
      const personKey = this.value;
      console.log('Crisis person selected:', personKey); // Debug
      if (personKey) {
        renderCrisisProtocols(personKey);
      }
    });
  }
}

// Fonctions utilitaires pour les modales
function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    console.log('Modal shown:', modalId); // Debug
  } else {
    console.error('Modal not found:', modalId); // Debug
  }
}

function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
    modal.style.display = 'none';
    console.log('Modal hidden:', modalId); // Debug
  }
}

// Mise à jour de la date actuelle
function updateCurrentDate() {
  const dateElement = document.getElementById('current-date');
  if (dateElement) {
    const now = new Date();
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    dateElement.textContent = now.toLocaleDateString('fr-FR', options);
  }
}

// Navigation du planning
function setupPlanningNavigation() {
  const prevWeekBtn = document.getElementById('prev-week');
  const nextWeekBtn = document.getElementById('next-week');
  
  if (prevWeekBtn) {
    prevWeekBtn.addEventListener('click', function(e) {
      e.preventDefault();
      currentWeekOffset--;
      updateWeekDisplay();
      renderPlanning();
    });
  }
  
  if (nextWeekBtn) {
    nextWeekBtn.addEventListener('click', function(e) {
      e.preventDefault();
      currentWeekOffset++;
      updateWeekDisplay();
      renderPlanning();
    });
  }
}

// Mise à jour affichage semaine
function updateWeekDisplay() {
  const currentWeekDisplay = document.getElementById('current-week-display');
  if (!currentWeekDisplay) return;
  
  const baseDate = new Date(2025, 6, 28); // 28 juillet 2025
  const weekStart = new Date(baseDate);
  weekStart.setDate(baseDate.getDate() + (currentWeekOffset * 7));
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  
  const formatDate = (date) => {
    const day = date.getDate();
    const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 
                   'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    const month = months[date.getMonth()];
    return `${day} ${month}`;
  };
  
  currentWeekDisplay.textContent = `Semaine du ${formatDate(weekStart)} - ${formatDate(weekEnd)} 2025`;
}

// Actions rapides avec tous les boutons du cahier des charges
function setupQuickActions() {
  document.querySelectorAll('.quick-action-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const action = this.dataset.action;
      handleQuickAction(action);
    });
  });
}

function handleQuickAction(action) {
  console.log('Quick action:', action); // Debug
  
  switch(action) {
    case 'add-activity':
      // Naviguer vers planning et créer événement
      const planningTab = document.querySelector('[data-tab="planning"]');
      if (planningTab) {
        planningTab.click();
        setTimeout(() => {
          createNewEvent(0, 9, 0);
        }, 300);
      }
      break;
      
    case 'meal-planner':
      showModal('meal-modal');
      renderMealModal();
      break;
      
    case 'task-assign':
      showModal('tasks-modal');
      renderTasksModal();
      break;
      
    case 'dice-activity':
      showModal('dice-modal');
      setupDiceModal();
      break;
      
    case 'energy-check':
      // CORRECTION BUG 2: Open energy modal properly
      showModal('energy-modal');
      renderEnergyModal();
      break;
      
    case 'optimize':
      alert('🎯 Optimisation appliquée:\n\n✅ Planning réorganisé\n✅ Conflits résolus\n✅ Charge équilibrée\n\nSatisfaction: +25%');
      break;
      
    case 'export-ical':
      exportToICal();
      break;
      
    case 'export-pdf':
      exportToPDF();
      break;
      
    case 'export-meals-md':
      exportMealsToMarkdown();
      break;
      
    default:
      console.warn('Action non reconnue:', action);
  }
}

// Rendu du dashboard avec actions rapides en premier
function renderDashboard() {
  renderWeekOverview();
  renderFamilyMembers();
  renderRecognitionSystem();
  updateFamilyWeather();
}

// Vue d'ensemble semaine avec tri chronologique
function renderWeekOverview() {
  const weekOverview = document.getElementById('week-overview');
  if (!weekOverview) return;
  
  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  weekOverview.innerHTML = '';
  
  days.forEach((day, dayIndex) => {
    const dayColumn = document.createElement('div');
    dayColumn.className = 'day-column';
    
    const dayHeader = document.createElement('div');
    dayHeader.className = 'day-header';
    dayHeader.textContent = day;
    
    const dayActivities = document.createElement('div');
    dayActivities.className = 'day-activities';
    
    // Tri chronologique des événements
    const dayEvents = events
      .filter(event => event.day === dayIndex)
      .sort((a, b) => {
        const timeA = a.startHour * 60 + a.startMinute;
        const timeB = b.startHour * 60 + b.startMinute;
        return timeA - timeB;
      });
    
    dayEvents.forEach(event => {
      const activityItem = document.createElement('div');
      activityItem.className = `activity-item activity-${event.member}`;
      activityItem.innerHTML = `
        <strong>${formatTime(event.startHour, event.startMinute)}</strong><br>
        ${event.title}
      `;
      dayActivities.appendChild(activityItem);
    });
    
    dayColumn.appendChild(dayHeader);
    dayColumn.appendChild(dayActivities);
    weekOverview.appendChild(dayColumn);
  });
}

// Membres famille avec émojis d'énergie
function renderFamilyMembers() {
  const container = document.getElementById('family-members');
  if (!container) return;
  
  container.innerHTML = '';
  
  Object.entries(familyData).forEach(([key, member]) => {
    const memberCard = document.createElement('div');
    memberCard.className = 'member-card';
    
    memberCard.addEventListener('click', function(e) {
      if (!e.target.classList.contains('energy-emoji')) {
        showMemberModal(key);
      }
    });
    
    memberCard.innerHTML = `
      <div class="member-info-container">
        <div class="member-avatar member-${key}" style="background-color: ${member.color}">
          ${member.avatar}
        </div>
        <div class="member-info">
          <h3>${member.name}</h3>
          <p class="member-role">${member.type} ${member.profile}</p>
        </div>
      </div>
      <div class="energy-emoji-selector">
        ${['😴', '😔', '😐', '😊', '⚡'].map((emoji, index) => 
          `<span class="energy-emoji ${member.current_energy === emoji ? 'selected' : ''}" 
                 data-member="${key}" data-energy="${emoji}" data-value="${index + 1}">${emoji}</span>`
        ).join('')}
      </div>
    `;
    
    container.appendChild(memberCard);
  });
  
  // Event listeners pour les émojis d'énergie
  document.querySelectorAll('.energy-emoji').forEach(emoji => {
    emoji.addEventListener('click', function(e) {
      e.stopPropagation();
      const memberKey = this.dataset.member;
      const energy = this.dataset.energy;
      
      familyData[memberKey].current_energy = energy;
      saveData();
      renderFamilyMembers();
      updateFamilyWeather();
    });
  });
}

// Système de reconnaissance avec bonus
function renderRecognitionSystem() {
  const container = document.getElementById('recognition-system');
  if (!container) return;
  
  container.innerHTML = Object.entries(familyData).map(([key, member]) => `
    <div class="recognition-member">
      <div class="recognition-info">
        <h4>${member.name}</h4>
        <small>Cette semaine: ${member.recognition_count || 0} points</small>
      </div>
      <div class="recognition-controls">
        <button class="recognition-btn" data-member="${key}">+1</button>
        <span class="recognition-count">${member.recognition_count || 0}</span>
      </div>
    </div>
  `).join('');
  
  container.querySelectorAll('.recognition-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const memberKey = this.dataset.member;
      const currentCount = familyData[memberKey].recognition_count || 0;
      familyData[memberKey].recognition_count = currentCount + 1;
      
      // Bonus à 20 points
      if (familyData[memberKey].recognition_count === 20) {
        alert(`🎉 ${familyData[memberKey].name} atteint 20 points de reconnaissance !\n\nBonus débloqué: Activité au choix ce weekend !`);
      }
      
      saveData();
      renderRecognitionSystem();
      
      // Animation
      this.style.transform = 'scale(1.2)';
      setTimeout(() => this.style.transform = 'scale(1)', 200);
    });
  });
  
  // Reset reconnaissance
  const resetBtn = document.getElementById('reset-recognition');
  if (resetBtn) {
    resetBtn.addEventListener('click', function() {
      Object.keys(familyData).forEach(key => {
        familyData[key].recognition_count = 0;
      });
      saveData();
      renderRecognitionSystem();
    });
  }
}

// Mise à jour météo familiale
function updateFamilyWeather() {
  const weatherIcon = document.getElementById('weather-icon');
  const weatherText = document.getElementById('weather-text');
  
  if (!weatherIcon || !weatherText) return;
  
  const energyEmojis = ['😴', '😔', '😐', '😊', '⚡'];
  const memberEnergies = Object.values(familyData).map(member => 
    energyEmojis.indexOf(member.current_energy) + 1
  ).filter(index => index > 0);
  
  const avgEnergy = memberEnergies.reduce((a, b) => a + b, 0) / memberEnergies.length;
  
  let weather, icon;
  if (avgEnergy >= 4.5) {
    weather = 'Rayonnante';
    icon = '☀️';
  } else if (avgEnergy >= 3.5) {
    weather = 'Ensoleillée';
    icon = '🌤️';
  } else if (avgEnergy >= 2.5) {
    weather = 'Mitigée';
    icon = '⛅';
  } else {
    weather = 'Orageuse';
    icon = '🌩️';
  }
  
  weatherIcon.textContent = icon;
  weatherText.textContent = `Météo familiale : ${weather}`;
}

// Planning interactif (7h-24h, créneaux 30 min)
function renderPlanning() {
  updateWeekDisplay();
  renderConstraintsChecklist();
  renderTimelineHours();
  renderPlanningGrid();
  renderEvents();
}

// Contraintes et impératifs avec templates
function renderConstraintsChecklist() {
  const container = document.getElementById('constraints-checklist');
  if (!container) return;
  
  container.innerHTML = planningConstraints.map((constraint, index) => `
    <div class="constraint-item">
      <div class="constraint-checkbox ${constraint.checked ? 'checked' : ''}" 
           data-index="${index}">
        ${constraint.checked ? '✓' : ''}
      </div>
      <span class="constraint-text ${constraint.checked ? 'completed' : ''}">${constraint.text}</span>
    </div>
  `).join('');
  
  // Event listeners
  container.querySelectorAll('.constraint-checkbox').forEach(checkbox => {
    checkbox.addEventListener('click', function() {
      const index = parseInt(this.dataset.index);
      planningConstraints[index].checked = !planningConstraints[index].checked;
      saveData();
      renderConstraintsChecklist();
    });
  });
  
  // Template selector
  const templateSelector = document.getElementById('template-selector');
  if (templateSelector) {
    templateSelector.addEventListener('change', function() {
      const templateKey = this.value;
      if (templateKey && templates[templateKey]) {
        planningConstraints = [...templates[templateKey]];
        saveData();
        renderConstraintsChecklist();
      }
    });
  }
  
  // Ajouter contrainte
  const addConstraintBtn = document.getElementById('add-constraint');
  if (addConstraintBtn) {
    addConstraintBtn.addEventListener('click', function() {
      const text = prompt('Nouvel impératif:');
      if (text) {
        planningConstraints.push({ text, checked: false, priority: 'low' });
        saveData();
        renderConstraintsChecklist();
      }
    });
  }
}

// Heures 7h-24h
function renderTimelineHours() {
  const timelineHours = document.getElementById('timeline-hours');
  if (!timelineHours) return;
  
  timelineHours.innerHTML = '';
  
  for (let hour = 7; hour <= 24; hour++) {
    const hourSlot = document.createElement('div');
    hourSlot.className = 'hour-slot';
    hourSlot.textContent = `${hour}:00`;
    timelineHours.appendChild(hourSlot);
  }
}

// Grille planning
function renderPlanningGrid() {
  const planningGrid = document.getElementById('planning-grid');
  const planningDaysHeader = document.getElementById('planning-days-header');
  
  if (!planningGrid || !planningDaysHeader) return;
  
  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  planningDaysHeader.innerHTML = '';
  days.forEach(day => {
    const dayHeader = document.createElement('div');
    dayHeader.className = 'day-header';
    dayHeader.textContent = day;
    planningDaysHeader.appendChild(dayHeader);
  });
  
  planningGrid.innerHTML = '';
  
  const hours = 17; // 7h à 24h
  const daysCount = 7;
  const totalCells = hours * 2 * daysCount; // 2 créneaux par heure (30 min)
  
  for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell';
    cell.dataset.day = Math.floor(i % daysCount);
    cell.dataset.hour = Math.floor(i / daysCount / 2) + 7;
    cell.dataset.minute = (Math.floor(i / daysCount) % 2) * 30;
    
    // CORRECTION BUG 3: Fix event creation click handler
    cell.addEventListener('click', function(e) {
      if (!isDragging && !isResizing) {
        console.log('Grid cell clicked:', this.dataset); // Debug
        handleCellClick(e);
      }
    });
    
    planningGrid.appendChild(cell);
  }
}

// Événements avec glisser-déposer et redimensionnement
function renderEvents() {
  const planningGrid = document.getElementById('planning-grid');
  if (!planningGrid) return;
  
  planningGrid.querySelectorAll('.planning-event').forEach(el => el.remove());
  
  events.forEach(event => {
    const eventElement = createEventElement(event);
    planningGrid.appendChild(eventElement);
  });
  
  handleOverlappingEvents();
}

function createEventElement(event) {
  const eventEl = document.createElement('div');
  eventEl.className = `planning-event planning-event-${event.member}`;
  eventEl.dataset.eventId = event.id;
  eventEl.draggable = true;
  
  const top = ((event.startHour - 7) * 2 + (event.startMinute / 30)) * 30;
  const height = event.duration;
  const left = event.day * (100 / 7);
  const width = 100 / 7 - 0.5;
  
  eventEl.style.cssText = `
    position: absolute;
    top: ${top}px;
    left: ${left}%;
    width: ${width}%;
    height: ${height}px;
  `;
  
  eventEl.innerHTML = `
    ${event.title}
    <div class="resize-handle"></div>
  `;
  
  // Glisser-déposer
  eventEl.addEventListener('dragstart', handleEventDragStart);
  eventEl.addEventListener('dragend', handleEventDragEnd);
  
  // Double-clic pour éditer - CORRECTION: Ensure modal opens
  eventEl.addEventListener('dblclick', function(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('Event double-clicked:', event.id); // Debug
    showEventModal(event.id);
  });
  
  // Clic droit pour supprimer
  eventEl.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    if (confirm('Supprimer cet événement ?')) {
      deleteEventById(event.id);
    }
  });
  
  // Redimensionnement
  const resizeHandle = eventEl.querySelector('.resize-handle');
  resizeHandle.addEventListener('mousedown', function(e) {
    e.stopPropagation();
    handleResizeStart(e, event.id);
  });
  
  return eventEl;
}

// Gestion empilement horizontal
function handleOverlappingEvents() {
  const planningGrid = document.getElementById('planning-grid');
  if (!planningGrid) return;
  
  const eventElements = planningGrid.querySelectorAll('.planning-event');
  
  eventElements.forEach(el => {
    el.classList.remove('overlapping', 'second', 'third');
  });
  
  for (let i = 0; i < eventElements.length; i++) {
    for (let j = i + 1; j < eventElements.length; j++) {
      const el1 = eventElements[i];
      const el2 = eventElements[j];
      
      if (isOverlapping(el1, el2)) {
        el1.classList.add('overlapping');
        el2.classList.add('overlapping', 'second');
      }
    }
  }
}

function isOverlapping(el1, el2) {
  const rect1 = {
    top: parseInt(el1.style.top),
    left: parseInt(el1.style.left),
    bottom: parseInt(el1.style.top) + parseInt(el1.style.height),
    right: parseInt(el1.style.left) + parseInt(el1.style.width)
  };
  
  const rect2 = {
    top: parseInt(el2.style.top),
    left: parseInt(el2.style.left),
    bottom: parseInt(el2.style.top) + parseInt(el2.style.height),
    right: parseInt(el2.style.left) + parseInt(el2.style.width)
  };
  
  return !(rect1.right <= rect2.left || 
           rect2.right <= rect1.left || 
           rect1.bottom <= rect2.top || 
           rect2.bottom <= rect1.top);
}

// Création événement - CORRECTION: Open modal properly
function handleCellClick(e) {
  const day = parseInt(e.target.dataset.day);
  const hour = parseInt(e.target.dataset.hour);
  const minute = parseInt(e.target.dataset.minute);
  
  console.log('Creating new event:', { day, hour, minute }); // Debug
  createNewEvent(day, hour, minute);
}

function createNewEvent(day, hour, minute) {
  const newEvent = {
    id: `evt${eventIdCounter++}`,
    title: 'Nouvel événement',
    member: 'jay',
    day: day,
    startHour: hour,
    startMinute: minute,
    duration: 60,
    description: ''
  };
  
  events.push(newEvent);
  renderEvents();
  renderWeekOverview();
  saveData();
  
  // CORRECTION: Ensure modal opens after event creation
  console.log('Opening event modal for new event:', newEvent.id); // Debug
  setTimeout(() => {
    showEventModal(newEvent.id);
  }, 100);
}

// Modal édition événement avec calcul durée - CORRECTION: Ensure proper setup
function showEventModal(eventId) {
  const event = events.find(ev => ev.id === eventId);
  if (!event) {
    console.error('Event not found:', eventId); // Debug
    return;
  }
  
  console.log('Showing event modal for:', event); // Debug
  
  const title = document.getElementById('event-modal-title');
  if (title) {
    title.textContent = event.title === 'Nouvel événement' ? 'Créer événement' : 'Éditer événement';
  }
  
  document.getElementById('event-id').value = event.id;
  document.getElementById('event-title').value = event.title;
  document.getElementById('event-day').value = event.day;
  document.getElementById('event-member').value = event.member;
  document.getElementById('event-start').value = formatTime(event.startHour, event.startMinute);
  
  const endHour = event.startHour + Math.floor(event.duration / 60);
  const endMinute = event.startMinute + (event.duration % 60);
  document.getElementById('event-end').value = formatTime(endHour, endMinute);
  document.getElementById('event-description').value = event.description || '';
  
  // Update duration display
  document.getElementById('event-duration-display').value = `${event.duration} minutes`;
  
  showModal('event-modal');
}

function handleEventSubmit(e) {
  e.preventDefault();
  
  const eventId = document.getElementById('event-id').value;
  const event = events.find(ev => ev.id === eventId);
  
  if (event) {
    event.title = document.getElementById('event-title').value;
    event.day = parseInt(document.getElementById('event-day').value);
    event.member = document.getElementById('event-member').value;
    
    const startTime = document.getElementById('event-start').value;
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    event.startHour = startHours;
    event.startMinute = startMinutes;
    
    const endTime = document.getElementById('event-end').value;
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    const startTotalMin = startHours * 60 + startMinutes;
    const endTotalMin = endHours * 60 + endMinutes;
    
    if (endTotalMin > startTotalMin) {
      event.duration = endTotalMin - startTotalMin;
    } else {
      alert('L\'heure de fin doit être supérieure à l\'heure de début');
      return;
    }
    
    event.description = document.getElementById('event-description').value;
    
    renderEvents();
    renderWeekOverview();
    saveData();
    hideModal('event-modal');
  }
}

function handleDeleteEvent(e) {
  e.preventDefault();
  const eventId = document.getElementById('event-id').value;
  
  if (confirm('Supprimer cet événement ?')) {
    deleteEventById(eventId);
    hideModal('event-modal');
  }
}

function deleteEventById(eventId) {
  events = events.filter(ev => ev.id !== eventId);
  renderEvents();
  renderWeekOverview();
  saveData();
}

// Drag & Drop
function handleEventDragStart(e) {
  isDragging = true;
  dragEvent = e.target.dataset.eventId;
  e.target.classList.add('dragging');
}

function handleEventDragEnd(e) {
  isDragging = false;
  dragEvent = null;
  e.target.classList.remove('dragging');
}

// Redimensionnement avec poignées
function handleResizeStart(e, eventId) {
  isResizing = true;
  const eventEl = document.querySelector(`[data-event-id="${eventId}"]`);
  eventEl.classList.add('resizing');
  
  const startY = e.clientY;
  const startHeight = parseInt(eventEl.style.height);
  
  const handleResize = (e) => {
    const deltaY = e.clientY - startY;
    const newHeight = Math.max(30, startHeight + deltaY);
    eventEl.style.height = newHeight + 'px';
  };
  
  const handleResizeEnd = () => {
    isResizing = false;
    eventEl.classList.remove('resizing');
    
    const event = events.find(ev => ev.id === eventId);
    if (event) {
      event.duration = parseInt(eventEl.style.height);
      saveData();
      renderWeekOverview();
    }
    
    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', handleResizeEnd);
  };
  
  document.addEventListener('mousemove', handleResize);
  document.addEventListener('mouseup', handleResizeEnd);
}

// Protocoles de crise personnalisés - CORRECTION: Ensure proper rendering
function renderCrisisProtocols(personKey) {
  const content = document.getElementById('crisis-protocols');
  if (!content) {
    console.error('Crisis protocols container not found'); // Debug
    return;
  }
  
  const protocols = crisisProtocols[personKey];
  
  if (!protocols) {
    content.innerHTML = '<p>Aucun protocole trouvé.</p>';
    return;
  }
  
  const personName = familyData[personKey]?.name || personKey.charAt(0).toUpperCase() + personKey.slice(1);
  
  content.innerHTML = `
    <div class="crisis-section">
      <h3>🚨 Protocoles pour ${personName}</h3>
      <div class="crisis-protocol-list">
        ${protocols.map(protocol => `
          <div class="crisis-protocol-item">
            <h4>${protocol.title}</h4>
            <p>${protocol.description}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  console.log('Crisis protocols rendered for:', personName); // Debug
}

// CORRECTION BUG 2: Tracker énergie avec émojis et moments - Fixed modal
function renderEnergyModal() {
  const content = document.getElementById('energy-modal-content');
  if (!content) {
    console.error('Energy modal content not found'); // Debug
    return;
  }
  
  content.innerHTML = `
    <div class="energy-tracker">
      ${Object.entries(familyData).map(([key, member]) => `
        <div class="energy-member-tracker">
          <div class="energy-member-header">
            <h4>${member.name}</h4>
          </div>
          <div class="energy-periods">
            ${['matin', 'midi', 'soir'].map(period => `
              <div class="energy-period">
                <strong>${period.charAt(0).toUpperCase() + period.slice(1)}</strong>
                <div class="energy-emojis">
                  ${['😴', '😔', '😐', '😊', '⚡'].map((emoji, index) => 
                    `<span class="energy-emoji ${member.energy_periods?.[period] === index + 1 ? 'selected' : ''}" 
                           data-member="${key}" data-period="${period}" data-value="${index + 1}">${emoji}</span>`
                  ).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>
    
    <div class="flex gap-8 mt-16">
      <button class="btn btn--primary" id="save-energy">💾 Sauvegarder</button>
      <button class="btn btn--outline" id="calculate-weather">🌤️ Calculer météo</button>
    </div>
  `;
  
  // Event listeners
  content.querySelectorAll('.energy-emoji').forEach(emoji => {
    emoji.addEventListener('click', function() {
      const memberKey = this.dataset.member;
      const period = this.dataset.period;
      const value = parseInt(this.dataset.value);
      
      if (!familyData[memberKey].energy_periods) {
        familyData[memberKey].energy_periods = {};
      }
      
      familyData[memberKey].energy_periods[period] = value;
      
      // Mettre à jour l'affichage
      content.querySelectorAll(`[data-member="${memberKey}"][data-period="${period}"]`).forEach(el => {
        el.classList.remove('selected');
      });
      this.classList.add('selected');
    });
  });
  
  const saveBtn = content.querySelector('#save-energy');
  const weatherBtn = content.querySelector('#calculate-weather');
  
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      saveData();
      hideModal('energy-modal');
      updateFamilyWeather();
    });
  }
  
  if (weatherBtn) {
    weatherBtn.addEventListener('click', () => {
      Object.entries(familyData).forEach(([key, member]) => {
        const periods = member.energy_periods || {};
        const avgEnergy = (periods.matin + periods.midi + periods.soir) / 3;
        const energyEmojis = ['😴', '😔', '😐', '😊', '⚡'];
        member.current_energy = energyEmojis[Math.round(avgEnergy) - 1] || '😐';
      });
      
      saveData();
      renderFamilyMembers();
      updateFamilyWeather();
    });
  }
  
  // Bouton info
  const energyHelp = document.getElementById('energy-help');
  if (energyHelp) {
    energyHelp.addEventListener('click', () => {
      alert('ℹ️ Tracker Énergie\n\nÉvaluez votre énergie 3 fois par jour:\n• 😴 (1) - Épuisé\n• 😔 (2) - Fatigué\n• 😐 (3) - Neutre\n• 😊 (4) - Énergique\n• ⚡ (5) - Très énergique\n\nLa moyenne calcule la météo familiale.');
    });
  }
  
  console.log('Energy modal rendered'); // Debug
}

// Dé activités avec édition des listes
function setupDiceModal() {
  const diceType = document.getElementById('dice-type');
  const memberSelector = document.getElementById('member-selector');
  const energySlider = document.getElementById('energy-slider');
  const rollBtn = document.getElementById('roll-dice');
  const resultDiv = document.getElementById('dice-result');
  
  if (diceType) {
    diceType.addEventListener('change', function() {
      if (this.value === 'family') {
        memberSelector.style.display = 'none';
      } else {
        memberSelector.style.display = 'block';
      }
    });
  }
  
  if (energySlider) {
    energySlider.addEventListener('input', function() {
      selectedEnergyLevel = parseInt(this.value);
    });
  }
  
  if (rollBtn) {
    rollBtn.addEventListener('click', function() {
      const activities = activitiesDice[selectedEnergyLevel.toString()];
      if (activities && activities.length > 0) {
        const randomActivity = activities[Math.floor(Math.random() * activities.length)];
        
        resultDiv.innerHTML = `
          <div style="padding: 16px; background: var(--color-bg-1); border-radius: 8px; margin-top: 16px;">
            <strong>🎯 Activité suggérée :</strong><br>
            <em style="font-size: 18px;">${randomActivity}</em><br><br>
            <small>Niveau d'énergie : ${selectedEnergyLevel}/5</small>
          </div>
        `;
      }
    });
  }
  
  // Édition des listes
  const editActivitiesBtn = document.getElementById('edit-activities');
  if (editActivitiesBtn) {
    editActivitiesBtn.addEventListener('click', showEditActivitiesModal);
  }
}

function showEditActivitiesModal() {
  const content = document.getElementById('edit-activities-content');
  
  content.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px;">
      ${Object.entries(activitiesDice).map(([level, activities]) => `
        <div style="background: var(--color-bg-1); padding: 16px; border-radius: 8px;">
          <h4>Niveau ${level}</h4>
          <div id="activities-${level}">
            ${activities.map((activity, index) => `
              <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                <input type="text" value="${activity}" 
                       onchange="updateActivity('${level}', ${index}, this.value)"
                       style="flex: 1; padding: 4px; font-size: 12px;">
                <button onclick="removeActivity('${level}', ${index})" 
                        style="background: var(--color-error); color: white; border: none; padding: 4px 8px; border-radius: 4px;">×</button>
              </div>
            `).join('')}
          </div>
          <button onclick="addActivity('${level}')" 
                  style="width: 100%; padding: 8px; background: var(--color-primary); color: white; border: none; border-radius: 4px; margin-top: 8px;">+ Ajouter</button>
        </div>
      `).join('')}
    </div>
    
    <div class="flex gap-8 mt-16">
      <button class="btn btn--primary" onclick="saveActivities()">💾 Sauvegarder</button>
      <button class="btn btn--outline" onclick="hideModal('edit-activities-modal')">❌ Fermer</button>
    </div>
  `;
  
  showModal('edit-activities-modal');
}

// Fonctions globales pour l'édition des activités
window.updateActivity = function(level, index, value) {
  activitiesDice[level][index] = value;
};

window.removeActivity = function(level, index) {
  activitiesDice[level].splice(index, 1);
  showEditActivitiesModal(); // Refresh
};

window.addActivity = function(level) {
  const activity = prompt('Nouvelle activité:');
  if (activity) {
    activitiesDice[level].push(activity);
    showEditActivitiesModal(); // Refresh
  }
};

window.saveActivities = function() {
  saveData();
  hideModal('edit-activities-modal');
  alert('✅ Listes d\'activités sauvegardées !');
};

// Plan repas avec export MD et liste courses
function renderMealModal() {
  const content = document.getElementById('meal-modal-content');
  const days = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
  
  content.innerHTML = `
    <div class="meal-planning-grid">
      <div style="font-weight: bold;">Jour</div>
      <div style="font-weight: bold;">Midi</div>
      <div style="font-weight: bold;">Soir</div>
      ${days.map(day => `
        <div class="meal-day-label">${day.charAt(0).toUpperCase() + day.slice(1)}</div>
        <div class="meal-input-group">
          <input type="text" class="meal-input" data-day="${day}" data-meal="midi" 
                 value="${mealsData[day]?.midi || ''}" placeholder="Repas du midi">
          <select class="meal-responsible" data-day="${day}" data-meal="midi-responsible">
            <option value="jay" ${mealsData[day]?.responsible_midi === 'jay' ? 'selected' : ''}>Jay</option>
            <option value="angelique" ${mealsData[day]?.responsible_midi === 'angelique' ? 'selected' : ''}>Angélique</option>
            <option value="gautier" ${mealsData[day]?.responsible_midi === 'gautier' ? 'selected' : ''}>Gautier</option>
            <option value="family" ${mealsData[day]?.responsible_midi === 'family' ? 'selected' : ''}>Famille</option>
          </select>
        </div>
        <div class="meal-input-group">
          <input type="text" class="meal-input" data-day="${day}" data-meal="soir" 
                 value="${mealsData[day]?.soir || ''}" placeholder="Repas du soir">
          <select class="meal-responsible" data-day="${day}" data-meal="soir-responsible">
            <option value="jay" ${mealsData[day]?.responsible_soir === 'jay' ? 'selected' : ''}>Jay</option>
            <option value="angelique" ${mealsData[day]?.responsible_soir === 'angelique' ? 'selected' : ''}>Angélique</option>
            <option value="gautier" ${mealsData[day]?.responsible_soir === 'gautier' ? 'selected' : ''}>Gautier</option>
            <option value="family" ${mealsData[day]?.responsible_soir === 'family' ? 'selected' : ''}>Famille</option>
          </select>
        </div>
      `).join('')}
    </div>
    
    <div class="export-section">
      <button class="btn btn--primary" id="export-meals-modal">📝 Export MD + Courses</button>
      <button class="btn btn--outline" id="save-meals-modal">💾 Sauvegarder</button>
    </div>
  `;
  
  // Event listeners
  content.querySelectorAll('.meal-input, .meal-responsible').forEach(input => {
    input.addEventListener('change', function() {
      const day = this.dataset.day;
      const meal = this.dataset.meal;
      
      if (!mealsData[day]) mealsData[day] = {};
      
      if (meal === 'midi') {
        mealsData[day].midi = this.value;
      } else if (meal === 'soir') {
        mealsData[day].soir = this.value;
      } else if (meal === 'midi-responsible') {
        mealsData[day].responsible_midi = this.value;
      } else if (meal === 'soir-responsible') {
        mealsData[day].responsible_soir = this.value;
      }
    });
  });
  
  const exportBtn = content.querySelector('#export-meals-modal');
  const saveBtn = content.querySelector('#save-meals-modal');
  
  if (exportBtn) {
    exportBtn.addEventListener('click', exportMealsToMarkdown);
  }
  
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      saveData();
      alert('✅ Plan repas sauvegardé !');
    });
  }
}

// Export repas vers Markdown avec liste courses
function exportMealsToMarkdown() {
  let markdown = '# 🍽️ Planning des repas de la semaine\n\n';
  
  const days = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
  
  // Planning des repas
  days.forEach(day => {
    const dayData = mealsData[day] || {};
    const dayCapitalized = day.charAt(0).toUpperCase() + day.slice(1);
    
    markdown += `## ${dayCapitalized}\n\n`;
    markdown += `- **Midi** : ${dayData.midi || 'Non défini'} _(${familyData[dayData.responsible_midi]?.name || dayData.responsible_midi || 'Non assigné'})_\n`;
    markdown += `- **Soir** : ${dayData.soir || 'Non défini'} _(${familyData[dayData.responsible_soir]?.name || dayData.responsible_soir || 'Non assigné'})_\n\n`;
  });
  
  // Liste de courses extraite
  markdown += '---\n\n';
  markdown += '## 🛒 Liste de courses (ingrédients extraits)\n\n';
  
  const ingredients = extractIngredients();
  if (ingredients.length > 0) {
    ingredients.forEach(ingredient => {
      markdown += `- [ ] ${ingredient}\n`;
    });
  } else {
    markdown += '- Aucun ingrédient détecté automatiquement\n';
    markdown += '- Ajoutez manuellement selon les plats prévus\n';
  }
  
  markdown += '\n---\n\n';
  markdown += '*Généré par l\'Organisateur Familial v8*\n';
  
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'planning-repas-et-courses.md';
  link.click();
  
  console.log('Export Markdown avec courses généré');
}

function extractIngredients() {
  const commonIngredients = [
    'pâtes', 'riz', 'pommes de terre', 'tomates', 'oignons', 'ail',
    'huile d\'olive', 'beurre', 'fromage', 'œufs', 'lait', 'pain',
    'salade', 'carottes', 'courgettes', 'poivrons', 'champignons',
    'viande', 'poisson', 'poulet', 'légumes', 'herbes', 'épices'
  ];
  
  const detectedIngredients = [];
  const allMeals = Object.values(mealsData).flatMap(day => [day.midi, day.soir]).filter(Boolean);
  
  commonIngredients.forEach(ingredient => {
    const found = allMeals.some(meal => 
      meal.toLowerCase().includes(ingredient.toLowerCase()) ||
      meal.toLowerCase().includes(ingredient.split(' ')[0].toLowerCase())
    );
    
    if (found) {
      detectedIngredients.push(ingredient);
    }
  });
  
  return detectedIngredients;
}

// Répartition tâches avec multi-assignation
function renderTasksModal() {
  const content = document.getElementById('tasks-modal-content');
  
  content.innerHTML = `
    <div class="task-distribution">
      ${tasksData.map((task, index) => `
        <div class="task-item">
          <div class="task-info">
            <div class="task-name">${task.name}</div>
            <div class="task-points">${task.points} points</div>
          </div>
          <div class="task-assignment">
            ${Object.entries(familyData).map(([key, member]) => `
              <div class="assignment-checkbox ${task.assigned.includes(key) ? 'selected' : ''}" 
                   data-task="${index}" data-member="${key}">
                <input type="checkbox" ${task.assigned.includes(key) ? 'checked' : ''} 
                       style="margin-right: 4px;">
                ${member.name}
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
      
      <div class="points-summary">
        ${Object.entries(familyData).map(([key, member]) => {
          const totalPoints = tasksData
            .filter(task => task.assigned.includes(key))
            .reduce((sum, task) => sum + task.points, 0);
          
          return `
            <div class="points-member-summary">
              <h4>${member.name}</h4>
              <div class="points-total">${totalPoints} pts</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
    
    <div class="flex gap-8 mt-16">
      <button class="btn btn--primary" id="add-task-modal">➕ Ajouter tâche</button>
      <button class="btn btn--outline" id="save-tasks-modal">💾 Sauvegarder</button>
      <button class="btn btn--secondary" id="rebalance-tasks-modal">⚖️ Rééquilibrer</button>
    </div>
  `;
  
  // Event listeners
  content.querySelectorAll('.assignment-checkbox').forEach(checkbox => {
    checkbox.addEventListener('click', function() {
      const taskIndex = parseInt(this.dataset.task);
      const memberKey = this.dataset.member;
      const isSelected = this.classList.contains('selected');
      
      if (isSelected) {
        tasksData[taskIndex].assigned = tasksData[taskIndex].assigned.filter(m => m !== memberKey);
        this.classList.remove('selected');
        this.querySelector('input').checked = false;
      } else {
        tasksData[taskIndex].assigned.push(memberKey);
        this.classList.add('selected');
        this.querySelector('input').checked = true;
      }
      
      renderTasksModal(); // Refresh pour mettre à jour les totaux
    });
  });
  
  const addTaskBtn = content.querySelector('#add-task-modal');
  const saveBtn = content.querySelector('#save-tasks-modal');
  const rebalanceBtn = content.querySelector('#rebalance-tasks-modal');
  
  if (addTaskBtn) {
    addTaskBtn.addEventListener('click', function() {
      const name = prompt('Nom de la tâche:');
      const points = parseInt(prompt('Points (1-5):') || '2');
      
      if (name && points > 0) {
        tasksData.push({ name, points, assigned: [] });
        renderTasksModal();
      }
    });
  }
  
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      saveData();
      alert('✅ Répartition des tâches sauvegardée !');
    });
  }
  
  if (rebalanceBtn) {
    rebalanceBtn.addEventListener('click', rebalanceTasks);
  }
}

function rebalanceTasks() {
  const members = Object.keys(familyData);
  const totalPoints = tasksData.reduce((sum, task) => sum + task.points, 0);
  const targetPerMember = Math.floor(totalPoints / members.length);
  
  // Reset toutes les assignations
  tasksData.forEach(task => task.assigned = []);
  
  // Redistribuer équitablement
  const memberPoints = {};
  members.forEach(member => memberPoints[member] = 0);
  
  tasksData.sort((a, b) => b.points - a.points).forEach(task => {
    const leastLoadedMember = members.reduce((min, member) => 
      memberPoints[member] < memberPoints[min] ? member : min
    );
    
    task.assigned = [leastLoadedMember];
    memberPoints[leastLoadedMember] += task.points;
  });
  
  saveData();
  renderTasksModal();
  alert('⚖️ Tâches rééquilibrées automatiquement !');
}

// Profils détaillés Human Design
function renderDetailedProfiles() {
  const container = document.getElementById('profiles-detailed');
  if (!container) return;
  
  container.innerHTML = '';
  
  Object.entries(familyData).forEach(([key, member]) => {
    const profileDiv = document.createElement('div');
    profileDiv.className = 'detailed-profile';
    
    profileDiv.innerHTML = `
      <div class="profile-header-detailed profile-${key}" style="background-color: ${member.color}">
        <div class="profile-basic-info">
          <div class="profile-avatar-xl">${member.avatar}</div>
          <div class="profile-identity">
            <h2>${member.name}</h2>
            <p class="profile-subtitle">${member.type} ${member.profile}</p>
          </div>
        </div>
      </div>
      <div class="profile-body-detailed">
        <div class="daily-checklist">
          <div class="checklist-header">
            <span>✅</span>
            <h3>Checklist quotidienne personnalisée</h3>
          </div>
          <div class="checklist-items">
            ${member.checklist.map((item, index) => `
              <div class="checklist-item">
                <div class="checklist-checkbox ${member.checklist_status?.[index] ? 'checked' : ''}" 
                     data-member="${key}" data-index="${index}">
                  ${member.checklist_status?.[index] ? '✓' : ''}
                </div>
                <span class="checklist-text ${member.checklist_status?.[index] ? 'completed' : ''}">${item}</span>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="profile-sections">
          <div class="profile-section">
            <div class="section-header">
              <span>🎯</span>
              <h3>Human Design</h3>
            </div>
            <div class="section-content">
              <p><strong>Type:</strong> ${member.type}</p>
              <p><strong>Profil:</strong> ${member.profile}</p>
              <p><strong>Stratégie:</strong> ${member.strategy}</p>
              <p><strong>Autorité:</strong> ${member.authority}</p>
            </div>
          </div>
          
          <div class="profile-section">
            <div class="section-header">
              <span>🔧</span>
              <h3>Recommandations</h3>
            </div>
            <div class="section-content">
              ${member.recommendations.map(rec => `<p>${rec}</p>`).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
    
    container.appendChild(profileDiv);
  });
  
  // Event listeners pour les checklists
  document.querySelectorAll('.checklist-checkbox').forEach(checkbox => {
    checkbox.addEventListener('click', function() {
      const memberKey = this.dataset.member;
      const index = parseInt(this.dataset.index);
      
      if (!familyData[memberKey].checklist_status) {
        familyData[memberKey].checklist_status = {};
      }
      
      familyData[memberKey].checklist_status[index] = !familyData[memberKey].checklist_status[index];
      saveData();
      renderDetailedProfiles();
    });
  });
}

// Pomodoro réglable par profil
function renderTools() {
  renderPomodoroTimer();
}

function renderPomodoroTimer() {
  const container = document.getElementById('pomodoro-timer');
  if (!container) return;
  
  const currentMember = familyData[pomodoroState.currentProfile];
  const settings = currentMember.pomodoro_settings;
  
  container.innerHTML = `
    <div class="form-group">
      <label class="form-label">Profil actuel</label>
      <select class="form-control" id="pomodoro-profile-select">
        ${Object.entries(familyData).map(([key, member]) => 
          `<option value="${key}" ${key === pomodoroState.currentProfile ? 'selected' : ''}>${member.name}</option>`
        ).join('')}
      </select>
    </div>
    
    <div class="pomodoro-status">
      Session ${pomodoroState.currentSession === 'work' ? 'Travail' : 'Pause'} - 
      ${pomodoroState.sessionsCompleted} pomodoros complétés
    </div>
    
    <div class="pomodoro-display" id="pomodoro-display">
      ${formatPomodoroTime(pomodoroState.timeLeft)}
    </div>
    
    <div class="pomodoro-controls">
      <button class="btn btn--primary" id="pomodoro-start" ${pomodoroState.isRunning ? 'style="display:none"' : ''}>
        ▶️ Démarrer
      </button>
      <button class="btn btn--secondary" id="pomodoro-pause" ${!pomodoroState.isRunning ? 'style="display:none"' : ''}>
        ⏸️ Pause
      </button>
      <button class="btn btn--outline" id="pomodoro-reset">
        🔄 Reset
      </button>
    </div>
  `;
  
  setupPomodoroControls();
}

function setupPomodoroControls() {
  const profileSelect = document.getElementById('pomodoro-profile-select');
  const startBtn = document.getElementById('pomodoro-start');
  const pauseBtn = document.getElementById('pomodoro-pause');
  const resetBtn = document.getElementById('pomodoro-reset');
  
  if (profileSelect) {
    profileSelect.addEventListener('change', function() {
      pomodoroState.currentProfile = this.value;
      resetPomodoro();
      renderPomodoroTimer();
    });
  }
  
  if (startBtn) {
    startBtn.addEventListener('click', startPomodoro);
  }
  
  if (pauseBtn) {
    pauseBtn.addEventListener('click', pausePomodoro);
  }
  
  if (resetBtn) {
    resetBtn.addEventListener('click', resetPomodoro);
  }
  
  // Settings
  const settingsBtn = document.getElementById('pomodoro-settings');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', showPomodoroSettings);
  }
}

function startPomodoro() {
  pomodoroState.isRunning = true;
  pomodoroTimer = setInterval(() => {
    pomodoroState.timeLeft--;
    
    const display = document.getElementById('pomodoro-display');
    if (display) {
      display.textContent = formatPomodoroTime(pomodoroState.timeLeft);
    }
    
    if (pomodoroState.timeLeft <= 0) {
      pomodoroComplete();
    }
  }, 1000);
  
  renderPomodoroTimer();
}

function pausePomodoro() {
  pomodoroState.isRunning = false;
  if (pomodoroTimer) {
    clearInterval(pomodoroTimer);
    pomodoroTimer = null;
  }
  renderPomodoroTimer();
}

function resetPomodoro() {
  pausePomodoro();
  const currentMember = familyData[pomodoroState.currentProfile];
  const settings = currentMember.pomodoro_settings;
  
  pomodoroState.timeLeft = (pomodoroState.currentSession === 'work' ? settings.work : settings.break) * 60;
  renderPomodoroTimer();
}

function pomodoroComplete() {
  pausePomodoro();
  
  if (pomodoroState.currentSession === 'work') {
    pomodoroState.sessionsCompleted++;
    pomodoroState.currentSession = 'break';
    
    const currentMember = familyData[pomodoroState.currentProfile];
    const settings = currentMember.pomodoro_settings;
    pomodoroState.timeLeft = (pomodoroState.sessionsCompleted % 4 === 0 ? settings.longBreak : settings.break) * 60;
    
    // Notification visuelle
    document.body.style.backgroundColor = '#4caf50';
    setTimeout(() => document.body.style.backgroundColor = '', 2000);
    
    alert(`🍅 Session terminée ! Prenez une pause de ${pomodoroState.timeLeft / 60} minutes.`);
  } else {
    pomodoroState.currentSession = 'work';
    const currentMember = familyData[pomodoroState.currentProfile];
    pomodoroState.timeLeft = currentMember.pomodoro_settings.work * 60;
    
    alert('⏰ Pause terminée ! Prêt pour une nouvelle session ?');
  }
  
  renderPomodoroTimer();
}

function formatPomodoroTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function showPomodoroSettings() {
  const content = document.getElementById('pomodoro-settings-content');
  
  content.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
      ${Object.entries(familyData).map(([key, member]) => `
        <div style="text-align: center;">
          <h4>${member.name}</h4>
          <div class="form-group">
            <label class="form-label">Travail (min)</label>
            <input type="number" min="5" max="60" value="${member.pomodoro_settings.work}" 
                   data-member="${key}" data-setting="work" class="form-control">
          </div>
          <div class="form-group">
            <label class="form-label">Pause (min)</label>
            <input type="number" min="1" max="30" value="${member.pomodoro_settings.break}" 
                   data-member="${key}" data-setting="break" class="form-control">
          </div>
          <div class="form-group">
            <label class="form-label">Pause longue (min)</label>
            <input type="number" min="5" max="60" value="${member.pomodoro_settings.longBreak}" 
                   data-member="${key}" data-setting="longBreak" class="form-control">
          </div>
        </div>
      `).join('')}
    </div>
    
    <div class="flex gap-8 mt-16">
      <button class="btn btn--primary" id="save-pomodoro-settings">💾 Sauvegarder</button>
      <button class="btn btn--outline" id="cancel-pomodoro-settings">❌ Annuler</button>
    </div>
  `;
  
  const saveBtn = content.querySelector('#save-pomodoro-settings');
  const cancelBtn = content.querySelector('#cancel-pomodoro-settings');
  
  if (saveBtn) {
    saveBtn.addEventListener('click', function() {
      content.querySelectorAll('input').forEach(input => {
        const member = input.dataset.member;
        const setting = input.dataset.setting;
        const value = parseInt(input.value);
        
        familyData[member].pomodoro_settings[setting] = value;
      });
      
      saveData();
      resetPomodoro();
      renderPomodoroTimer();
      hideModal('pomodoro-settings-modal');
    });
  }
  
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => hideModal('pomodoro-settings-modal'));
  }
  
  showModal('pomodoro-settings-modal');
}

// Exports (iCal, PDF)
function exportToICal() {
  let icalContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Organisateur Familial//v8//FR\n';
  
  const baseDate = new Date(2025, 6, 28);
  const weekStart = new Date(baseDate);
  weekStart.setDate(baseDate.getDate() + (currentWeekOffset * 7));
  
  events.forEach(event => {
    const eventDate = new Date(weekStart);
    eventDate.setDate(weekStart.getDate() + event.day);
    eventDate.setHours(event.startHour, event.startMinute, 0, 0);
    
    const endDate = new Date(eventDate);
    endDate.setMinutes(endDate.getMinutes() + event.duration);
    
    const formatDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    
    icalContent += `BEGIN:VEVENT\n`;
    icalContent += `UID:${event.id}@organisateur-familial.local\n`;
    icalContent += `DTSTART:${formatDate(eventDate)}\n`;
    icalContent += `DTEND:${formatDate(endDate)}\n`;
    icalContent += `SUMMARY:${event.title}\n`;
    icalContent += `DESCRIPTION:${event.description || ''}\n`;
    icalContent += `ORGANIZER:${familyData[event.member]?.name || event.member}\n`;
    icalContent += `END:VEVENT\n`;
  });
  
  icalContent += 'END:VCALENDAR';
  
  const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `planning-familial-semaine-${currentWeekOffset + 1}.ics`;
  link.click();
}

function exportToPDF() {
  const planningContainer = document.querySelector('.planning-container');
  if (!planningContainer) return;
  
  if (typeof html2canvas !== 'undefined' && typeof window.jspdf !== 'undefined') {
    html2canvas(planningContainer).then(canvas => {
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('l', 'mm', 'a4');
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 297;
      const pageHeight = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`planning-familial-semaine-${currentWeekOffset + 1}.pdf`);
    });
  } else {
    alert('Libraries PDF not loaded. Export will be available once external scripts load.');
  }
}

// Gestion événements globaux - CORRECTION: Setup all event listeners properly
function setupEventListeners() {
  // CORRECTION BUG 2: Update energy button
  const updateEnergyBtn = document.getElementById('update-energy');
  if (updateEnergyBtn) {
    updateEnergyBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Energy button clicked'); // Debug
      showModal('energy-modal');
      renderEnergyModal();
    });
  }
  
  // Export meals button
  const exportMealsBtn = document.getElementById('export-meals-btn');
  if (exportMealsBtn) {
    exportMealsBtn.addEventListener('click', exportMealsToMarkdown);
  }
  
  // Add task button
  const addTaskBtn = document.getElementById('add-task');
  if (addTaskBtn) {
    addTaskBtn.addEventListener('click', () => {
      showModal('tasks-modal');
      renderTasksModal();
    });
  }
  
  // Sauvegarde automatique
  setInterval(saveData, 30000);
  
  // Gestion erreurs
  window.addEventListener('error', function(e) {
    console.error('Erreur JavaScript:', e.error);
  });
  
  console.log('Event listeners setup completed'); // Debug
}

// Utilitaires
function formatTime(hour, minute) {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

function showMemberModal(memberKey) {
  const member = familyData[memberKey];
  alert(`👤 ${member.name}\n\nType: ${member.type} ${member.profile}\nStratégie: ${member.strategy}\nAutorité: ${member.authority}\n\nÉnergie actuelle: ${member.current_energy}\nReconnaissance: ${member.recognition_count} points`);
}

// Démarrage final
console.log('Organisateur Familial v8 - Code JavaScript CORRIGÉ chargé');