import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, ShoppingBag, Menu, X, Plus, Trash2, ChevronRight, 
  User, Headset, CreditCard, ShieldCheck, ArrowRight, 
  ChevronLeft, LogIn, LogOut, Package, Mail, Lock, CheckCircle2,
  LayoutDashboard, Eye, Clock, Calendar, Hash, Loader2, Sparkles, MessageCircle, Send, ArrowUp, Database, UploadCloud, AlertTriangle
} from 'lucide-react';

import { initializeApp } from 'firebase/app';
import { 
  getAuth, signInAnonymously, signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, onAuthStateChanged, signOut, signInWithCustomToken
} from 'firebase/auth';
import { 
  getFirestore, collection, doc, setDoc, addDoc, 
  onSnapshot, query, where, updateDoc, deleteDoc
} from 'firebase/firestore';

// TA CONFIGURATION FIREBASE PRIVÉE ET CONFIGURÉE
const firebaseConfig = {
  apiKey: "AIzaSyDpqynpyHRAsGtYHDrynRZvJ922HZPdhPQ",
  authDomain: "kit-26.firebaseapp.com",
  projectId: "kit-26",
  storageBucket: "kit-26.firebasestorage.app",
  messagingSenderId: "570763589318",
  appId: "1:570763589318:web:d8a76e3a1f333506df49c7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'kit-26-pro';

const apiKey = ""; 

const callGemini = async (userQuery, systemPrompt) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  const payload = { contents: [{ parts: [{ text: userQuery }] }], systemInstruction: { parts: [{ text: systemPrompt }] } };
  let delay = 1000;
  for (let i = 0; i < 5; i++) {
    try {
      const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error('API Error');
      const result = await response.json();
      return result.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch (err) {
      if (i === 4) throw err;
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
};

const ADMIN_EMAIL = "admin@kit26.fr"; 
const WHATSAPP_NUMBER = "33744878584"; 
const LOCATIONS_FR = ["Paris", "Lyon", "Marseille", "Yvelines", "Gironde", "Bretagne", "Normandie", "Toulouse", "Nice", "Nantes", "Strasbourg", "Montpellier", "Bordeaux", "Lille", "Rennes", "Reims"];

const CATEGORIES = ["COUPE DU MONDE 2026", "LIGUE 1", "SERIE A", "PREMIER LEAGUE", "BUNDESLIGA", "LIGA", "RÉTRO", "AUTRES CLUBS", "SURVÊTEMENTS", "ENFANT"];

const SUBCATEGORIES = {
  "COUPE DU MONDE 2026": ["Mexico", "France", "Germany", "Brazil", "Portugal", "England", "Argentina", "Italy", "Netherlands", "Spain", "Japan", "Morocco", "Senegal", "Uruguay", "Algeria", "Korea", "Jamaica", "Soviet Union", "Colombia", "Chile"],
  "LIGUE 1": ["PSG", "Marseille", "Lyon", "Monaco", "Lille", "Strasbourg", "Paris FC"],
  "SERIE A": ["Juventus", "AC Milan", "Inter Milan", "AS Roma", "Napoli", "Parma", "Lazio", "Fiorentina"],
  "PREMIER LEAGUE": ["Liverpool", "Manchester City", "Manchester Utd", "Chelsea", "Arsenal", "Tottenham"],
  "BUNDESLIGA": ["Bayern Munich", "Borussia Dortmund", "Bayer Leverkusen", "RB Leipzig"],
  "LIGA": ["Real Madrid", "Barcelona", "Atletico Madrid", "Girona"],
  "RÉTRO": ["Classic", "France Retro", "Brazil Retro", "AC Milan Retro", "Inter Milan Retro", "Bayern Retro", "Arsenal Retro", "Real Madrid Retro", "Man Utd Retro", "Juventus Retro", "Argentina Retro", "Liverpool Retro"],
  "AUTRES CLUBS": ["Ajax", "Inter Miami", "Boca Juniors", "River Plate", "Galatasaray"],
  "SURVÊTEMENTS": ["Real Madrid", "Barcelona", "PSG", "Chelsea", "Bayern Munich", "Manchester City", "Arsenal", "Juventus", "AC Milan"],
  "ENFANT": ["France Kids", "PSG Kids", "Real Madrid Kids", "Barcelona Kids", "Manchester City Kids", "Arsenal Kids", "Juventus Kids", "AC Milan Kids", "Inter Miami Kids", "Bayern Kids", "Brazil Kids", "Argentina Kids"]
};

const BADGES_BY_CATEGORY = {
  "LIGUE 1": [
    { id: 'l1', name: 'Ligue 1 McDonald\'s', price: 2.00, img: 'https://cdn-icons-png.flaticon.com/512/8825/8825595.png' }, 
    { id: 'l1-champ', name: 'Champion de France', price: 2.00, img: 'https://cdn-icons-png.flaticon.com/512/8825/8825586.png' }
  ],
  "PREMIER LEAGUE": [
    { id: 'pl', name: 'Premier League', price: 2.00, img: 'https://cdn-icons-png.flaticon.com/512/8825/8825615.png' },
    { id: 'pl-champ', name: 'Champion PL', price: 2.00, img: 'https://cdn-icons-png.flaticon.com/512/8825/8825586.png' }
  ],
  "LIGA": [
    { id: 'liga', name: 'La Liga EA Sports', price: 2.00, img: 'https://cdn-icons-png.flaticon.com/512/8825/8825586.png' },
    { id: 'liga-champ', name: 'Champion La Liga', price: 2.00, img: 'https://cdn-icons-png.flaticon.com/512/8825/8825586.png' }
  ],
  "SERIE A": [
    { id: 'seriea', name: 'Serie A Enilive', price: 2.00, img: 'https://cdn-icons-png.flaticon.com/512/8825/8825595.png' },
    { id: 'seriea-champ', name: 'Scudetto (Champion)', price: 2.00, img: 'https://cdn-icons-png.flaticon.com/512/8825/8825586.png' }
  ],
  "BUNDESLIGA": [
    { id: 'bundes', name: 'Bundesliga', price: 2.00, img: 'https://cdn-icons-png.flaticon.com/512/8825/8825615.png' },
    { id: 'bundes-champ', name: 'Champion Bundesliga', price: 2.00, img: 'https://cdn-icons-png.flaticon.com/512/8825/8825586.png' }
  ],
  "COUPE DU MONDE 2026": [
    { id: 'wc26', name: 'FIFA World Cup 2026', price: 2.00, img: 'https://cdn-icons-png.flaticon.com/512/8825/8825595.png' },
    { id: 'wc-champ', name: 'Champion du Monde', price: 2.00, img: 'https://cdn-icons-png.flaticon.com/512/8825/8825586.png' }
  ],
  "RÉTRO": [
    { id: 'retro', name: 'Badge Époque Original', price: 2.00, img: 'https://cdn-icons-png.flaticon.com/512/8825/8825595.png' }
  ],
  "DEFAULT": [
    { id: 'respect', name: 'Respect UEFA', price: 2.00, img: 'https://cdn-icons-png.flaticon.com/512/8825/8825595.png' }
  ]
};

const UCL_BADGES = [
  { id: 'ucl', name: 'Champions League', price: 2.00, img: 'https://cdn-icons-png.flaticon.com/512/8825/8825595.png' },
  { id: 'ucl-found', name: 'UEFA Foundation', price: 2.00, img: 'https://cdn-icons-png.flaticon.com/512/8825/8825595.png' },
  { id: 'ucl-winner', name: 'Vainqueur LDC', price: 2.00, img: 'https://cdn-icons-png.flaticon.com/512/8825/8825586.png' }
];

const SIZES = [
  { name: 'S', price: 0 }, { name: 'M', price: 0 }, { name: 'L', price: 0 }, { name: 'XL', price: 0 }, 
  { name: '2XL', price: 1.00 }, { name: '3XL', price: 2.00 }, { name: '4XL', price: 3.00 }
];

const deduplicateProducts = (productList) => {
  const grouped = {};
  productList.forEach(p => {
    const key = p.name.toLowerCase().trim();
    if (!grouped[key]) {
      grouped[key] = p;
    } else {
      if (p.images.length > grouped[key].images.length) {
        grouped[key] = p;
      }
    }
  });
  return Object.values(grouped);
};

const generatePlaceholders = () => {
  const list = [];
  CATEGORIES.forEach(cat => {
    for (let i = 1; i <= 60; i++) {
      list.push({
        id: `template-${cat}-${i}`,
        category: cat,
        subCategory: SUBCATEGORIES[cat] ? SUBCATEGORIES[cat][0] : "Autre",
        name: `Modèle ${cat} - ${i}`,
        basePrice: 29.99,
        oldPrice: 79.99,
        discount: "-62%",
        isPlaceholder: true,
        images: [
          `https://placehold.co/800x1000/111111/06b6d4?text=GALERIE+VIDE%0A${encodeURIComponent(cat)}+${i}%0A(Photo+1)`,
          `https://placehold.co/800x1000/111111/06b6d4?text=GALERIE+VIDE%0A${encodeURIComponent(cat)}+${i}%0A(Photo+2)`,
          `https://placehold.co/800x1000/111111/06b6d4?text=GALERIE+VIDE%0A${encodeURIComponent(cat)}+${i}%0A(Photo+3)`
        ]
      });
    }
  });
  return list;
};

const INITIAL_PRODUCTS = generatePlaceholders();

// BANNIÈRE CONTACT WHATSAPP POUR LE BAS DES CATÉGORIES
const WhatsAppBanner = () => (
  <div className="bg-zinc-900/80 border-2 border-dashed border-zinc-800 rounded-[3rem] p-8 md:p-12 text-center mt-16 shadow-2xl relative overflow-hidden">
    <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
    
    <h3 className="text-cyan-400 font-black text-xl md:text-2xl uppercase tracking-widest mb-4 flex items-center justify-center gap-3 relative z-10">
      <Sparkles className="w-6 h-6" /> Vous ne trouvez pas votre bonheur ?
    </h3>
    <p className="text-zinc-400 text-xs md:text-sm leading-relaxed mb-8 font-medium max-w-2xl mx-auto relative z-10">
      Notre catalogue possède des <strong>milliers de références</strong> impossibles à toutes afficher ici ! Éditions limitées, autres clubs, anciennes saisons... Nous l'avons forcément en stock.
    </p>
    <a 
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Bonjour KIT 26 ! Je recherche un maillot spécifique qui n'est pas affiché sur le site. Voici mon email : [VOTRE EMAIL]")}`}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-3 bg-[#25D366] text-white px-8 py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_10px_30px_rgba(37,211,102,0.2)] relative z-10"
    >
      <MessageCircle className="w-6 h-6" /> Demander sur WhatsApp
    </a>
  </div>
);

const HeroCarousel = ({ products, onProductClick, getCartQty }) => {
  const carouselProducts = useMemo(() => {
    const targetCats = ["COUPE DU MONDE 2026", "LIGUE 1", "SERIE A", "PREMIER LEAGUE", "BUNDESLIGA", "LIGA"];
    const selected = [];
    targetCats.forEach(cat => {
      const catProds = products.filter(p => p.category === cat);
      if(catProds.length > 0) selected.push(...catProds.slice(0, 2));
    });
    if(selected.length === 0) {
      selected.push(
        { category: "BOUTIQUE", name: "Chargement...", images: ["https://www.kkgool1.com/u_file/2403/products/26/5c0d50730d.jpg"] },
        { category: "BOUTIQUE", name: "Chargement...", images: ["https://www.kkgool1.com/u_file/2401/products/30/d8a80d750c.jpg"] }
      );
    }
    return selected;
  }, [products]);

  return (
    <div className="w-full overflow-hidden bg-[#050505] py-10 border-b border-zinc-900 relative">
      <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-[#050505] to-transparent z-10 pointer-events-none"></div>
      <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-[#050505] to-transparent z-10 pointer-events-none"></div>

      <div className="flex animate-marquee w-max">
        {[...Array(3)].map((_, groupIndex) => (
          <div key={groupIndex} className="flex gap-4 sm:gap-6 pr-4 sm:pr-6">
            {carouselProducts.map((prod, idx) => {
              const qty = getCartQty ? getCartQty(prod.name) : 0;
              return (
                <div key={idx} onClick={() => prod.id && onProductClick(prod)} className="relative w-44 sm:w-56 md:w-64 lg:w-72 aspect-[9/16] bg-zinc-900 rounded-[2rem] overflow-hidden shrink-0 border border-zinc-800 hover:border-cyan-500 transition-all duration-500 group cursor-pointer shadow-lg flex flex-col justify-center items-center p-3 sm:p-4">
                  {qty > 0 && (
                    <div className="absolute top-4 right-4 bg-cyan-500 text-black w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-black z-30 shadow-[0_0_15px_rgba(6,182,212,0.6)] border-2 border-[#050505] animate-in zoom-in">
                      {qty}
                    </div>
                  )}
                  <div className="absolute top-4 left-4 z-20">
                    <span className="bg-zinc-950/80 text-zinc-400 text-[9px] font-black uppercase tracking-widest py-1.5 px-3 rounded-lg backdrop-blur-md border border-zinc-800">{prod.category}</span>
                  </div>
                  <img src={prod.images[0]} className="w-full h-full object-cover rounded-2xl scale-100 group-hover:scale-105 transition-transform duration-700 shadow-inner" alt={prod.name} />
                  <div className="absolute bottom-4 left-4 right-4 z-20 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="bg-cyan-500/90 text-black text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-xl text-center backdrop-blur-sm shadow-xl flex items-center justify-center gap-2">
                      <ShoppingBag className="w-4 h-4" /> Voir le modèle
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

const AiChatbot = ({ cartCount, onCartClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{role: 'bot', text: "Salut ! Je suis l'assistant de KIT 26 ⚽. As-tu une question sur nos maillots ou sur la livraison ?"}]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, {role: 'user', text: userMsg}]);
    setIsLoading(true);

    const conversationHistory = messages.slice(-4).map(m => `${m.role === 'user' ? 'Client' : 'Assistant'}: ${m.text}`).join('\n');
    const systemPrompt = `Tu es le conseiller clientèle IA de "KIT 26", une boutique en ligne premium de maillots de foot. 
    Règles strictes : 1. Amical, concis, emojis foot. 2. Maillots à 29.99€ de base. 3. Flocage personnalisé +3.00€. 4. Badge officiel +2.00€. 5. Livraison 2-3 semaines. 6. Achat : panier puis WhatsApp.
    Historique : ${conversationHistory}\nRéponds à : "${userMsg}"`;
    
    try {
       const res = await callGemini(userMsg, systemPrompt);
       setMessages(prev => [...prev, {role: 'bot', text: res}]);
    } catch(e) {
       setMessages(prev => [...prev, {role: 'bot', text: "Erreur réseau. Contacte-nous sur WhatsApp !"}]);
    } finally {
       setIsLoading(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 bg-zinc-900 border border-zinc-800 rounded-[2rem] shadow-2xl z-[150] overflow-hidden flex flex-col animate-in slide-in-from-bottom-5">
          <div className="bg-cyan-500 p-4 flex justify-between items-center text-black">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span className="font-black uppercase tracking-widest text-[10px]">Assistant KIT 26</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:scale-110 transition-transform"><X className="w-5 h-5" /></button>
          </div>
          <div className="h-80 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#050505]/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${m.role === 'user' ? 'bg-cyan-500 text-black font-medium rounded-tr-sm' : 'bg-zinc-800 text-zinc-300 rounded-tl-sm'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-zinc-800 text-zinc-300 rounded-2xl p-3 rounded-tl-sm flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin text-cyan-400" /> <span className="text-[10px] uppercase">Réflexion...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex gap-2">
            <input 
              type="text" value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()}
              placeholder="Posez votre question..." 
              className="flex-1 bg-zinc-800 rounded-xl px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-cyan-500 text-white"
            />
            <button onClick={handleSend} disabled={isLoading || !input.trim()} className="bg-cyan-500 text-black p-3 rounded-xl disabled:opacity-50 hover:bg-white transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-[150]">
         <button onClick={onCartClick} className="relative w-14 h-14 bg-zinc-900 border-2 border-zinc-800 text-cyan-400 rounded-full flex items-center justify-center shadow-lg hover:border-cyan-500 hover:scale-110 transition-all cursor-pointer">
           <ShoppingBag className="w-6 h-6" />
           {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-cyan-500 text-black text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-[#050505] shadow-[0_0_10px_rgba(6,182,212,0.5)]">{cartCount}</span>}
         </button>
         <a 
           href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Bonjour KIT 26 ! J'ai une question. Voici mon adresse email : [VOTRE EMAIL ICI]")}`} 
           target="_blank" 
           rel="noreferrer" 
           className="w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer"
         >
           <MessageCircle className="w-6 h-6" />
         </a>
         <button onClick={() => setIsOpen(!isOpen)} className={`w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-110 transition-all ${isOpen ? 'bg-zinc-800 text-zinc-400 border border-zinc-700' : 'bg-cyan-500 text-black'}`}>
           {isOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
         </button>
      </div>
    </>
  );
};

const ProductCard = ({ product, onClick, cartQty }) => (
  <div onClick={onClick} className="group cursor-pointer flex flex-col h-full animate-in fade-in zoom-in-95 duration-300 relative">
    {cartQty > 0 && (
      <div className="absolute top-1 right-1 sm:-top-2 sm:-right-2 bg-cyan-500 text-black w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[11px] font-black z-30 shadow-[0_0_15px_rgba(6,182,212,0.6)] border-2 border-[#050505] animate-in zoom-in">
        {cartQty}
      </div>
    )}
    <div className="relative aspect-[4/5] bg-zinc-900 rounded-[2rem] overflow-hidden mb-3 border border-zinc-800 transition-all duration-300 group-hover:border-cyan-500/50 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] flex items-center justify-center p-3 lg:p-4">
      {product.discount && (
        <div className="absolute top-3 left-3 bg-cyan-500 text-black px-2 py-1 rounded-lg text-[10px] font-black z-20 shadow-sm">
          {product.discount}
        </div>
      )}
      <img src={product.images[0]} className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500 relative z-10" alt={product.name} />
    </div>
    <div className="text-center px-1 flex-1 flex flex-col">
      <p className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold mb-1">{product.category}</p>
      <h3 className="text-[10px] sm:text-[11px] font-bold text-zinc-100 mb-2 line-clamp-2 leading-tight group-hover:text-cyan-400 transition-colors h-8 uppercase">
        {product.name}
      </h3>
      <div className="mt-auto flex items-center justify-center gap-1.5 flex-wrap">
        <span className="text-zinc-600 line-through text-[10px] sm:text-xs">€{product.oldPrice.toFixed(2)}</span>
        <span className="text-cyan-400 font-black text-sm sm:text-base">€{product.basePrice.toFixed(2)}</span>
      </div>
    </div>
  </div>
);

const CategoryRow = ({ category, products, onProductClick, onDiscoverClick, getCartQty }) => {
  const rowRef = useRef(null);

  const scroll = (direction) => {
    if (rowRef.current) {
      const scrollAmount = direction === 'left' ? -rowRef.current.offsetWidth * 0.8 : rowRef.current.offsetWidth * 0.8;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="mb-24 relative">
      <div className="flex justify-between items-end mb-8 border-b border-zinc-900 pb-4">
        <h3 onClick={onDiscoverClick} className="text-4xl lg:text-5xl font-black uppercase italic tracking-tighter cursor-pointer hover:text-cyan-400 transition-colors">{category}</h3>
        <button onClick={onDiscoverClick} className="text-[10px] font-black text-zinc-600 hover:text-cyan-400 uppercase tracking-[0.2em] transition-all group flex items-center gap-2">Découvrir <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></button>
      </div>
      <div className="relative group/row">
        <button onClick={() => scroll('left')} className="absolute -left-5 top-1/2 -translate-y-1/2 z-20 bg-[#050505] border-2 border-zinc-800 hover:border-cyan-500 hover:text-cyan-400 text-white w-12 h-12 rounded-full flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all shadow-[0_0_20px_rgba(0,0,0,0.8)] hidden md:flex">
          <ChevronLeft className="w-6 h-6 -ml-0.5" />
        </button>
        <div ref={rowRef} className="flex overflow-x-auto gap-5 sm:gap-6 pb-10 scrollbar-hide snap-x scroll-smooth">
          {products.map(p => (
            <div key={p.id || p.name} className="w-[180px] sm:w-[220px] md:w-[240px] xl:w-[260px] shrink-0 snap-start">
              <ProductCard product={p} onClick={() => onProductClick(p)} cartQty={getCartQty ? getCartQty(p.name) : 0} />
            </div>
          ))}
        </div>
        <button onClick={() => scroll('right')} className="absolute -right-5 top-1/2 -translate-y-1/2 z-20 bg-[#050505] border-2 border-zinc-800 hover:border-cyan-500 hover:text-cyan-400 text-white w-12 h-12 rounded-full flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all shadow-[0_0_20px_rgba(0,0,0,0.8)] hidden md:flex">
          <ChevronRight className="w-6 h-6 ml-0.5" />
        </button>
      </div>
    </div>
  );
};

const ProductDetails = ({ product, onBack, onAddToCart }) => {
  const [selectedSize, setSelectedSize] = useState(SIZES[0]);
  const [flocage, setFlocage] = useState('');
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [imgIndex, setImgIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const extraSize = selectedSize ? selectedSize.price : 0;
  const extraFlocage = flocage.trim().length > 0 ? 3.00 : 0;
  const finalPricePerItem = product.basePrice + extraSize + extraFlocage + (selectedBadge ? selectedBadge.price : 0);
  const totalFinal = finalPricePerItem * quantity;

  const availableBadges = useMemo(() => {
    let badges = BADGES_BY_CATEGORY[product.category] ? [...BADGES_BY_CATEGORY[product.category]] : [...BADGES_BY_CATEGORY["DEFAULT"]];
    const nameUpper = product.name.toUpperCase();
    if (nameUpper.includes('UCL') || nameUpper.includes('CHAMPIONS LEAGUE') || nameUpper.includes('LDC') || nameUpper.includes('EUROPE')) {
      badges = [...badges, ...UCL_BADGES];
    }
    return badges;
  }, [product]);

  const nextImage = () => setImgIndex((prev) => (prev + 1) % (product.images?.length || 1));
  const prevImage = () => setImgIndex((prev) => (prev - 1 + (product.images?.length || 1)) % (product.images?.length || 1));

  return (
    <>
      <div className="animate-in fade-in duration-300">
        <div className="text-sm text-zinc-500 mb-8 flex items-center gap-2">
          <button onClick={onBack} className="hover:text-cyan-400 uppercase font-bold tracking-tighter transition-colors">Accueil</button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-cyan-400 font-black truncate uppercase italic">{product.name}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          <div className="flex flex-col gap-6">
            <div 
              className="relative bg-zinc-900 border border-zinc-800 rounded-[3rem] shadow-2xl flex-1 flex items-center justify-center aspect-[4/5] md:aspect-square group cursor-zoom-in p-4 lg:p-6"
              onClick={() => setIsFullscreen(true)}
            >
              <img src={product.images && product.images[imgIndex]} alt={product.name} className="w-full h-full object-cover rounded-[2rem] transition-all duration-500" />
              
              {product.images && product.images.length > 1 && (
                <>
                  <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-cyan-500 text-white hover:text-black rounded-full flex items-center justify-center backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 shadow-xl z-20">
                    <ChevronLeft className="w-6 h-6 -ml-1" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-cyan-500 text-white hover:text-black rounded-full flex items-center justify-center backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 shadow-xl z-20">
                    <ChevronRight className="w-6 h-6 ml-1" />
                  </button>
                </>
              )}
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="flex flex-wrap justify-center gap-3 lg:gap-4">
                {product.images.map((img, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setImgIndex(idx)}
                    className={`w-16 h-20 sm:w-20 sm:h-24 shrink-0 bg-zinc-900 rounded-[1.5rem] border-2 cursor-pointer transition-all flex items-center justify-center p-1 sm:p-1.5 ${imgIndex === idx ? 'border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)] scale-105' : 'border-zinc-800 hover:border-zinc-500'}`}
                  >
                    <img src={img} alt={`Vue ${idx+1}`} className="w-full h-full object-cover rounded-xl" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <h1 className="text-4xl lg:text-5xl font-black text-white mb-4 leading-tight uppercase italic tracking-tighter">{product.name}</h1>
            <div className="flex items-center gap-4 mb-10">
              <span className="text-cyan-400 text-4xl lg:text-5xl font-black tracking-tighter">€{product.basePrice.toFixed(2)}</span>
              <span className="text-zinc-600 line-through text-xl font-bold">€{product.oldPrice.toFixed(2)}</span>
            </div>

            <div className="bg-zinc-900/80 border border-cyan-500/30 rounded-[2rem] p-6 mb-10">
              <h3 className="text-cyan-400 font-black text-[11px] uppercase tracking-widest mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Vous ne trouvez pas votre bonheur ?
              </h3>
              <p className="text-zinc-400 text-[11px] leading-relaxed mb-5 font-medium">
                Notre catalogue possède des <strong>milliers de références</strong> impossibles à toutes afficher ici ! Vous cherchez une autre équipe, une édition spéciale ou une ancienne saison ?
              </p>
              <a 
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Bonjour, je recherche un maillot spécifique qui n'est pas affiché sur le site. Mon email est : [VOTRE EMAIL ICI]")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366]/10 text-[#25D366] px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#25D366]/20 transition-colors"
              >
                <MessageCircle className="w-4 h-4" /> Demander sur WhatsApp
              </a>
            </div>

            <div className="space-y-10">
              <div>
                <label className="block text-xs font-black text-zinc-400 mb-4 uppercase tracking-[0.3em]">Sélectionner la Taille</label>
                <div className="flex flex-wrap gap-3">
                  {SIZES.map(size => (
                    <button 
                      key={size.name}
                      onClick={() => setSelectedSize(size)}
                      className={`px-5 py-3 text-xs font-black border-2 transition-all rounded-xl ${selectedSize.name === size.name ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10' : 'border-zinc-800 text-zinc-500 hover:border-zinc-500 hover:text-white'}`}
                    >
                      {size.name} {size.price > 0 && <span className="ml-1 opacity-80">(+€{size.price})</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest">Flocage Personnalisé (Nom / N°) (+€3.00)</label>
                <input type="text" maxLength="25" value={flocage} onChange={(e) => setFlocage(e.target.value)} className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-2xl py-4 px-6 text-sm focus:border-cyan-500 text-white outline-none uppercase font-bold transition-all" placeholder="EX: MBAPPÉ / 10" />
              </div>

              <div>
                <label className="block text-xs font-black text-zinc-400 mb-4 uppercase tracking-widest">Ajouter un Badge Officiel (+€2.00)</label>
                <div className="flex gap-5 flex-wrap">
                  {availableBadges.map(badge => (
                    <div key={badge.id} onClick={() => setSelectedBadge(selectedBadge?.id === badge.id ? null : badge)} className={`cursor-pointer group flex flex-col items-center p-4 border-2 rounded-[1.5rem] transition-all min-w-[80px] ${selectedBadge?.id === badge.id ? 'border-cyan-500 bg-cyan-500/10' : 'border-zinc-800 bg-zinc-900 hover:bg-zinc-800'}`}>
                      <img src={badge.img} alt="" className={`w-12 h-12 mb-3 transition-opacity ${selectedBadge?.id === badge.id ? 'opacity-100' : 'opacity-30 group-hover:opacity-100'}`} />
                      <span className="text-[9px] font-black text-center uppercase leading-tight w-20 text-zinc-300">{badge.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-zinc-900 rounded-[2.5rem] p-8 border border-zinc-800 shadow-xl">
                 <div className="flex justify-between items-center mb-6">
                    <span className="text-zinc-500 font-black uppercase text-[11px] tracking-[0.2em]">Total</span>
                    <span className="text-3xl font-black italic text-cyan-400">€{totalFinal.toFixed(2)}</span>
                 </div>
                 <div className="flex gap-5">
                    <button 
                      onClick={() => onAddToCart({ ...product, cartItemId: Date.now(), selectedSize: selectedSize.name, flocage, selectedBadge, quantity, totalPrice: totalFinal })}
                      className="flex-1 bg-cyan-500 text-black font-black uppercase py-4 rounded-2xl text-[12px] tracking-[0.4em] hover:bg-white transition-all shadow-[0_0_30px_rgba(6,182,212,0.3)] flex items-center justify-center gap-3"
                    >
                      <Plus className="w-5 h-5" /> Ajouter au panier
                    </button>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isFullscreen && (
        <div className="fixed inset-0 z-[150] bg-black/95 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsFullscreen(false)}>
          <button className="absolute top-6 right-6 text-white hover:text-cyan-400 p-2 z-[200] transition-colors">
            <X className="w-8 h-8" />
          </button>
          
          {product.images && product.images.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-4 sm:left-10 text-white hover:text-cyan-400 p-4 z-[200] transition-colors">
                <ChevronLeft className="w-10 h-10 sm:w-16 sm:h-16" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-4 sm:right-10 text-white hover:text-cyan-400 p-4 z-[200] transition-colors">
                <ChevronRight className="w-10 h-10 sm:w-16 sm:h-16" />
              </button>
            </>
          )}
          
          <img src={product.images && product.images[imgIndex]} alt="Aperçu Plein Écran" className="max-w-[85vw] max-h-[85vh] object-contain rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  const [authView, setAuthView] = useState(null);
  const [view, setView] = useState('shop'); 
  
  const [dbProducts, setDbProducts] = useState([]);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [subFilter, setSubFilter] = useState(''); 
  const [orderNumber, setOrderNumber] = useState('');
  const [userOrders, setUserOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]); 
  const [lastOrderItems, setLastOrderItems] = useState([]);
  const [lastOrderTotal, setLastOrderTotal] = useState(0);
  
  const [rawScrapeText, setRawScrapeText] = useState('');
  const [importCategory, setImportCategory] = useState(CATEGORIES[0]);
  const [isImporting, setIsImporting] = useState(false);

  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const navRef = useRef(null);
  const [socialProof, setSocialProof] = useState(null);
  
  const [toastMessage, setToastMessage] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // GESTION DU MOT DE PASSE ADMIN
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const getProductCartQty = (productName) => {
    return cart.reduce((sum, item) => item.name === productName ? sum + item.quantity : sum, 0);
  };

  useEffect(() => {
    if (dbProducts.length === 0) return;
    
    const badProducts = dbProducts.filter(p => 
        p.name.toLowerCase().startsWith('maillot ') ||
        p.name.includes('PROCESS=') ||
        p.name.includes('Q_90') ||
        p.name.length < 5
    );

    badProducts.forEach(async (p) => {
        try {
            await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', p.id));
        } catch (e) {}
    });
  }, [dbProducts]);

  useEffect(() => {
    let timeoutId;
    let intervalId;

    const triggerNotification = () => {
      const sourceList = (dbProducts.length > 0 ? dbProducts : INITIAL_PRODUCTS).filter(p => !p.isPlaceholder);
      if (sourceList.length === 0) return;
      
      const randomProduct = sourceList[Math.floor(Math.random() * sourceList.length)];
      const randomLocation = LOCATIONS_FR[Math.floor(Math.random() * LOCATIONS_FR.length)];
      const randomTime = Math.floor(Math.random() * 59) + 1;

      setSocialProof({
        product: randomProduct,
        location: randomLocation,
        time: randomTime
      });

      timeoutId = setTimeout(() => setSocialProof(null), 15000);
    };

    const initialTimer = setTimeout(() => {
      triggerNotification();
      intervalId = setInterval(triggerNotification, 25000);
    }, 25000);

    return () => {
      clearTimeout(initialTimer);
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [dbProducts]);

  const scrollNav = (direction) => {
    if (navRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      navRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollToShop = () => {
    setTimeout(() => {
      const el = document.getElementById('shop-content');
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 120;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 50);
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const productsRef = collection(db, 'artifacts', appId, 'public', 'data', 'products');
    const unsubscribe = onSnapshot(productsRef, (snapshot) => {
      const fetchedProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      fetchedProducts.sort((a, b) => b.createdAt - a.createdAt);
      setDbProducts(fetchedProducts);
    }, (err) => {
      console.error(err);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user || user.isAnonymous) return;
    const ordersRef = collection(db, 'artifacts', appId, 'users', user.uid, 'orders');
    const unsubscribe = onSnapshot(ordersRef, (snapshot) => {
      setUserOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.error(err));
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!isAdminAuthenticated || !user) return;
    const allOrdersRef = collection(db, 'artifacts', appId, 'public', 'data', 'all_orders');
    const unsubscribe = onSnapshot(allOrdersRef, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllOrders(orders.sort((a, b) => new Date(b.date) - new Date(a.date)));
    }, (err) => console.error(err));
    return () => unsubscribe();
  }, [isAdminAuthenticated, user]);

  const cartTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  const handleAuth = async (e, type) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    try {
      if (type === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setAuthView(null);
    } catch (err) {
      console.error(err);
    }
  };

  const confirmOrder = async () => {
    const num = 'K26-' + Math.floor(100000 + Math.random() * 900000);
    const orderData = {
      orderNumber: num,
      userEmail: user && !user.isAnonymous ? user.email : 'Client Invité',
      userId: user ? user.uid : 'anonymous',
      date: new Date().toISOString(),
      items: cart,
      total: cartTotal,
      status: 'En attente'
    };

    try {
      if (user && !user.isAnonymous) {
        const userOrdersRef = collection(db, 'artifacts', appId, 'users', user.uid, 'orders');
        await addDoc(userOrdersRef, orderData);
      }
      
      const allOrdersRef = collection(db, 'artifacts', appId, 'public', 'data', 'all_orders');
      await addDoc(allOrdersRef, orderData);

      setOrderNumber(num);
      setLastOrderItems(cart);
      setLastOrderTotal(cartTotal);
      setView('success');
      setCart([]);
      window.scrollTo(0,0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleWhatsApp = (num, total, items) => {
    let msg = `Salut ! Je souhaite finaliser ma commande *${num}* sur KIT 26 :\n\n`;
    items.forEach((it) => {
      msg += `- ${it.name} (Taille: ${it.selectedSize})\n`;
      if (it.flocage) msg += `   Flocage: ${it.flocage}\n`;
      if (it.selectedBadge) msg += `   Badge: ${it.selectedBadge.name}\n`;
    });
    msg += `\n*TOTAL: €${total.toFixed(2)}*\n\nVoici mon adresse email pour le suivi : [VOTRE EMAIL ICI]`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleImportCatalog = async () => {
    if(!rawScrapeText.trim()) return;
    setIsImporting(true);

    try {
      const rows = [];
      let currentRow = [];
      let currentCell = '';
      let inQuotes = false;
      
      for (let i = 0; i < rawScrapeText.length; i++) {
        const char = rawScrapeText[i];
        if (char === '"' && rawScrapeText[i+1] === '"') {
           currentCell += '"';
           i++;
        } else if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === '\t' && !inQuotes) {
          currentRow.push(currentCell);
          currentCell = '';
        } else if ((char === '\n' || char === '\r') && !inQuotes) {
          if (char === '\r' && rawScrapeText[i+1] === '\n') i++; 
          currentRow.push(currentCell);
          rows.push(currentRow);
          currentRow = [];
          currentCell = '';
        } else {
          currentCell += char;
        }
      }
      if (currentCell || currentRow.length > 0) {
        currentRow.push(currentCell);
        rows.push(currentRow);
      }

      const newProducts = [];

      for (let i = 0; i < rows.length; i++) {
        const cols = rows[i];
        if (cols.length < 3) continue; 

        let name = "";
        let rawUrls = [];

        const extractAllUrls = (text) => {
            if (!text) return [];
            const regex = /(https?:\/\/[^\s\t"'\\]+\.(?:jpg|jpeg|png|webp))|((?:\d{4,5}\/)?\d{4}\/\d{2}\/\d{2}\/[^\s\t"'\\]+\.(?:jpg|jpeg|png|webp))/gi;
            let matches = [];
            let match;
            while ((match = regex.exec(text)) !== null) {
                matches.push(match[0]);
            }
            return matches;
        };

        rawUrls.push(...extractAllUrls(cols[1]));

        name = cols[2].replace(/\?x-oss-process=[^\s]*/gi, '')
                      .replace(/(IMAGE\/QUALITY|Q_90\/AUTO-ORIENT|1\/RESIZE|M_LFIT|W_\d+|H_\d+\/FORMAT|WEBP|JPG|PNG)/gi, '')
                      .replace(/https?:\/\/[^\s]+/gi, '')
                      .trim().toUpperCase();

        for (let j = 3; j < cols.length; j++) {
            rawUrls.push(...extractAllUrls(cols[j]));
        }

        if (name.length < 4 || rawUrls.length === 0) continue; 

        const cleanImages = [...new Set(rawUrls.map(url => {
           let finalUrl = url.replace(/['"\[\]\\]/g, ''); 
           if (!finalUrl.startsWith('http')) {
                if (!finalUrl.includes('50018/')) {
                    finalUrl = '50018/' + finalUrl.replace(/^\/+/, '');
                }
                finalUrl = 'https://ssl.images-ssl-mars.com/' + finalUrl;
           }
           finalUrl = finalUrl.split('?')[0];
           return `${finalUrl}?x-oss-process=image/quality,Q_90/auto-orient,1/resize,m_lfit,w_800,h_800/format,webp`;
        }).filter(Boolean))];

        if (cleanImages.length === 0) continue;

        let team = "Autre";
        if (SUBCATEGORIES[importCategory]) {
          SUBCATEGORIES[importCategory].forEach(t => {
            if(name.includes(t.toUpperCase())) team = t;
          });
        }

        let baseP = 29.99; let oldP = 79.99; let disc = "-62%";
        if (importCategory === "SURVÊTEMENTS") {
          if (name.includes('PANTS') || name.includes('SHORTS')) { baseP = 34.99; oldP = 69.99; disc = "-50%"; } 
          else if (name.includes('WINDBREAKER') || name.includes('JACKET')) { baseP = 49.99; oldP = 99.99; disc = "-50%"; } 
          else { baseP = 59.99; oldP = 119.99; disc = "-50%"; }
        }

        newProducts.push({
          category: importCategory, 
          subCategory: team, 
          name: name, 
          basePrice: baseP, 
          oldPrice: oldP, 
          discount: disc, 
          images: cleanImages
        });
      }

      const dedupedProducts = deduplicateProducts(newProducts);
      dedupedProducts.reverse();

      const productsRef = collection(db, 'artifacts', appId, 'public', 'data', 'products');
      const baseTime = Date.now();
      
      for (let i = 0; i < dedupedProducts.length; i++) {
        const p = dedupedProducts[i];
        p.createdAt = baseTime - i; 
        await addDoc(productsRef, p);
      }

      setRawScrapeText('');
      showToast(`✅ Boom ! ${dedupedProducts.length} maillots importés (Ex: "${dedupedProducts[0]?.name}" importé avec ses ${dedupedProducts[0]?.images.length} photos !)`);
    } catch(err) {
      console.error(err);
      showToast("❌ Erreur lors de l'import. Vérifiez le format.");
    } finally {
      setIsImporting(false);
    }
  };

  const executeClearCategory = async () => {
    if (!deleteConfirm) return;
    try {
      const productsToDelete = dbProducts.filter(p => p.category === deleteConfirm);
      for(const p of productsToDelete) {
         if(p.id) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', p.id));
      }
      showToast(`🗑️ La catégorie ${deleteConfirm} a été vidée avec succès !`);
    } catch(err) { 
      console.error(err); 
      showToast("❌ Erreur lors de la suppression.");
    } finally {
      setDeleteConfirm(null);
    }
  };

  const cleanDbProducts = dbProducts.filter(p => 
      !p.name.toLowerCase().startsWith('maillot ') &&
      !p.name.includes('PROCESS=') &&
      !p.name.includes('Q_90') &&
      p.name.length >= 5
  );

  const displayProducts = useMemo(() => {
    let merged = [...cleanDbProducts];
    CATEGORIES.forEach(cat => {
      const importedCount = cleanDbProducts.filter(p => p.category === cat).length;
      if (importedCount < 60) {
         const placeholdersNeeded = INITIAL_PRODUCTS.filter(p => p.category === cat).slice(importedCount);
         merged = [...merged, ...placeholdersNeeded];
      }
    });
    return merged;
  }, [cleanDbProducts]);

  const filteredProducts = useMemo(() => {
    if (filter === 'ALL') return displayProducts;
    let filtered = displayProducts.filter(p => p.category === filter);
    if (subFilter) filtered = filtered.filter(p => p.subCategory === subFilter);
    return filtered;
  }, [displayProducts, filter, subFilter]);

  const availableCategories = useMemo(() => CATEGORIES.filter(cat => displayProducts.some(p => p.category === cat)), [displayProducts]);

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-zinc-100 selection:bg-cyan-900 selection:text-white relative">
      
      {/* GLOBAL TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[200] bg-cyan-500 text-black px-8 py-4 rounded-full font-black uppercase tracking-widest text-xs shadow-[0_10px_40px_rgba(6,182,212,0.4)] animate-in slide-in-from-top-5">
          {toastMessage}
        </div>
      )}

      {/* MODAL CONNEXION ADMIN (MOT DE PASSE) */}
      {showAdminLogin && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center p-6 backdrop-blur-md bg-black/90">
          <div className="bg-zinc-900 border border-zinc-800 p-8 sm:p-10 rounded-[3rem] max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95">
             <Lock className="w-12 h-12 text-cyan-400 mx-auto mb-6" />
             <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-2">Accès Restreint</h3>
             <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-8">Zone d'administration</p>
             <input 
                type="password" 
                value={adminPasswordInput} 
                onChange={e => setAdminPasswordInput(e.target.value)} 
                className="w-full bg-zinc-800 rounded-2xl py-4 px-6 text-center text-white font-black tracking-widest mb-6 outline-none focus:ring-2 focus:ring-cyan-500" 
                placeholder="Mot de passe..." 
             />
             <div className="flex gap-3">
               <button onClick={() => {
                 if(adminPasswordInput === 'Tony97210') {
                   setIsAdminAuthenticated(true);
                   setShowAdminLogin(false);
                   setView('admin');
                   showToast('✅ Accès Autorisé');
                   setAdminPasswordInput('');
                 } else {
                   showToast('❌ Mot de passe incorrect');
                 }
               }} className="flex-1 bg-cyan-500 text-black font-black uppercase py-4 rounded-xl text-[10px] tracking-widest hover:bg-white transition-all">Valider</button>
               <button onClick={() => setShowAdminLogin(false)} className="bg-zinc-800 text-zinc-400 px-6 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors">Fermer</button>
             </div>
          </div>
        </div>
      )}

      {showWelcomeModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowWelcomeModal(false)} />
          <div className="relative bg-zinc-900 border-2 border-cyan-500/50 w-full max-w-lg rounded-[3rem] p-10 shadow-[0_0_50px_rgba(6,182,212,0.2)] animate-in zoom-in-95 text-center">
            <div className="w-20 h-20 bg-cyan-500/10 text-cyan-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-cyan-500/20">
              <Package className="w-10 h-10" />
            </div>
            <h3 className="text-3xl font-black uppercase italic mb-4 tracking-tighter text-white">
              Des milliers de références !
            </h3>
            <p className="text-zinc-400 text-xs leading-relaxed mb-8 font-medium">
              Notre catalogue est si vaste qu'il est impossible de tout afficher ici. 
              <br/><br/>
              <strong className="text-cyan-400 text-sm">Un maillot précis en tête ?</strong><br/><br/>
              Éditions limitées ou clubs rares... 
              <br/><br/>
              Demandez-nous sur WhatsApp, nous l'avons en stock !
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => setShowWelcomeModal(false)}
                className="w-full bg-cyan-500 text-black font-black uppercase py-5 rounded-[2rem] text-[12px] tracking-widest hover:bg-white transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] flex justify-center items-center gap-2"
              >
                Découvrir la boutique
              </button>
              <a 
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Bonjour KIT 26 ! Je recherche un maillot spécifique. Voici mon email : [VOTRE EMAIL]")}`}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-zinc-800/80 text-[#25D366] font-bold uppercase py-3.5 rounded-[2rem] text-[10px] tracking-widest hover:bg-zinc-800 transition-all flex justify-center items-center gap-2 mt-1"
                onClick={() => setShowWelcomeModal(false)}
              >
                <MessageCircle className="w-4 h-4" /> Contacter sur WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      {authView && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setAuthView(null)} />
          <div className="relative bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-3xl font-black uppercase italic mb-2 tracking-tighter text-white">
              {authView === 'login' ? 'Connexion' : 'Rejoindre KIT 26'}
            </h3>
            <p className="text-zinc-500 text-xs uppercase font-bold tracking-widest mb-8">Accès Espace Membre</p>
            <form onSubmit={(e) => handleAuth(e, authView)} className="space-y-4">
              <input name="email" type="email" placeholder="Email" required className="w-full bg-zinc-800 border-none rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 focus:ring-cyan-500" />
              <input name="password" type="password" placeholder="Mot de passe" required className="w-full bg-zinc-800 border-none rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 focus:ring-cyan-500" />
              <button type="submit" className="w-full bg-cyan-500 text-black font-black uppercase py-4 rounded-2xl text-xs tracking-widest hover:bg-white transition-all shadow-xl">
                {authView === 'login' ? 'Se connecter' : "Créer mon compte"}
              </button>
            </form>
          </div>
        </div>
      )}

      <header className="py-8 px-10 border-b border-zinc-900 flex justify-between items-center max-w-[1500px] mx-auto">
        <h1 onClick={() => { setView('shop'); setFilter('ALL'); }} className="text-4xl font-black italic tracking-tighter cursor-pointer hover:text-cyan-400 transition-all">KIT 26</h1>
        
        <div className="flex items-center gap-6">

          {user && !user.isAnonymous ? (
            <div className="flex items-center gap-6">
              <button onClick={() => setView('profile')} className={`flex flex-col items-center group ${view === 'profile' ? 'text-cyan-400' : 'text-zinc-600'}`}>
                <User className="w-7 h-7" />
                <span className="text-[10px] font-black uppercase mt-1 tracking-widest text-zinc-600">Compte</span>
              </button>
              <button onClick={() => { signOut(auth); setView('shop'); }} className="text-zinc-700 hover:text-red-500"><LogOut className="w-5 h-5" /></button>
            </div>
          ) : (
            <button onClick={() => setAuthView('login')} className="flex flex-col items-center text-zinc-400 hover:text-cyan-400 transition-all">
              <User className="w-7 h-7" />
              <span className="text-[10px] font-black uppercase mt-1 tracking-widest">Connexion</span>
            </button>
          )}
          <button onClick={() => setView('cart')} className="relative flex flex-col items-center group hidden md:flex">
            <ShoppingBag className={`w-7 h-7 ${view === 'cart' ? 'text-cyan-400' : 'text-zinc-400 group-hover:text-cyan-400'}`} />
            <span className="text-[10px] font-black uppercase mt-1 tracking-widest text-zinc-600 group-hover:text-cyan-400 text-center">Panier</span>
            {cart.length > 0 && <span className="absolute -top-1 -right-2 bg-cyan-500 text-black text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#050505]">{cart.length}</span>}
          </button>
        </div>
      </header>

      <nav className="bg-zinc-950 border-b border-zinc-900 sticky top-0 z-40 shadow-2xl relative">
        <div className="max-w-[1500px] mx-auto relative flex items-center">
          <button 
            onClick={() => scrollNav('left')} 
            className="absolute left-0 z-10 h-full px-2 sm:px-6 bg-gradient-to-r from-zinc-950 via-zinc-950 to-transparent text-zinc-500 hover:text-cyan-400 transition-colors flex items-center cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <div ref={navRef} className="flex-1 px-10 sm:px-16 flex items-center justify-start md:justify-center gap-6 md:gap-10 py-5 whitespace-nowrap overflow-x-auto scrollbar-hide scroll-smooth">
            <button onClick={() => { setFilter('ALL'); setView('shop'); window.scrollTo({top: 0, behavior: 'smooth'}); }} className={`shrink-0 text-[11px] font-black uppercase tracking-[0.2em] transition-all ${filter === 'ALL' && view === 'shop' ? 'text-cyan-400 border-b-2 border-cyan-400 pb-1' : 'text-zinc-500 hover:text-cyan-400'}`}>Accueil</button>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => { setFilter(cat); setView('shop'); setSubFilter(''); scrollToShop(); }} className={`shrink-0 text-[11px] font-black uppercase tracking-[0.2em] transition-all ${filter === cat && view === 'shop' ? 'text-cyan-400 border-b-2 border-cyan-400 pb-1' : 'text-zinc-500 hover:text-cyan-400'}`}>{cat}</button>
            ))}
          </div>

          <button 
            onClick={() => scrollNav('right')} 
            className="absolute right-0 z-10 h-full px-2 sm:px-6 bg-gradient-to-l from-zinc-950 via-zinc-950 to-transparent text-zinc-500 hover:text-cyan-400 transition-colors flex items-center cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </nav>

      {view === 'shop' && displayProducts.length > 0 && <HeroCarousel products={displayProducts} onProductClick={(p) => { setSelectedProduct(p); setView('product'); window.scrollTo(0,0); }} getCartQty={getProductCartQty} />}

      <main id="shop-content" className="max-w-[1500px] mx-auto px-10 py-16 min-h-[60vh]">
        
        {view === 'admin' && isAdminAuthenticated && (
          <div className="animate-in fade-in duration-500 space-y-16">
             <div className="flex justify-between items-end">
                <h2 className="text-5xl font-black uppercase italic tracking-tighter text-white">Administration <span className="text-cyan-500">.</span></h2>
             </div>

             <div className="bg-zinc-900 border-2 border-cyan-500/30 rounded-[3rem] p-10 relative overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                <div className="absolute top-0 right-0 bg-cyan-500 text-black px-6 py-2 rounded-bl-[2rem] font-black uppercase tracking-widest text-[10px]">
                  Outil Magique
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
                  <Database className="w-6 h-6 text-cyan-400" /> Importer le Catalogue
                </h3>
                <p className="text-zinc-400 text-xs mb-8">Copie-colle directement le texte brut de ton scraping ci-dessous. Le système va l'inverser, isoler tes titres et tes galeries photos, puis sauvegarder le tout dans Firebase.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                   <div className="md:col-span-1">
                      <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">Catégorie Cible</label>
                      <select 
                        value={importCategory} onChange={(e) => setImportCategory(e.target.value)}
                        className="w-full bg-zinc-800 text-white border-2 border-zinc-700 rounded-2xl py-4 px-6 font-bold uppercase text-xs outline-none focus:border-cyan-500 transition-colors"
                      >
                         {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                   </div>
                   <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">Texte Brut du Scraping</label>
                      <textarea 
                        value={rawScrapeText} onChange={(e) => setRawScrapeText(e.target.value)}
                        placeholder="Collez ici le texte copié (Réf | Image Princ | Titre | Photos Annexes...)"
                        className="w-full h-40 bg-zinc-800 text-zinc-300 border-2 border-zinc-700 rounded-2xl py-4 px-6 text-xs outline-none focus:border-cyan-500 transition-colors custom-scrollbar"
                      />
                   </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={handleImportCatalog} disabled={isImporting}
                    className="flex-1 bg-cyan-500 text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isImporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
                    {isImporting ? 'Importation en cours...' : 'Lancer l\'Importation Massive'}
                  </button>
                  <button 
                    onClick={() => setDeleteConfirm(importCategory)}
                    className="bg-red-500/10 text-red-500 border border-red-500/50 py-4 px-8 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-500 hover:text-white transition-all"
                  >
                    Vider {importCategory}
                  </button>
                </div>

                {deleteConfirm && (
                  <div className="absolute inset-0 bg-zinc-900/95 backdrop-blur-sm flex flex-col items-center justify-center z-10 animate-in fade-in rounded-[3rem]">
                     <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
                     <p className="text-white font-black uppercase tracking-widest text-sm mb-6">Confirmer la suppression de {deleteConfirm} ?</p>
                     <div className="flex gap-4">
                       <button onClick={executeClearCategory} className="bg-red-500 text-white px-8 py-3 rounded-xl font-black uppercase text-xs hover:bg-red-600 transition-colors">Confirmer</button>
                       <button onClick={() => setDeleteConfirm(null)} className="bg-zinc-800 text-zinc-300 px-8 py-3 rounded-xl font-black uppercase text-xs hover:bg-zinc-700 transition-colors">Annuler</button>
                     </div>
                  </div>
                )}
             </div>

             <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                   <thead className="bg-zinc-950 border-b border-zinc-800">
                      <tr className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                         <th className="px-8 py-6">ID Commande</th>
                         <th className="px-8 py-6">Client</th>
                         <th className="px-8 py-6">Articles</th>
                         <th className="px-8 py-6">Montant</th>
                         <th className="px-8 py-6 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody>
                      {allOrders.map(order => (
                        <tr key={order.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                           <td className="px-8 py-6 font-black text-cyan-400 tracking-widest">{order.orderNumber}</td>
                           <td className="px-8 py-6 text-xs font-bold text-zinc-400">{order.userEmail}</td>
                           <td className="px-8 py-6 text-xs font-black text-white">{order.items ? order.items.length : 0} kits</td>
                           <td className="px-8 py-6 font-black text-white">€{order.total.toFixed(2)}</td>
                           <td className="px-8 py-6 text-right">
                              <button 
                                onClick={() => handleWhatsApp(order.orderNumber, order.total, order.items || [])}
                                className="bg-[#25D366] text-white p-2 rounded-lg hover:scale-105 transition-all"
                              >
                                <ShoppingBag className="w-4 h-4" />
                              </button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        )}

        {view === 'profile' && user && (
          <div className="max-w-4xl mx-auto animate-in fade-in duration-500 text-center">
             <h2 className="text-5xl font-black uppercase italic mb-16 tracking-tighter">Mon Compte <span className="text-cyan-500">.</span></h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                <div className="bg-zinc-900 p-10 rounded-[3rem] border border-zinc-800">
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Commandes Effectuées</p>
                  <p className="text-6xl font-black text-white italic">{userOrders.length}</p>
                </div>
                <div className="bg-zinc-900 p-10 rounded-[3rem] border border-zinc-800 flex flex-col justify-center">
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Utilisateur</p>
                  <p className="text-sm font-black text-cyan-400 truncate uppercase">{user.email}</p>
                </div>
             </div>
          </div>
        )}

        {view === 'shop' && (
           <div className="flex flex-col lg:flex-row gap-16 animate-in fade-in duration-700">
              <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-24 self-start z-30">
                {SUBCATEGORIES[filter] ? (
                  <div className="border-2 border-zinc-900 rounded-[3rem] overflow-hidden shadow-2xl bg-[#0a0a0a]">
                    <div onClick={() => { setFilter('ALL'); scrollToShop(); }} className="bg-zinc-900 text-cyan-400 font-black py-5 px-6 flex items-center gap-3 cursor-pointer uppercase text-xs italic tracking-[0.2em] border-b border-zinc-800"><ChevronLeft className="w-5 h-5" /> Menu</div>
                    <ul className="max-h-[600px] overflow-y-auto custom-scrollbar">
                      {SUBCATEGORIES[filter].map(sub => (
                        <li key={sub} className="border-b border-zinc-900 last:border-0">
                          <button onClick={() => { setSubFilter(sub); scrollToShop(); }} className={`w-full text-left py-4 px-6 text-xs font-black transition-all flex items-center justify-between group ${subFilter === sub ? 'text-cyan-400 bg-cyan-500/5' : 'text-zinc-500 hover:text-white'}`}>
                            {sub} <ChevronRight className={`w-4 h-4 transition-transform ${subFilter === sub ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="border-2 border-zinc-900 rounded-[3rem] overflow-hidden shadow-2xl bg-[#0a0a0a]">
                    <div className="bg-cyan-500 text-black font-black py-5 px-6 flex items-center gap-3 uppercase text-xs tracking-[0.2em] italic shadow-[0_0_20px_rgba(6,182,212,0.2)]"><Menu className="w-6 h-6" /> Explorer</div>
                    <ul className="">
                      {CATEGORIES.map(cat => (
                        <li key={cat} className="border-b border-zinc-900 last:border-0"><button onClick={() => { setFilter(cat); setSubFilter(''); scrollToShop(); }} className={`w-full text-left py-4 px-6 text-xs font-black transition-all ${filter === cat ? 'text-cyan-400 bg-cyan-500/5' : 'text-zinc-500 hover:text-white'}`}>{cat}</button></li>
                      ))}
                    </ul>
                  </div>
                )}
              </aside>

              <div className="flex-1 min-w-0">
                {displayProducts.length === 0 ? (
                   <div className="text-center py-32 bg-[#0a0a0a] rounded-[4rem] border-2 border-dashed border-zinc-900">
                      <Database className="w-16 h-16 text-zinc-700 mx-auto mb-6" />
                      <p className="text-zinc-400 font-black uppercase tracking-widest text-sm mb-4">Base de données vide</p>
                      <p className="text-zinc-600 text-xs max-w-md mx-auto mb-8">Le catalogue est actuellement vide. Connectez-vous avec le compte admin pour importer vos fichiers de scraping.</p>
                      <button onClick={() => { setView('admin'); window.scrollTo(0,0); }} className="bg-cyan-500 text-black px-10 py-4 rounded-2xl font-black uppercase text-xs hover:bg-white transition-colors shadow-lg">Espace Admin</button>
                   </div>
                ) : filter === 'ALL' ? (
                  <div>
                    {availableCategories.map(cat => {
                      const catProds = displayProducts.filter(p => p.category === cat);
                      return (
                        <CategoryRow 
                          key={cat} 
                          category={cat} 
                          products={catProds} 
                          onProductClick={(p) => { setSelectedProduct(p); setView('product'); window.scrollTo(0,0); }} 
                          onDiscoverClick={() => { setFilter(cat); setSubFilter(''); }}
                          getCartQty={getProductCartQty} 
                        />
                      );
                    })}
                    <WhatsAppBanner />
                  </div>
                ) : (
                  <div className="animate-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-6xl font-black uppercase italic mb-16 tracking-tighter leading-none">{filter} <span className="text-zinc-800 ml-4">/</span> <span className="text-cyan-400 ml-4">{subFilter || 'Tous'}</span></h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 xl:gap-8 mb-16">
                      {filteredProducts.map(p => <ProductCard key={p.id || p.name} product={p} onClick={() => { setSelectedProduct(p); setView('product'); window.scrollTo(0,0); }} cartQty={getProductCartQty(p.name)} />)}
                    </div>
                    <WhatsAppBanner />
                  </div>
                )}
              </div>
           </div>
        )}

        {view === 'product' && selectedProduct && (
          <ProductDetails 
            product={selectedProduct} 
            onBack={() => setView('shop')} 
            onAddToCart={(it) => { 
              setCart([...cart, it]); 
              showToast(`✅ Le maillot a bien été ajouté à votre panier !`); 
            }} 
          />
        )}

        {view === 'cart' && (
          <div className="max-w-4xl mx-auto py-10">
            <h2 className="text-5xl font-black uppercase italic mb-16 text-center tracking-tighter underline decoration-cyan-400 decoration-8 underline-offset-[15px]">Mon Panier</h2>
            {cart.length === 0 ? (
              <div className="text-center py-32 bg-[#0a0a0a] rounded-[4rem] border-2 border-dashed border-zinc-900">
                <p className="text-zinc-600 font-black uppercase tracking-[0.3em] text-sm mb-8 text-center">Votre panier est vide</p>
                <button onClick={() => setView('shop')} className="bg-white text-black px-12 py-5 rounded-[2rem] font-black uppercase text-xs">Boutique</button>
              </div>
            ) : (
              <div className="space-y-8">
                {cart.map(it => (
                  <div key={it.cartItemId} className="flex gap-10 bg-[#0a0a0a] border-2 border-zinc-900 p-8 rounded-[3rem] items-center group transition-all hover:border-zinc-700">
                    <div className="w-24 h-28 sm:w-32 sm:h-36 shrink-0 rounded-[2rem] border border-zinc-800 bg-zinc-900 p-2 flex items-center justify-center shadow-inner">
                      <img src={it.images && it.images[0]} className="w-[92%] h-[96%] object-cover rounded-[1.2rem] group-hover:scale-110 transition-transform duration-500" alt={it.name} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-xl uppercase tracking-tight group-hover:text-cyan-400 transition-colors">{it.name}</h4>
                      <p className="text-[11px] text-zinc-500 font-black uppercase mt-3 tracking-widest">Taille: {it.selectedSize}</p>
                      {it.flocage && <p className="text-[10px] text-cyan-400 font-bold uppercase mt-1 tracking-wider">Flocage: {it.flocage}</p>}
                      {it.selectedBadge && <p className="text-[10px] text-cyan-400 font-bold uppercase mt-1 tracking-wider">Badge: {it.selectedBadge.name}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-black text-2xl text-cyan-400">€{it.totalPrice.toFixed(2)}</p>
                      <button onClick={() => setCart(cart.filter(x => x.cartItemId !== it.cartItemId))} className="text-zinc-700 text-[10px] font-black uppercase hover:text-red-500 transition-colors mt-4">Retirer</button>
                    </div>
                  </div>
                ))}
                <div className="bg-zinc-900 text-white p-12 rounded-[4rem] mt-16 border border-zinc-800 relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400"></div>
                  <div className="flex justify-between items-center mb-12">
                    <span className="text-zinc-500 uppercase font-black text-sm tracking-[0.4em]">Total</span>
                    <span className="text-5xl font-black italic tracking-tighter text-cyan-400">€{cartTotal.toFixed(2)}</span>
                  </div>
                  <button onClick={confirmOrder} className="w-full bg-cyan-500 text-black py-7 rounded-[2.5rem] font-black uppercase tracking-[0.4em] hover:bg-white shadow-[0_10px_30px_rgba(6,182,212,0.3)] transition-all mb-4">
                    Finaliser ma Commande
                  </button>
                  {(!user || user.isAnonymous) && (
                    <p className="text-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                      Achat rapide en tant qu'invité activé
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'success' && (
          <div className="text-center py-24 animate-in zoom-in-95 duration-700 max-w-2xl mx-auto">
            <div className="w-32 h-32 bg-cyan-500/10 text-cyan-400 rounded-full flex items-center justify-center mx-auto mb-12 border-4 border-cyan-500/20 shadow-2xl"><CheckCircle2 className="w-16 h-16" /></div>
            <h2 className="text-7xl font-black uppercase italic mb-8 tracking-tighter text-white italic">Validé !</h2>
            
            <div className="bg-[#0a0a0a] border-4 border-dashed border-zinc-900 p-12 rounded-[5rem] mb-12 shadow-inner group">
              <p className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.5em] mb-4">N° de Commande</p>
              <p className="text-6xl font-black text-cyan-400 tracking-[0.2em] select-all uppercase mb-4">{orderNumber}</p>
              <p className="text-xl font-black text-white mb-6 uppercase tracking-widest">Montant : <span className="text-cyan-400">€{lastOrderTotal.toFixed(2)}</span></p>
              
              <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-3xl mt-6">
                 <p className="text-red-400 font-bold text-sm mb-2 uppercase tracking-widest flex items-center justify-center gap-2">
                   <AlertTriangle className="w-4 h-4" /> Attention : Commande non payée
                 </p>
                 <p className="text-zinc-400 text-xs leading-relaxed">
                   Votre commande est enregistrée mais <strong>ne sera pas expédiée</strong> tant qu'elle n'est pas réglée. <br/><br/>
                   Cliquez sur le bouton ci-dessous pour nous contacter sur WhatsApp afin de procéder au paiement sécurisé. Pensez à bien nous indiquer votre <strong>N° de commande</strong> et votre <strong>Email</strong>.
                 </p>
              </div>
            </div>
            
            <button onClick={() => handleWhatsApp(orderNumber, lastOrderTotal, lastOrderItems)} className="w-full bg-[#25D366] text-white py-7 rounded-[3rem] font-black uppercase tracking-[0.4em] hover:scale-105 transition-all shadow-[0_10px_40px_rgba(37,211,102,0.4)] flex justify-center items-center gap-4">
               <MessageCircle className="w-8 h-8" /> Payer ma commande sur WhatsApp
            </button>
          </div>
        )}
      </main>

      <footer className="relative bg-zinc-950 text-white py-32 mt-32 border-t-[15px] border-cyan-500 shadow-[0_-30px_100px_rgba(0,0,0,1)] text-center">
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="absolute left-1/2 -translate-x-1/2 -top-10 w-20 h-20 bg-[#050505] border-[5px] border-cyan-500 text-cyan-400 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:bg-cyan-500 hover:text-black transition-all hover:scale-110 z-50 cursor-pointer"
        >
          <ArrowUp className="w-10 h-10" />
        </button>

        <h2 className="text-6xl font-black italic tracking-tighter mb-8 uppercase italic">KIT 26</h2>
        <div className="w-24 h-1 bg-cyan-400 mx-auto mb-10"></div>
        <p className="text-[12px] text-zinc-500 uppercase tracking-[0.5em] font-black italic">Le labo du maillot premium • Authentifié par KIT 26</p>
        
        {/* BOUTON SECRET ADMIN EN BAS A GAUCHE */}
        <button 
          onClick={() => isAdminAuthenticated ? setView('admin') : setShowAdminLogin(true)}
          className="absolute bottom-6 left-6 flex items-center gap-2 text-zinc-800 hover:text-zinc-500 transition-colors text-[10px] font-black uppercase tracking-widest"
        >
           <Lock className="w-3 h-3" /> Espace Sécurisé
        </button>
      </footer>

      {socialProof && (
        <div className="fixed bottom-6 left-6 z-[60] animate-in slide-in-from-bottom-5 fade-in duration-500 max-w-md w-[calc(100%-3rem)] sm:w-96 pointer-events-none">
          <div className="bg-cyan-500 text-black rounded-xl shadow-[0_10px_40px_rgba(6,182,212,0.3)] overflow-hidden flex border-2 border-cyan-400 relative pointer-events-auto">
            <button onClick={() => setSocialProof(null)} className="absolute top-2 right-2 text-black/60 hover:text-black transition-colors z-10">
              <X className="w-4 h-4" />
            </button>
            <div className="w-28 shrink-0 bg-zinc-900 border-r border-cyan-600 flex items-center justify-center overflow-hidden p-2">
              <img src={socialProof.product.images[0]} className="w-[92%] h-[96%] object-cover rounded-lg shadow-sm" alt="Produit récent" />
            </div>
            <div className="p-4 flex-1 flex flex-col justify-center relative bg-gradient-to-br from-cyan-500 to-cyan-600">
               <h4 className="font-black text-[11px] uppercase truncate pr-4 drop-shadow-sm mb-1.5">{socialProof.product.name}</h4>
               <p className="text-[11px] font-medium leading-tight text-black/80">Quelqu'un de {socialProof.location}, 🇫🇷 France<br/><span className="font-black text-black">Vient d'acheter ça !</span></p>
               <div className="mt-3 flex justify-between items-end">
                 <p className="text-[10px] font-bold opacity-80">Il y a {socialProof.time} Minutes</p>
                 <span className="text-[9px] font-black border border-black/30 px-1.5 py-0.5 rounded uppercase tracking-wider">Achat Vérifié</span>
               </div>
            </div>
          </div>
        </div>
      )}

      <AiChatbot cartCount={cart.length} onCartClick={() => { setView('cart'); window.scrollTo(0,0); }} />

      <style>{`
        #root { max-width: none !important; margin: 0 !important; padding: 0 !important; text-align: left !important; }
        body { overflow-x: hidden; margin: 0; background-color: #050505; } 
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e1e1e; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #06b6d4; }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default App;