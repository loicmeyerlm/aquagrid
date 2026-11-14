import { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';
import {
  Droplets,
  FlaskConical,
  Wrench,
  MapPin,
  Camera,
  Calendar,
  Table as TableIcon,
  LayoutDashboard,
  Plus,
  Search,
  Download,
  CheckCircle2,
  AlertTriangle,
  Navigation,
  X,
  Check,
  GripVertical,
  Trash2,
  LogOut,
  LogIn,
  Image as ImageIcon,
  ExternalLink,
  Waves,
} from 'lucide-react';

// ============================================================================
// INITIALISATION FIREBASE (Architecture temps réel)
// ============================================================================
const firebaseConfig = {
  apiKey: 'AIzaSyALgApX9m3bhjbvRmOM1EuE7J140m2D7ig',
  authDomain: 'aquagrid-exploitation.firebaseapp.com',
  projectId: 'aquagrid-exploitation',
  storageBucket: 'aquagrid-exploitation.firebasestorage.app',
  messagingSenderId: '536140045695',
  appId: '1:536140045695:web:d5e431645a463232918e4a',
  measurementId: 'G-6WWJHQ5LRD',
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId =
  typeof __app_id !== 'undefined' ? __app_id : 'aquagrid-pro-eau-potable';

// ============================================================================
// AGENTS D'EXPLOITATION & JOURS DU PLANNING
// ============================================================================
const AGENTS_INITIAUX = [
  {
    id: 'ag1',
    nom: 'Claire Valette',
    role: 'Responsable d’exploitation',
    secteur: 'Direction & Supervision',
    isAdmin: true,
    avatar: 'CV',
    couleur: 'bg-slate-900 text-cyan-400',
  },
  {
    id: 'ag2',
    nom: 'Julien Mercier',
    role: 'Agent Réseau & Fuites',
    secteur: 'Secteur Nord / Centre',
    isAdmin: false,
    avatar: 'JM',
    couleur: 'bg-sky-600 text-white',
  },
  {
    id: 'ag3',
    nom: 'Mehdi Benamar',
    role: 'Agent Usine & Qualité Chlore',
    secteur: 'Station & Réservoirs',
    isAdmin: false,
    avatar: 'MB',
    couleur: 'bg-teal-600 text-white',
  },
  {
    id: 'ag4',
    nom: 'Élodie Garnier',
    role: 'Technicienne Maintenance Électroméca',
    secteur: 'Surpresseurs & Captages',
    isAdmin: false,
    avatar: 'EG',
    couleur: 'bg-indigo-600 text-white',
  },
  {
    id: 'ag5',
    nom: 'Romain Perrot',
    role: 'Agent Polyvalent Réseau',
    secteur: 'Secteur Sud / Périphérie',
    isAdmin: false,
    avatar: 'RP',
    couleur: 'bg-cyan-700 text-white',
  },
];

const JOURS_SEMAINE = [
  { id: '2026-11-16', label: 'Lun 16 Nov', court: 'Lun 16' },
  { id: '2026-11-17', label: 'Mar 17 Nov', court: 'Mar 17' },
  { id: '2026-11-18', label: 'Mer 18 Nov', court: 'Mer 18' },
  { id: '2026-11-19', label: 'Jeu 19 Nov', court: 'Jeu 19' },
  { id: '2026-11-20', label: 'Ven 20 Nov', court: 'Ven 20' },
];

const INITIAL_TACHES_EAU = [
  {
    code: 'AQ-2026-01',
    type: 'Tour de chlore',
    titre: 'Prélèvement & contrôle chlore Réservoir Hauts-de-Vaux',
    ouvrage: 'Réservoir Semi-Enterré Hauts-de-Vaux (2500 m³)',
    chloreMgL: 0.06,
    turbiditeNtu: 0.35,
    debitFuite: '',
    diametreConduite: '',
    natureTerrain: '',
    typeMaintenance: '',
    priorite: 'Urgente',
    statut: 'À planifier',
    agentId: '',
    datePlanifiee: '',
    createurNom: 'Mehdi Benamar',
    dateCreation: '14/11/2026 08:45',
    lat: 45.7782,
    lng: 4.8512,
    adresseGps: 'Chemin du Réservoir, Secteur Nord',
    notes:
      'ALERTE : Chlore libre trop bas (0.06 mg/L < seuil 0.10 mg/L). Prévoir ajustement pompe doseuse javel et purge antenne.',
    photos: [
      'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    code: 'AQ-2026-02',
    type: 'Fuite',
    titre: 'Fuite apparente sur chaussée - Avenue Jean Jaurès',
    ouvrage: 'Conduite Fonte DN150 - Distribution Centre',
    chloreMgL: null,
    turbiditeNtu: null,
    debitFuite: 'Importante (Jet / Ravinement ~4 m³/h)',
    diametreConduite: 'DN 150 mm (Fonte)',
    natureTerrain: 'Enrobé voirie départementale',
    typeMaintenance: '',
    priorite: 'Urgente',
    statut: 'En cours',
    agentId: 'ag2',
    datePlanifiee: '2026-11-16',
    createurNom: 'Julien Mercier',
    dateCreation: '14/11/2026 09:20',
    lat: 45.7465,
    lng: 4.8412,
    adresseGps: '42 Avenue Jean Jaurès (Face boulangerie)',
    notes:
      'Balisage posé. Vanne de sectionnement amont repérée. Prévoir manchon de réparation DN150 et mini-pelle.',
    photos: [
      'https://images.unsplash.com/photo-1584467541268-b040f83be3fd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    code: 'AQ-2026-03',
    type: 'Maintenance',
    titre: 'Révision garniture mécanique Pompe n°2 Surpresseur Sud',
    ouvrage: 'Station de Surpression Les Coteaux',
    chloreMgL: null,
    turbiditeNtu: null,
    debitFuite: '',
    diametreConduite: '',
    natureTerrain: '',
    typeMaintenance: 'Pompe / Surpresseur',
    priorite: 'Haute',
    statut: 'Planifiée',
    agentId: 'ag4',
    datePlanifiee: '2026-11-17',
    createurNom: 'Élodie Garnier',
    dateCreation: '14/11/2026 10:15',
    lat: 45.721,
    lng: 4.873,
    adresseGps: 'Route des Coteaux, Station P2',
    notes:
      'Léger suintement au presse-étoupe constaté lors de la ronde hebdomadaire. Kit joints disponible au magasin.',
    photos: [
      'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    code: 'AQ-2026-04',
    type: 'Tour de chlore',
    titre: 'Tour de chlore hebdomadaire - École Jules Ferry & Mairie',
    ouvrage: 'Point de prélèvement réseau distribution Centre',
    chloreMgL: 0.28,
    turbiditeNtu: 0.18,
    debitFuite: '',
    diametreConduite: '',
    natureTerrain: '',
    typeMaintenance: '',
    priorite: 'Normale',
    statut: 'Terminée',
    agentId: 'ag3',
    datePlanifiee: '2026-11-16',
    createurNom: 'Mehdi Benamar',
    dateCreation: '14/11/2026 11:05',
    lat: 45.758,
    lng: 4.8325,
    adresseGps: 'Place de la Mairie - Robinet prélèvement',
    notes:
      'Paramètres conformes ARS. Eau limpide, goût/odeur RAS. Chlore libre stable à 0.28 mg/L.',
    photos: [],
  },
  {
    code: 'AQ-2026-05',
    type: 'Maintenance',
    titre: 'Manœuvre et graissage vanne de sectorisation DN200',
    ouvrage: 'Regard Vanne V-104 - Rue Victor Hugo',
    chloreMgL: null,
    turbiditeNtu: null,
    debitFuite: '',
    diametreConduite: '',
    natureTerrain: '',
    typeMaintenance: 'Vanne de réseau',
    priorite: 'Normale',
    statut: 'À planifier',
    agentId: '',
    datePlanifiee: '',
    createurNom: 'Romain Perrot',
    dateCreation: '14/11/2026 14:10',
    lat: 45.7532,
    lng: 4.829,
    adresseGps: 'Angle Rue Victor Hugo / Rue Sala',
    notes: 'Carré de manœuvre grippé, tampon fonte à nettoyer avant manœuvre.',
    photos: [],
  },
];

// ============================================================================
// UTILITAIRE DE COMPRESSION PHOTO (Multiple photos légères < 200 Ko)
// ============================================================================
const compressPhoto = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_W = 720;
        const scale = MAX_W / img.width;
        canvas.width = img.width > MAX_W ? MAX_W : img.width;
        canvas.height = img.width > MAX_W ? img.height * scale : img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.68));
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

// ============================================================================
// COMPOSANT PRINCIPAL : AQUAGRID PRO
// ============================================================================
export default function App() {
  // --- Auth & Profil Agent connecté en nom propre ---
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [agents, setAgents] = useState(AGENTS_INITIAUX);
  const [loggedAgent, setLoggedAgent] = useState(null); // null = écran de connexion en nom propre affiché au choix ou pré-connecté
  const [showLoginModal, setShowLoginModal] = useState(true);

  // --- Données Tâches / Remontées ---
  const [taches, setTaches] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Navigation ---
  const [activeTab, setActiveTab] = useState('tableur'); // 'terrain' | 'tableur' | 'planning' | 'dashboard'

  // --- Filtres du Tableur ---
  const [filterType, setFilterType] = useState('Tous');
  const [filterStatut, setFilterStatut] = useState('Tous');
  const [filterAgent, setFilterAgent] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState('');

  // --- Sélection & Détail Tâche ---
  const [selectedTache, setSelectedTache] = useState(null);
  const [lightboxUrl, setLightboxUrl] = useState(null);

  // --- Toast Notifications ---
  const [toast, setToast] = useState(null);
  const notify = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // --------------------------------------------------------------------------
  // 1. AUTHENTIFICATION FIREBASE
  // --------------------------------------------------------------------------
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (
          typeof __initial_auth_token !== 'undefined' &&
          __initial_auth_token
        ) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error('Erreur auth Firebase:', err);
      }
    };
    initAuth();
    const unsub = onAuthStateChanged(auth, (u) => setFirebaseUser(u));
    return () => unsub();
  }, []);

  // --------------------------------------------------------------------------
  // 2. SYNCHRONISATION TEMPS RÉEL FIRESTORE (Tâches & Agents)
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!firebaseUser) return;

    const tachesRef = collection(
      db,
      'artifacts',
      appId,
      'public',
      'data',
      'taches_eau'
    );
    const agentsRef = collection(
      db,
      'artifacts',
      appId,
      'public',
      'data',
      'agents_eau'
    );

    const initSeed = async () => {
      try {
        const snap = await getDocs(tachesRef);
        if (snap.empty) {
          for (const t of INITIAL_TACHES_EAU) {
            await addDoc(tachesRef, { ...t, createdAt: Date.now() });
          }
        }
        const snapAg = await getDocs(agentsRef);
        if (snapAg.empty) {
          for (const ag of AGENTS_INITIAUX) {
            await addDoc(agentsRef, ag);
          }
        }
      } catch (err) {
        console.error('Erreur initialisation données:', err);
      }
    };
    initSeed();

    const unsubTaches = onSnapshot(
      tachesRef,
      (snapshot) => {
        const list: any[] = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setTaches(list);
        setLoading(false);
      },
      (err) => console.error('Erreur snapshot tâches:', err)
    );

    const unsubAgents = onSnapshot(
      agentsRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: any[] = snapshot.docs.map((d) => ({ docId: d.id, ...d.data() }));
          // Conserver un ordre cohérent
          list.sort((a, b) => (a.id || '').localeCompare(b.id || ''));
          setAgents(list);
        }
      },
      (err) => console.error('Erreur snapshot agents:', err)
    );

    return () => {
      unsubTaches();
      unsubAgents();
    };
  }, [firebaseUser]);

  // --------------------------------------------------------------------------
  // ACTIONS CRUD SUR LES TÂCHES
  // --------------------------------------------------------------------------
  const handleCreateTache = async (newTacheData) => {
    if (!firebaseUser) return;
    try {
      const tachesRef = collection(
        db,
        'artifacts',
        appId,
        'public',
        'data',
        'taches_eau'
      );
      const code = `AQ-2026-${String(taches.length + 1).padStart(2, '0')}`;
      const nowStr =
        new Date().toLocaleDateString('fr-FR') +
        ' ' +
        new Date().toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        });

      await addDoc(tachesRef, {
        ...newTacheData,
        code,
        createurNom: loggedAgent ? loggedAgent.nom : 'Agent Terrain',
        dateCreation: nowStr,
        createdAt: Date.now(),
      });

      notify(`Remontée ${code} enregistrée et synchronisée !`, 'success');
      setActiveTab('tableur');
    } catch (err) {
      notify("Erreur lors de l'enregistrement de la tâche", 'error');
    }
  };

  const handleUpdateTache = async (tacheId, updates) => {
    if (!firebaseUser) return;
    try {
      const ref = doc(
        db,
        'artifacts',
        appId,
        'public',
        'data',
        'taches_eau',
        tacheId
      );
      await updateDoc(ref, updates);
      if (selectedTache && selectedTache.id === tacheId) {
        setSelectedTache((prev) => ({ ...prev, ...updates }));
      }
      notify('Mise à jour enregistrée', 'success');
    } catch (err) {
      notify('Erreur de mise à jour', 'error');
    }
  };

  const handleDeleteTache = async (tacheId) => {
    if (!firebaseUser) return;
    try {
      await deleteDoc(
        doc(db, 'artifacts', appId, 'public', 'data', 'taches_eau', tacheId)
      );
      if (selectedTache?.id === tacheId) setSelectedTache(null);
      notify('Tâche supprimée', 'info');
    } catch (err) {
      notify('Erreur lors de la suppression', 'error');
    }
  };

  const handleCreateNewAgent = async (nom, role, secteur) => {
    if (!firebaseUser) return;
    const initials = nom
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    const newAg = {
      id: 'ag-' + Date.now(),
      nom,
      role,
      secteur,
      isAdmin: role.toLowerCase().includes('responsable'),
      avatar: initials || 'AG',
      couleur: 'bg-sky-700 text-white',
    };
    try {
      await addDoc(
        collection(db, 'artifacts', appId, 'public', 'data', 'agents_eau'),
        newAg
      );
      setLoggedAgent(newAg);
      setShowLoginModal(false);
      if (!newAg.isAdmin) setActiveTab('terrain');
      notify(`Bienvenue ${newAg.nom} ! Profil créé et connecté.`, 'success');
    } catch (err) {
      notify('Erreur création profil agent', 'error');
    }
  };

  // --------------------------------------------------------------------------
  // EXPORT CSV DU TABLEUR
  // --------------------------------------------------------------------------
  const handleExportCSV = () => {
    const headers = [
      'Code',
      'Type',
      'Titre',
      'Ouvrage',
      'Chlore (mg/L)',
      'Turbidite (NTU)',
      'Priorite',
      'Statut',
      'Agent Affecte',
      'Date Planifiee',
      'Createur',
      'Date Creation',
      'Latitude',
      'Longitude',
      'Adresse GPS',
      'Notes',
    ];
    const rows = tachesFiltrees.map((t) => {
      const ag = agents.find((a) => a.id === t.agentId);
      return [
        t.code,
        t.type,
        `"${(t.titre || '').replace(/"/g, '""')}"`,
        `"${(t.ouvrage || '').replace(/"/g, '""')}"`,
        t.chloreMgL ?? '',
        t.turbiditeNtu ?? '',
        t.priorite,
        t.statut,
        ag ? ag.nom : 'Non affecté',
        t.datePlanifiee || '',
        t.createurNom || '',
        t.dateCreation || '',
        t.lat || '',
        t.lng || '',
        `"${(t.adresseGps || '').replace(/"/g, '""')}"`,
        `"${(t.notes || '').replace(/"/g, '""')}"`,
      ].join(';');
    });

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `AquaGrid_Exploitation_Eau_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify('Export CSV téléchargé !', 'success');
  };

  // --------------------------------------------------------------------------
  // FILTRAGE DES TÂCHES
  // --------------------------------------------------------------------------
  const tachesFiltrees = taches.filter((t) => {
    if (filterType !== 'Tous' && t.type !== filterType) return false;
    if (filterStatut !== 'Tous' && t.statut !== filterStatut) return false;
    if (filterAgent !== 'Tous') {
      if (filterAgent === 'Non affecté' && t.agentId) return false;
      if (filterAgent !== 'Non affecté' && t.agentId !== filterAgent)
        return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        (t.code || '').toLowerCase().includes(q) ||
        (t.titre || '').toLowerCase().includes(q) ||
        (t.ouvrage || '').toLowerCase().includes(q) ||
        (t.adresseGps || '').toLowerCase().includes(q) ||
        (t.notes || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Indicateurs clés
  const alertesChlore = taches.filter(
    (t) =>
      t.type === 'Tour de chlore' &&
      t.chloreMgL !== null &&
      (t.chloreMgL < 0.1 || t.chloreMgL > 0.5) &&
      t.statut !== 'Terminée'
  ).length;
  const fuitesActives = taches.filter(
    (t) => t.type === 'Fuite' && t.statut !== 'Terminée'
  ).length;
  const aPlanifierCount = taches.filter(
    (t) => !t.agentId || t.statut === 'À planifier'
  ).length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans pb-20 md:pb-8">
      {/* ==================================================================== */}
      {/* TOAST DE NOTIFICATION                                                */}
      {/* ==================================================================== */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl border text-sm font-bold transition-all ${
            toast.type === 'error'
              ? 'bg-red-900 text-white border-red-700'
              : toast.type === 'success'
              ? 'bg-slate-900 text-cyan-300 border-cyan-500/40'
              : 'bg-slate-800 text-white border-slate-700'
          }`}
        >
          <Droplets className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toast.msg}</span>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ÉCRAN DE CONNEXION EN NOM PROPRE (MODALE D'ACCUEIL / BASCULE)        */}
      {/* ==================================================================== */}
      {showLoginModal && (
        <LoginAgentModal
          agents={agents}
          currentAgent={loggedAgent}
          onSelectAgent={(ag) => {
            setLoggedAgent(ag);
            setShowLoginModal(false);
            // Sur mobile ou profil terrain, ouvrir directement la saisie terrain si souhaité
            if (!ag.isAdmin && window.innerWidth < 768) {
              setActiveTab('terrain');
            }
            notify(`Connecté en nom propre : ${ag.nom}`, 'success');
          }}
          onCreateAgent={handleCreateNewAgent}
          onClose={loggedAgent ? () => setShowLoginModal(false) : null}
        />
      )}

      {/* ==================================================================== */}
      {/* EN-TÊTE PRINCIPAL (EN-TÊTE MÉTIER EAU POTABLE)                       */}
      {/* ==================================================================== */}
      <header className="bg-slate-950 text-white sticky top-0 z-30 shadow-lg border-b border-sky-900/60">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Logo AquaGrid Pro */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-sky-600 flex items-center justify-center text-slate-950 shadow-lg shadow-cyan-500/20">
              <Droplets className="w-6 h-6 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                  AquaGrid <span className="text-cyan-400">Pro</span>
                </h1>
                <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  ● Exploitation Eau Potable
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Télégestion terrain, qualité chlore, fuites & planification
              </p>
            </div>
          </div>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('terrain')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs lg:text-sm font-bold transition-all ${
                activeTab === 'terrain'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Saisie Terrain</span>
            </button>

            <button
              onClick={() => setActiveTab('tableur')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs lg:text-sm font-bold transition-all ${
                activeTab === 'tableur'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <TableIcon className="w-4 h-4" />
              <span>Tableur & Suivi</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[11px] ${
                  activeTab === 'tableur'
                    ? 'bg-slate-950 text-cyan-400'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                {taches.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('planning')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs lg:text-sm font-bold transition-all ${
                activeTab === 'planning'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Planning Agents</span>
              {aPlanifierCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 text-[11px] rounded-full font-extrabold">
                  {aPlanifierCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs lg:text-sm font-bold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Synthèse & Carte</span>
            </button>
          </nav>

          {/* Badge Agent Connecté en nom propre */}
          <div>
            {loggedAgent ? (
              <button
                onClick={() => setShowLoginModal(true)}
                title="Changer d'agent connecté"
                className="flex items-center gap-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 px-3 py-1.5 rounded-xl transition-all text-left"
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-xs shrink-0 ${loggedAgent.couleur}`}
                >
                  {loggedAgent.avatar}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                    <span>{loggedAgent.nom}</span>
                  </div>
                  <div className="text-[10px] text-cyan-400 font-semibold truncate max-w-[140px]">
                    {loggedAgent.role}
                  </div>
                </div>
                <LogOut className="w-3.5 h-3.5 text-slate-400 ml-1" />
              </button>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="flex items-center gap-2 bg-cyan-500 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl"
              >
                <LogIn className="w-4 h-4" />
                <span>Se connecter</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* BANDEAU D'ALERTES & INDICATEURS TEMPS RÉEL                           */}
      {/* ==================================================================== */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="font-bold text-slate-700">Fuites actives :</span>
              <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-800 font-extrabold">
                {fuitesActives}
              </span>
            </div>

            <div className="h-4 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-amber-600" />
              <span className="font-bold text-slate-700">
                Alertes Chlore (&lt;0.1 ou &gt;0.5 mg/L) :
              </span>
              <span
                className={`px-2 py-0.5 rounded-md font-extrabold ${
                  alertesChlore > 0
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {alertesChlore}
              </span>
            </div>

            <div className="h-4 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-600" />
              <span className="font-bold text-slate-700">À planifier :</span>
              <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 font-extrabold">
                {aPlanifierCount}
              </span>
            </div>
          </div>

          {/* Bouton raccourci Nouvelle Saisie Terrain */}
          {activeTab !== 'terrain' && (
            <button
              onClick={() => setActiveTab('terrain')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvelle remontée terrain</span>
            </button>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* CORPS DE L'APPLICATION                                               */}
      {/* ==================================================================== */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500">
            <Waves className="w-12 h-12 text-sky-500 animate-bounce mb-3" />
            <p className="font-bold text-sm">
              Connexion aux serveurs d'exploitation AquaGrid...
            </p>
          </div>
        ) : (
          <>
            {/* ============================================================== */}
            {/* VUE 1 : REMONTÉE D'INFORMATIONS TERRAIN (MOBILE & TABLETTE)    */}
            {/* ============================================================== */}
            {activeTab === 'terrain' && (
              <TerrainFormView
                loggedAgent={loggedAgent}
                agents={agents}
                onSubmit={handleCreateTache}
                onCancel={() => setActiveTab('tableur')}
              />
            )}

            {/* ============================================================== */}
            {/* VUE 2 : TABLEUR COMPLET & ÉDITION EN DIRECT (ORDINATEUR)       */}
            {/* ============================================================== */}
            {activeTab === 'tableur' && (
              <SpreadsheetView
                taches={tachesFiltrees}
                allTachesCount={taches.length}
                agents={agents}
                filterType={filterType}
                setFilterType={setFilterType}
                filterStatut={filterStatut}
                setFilterStatut={setFilterStatut}
                filterAgent={filterAgent}
                setFilterAgent={setFilterAgent}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onUpdateTache={handleUpdateTache}
                onSelectTache={setSelectedTache}
                onExportCSV={handleExportCSV}
                onPreviewPhoto={setLightboxUrl}
              />
            )}

            {/* ============================================================== */}
            {/* VUE 3 : PLANNING DES AGENTS AVEC GLISSER-DÉPOSER (DRAG & DROP) */}
            {/* ============================================================== */}
            {activeTab === 'planning' && (
              <PlanningDragDropView
                taches={taches}
                agents={agents}
                onUpdateTache={handleUpdateTache}
                onSelectTache={setSelectedTache}
              />
            )}

            {/* ============================================================== */}
            {/* VUE 4 : TABLEAU DE BORD & LOCALISATION GPS DES INTERVENTIONS   */}
            {/* ============================================================== */}
            {activeTab === 'dashboard' && (
              <DashboardAndMapView
                taches={taches}
                agents={agents}
                onSelectTache={setSelectedTache}
                onPreviewPhoto={setLightboxUrl}
              />
            )}
          </>
        )}
      </main>

      {/* ==================================================================== */}
      {/* BARRE DE NAVIGATION MOBILE INFÉRIEURE (SMARTPHONE)                   */}
      {/* ==================================================================== */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-slate-950 border-t border-slate-800 z-30 px-2 py-1.5 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('terrain')}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl text-[11px] font-bold ${
            activeTab === 'terrain'
              ? 'text-cyan-400 bg-slate-900'
              : 'text-slate-400'
          }`}
        >
          <Camera className="w-5 h-5" />
          <span>Terrain</span>
        </button>

        <button
          onClick={() => setActiveTab('tableur')}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl text-[11px] font-bold ${
            activeTab === 'tableur'
              ? 'text-cyan-400 bg-slate-900'
              : 'text-slate-400'
          }`}
        >
          <TableIcon className="w-5 h-5" />
          <span>Tableur</span>
        </button>

        <button
          onClick={() => setActiveTab('planning')}
          className={`relative flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl text-[11px] font-bold ${
            activeTab === 'planning'
              ? 'text-cyan-400 bg-slate-900'
              : 'text-slate-400'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span>Planning</span>
          {aPlanifierCount > 0 && (
            <span className="absolute top-1 right-2 w-4 h-4 bg-amber-500 text-slate-950 text-[10px] rounded-full flex items-center justify-center font-extrabold">
              {aPlanifierCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl text-[11px] font-bold ${
            activeTab === 'dashboard'
              ? 'text-cyan-400 bg-slate-900'
              : 'text-slate-400'
          }`}
        >
          <MapPin className="w-5 h-5" />
          <span>Carte</span>
        </button>
      </nav>

      {/* ==================================================================== */}
      {/* TIROIR / MODALE DE DÉTAIL ET ÉVOLUTION COMPLÈTE D'UNE TÂCHE          */}
      {/* ==================================================================== */}
      {selectedTache && (
        <TacheDetailModal
          tache={selectedTache}
          agents={agents}
          onClose={() => setSelectedTache(null)}
          onUpdate={(updates) => handleUpdateTache(selectedTache.id, updates)}
          onDelete={() => handleDeleteTache(selectedTache.id)}
          onPreviewPhoto={setLightboxUrl}
        />
      )}

      {/* ==================================================================== */}
      {/* LIGHTBOX PHOTO PLEIN ÉCRAN                                           */}
      {/* ==================================================================== */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 bg-white/15 hover:bg-white/25 text-white p-2.5 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightboxUrl}
            alt="Photo terrain"
            className="max-w-full max-h-[88vh] rounded-xl shadow-2xl object-contain"
          />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// COMPOSANT 1 : MODALE CONNEXION AGENT EN NOM PROPRE
// ============================================================================
function LoginAgentModal({
  agents,
  currentAgent,
  onSelectAgent,
  onCreateAgent,
  onClose,
}) {
  const [modeCreate, setModeCreate] = useState(false);
  const [nom, setNom] = useState('');
  const [role, setRole] = useState('Agent Réseau & Fuites');
  const [secteur, setSecteur] = useState('Secteur Centre');

  const handleSubmitCreate = (e) => {
    e.preventDefault();
    if (!nom.trim()) return;
    onCreateAgent(nom.trim(), role, secteur);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden my-auto">
        <div className="bg-gradient-to-r from-slate-950 to-sky-950 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-400 text-slate-950 flex items-center justify-center">
              <Droplets className="w-6 h-6 fill-slate-950" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg">Connexion Agent</h2>
              <p className="text-xs text-cyan-300">
                Identification nominative d'exploitation
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="p-6">
          {!modeCreate ? (
            <>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Sélectionnez votre profil nominatif :
              </p>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {agents.map((ag) => (
                  <button
                    key={ag.id}
                    onClick={() => onSelectAgent(ag)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      currentAgent?.id === ag.id
                        ? 'bg-sky-50 border-sky-500 ring-1 ring-sky-500'
                        : 'bg-white border-slate-200 hover:border-sky-400 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 ${ag.couleur}`}
                    >
                      {ag.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-extrabold text-slate-900 flex items-center justify-between">
                        <span className="truncate">{ag.nom}</span>
                        {ag.isAdmin && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-cyan-400">
                            Supervision
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-600 font-medium truncate">
                        {ag.role}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {ag.secteur}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setModeCreate(true)}
                  className="w-full py-2.5 px-4 rounded-xl border-2 border-dashed border-sky-300 hover:border-sky-500 text-sky-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nouvel agent ? Créer mon profil nominatif</span>
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmitCreate} className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900">
                Créer un accès agent nominatif
              </h3>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Prénom et Nom *
                </label>
                <input
                  type="text"
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Ex: Nicolas Durand"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Fonction / Spécialité
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold"
                >
                  <option value="Agent Réseau & Fuites">
                    Agent Réseau & Fuites
                  </option>
                  <option value="Agent Usine & Qualité Chlore">
                    Agent Usine & Qualité Chlore
                  </option>
                  <option value="Technicien Maintenance Électroméca">
                    Technicien Maintenance Électroméca
                  </option>
                  <option value="Responsable d’exploitation">
                    Responsable d’exploitation
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Secteur d'affectation
                </label>
                <input
                  type="text"
                  value={secteur}
                  onChange={(e) => setSecteur(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModeCreate(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold"
                >
                  Valider et me connecter
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPOSANT 2 : FORMULAIRE TERRAIN (CHLORE, FUITE, TÂCHE, PHOTOS & GPS)
// ============================================================================
function TerrainFormView({ loggedAgent, agents, onSubmit, onCancel }) {
  const [type, setType] = useState('Tour de chlore'); // 'Tour de chlore' | 'Fuite' | 'Maintenance'
  const [titre, setTitre] = useState('');
  const [ouvrage, setOuvrage] = useState('');
  const [priorite, setPriorite] = useState('Normale');

  // Champs spécifiques Tour de chlore
  const [chloreMgL, setChloreMgL] = useState('0.25');
  const [turbiditeNtu, setTurbiditeNtu] = useState('0.20');

  // Champs spécifiques Fuite
  const [debitFuite, setDebitFuite] = useState('Modérée (Suintement / Flaque)');
  const [diametreConduite, setDiametreConduite] = useState('DN 100 mm');
  const [natureTerrain, setNatureTerrain] = useState('Enrobé voirie');

  // Champs spécifiques Maintenance / Nouvelle tâche
  const [typeMaintenance, setTypeMaintenance] = useState('Vanne de réseau');

  // Affectation directe optionnelle & Notes
  const [agentId, setAgentId] = useState('');
  const [datePlanifiee, setDatePlanifiee] = useState('');
  const [notes, setNotes] = useState('');

  // Photos multiples
  const [photos, setPhotos] = useState([]);
  const fileRef = useRef(null);

  // Géolocalisation GPS
  const [gps, setGps] = useState({
    status: 'idle',
    lat: null,
    lng: null,
    adresse: '',
  });

  // Détection automatique alerte chlore (norme eau potable réseau : 0.10 à 0.50 mg/L)
  const chloreNum = parseFloat(chloreMgL);
  const isChloreAlert =
    type === 'Tour de chlore' &&
    !isNaN(chloreNum) &&
    (chloreNum < 0.1 || chloreNum > 0.5);

  const handleCaptureGps = () => {
    setGps({
      status: 'loading',
      lat: null,
      lng: null,
      adresse: 'Acquisition satellites GPS en cours...',
    });
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          setGps({
            status: 'ok',
            lat: latitude,
            lng: longitude,
            adresse: `GPS Terrain (${latitude.toFixed(5)}, ${longitude.toFixed(
              5
            )} • ±${Math.round(accuracy)}m)`,
          });
        },
        () => {
          // Coordonnées de secours réalistes si GPS navigateur bloqué
          const lat = 45.7578 + (Math.random() - 0.5) * 0.02;
          const lng = 4.832 + (Math.random() - 0.5) * 0.02;
          setGps({
            status: 'ok',
            lat,
            lng,
            adresse: `Secteur Exploitation (${lat.toFixed(5)}, ${lng.toFixed(
              5
            )})`,
          });
        },
        { timeout: 5000 }
      );
    }
  };

  const handleAddPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    try {
      const compressedList = await Promise.all(
        files.slice(0, 4).map((f) => compressPhoto(f))
      );
      setPhotos((prev) => [...prev, ...compressedList].slice(0, 4));
    } catch (err) {
      console.error('Erreur compression photo:', err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const autoTitre =
      titre.trim() ||
      (type === 'Tour de chlore'
        ? `Relevé chlore (${chloreMgL} mg/L) - ${ouvrage || 'Point réseau'}`
        : type === 'Fuite'
        ? `Fuite ${diametreConduite} - ${ouvrage || 'Voirie'}`
        : `Intervention ${typeMaintenance} - ${ouvrage || 'Ouvrage'}`);

    const effectivePriorite =
      (isChloreAlert || type === 'Fuite') && priorite === 'Normale'
        ? 'Haute'
        : priorite;

    onSubmit({
      type,
      titre: autoTitre,
      ouvrage: ouvrage || 'Ouvrage réseau AEP',
      chloreMgL: type === 'Tour de chlore' ? parseFloat(chloreMgL) || 0 : null,
      turbiditeNtu:
        type === 'Tour de chlore' ? parseFloat(turbiditeNtu) || 0 : null,
      debitFuite: type === 'Fuite' ? debitFuite : '',
      diametreConduite: type === 'Fuite' ? diametreConduite : '',
      natureTerrain: type === 'Fuite' ? natureTerrain : '',
      typeMaintenance: type === 'Maintenance' ? typeMaintenance : '',
      priorite: effectivePriorite,
      statut: agentId && datePlanifiee ? 'Planifiée' : 'À planifier',
      agentId,
      datePlanifiee,
      lat: gps.lat,
      lng: gps.lng,
      adresseGps: gps.adresse,
      notes,
      photos,
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* En-tête du formulaire */}
        <div className="bg-gradient-to-r from-slate-900 to-sky-900 text-white px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-base sm:text-lg flex items-center gap-2">
              <Camera className="w-5 h-5 text-cyan-400" />
              <span>Remontée Terrain & Création de Tâche</span>
            </h2>
            <p className="text-xs text-sky-200 mt-0.5">
              Agent connecté :{' '}
              <strong className="text-white">
                {loggedAgent?.nom || 'Agent'}
              </strong>
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-xs font-bold text-slate-300 hover:text-white bg-white/10 px-3 py-1.5 rounded-lg"
          >
            Voir tableur
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          {/* 1. CHOIX DU TYPE DE REMONTÉE */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
              1. Nature de l'intervention / Remontée *
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setType('Tour de chlore')}
                className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 text-center transition-all ${
                  type === 'Tour de chlore'
                    ? 'bg-cyan-50 border-cyan-500 text-cyan-950 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FlaskConical
                  className={`w-6 h-6 ${
                    type === 'Tour de chlore'
                      ? 'text-cyan-600'
                      : 'text-slate-400'
                  }`}
                />
                <span className="text-xs font-extrabold">Tour de chlore</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('Fuite');
                  setPriorite('Urgente');
                }}
                className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 text-center transition-all ${
                  type === 'Fuite'
                    ? 'bg-red-50 border-red-500 text-red-950 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Droplets
                  className={`w-6 h-6 ${
                    type === 'Fuite' ? 'text-red-600' : 'text-slate-400'
                  }`}
                />
                <span className="text-xs font-extrabold">Détection Fuite</span>
              </button>

              <button
                type="button"
                onClick={() => setType('Maintenance')}
                className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 text-center transition-all ${
                  type === 'Maintenance'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-950 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Wrench
                  className={`w-6 h-6 ${
                    type === 'Maintenance'
                      ? 'text-indigo-600'
                      : 'text-slate-400'
                  }`}
                />
                <span className="text-xs font-extrabold">Nouvelle Tâche</span>
              </button>
            </div>
          </div>

          {/* 2. CHAMPS DYNAMIQUES SELON LE TYPE CHOISI */}
          {type === 'Tour de chlore' && (
            <div
              className={`p-4 rounded-2xl border space-y-3 ${
                isChloreAlert
                  ? 'bg-amber-50 border-amber-300'
                  : 'bg-cyan-50/60 border-cyan-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase text-cyan-900 flex items-center gap-1.5">
                  <FlaskConical className="w-4 h-4 text-cyan-600" />
                  Mesures Physico-Chimiques
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  Cible réseau : 0.10 – 0.50 mg/L
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Chlore libre (mg/L) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="5"
                    required
                    value={chloreMgL}
                    onChange={(e) => setChloreMgL(e.target.value)}
                    className={`w-full bg-white border rounded-xl px-3 py-2 text-base font-extrabold ${
                      isChloreAlert
                        ? 'border-red-500 text-red-700'
                        : 'border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Turbidité (NTU)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="50"
                    value={turbiditeNtu}
                    onChange={(e) => setTurbiditeNtu(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-base font-bold text-slate-900"
                  />
                </div>
              </div>

              {isChloreAlert && (
                <div className="flex items-center gap-2 text-xs font-bold text-red-800 bg-red-100 px-3 py-2 rounded-xl">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>
                    Valeur hors plage réglementaire (0.10 - 0.50 mg/L) ! Une
                    alerte prioritaire sera générée.
                  </span>
                </div>
              )}
            </div>
          )}

          {type === 'Fuite' && (
            <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200 space-y-3">
              <span className="text-xs font-extrabold uppercase text-red-900 flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-red-600" />
                Caractérisation de la fuite
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Débit / Gravité
                  </label>
                  <select
                    value={debitFuite}
                    onChange={(e) => setDebitFuite(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-bold"
                  >
                    <option>Faible (Suintement)</option>
                    <option>Modérée (Flaque continue)</option>
                    <option>Importante (Jet / Ravinement)</option>
                    <option>Critique (Casse franche)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Diamètre conduite
                  </label>
                  <select
                    value={diametreConduite}
                    onChange={(e) => setDiametreConduite(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-bold"
                  >
                    <option>Branchement PE Ø32</option>
                    <option>DN 60 / 80 mm</option>
                    <option>DN 100 mm</option>
                    <option>DN 150 mm</option>
                    <option>DN 200+ mm (Adduction)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nature du sol
                  </label>
                  <select
                    value={natureTerrain}
                    onChange={(e) => setNatureTerrain(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-bold"
                  >
                    <option>Enrobé voirie</option>
                    <option>Trottoir / Pavés</option>
                    <option>Accotement / Terre</option>
                    <option>Regard / Chambre vanne</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {type === 'Maintenance' && (
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-3">
              <span className="text-xs font-extrabold uppercase text-indigo-900 flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-indigo-600" />
                Type d'équipement / Intervention
              </span>
              <select
                value={typeMaintenance}
                onChange={(e) => setTypeMaintenance(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold"
              >
                <option>Vanne de réseau / Sectorisation</option>
                <option>Pompe / Surpresseur / Chloration</option>
                <option>Compteur / Débitmètre sectoriel</option>
                <option>Poteau Incendie (PI)</option>
                <option>Purge réseau / Ventouse</option>
                <option>Autre tâche d'exploitation</option>
              </select>
            </div>
          )}

          {/* 3. LOCALISATION DE L'OUVRAGE & INTITULÉ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ouvrage / Point réseau *
              </label>
              <input
                type="text"
                required
                value={ouvrage}
                onChange={(e) => setOuvrage(e.target.value)}
                placeholder="Ex: Réservoir Nord, Rue Pasteur..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Priorité d'intervention
              </label>
              <select
                value={priorite}
                onChange={(e) => setPriorite(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-bold"
              >
                <option value="Basse">Basse</option>
                <option value="Normale">Normale</option>
                <option value="Haute">Haute</option>
                <option value="Urgente">
                  Urgente (Intervention immédiate)
                </option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Titre synthétique de la tâche (optionnel)
            </label>
            <input
              type="text"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="Généré automatiquement si laissé vide..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm"
            />
          </div>

          {/* 4. GÉOLOCALISATION GPS & PHOTOS MULTIPLES */}
          <div className="space-y-3 pt-1">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500">
              2. Géolocalisation GPS & Photos terrain
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleCaptureGps}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 text-xs font-extrabold transition-all ${
                  gps.status === 'ok'
                    ? 'bg-sky-50 border-sky-500 text-sky-900'
                    : 'bg-slate-50 border-slate-300 hover:border-sky-500 text-slate-800'
                }`}
              >
                <MapPin className="w-4 h-4 text-sky-600" />
                <span>
                  {gps.status === 'ok'
                    ? 'Position GPS verrouillée ✓'
                    : 'Localiser ma position GPS'}
                </span>
              </button>

              <div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  capture="environment"
                  onChange={handleAddPhotos}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-cyan-500 bg-slate-50 text-slate-800 text-xs font-extrabold transition-all"
                >
                  <Camera className="w-4 h-4 text-cyan-600" />
                  <span>Ajouter photo(s) ({photos.length}/4)</span>
                </button>
              </div>
            </div>

            {gps.adresse && (
              <div className="flex items-center justify-between gap-2 text-xs bg-sky-50 text-sky-900 px-3.5 py-2.5 rounded-xl border border-sky-200 font-semibold">
                <div className="flex items-center gap-2 truncate">
                  <Navigation className="w-4 h-4 text-sky-600 shrink-0" />
                  <span className="truncate">{gps.adresse}</span>
                </div>
                {gps.lat && (
                  <a
                    href={`https://www.google.com/maps?q=${gps.lat},${gps.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-700 underline shrink-0"
                  >
                    Vérifier carte
                  </a>
                )}
              </div>
            )}

            {/* Galerie de prévisualisation des photos multiples */}
            {photos.length > 0 && (
              <div className="grid grid-cols-4 gap-2.5">
                {photos.map((src, idx) => (
                  <div
                    key={idx}
                    className="relative h-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-900"
                  >
                    <img
                      src={src}
                      alt={`Capture ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setPhotos((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="absolute top-1 right-1 bg-black/75 text-white p-1 rounded-lg hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 5. OBSERVATIONS & AFFECTATION RAPIDE OPTIONNELLE */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Observations / Matériel nécessaire
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Précisions techniques pour l'équipe d'intervention..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm"
            />
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                Affecter directement à (Optionnel)
              </label>
              <select
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-xs font-bold"
              >
                <option value="">-- Laisser dans "À planifier" --</option>
                {agents.map((ag) => (
                  <option key={ag.id} value={ag.id}>
                    {ag.nom} ({ag.role.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                Date souhaitée
              </label>
              <select
                value={datePlanifiee}
                onChange={(e) => setDatePlanifiee(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-xs font-bold"
              >
                <option value="">-- Non datée --</option>
                {JOURS_SEMAINE.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white font-extrabold text-sm shadow-lg shadow-sky-500/20 transition-all active:scale-[0.99]"
          >
            Enregistrer & Transmettre au Bureau d'Exploitation
          </button>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// COMPOSANT 3 : VUE TABLEUR & ÉDITION DIRECTE (FORMAT BASE DE DONNÉES)
// ============================================================================
function SpreadsheetView({
  taches,
  allTachesCount,
  agents,
  filterType,
  setFilterType,
  filterStatut,
  setFilterStatut,
  filterAgent,
  setFilterAgent,
  searchQuery,
  setSearchQuery,
  onUpdateTache,
  onSelectTache,
  onExportCSV,
  onPreviewPhoto,
}) {
  return (
    <div className="space-y-4">
      {/* Barre d'outils & Filtres du Tableur */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <TableIcon className="w-5 h-5 text-sky-600" />
              <span>
                Registre & Tableur d'Exploitation ({taches.length} /{' '}
                {allTachesCount})
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Modifiez directement le statut, la priorité, l'agent ou la date
              dans les cellules, ou cliquez sur une ligne pour ouvrir sa fiche
              complète.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Recherche rapide */}
            <div className="relative flex-1 sm:flex-none">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher ouvrage, code, rue..."
                className="w-full sm:w-60 bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <button
              onClick={onExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 text-xs font-bold transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filtres par pilules Type + Sélecteurs Statut / Agent */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          {/* Onglets de filtrage par Type de tâche */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['Tous', 'Tour de chlore', 'Fuite', 'Maintenance'].map(
              (typeOpt) => (
                <button
                  key={typeOpt}
                  onClick={() => setFilterType(typeOpt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold whitespace-nowrap transition-all ${
                    filterType === typeOpt
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {typeOpt}
                </button>
              )
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700"
            >
              <option value="Tous">Tous les statuts</option>
              <option value="À planifier">À planifier</option>
              <option value="Planifiée">Planifiée</option>
              <option value="En cours">En cours</option>
              <option value="Terminée">Terminée</option>
            </select>

            <select
              value={filterAgent}
              onChange={(e) => setFilterAgent(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700"
            >
              <option value="Tous">Tous les agents</option>
              <option value="Non affecté">Non affecté</option>
              {agents.map((ag) => (
                <option key={ag.id} value={ag.id}>
                  {ag.nom}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tableau Style Tableur Professionnel */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-slate-600 uppercase tracking-wider font-extrabold text-[11px]">
                <th className="py-3 px-3 border-r border-slate-200">ID</th>
                <th className="py-3 px-3 border-r border-slate-200">Type</th>
                <th className="py-3 px-3 border-r border-slate-200 min-w-[220px]">
                  Tâche & Ouvrage
                </th>
                <th className="py-3 px-3 border-r border-slate-200 min-w-[160px]">
                  Données Terrain
                </th>
                <th className="py-3 px-3 border-r border-slate-200">
                  Priorité
                </th>
                <th className="py-3 px-3 border-r border-slate-200">
                  Statut (Évolution)
                </th>
                <th className="py-3 px-3 border-r border-slate-200 min-w-[155px]">
                  Agent Affecté
                </th>
                <th className="py-3 px-3 border-r border-slate-200 min-w-[130px]">
                  Date Planifiée
                </th>
                <th className="py-3 px-3 border-r border-slate-200">
                  GPS & Médias
                </th>
                <th className="py-3 px-3 text-center">Fiche</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {taches.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="py-10 text-center text-slate-400 font-semibold"
                  >
                    Aucune tâche ne correspond aux filtres sélectionnés.
                  </td>
                </tr>
              ) : (
                taches.map((t) => {
                  const isChloreBad =
                    t.type === 'Tour de chlore' &&
                    t.chloreMgL !== null &&
                    (t.chloreMgL < 0.1 || t.chloreMgL > 0.5);
                  const isDone = t.statut === 'Terminée';

                  return (
                    <tr
                      key={t.id}
                      className={`hover:bg-sky-50/50 transition-colors ${
                        isDone ? 'bg-slate-50/70' : 'bg-white'
                      }`}
                    >
                      {/* ID */}
                      <td className="py-2.5 px-3 border-r border-slate-200 font-mono font-bold text-slate-600 whitespace-nowrap">
                        {t.code}
                      </td>

                      {/* Type */}
                      <td className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md font-extrabold text-[11px] ${
                            t.type === 'Tour de chlore'
                              ? 'bg-cyan-100 text-cyan-900'
                              : t.type === 'Fuite'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          {t.type === 'Tour de chlore' && (
                            <FlaskConical className="w-3 h-3" />
                          )}
                          {t.type === 'Fuite' && (
                            <Droplets className="w-3 h-3" />
                          )}
                          {t.type === 'Maintenance' && (
                            <Wrench className="w-3 h-3" />
                          )}
                          {t.type}
                        </span>
                      </td>

                      {/* Tâche & Ouvrage */}
                      <td
                        onClick={() => onSelectTache(t)}
                        className="py-2.5 px-3 border-r border-slate-200 cursor-pointer group"
                      >
                        <div
                          className={`font-bold text-slate-900 group-hover:text-sky-700 ${
                            isDone ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {t.titre}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[260px]">
                          {t.ouvrage} •{' '}
                          <span className="italic">par {t.createurNom}</span>
                        </div>
                      </td>

                      {/* Données techniques spécifiques */}
                      <td className="py-2.5 px-3 border-r border-slate-200">
                        {t.type === 'Tour de chlore' && (
                          <div className="space-y-0.5">
                            <span
                              className={`inline-block px-2 py-0.5 rounded font-extrabold ${
                                isChloreBad
                                  ? 'bg-red-600 text-white'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              Cl₂ : {t.chloreMgL} mg/L
                            </span>
                            {t.turbiditeNtu !== null && (
                              <div className="text-[11px] text-slate-500">
                                Turb : {t.turbiditeNtu} NTU
                              </div>
                            )}
                          </div>
                        )}
                        {t.type === 'Fuite' && (
                          <div className="text-[11px] space-y-0.5">
                            <div className="font-bold text-red-700">
                              {t.diametreConduite}
                            </div>
                            <div className="text-slate-600 truncate max-w-[160px]">
                              {t.debitFuite}
                            </div>
                          </div>
                        )}
                        {t.type === 'Maintenance' && (
                          <div className="text-[11px] font-semibold text-indigo-900">
                            {t.typeMaintenance || 'Maintenance réseau'}
                          </div>
                        )}
                      </td>

                      {/* Priorité (Éditable en direct) */}
                      <td className="py-2.5 px-3 border-r border-slate-200">
                        <select
                          value={t.priorite}
                          onChange={(e) =>
                            onUpdateTache(t.id, { priorite: e.target.value })
                          }
                          className={`rounded-lg px-2 py-1 font-extrabold text-[11px] border cursor-pointer ${
                            t.priorite === 'Urgente'
                              ? 'bg-red-50 text-red-700 border-red-300'
                              : t.priorite === 'Haute'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          <option value="Basse">Basse</option>
                          <option value="Normale">Normale</option>
                          <option value="Haute">Haute</option>
                          <option value="Urgente">Urgente</option>
                        </select>
                      </td>

                      {/* Statut (Éditable en direct jusqu'à Terminée) */}
                      <td className="py-2.5 px-3 border-r border-slate-200">
                        <select
                          value={t.statut}
                          onChange={(e) =>
                            onUpdateTache(t.id, { statut: e.target.value })
                          }
                          className={`rounded-lg px-2.5 py-1 font-extrabold text-[11px] border cursor-pointer ${
                            t.statut === 'Terminée'
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : t.statut === 'En cours'
                              ? 'bg-sky-100 text-sky-900 border-sky-300'
                              : t.statut === 'Planifiée'
                              ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                              : 'bg-amber-100 text-amber-900 border-amber-300'
                          }`}
                        >
                          <option value="À planifier">À planifier</option>
                          <option value="Planifiée">Planifiée</option>
                          <option value="En cours">En cours</option>
                          <option value="Terminée">✓ Terminée</option>
                        </select>
                      </td>

                      {/* Agent Affecté (Éditable en direct) */}
                      <td className="py-2.5 px-3 border-r border-slate-200">
                        <select
                          value={t.agentId || ''}
                          onChange={(e) => {
                            const newAgent = e.target.value;
                            onUpdateTache(t.id, {
                              agentId: newAgent,
                              statut:
                                newAgent && t.statut === 'À planifier'
                                  ? 'Planifiée'
                                  : t.statut,
                            });
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-800"
                        >
                          <option value="">-- Non affecté --</option>
                          {agents.map((ag) => (
                            <option key={ag.id} value={ag.id}>
                              {ag.nom}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Date Planifiée (Éditable en direct) */}
                      <td className="py-2.5 px-3 border-r border-slate-200">
                        <select
                          value={t.datePlanifiee || ''}
                          onChange={(e) =>
                            onUpdateTache(t.id, {
                              datePlanifiee: e.target.value,
                            })
                          }
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-semibold text-slate-700"
                        >
                          <option value="">-- Sans date --</option>
                          {JOURS_SEMAINE.map((j) => (
                            <option key={j.id} value={j.id}>
                              {j.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* GPS & Photos */}
                      <td className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {t.lat && t.lng ? (
                            <a
                              href={`https://www.google.com/maps?q=${t.lat},${t.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={t.adresseGps || `${t.lat}, ${t.lng}`}
                              className="p-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200"
                            >
                              <MapPin className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <span className="text-slate-300 px-1">-</span>
                          )}

                          {t.photos && t.photos.length > 0 && (
                            <button
                              onClick={() => onPreviewPhoto(t.photos[0])}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                            >
                              <ImageIcon className="w-3.5 h-3.5 text-cyan-600" />
                              <span>{t.photos.length}</span>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Bouton Ouvrir Détail / Évolution */}
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => onSelectTache(t)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-sky-600 text-white font-bold transition-colors"
                        >
                          Ouvrir
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPOSANT 4 : PLANNING DES AGENTS AVEC GLISSER-DÉPOSER (DRAG & DROP)
// ============================================================================
function PlanningDragDropView({
  taches,
  agents,
  onUpdateTache,
  onSelectTache,
}) {
  const [draggedTacheId, setDraggedTacheId] = useState(null);
  const [dragOverCell, setDragOverCell] = useState(null); // `${agentId}_${jourId}`

  const tachesNonPlanifiees = taches.filter(
    (t) => (!t.agentId || !t.datePlanifiee) && t.statut !== 'Terminée'
  );

  const handleDragStart = (e, tacheId) => {
    setDraggedTacheId(tacheId);
    e.dataTransfer.setData('text/plain', tacheId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, cellKey) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCell !== cellKey) {
      setDragOverCell(cellKey);
    }
  };

  const handleDropOnCell = (e, agentId, jourId) => {
    e.preventDefault();
    const tacheId = e.dataTransfer.getData('text/plain') || draggedTacheId;
    setDragOverCell(null);
    setDraggedTacheId(null);
    if (!tacheId) return;

    onUpdateTache(tacheId, {
      agentId,
      datePlanifiee: jourId,
      statut: 'Planifiée',
    });
  };

  const handleDropBackToUnassigned = (e) => {
    e.preventDefault();
    const tacheId = e.dataTransfer.getData('text/plain') || draggedTacheId;
    setDragOverCell(null);
    setDraggedTacheId(null);
    if (!tacheId) return;

    onUpdateTache(tacheId, {
      agentId: '',
      datePlanifiee: '',
      statut: 'À planifier',
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-600" />
            <span>Planning Hebdomadaire des Agents (Glisser-Déposer)</span>
          </h2>
          <p className="text-xs text-slate-500">
            Faites glisser une tâche depuis la colonne de gauche directement
            dans la case d'un agent et d'un jour pour l'affecter instantanément.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* COLONNE GAUCHE : TÂCHES À PLANIFIER (DRAGGABLE) */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDropBackToUnassigned}
          className="xl:col-span-3 bg-white rounded-2xl border-2 border-dashed border-slate-300 p-3.5 space-y-3"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              À planifier ({tachesNonPlanifiees.length})
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              Glisser →
            </span>
          </div>

          {tachesNonPlanifiees.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Toutes les tâches sont affectées au planning !
            </div>
          ) : (
            <div className="space-y-2.5">
              {tachesNonPlanifiees.map((t) => (
                <div
                  key={t.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, t.id)}
                  onClick={() => onSelectTache(t)}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-400 cursor-grab active:cursor-grabbing shadow-xs transition-all group"
                >
                  <div className="flex items-start justify-between gap-1.5 mb-1">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${
                        t.type === 'Fuite'
                          ? 'bg-red-100 text-red-800'
                          : t.type === 'Tour de chlore'
                          ? 'bg-cyan-100 text-cyan-900'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {t.type}
                    </span>
                    <GripVertical className="w-4 h-4 text-slate-400 group-hover:text-sky-600 shrink-0" />
                  </div>
                  <div className="text-xs font-extrabold text-slate-900 line-clamp-2 mb-1">
                    {t.titre}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {t.ouvrage}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* GRILLE PLANNING DES AGENTS (DROP ZONES) */}
        <div className="xl:col-span-9 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full border-collapse min-w-[780px]">
            <thead>
              <tr className="bg-slate-900 text-white text-xs">
                <th className="py-3 px-4 text-left font-extrabold w-48 border-r border-slate-800">
                  Agent d'exploitation
                </th>
                {JOURS_SEMAINE.map((jour) => (
                  <th
                    key={jour.id}
                    className="py-3 px-2.5 text-center font-extrabold border-r border-slate-800 last:border-r-0"
                  >
                    {jour.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {agents.map((agent) => (
                <tr key={agent.id} className="align-top">
                  {/* Info Agent */}
                  <td className="p-3 bg-slate-50 border-r border-slate-200">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-xs shrink-0 ${agent.couleur}`}
                      >
                        {agent.avatar}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-extrabold text-slate-900 truncate">
                          {agent.nom}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {agent.role}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Cellules par jour (Drop zones) */}
                  {JOURS_SEMAINE.map((jour) => {
                    const cellKey = `${agent.id}_${jour.id}`;
                    const cellTaches = taches.filter(
                      (t) =>
                        t.agentId === agent.id && t.datePlanifiee === jour.id
                    );
                    const isOver = dragOverCell === cellKey;

                    return (
                      <td
                        key={jour.id}
                        onDragOver={(e) => handleDragOver(e, cellKey)}
                        onDragLeave={() => setDragOverCell(null)}
                        onDrop={(e) => handleDropOnCell(e, agent.id, jour.id)}
                        className={`p-2 border-r border-slate-200 last:border-r-0 min-h-[110px] h-28 transition-colors ${
                          isOver
                            ? 'bg-cyan-100/70 ring-2 ring-inset ring-cyan-500'
                            : 'bg-white hover:bg-slate-50/60'
                        }`}
                      >
                        <div className="space-y-1.5">
                          {cellTaches.map((t) => (
                            <div
                              key={t.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, t.id)}
                              onClick={() => onSelectTache(t)}
                              className={`p-2 rounded-lg border text-[11px] cursor-grab active:cursor-grabbing shadow-xs transition-all ${
                                t.statut === 'Terminée'
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950 opacity-80'
                                  : t.type === 'Fuite'
                                  ? 'bg-red-50 border-red-300 text-red-950'
                                  : t.type === 'Tour de chlore'
                                  ? 'bg-cyan-50 border-cyan-300 text-cyan-950'
                                  : 'bg-indigo-50 border-indigo-300 text-indigo-950'
                              }`}
                            >
                              <div className="flex items-center justify-between font-extrabold mb-0.5">
                                <span>{t.code}</span>
                                {t.statut === 'Terminée' && (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                )}
                              </div>
                              <div
                                className={`font-bold line-clamp-2 ${
                                  t.statut === 'Terminée' ? 'line-through' : ''
                                }`}
                              >
                                {t.titre}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPOSANT 5 : SYNTHÈSE QUALITÉ CHLORE & CARTE GPS DES INTERVENTIONS
// ============================================================================
function DashboardAndMapView({
  taches,
  agents,
  onSelectTache,
  onPreviewPhoto,
}) {
  const relevesChlore = taches.filter((t) => t.type === 'Tour de chlore');
  const tachesGeolocalisees = taches.filter((t) => t.lat && t.lng);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Colonne Gauche : Suivi Qualité Chlore */}
      <div className="lg:col-span-5 space-y-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 mb-1">
            <FlaskConical className="w-5 h-5 text-cyan-600" />
            <span>Suivi des Tours de Chlore (mg/L)</span>
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Plage réglementaire réseau : <strong>0.10 mg/L à 0.50 mg/L</strong>.
          </p>

          <div className="space-y-3">
            {relevesChlore.map((rel) => {
              const val = rel.chloreMgL ?? 0;
              const isAlert = val < 0.1 || val > 0.5;
              const pct = Math.min(100, Math.round((val / 0.8) * 100));

              return (
                <div
                  key={rel.id}
                  onClick={() => onSelectTache(rel)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isAlert
                      ? 'bg-red-50/70 border-red-300'
                      : 'bg-slate-50 border-slate-200 hover:border-cyan-400'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-extrabold mb-1">
                    <span className="text-slate-900 truncate pr-2">
                      {rel.ouvrage}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded ${
                        isAlert
                          ? 'bg-red-600 text-white'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {val.toFixed(2)} mg/L
                    </span>
                  </div>

                  {/* Jauge visuelle */}
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden my-2">
                    <div
                      className={`h-full rounded-full ${
                        isAlert ? 'bg-red-500' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Relevé par {rel.createurNom}</span>
                    <span>{rel.dateCreation}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Colonne Droite : Interventions Géolocalisées sur le Réseau */}
      <div className="lg:col-span-7 space-y-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 mb-1">
            <MapPin className="w-5 h-5 text-sky-600" />
            <span>
              Points d'Intervention Géolocalisés ({tachesGeolocalisees.length})
            </span>
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Cliquez sur un point GPS pour ouvrir l'itinéraire Google Maps ou
            consulter les photos terrain.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {tachesGeolocalisees.map((t) => {
              const ag = agents.find((a) => a.id === t.agentId);
              return (
                <div
                  key={t.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          t.type === 'Fuite'
                            ? 'bg-red-100 text-red-800'
                            : t.type === 'Tour de chlore'
                            ? 'bg-cyan-100 text-cyan-900'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {t.type} • {t.code}
                      </span>
                      <span className="text-[11px] font-bold text-slate-600">
                        {t.statut}
                      </span>
                    </div>

                    <h4
                      onClick={() => onSelectTache(t)}
                      className="text-sm font-extrabold text-slate-900 hover:text-sky-700 cursor-pointer mb-1"
                    >
                      {t.titre}
                    </h4>

                    <div className="text-xs text-slate-600 flex items-center gap-1.5 mb-2">
                      <Navigation className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span className="truncate">
                        {t.adresseGps || `${t.lat}, ${t.lng}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-xs">
                    <span className="font-semibold text-slate-600">
                      {ag ? `Agent : ${ag.nom}` : 'Non affecté'}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {t.photos?.[0] && (
                        <button
                          onClick={() => onPreviewPhoto(t.photos[0])}
                          className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                          title="Voir photo"
                        >
                          <Camera className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <a
                        href={`https://www.google.com/maps?q=${t.lat},${t.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold"
                      >
                        <span>GPS</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPOSANT 6 : MODALE DE DÉTAIL COMPLET & ÉVOLUTION D'UNE TÂCHE
// ============================================================================
function TacheDetailModal({
  tache,
  agents,
  onClose,
  onUpdate,
  onDelete,
  onPreviewPhoto,
}) {
  const [notes, setNotes] = useState(tache.notes || '');
  const [statut, setStatut] = useState(tache.statut || 'À planifier');
  const [priorite, setPriorite] = useState(tache.priorite || 'Normale');
  const [agentId, setAgentId] = useState(tache.agentId || '');
  const [datePlanifiee, setDatePlanifiee] = useState(tache.datePlanifiee || '');
  const [chloreMgL, setChloreMgL] = useState(tache.chloreMgL ?? '');

  const handleSave = (e) => {
    e.preventDefault();
    const updates: Record<string, any> = {
      notes,
      statut,
      priorite,
      agentId,
      datePlanifiee,
    };
    if (tache.type === 'Tour de chlore' && chloreMgL !== '') {
      updates.chloreMgL = parseFloat(chloreMgL);
    }
    onUpdate(updates);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-cyan-400">
                {tache.code}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-white/10 font-bold">
                {tache.type}
              </span>
            </div>
            <h3 className="font-extrabold text-base sm:text-lg mt-0.5">
              {tache.titre}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form
          onSubmit={handleSave}
          className="p-6 space-y-5 max-h-[82vh] overflow-y-auto"
        >
          {/* Infos origine & GPS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-400 block">
                Ouvrage / Localisation
              </span>
              <strong className="text-slate-900">{tache.ouvrage}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Remonté par</span>
              <strong className="text-slate-900">
                {tache.createurNom} ({tache.dateCreation})
              </strong>
            </div>
            {tache.lat && tache.lng && (
              <div className="sm:col-span-2 pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="text-slate-700 font-semibold flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-sky-600" />
                  {tache.adresseGps || `${tache.lat}, ${tache.lng}`}
                </span>
                <a
                  href={`https://www.google.com/maps?q=${tache.lat},${tache.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-700 font-extrabold underline"
                >
                  Ouvrir Google Maps →
                </a>
              </div>
            )}
          </div>

          {/* Données spécifiques selon le type */}
          {tache.type === 'Tour de chlore' && (
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-cyan-50 border border-cyan-200">
              <div>
                <label className="block text-xs font-bold text-cyan-950 mb-1">
                  Taux de chlore libre (mg/L)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={chloreMgL}
                  onChange={(e) => setChloreMgL(e.target.value)}
                  className="w-full bg-white border border-cyan-300 rounded-lg px-3 py-2 text-sm font-extrabold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-cyan-950 mb-1">
                  Turbidité relevée
                </label>
                <div className="py-2 px-3 bg-white/70 rounded-lg text-sm font-bold text-slate-700">
                  {tache.turbiditeNtu ?? '-'} NTU
                </div>
              </div>
            </div>
          )}

          {tache.type === 'Fuite' && (
            <div className="grid grid-cols-3 gap-2 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs">
              <div>
                <span className="text-red-700 block">Débit</span>
                <strong>{tache.debitFuite}</strong>
              </div>
              <div>
                <span className="text-red-700 block">Conduite</span>
                <strong>{tache.diametreConduite}</strong>
              </div>
              <div>
                <span className="text-red-700 block">Sol / Voirie</span>
                <strong>{tache.natureTerrain}</strong>
              </div>
            </div>
          )}

          {/* Pilotage & Évolution de la tâche */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                État d'avancement
              </label>
              <select
                value={statut}
                onChange={(e) => setStatut(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-extrabold"
              >
                <option value="À planifier">À planifier</option>
                <option value="Planifiée">Planifiée</option>
                <option value="En cours">En cours d'intervention</option>
                <option value="Terminée">✓ Terminée / Clôturée</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Priorité
              </label>
              <select
                value={priorite}
                onChange={(e) => setPriorite(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-bold"
              >
                <option value="Basse">Basse</option>
                <option value="Normale">Normale</option>
                <option value="Haute">Haute</option>
                <option value="Urgente">Urgente</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Agent affecté
              </label>
              <select
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-bold"
              >
                <option value="">-- Non affecté --</option>
                {agents.map((ag) => (
                  <option key={ag.id} value={ag.id}>
                    {ag.nom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Date d'intervention
              </label>
              <select
                value={datePlanifiee}
                onChange={(e) => setDatePlanifiee(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-bold"
              >
                <option value="">-- Non planifiée --</option>
                {JOURS_SEMAINE.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Compte-rendu & Notes d'évolution */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Compte-rendu d'intervention & Observations
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Saisissez l'évolution des travaux, pièces posées, résultats de purge..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm"
            />
          </div>

          {/* Galerie photos attachées */}
          {tache.photos && tache.photos.length > 0 && (
            <div>
              <span className="block text-xs font-bold uppercase text-slate-500 mb-2">
                Photos terrain jointes ({tache.photos.length})
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {tache.photos.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`Preuve ${idx + 1}`}
                    onClick={() => onPreviewPhoto(url)}
                    className="h-24 w-full object-cover rounded-xl border border-slate-200 cursor-pointer hover:opacity-90"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onDelete}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>Supprimer</span>
            </button>

            <div className="flex items-center gap-2">
              {statut !== 'Terminée' && (
                <button
                  type="button"
                  onClick={() => {
                    onUpdate({
                      notes,
                      statut: 'Terminée',
                      priorite,
                      agentId,
                      datePlanifiee,
                    });
                    onClose();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Clôturer (Terminée)</span>
                </button>
              )}

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold"
              >
                Enregistrer les modifications
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
