// ====== CONFIG SUPABASE ======
const ODA_SB_URL = 'https://xjckbqbqxcwzcrlmuvzf.supabase.co';
const ODA_SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqY2ticWJxeGN3emNybG11dnpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTk1MzMsImV4cCI6MjA3NjA5NTUzM30.AMzAUwtjFt7Rvof5r2enMyYIYToc1wNWWEjvZqK_YXM';
let odaSb = null;

function getOdaSb() {
    if (!odaSb) odaSb = window.supabase.createClient(ODA_SB_URL, ODA_SB_KEY);
    return odaSb;
}

// ====== OUVRIR / FERMER MODAL ======
async function ouvrirModalOda() {
    document.getElementById('odaModalOverlay').classList.add('active');
    const { data: { session } } = await getOdaSb().auth.getSession();
    session?.user ? afficherEtatConnecte(session.user) : afficherFormulaireConnexion();
}

function fermerOdaModal() {
    document.getElementById('odaModalOverlay').classList.remove('active');
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') fermerOdaModal(); });

// ====== FORMULAIRE DE CONNEXION ======
function afficherFormulaireConnexion() {
    document.getElementById('odaModalBox').innerHTML = `
        <img class="oda-modal-logo" src="oda-logo.png" alt="ODA" onerror="this.style.display='none'">
        <div class="oda-modal-title">Espace Vendeur ODA</div>
        <div class="oda-modal-sub">Connectez-vous pour gérer votre boutique</div>
        <div class="oda-form-error" id="odaFormError"></div>

        <div style="position:relative;margin-bottom:10px;">
            <input class="oda-form-input" style="margin-bottom:0;padding-right:44px;"
                type="email" id="odaEmail" placeholder="Adresse email" autocomplete="email">
        </div>

        <div style="position:relative;margin-bottom:6px;">
            <input class="oda-form-input" style="margin-bottom:0;padding-right:44px;"
                type="password" id="odaPassword" placeholder="Mot de passe"
                autocomplete="current-password"
                onkeydown="if(event.key==='Enter')soumettreConnexionOda()">
            <button type="button" onclick="toggleMdpOda()" style="
                position:absolute;right:12px;top:50%;transform:translateY(-50%);
                background:none;border:none;cursor:pointer;padding:4px;
                color:rgba(255,255,255,0.6);display:flex;align-items:center;
                transition:color 0.2s;
            " title="Voir le mot de passe">
                <svg id="odaEyeOff" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
                <svg id="odaEyeOn" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                </svg>
            </button>
        </div>

        <div style="text-align:right;margin-bottom:14px;">
            <a onclick="mdpOublieOda()" style="
                font-size:0.72rem;color:rgba(255,255,255,0.55);
                cursor:pointer;text-decoration:underline;
            ">Mot de passe oublié ?</a>
        </div>

        <button onclick="soumettreConnexionOda()" id="odaSubmitBtn" style="
            width:100%;padding:12px;
            background:rgba(255,255,255,0.95);
            color:#1a1a1a;border:none;border-radius:12px;
            font-size:0.9rem;font-weight:700;cursor:pointer;
            font-family:'Inter',sans-serif;
            display:flex;align-items:center;justify-content:center;gap:8px;
            transition:all 0.2s;box-shadow:0 4px 14px rgba(0,0,0,0.2);
            margin-bottom:16px;
        ">
            <img src="oda-logo.png" alt="" style="width:18px;height:18px;border-radius:4px;" onerror="this.style.display='none'">
            Se connecter
        </button>

        <div style="font-size:0.72rem;color:rgba(255,255,255,0.5);line-height:1.5;">
            Pas de boutique ?
            <a onclick="installOdaVendeur()" style="color:rgba(255,255,255,0.8);font-weight:600;cursor:pointer;text-decoration:underline;">
                Installer ODA Vendeur
            </a>
        </div>
    `;
    setTimeout(() => document.getElementById('odaEmail')?.focus(), 100);
}

// ====== TOGGLE MOT DE PASSE ======
function toggleMdpOda() {
    const input = document.getElementById('odaPassword');
    const eyeOff = document.getElementById('odaEyeOff');
    const eyeOn  = document.getElementById('odaEyeOn');
    if (!input) return;
    if (input.type === 'password') {
        input.type = 'text';
        eyeOff.style.display = 'none';
        eyeOn.style.display  = 'block';
    } else {
        input.type = 'password';
        eyeOff.style.display = 'block';
        eyeOn.style.display  = 'none';
    }
}

// ====== SOUMISSION CONNEXION ======
async function soumettreConnexionOda() {
    const email    = document.getElementById('odaEmail')?.value?.trim();
    const password = document.getElementById('odaPassword')?.value;
    const errEl    = document.getElementById('odaFormError');
    const btn      = document.getElementById('odaSubmitBtn');

    errEl.classList.remove('show');

    if (!email || !password) {
        errEl.textContent = 'Veuillez remplir tous les champs.';
        errEl.classList.add('show');
        return;
    }

    btn.disabled = true;
    btn.textContent = '⏳ Connexion...';

    try {
        const sb = getOdaSb();

        // 1. Authentification
        const { data: authData, error: authError } = await sb.auth.signInWithPassword({ email, password });
        if (authError) throw authError;

        // 2. Vérifier boutique
        const { data: boutique, error: boutError } = await sb
            .from('parametres_boutique')
            .select('user_id, config')
            .eq('user_id', authData.user.id)
            .single();

        if (boutError && boutError.code !== 'PGRST116') throw boutError;

        if (boutique) {
            // ✅ Boutique trouvée → célébration puis sandbox
            const nomUser     = authData.user.user_metadata?.name || email.split('@')[0];
            const nomBoutique = boutique.config?.general?.nom || boutique.config?.nom || 'votre boutique';
            fermerOdaModal();
            lancerCelebrationOda(nomUser, nomBoutique);
        } else {
            // ❌ Pas de boutique
            await sb.auth.signOut();
            afficherSansBoutiqueOda();
        }

    } catch (err) {
        let msg = 'Email ou mot de passe incorrect.';
        if (err.message?.includes('Email not confirmed')) msg = 'Confirmez votre email avant de vous connecter.';
        errEl.textContent = msg;
        errEl.classList.add('show');
        btn.disabled = false;
        btn.innerHTML = `
            <img src="oda-logo.png" alt="" style="width:18px;height:18px;border-radius:4px;" onerror="this.style.display='none'">
            Se connecter
        `;
    }
}

// ====== CONNEXION GOOGLE ======
async function connexionGoogleOda() {
    const btn = document.getElementById('odaGoogleBtn');
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Redirection...'; }
    try {
        const sb = getOdaSb();
        sessionStorage.setItem('oda_vendor_google', '1');
        const { error } = await sb.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin + '/sandbox-google-callback.html' }
        });
        if (error) throw error;
    } catch (e) {
        const errEl = document.getElementById('odaFormError');
        if (errEl) { errEl.textContent = 'Erreur connexion Google.'; errEl.classList.add('show'); }
        if (btn) { btn.disabled = false; btn.textContent = 'Continuer avec Google'; }
    }
}

// ====== ÉTAT : PAS DE BOUTIQUE ======
function afficherSansBoutiqueOda() {
    document.getElementById('odaModalBox').innerHTML = `
        <div style="text-align:center;">
            <div style="font-size:2.8rem;margin-bottom:12px;">📦</div>
            <div class="oda-modal-title">Aucune boutique trouvée</div>
            <div class="oda-modal-sub">Ce compte n'a pas de boutique ODA.<br>Installez l'app pour en créer une.</div>
            <button onclick="installOdaVendeur()" style="
                width:100%;padding:12px;margin-bottom:10px;
                background:rgba(255,255,255,0.95);color:#1a1a1a;
                border:none;border-radius:12px;font-size:0.88rem;font-weight:700;
                cursor:pointer;font-family:'Inter',sans-serif;
            ">📲 Installer ODA Vendeur</button>
            <button onclick="afficherFormulaireConnexion()" style="
                background:none;border:none;
                color:rgba(255,255,255,0.55);font-size:0.75rem;
                cursor:pointer;text-decoration:underline;
                font-family:'Inter',sans-serif;
            ">← Retour</button>
        </div>
    `;
}

// ====== ÉTAT : DÉJÀ CONNECTÉ ======
function afficherEtatConnecte(user) {
    const initiale = (user.user_metadata?.name || user.email || '?').charAt(0).toUpperCase();
    const nom      = user.user_metadata?.name || user.email?.split('@')[0] || 'Vendeur';
    document.getElementById('odaModalBox').innerHTML = `
        <div class="oda-connected-state">
            <div class="oda-user-avatar">${initiale}</div>
            <div class="oda-modal-title" style="color:rgba(255,255,255,0.7);font-size:0.78rem;font-weight:500;margin-bottom:4px;">Connecté en tant que</div>
            <div style="color:white;font-weight:700;font-size:0.95rem;margin-bottom:18px;">${nom}</div>
            <button onclick="allerSandboxOda()" class="oda-sandbox-btn">🏪 Accéder à mon espace</button>
            <button onclick="deconnecterOda()" class="oda-logout-link">Se déconnecter</button>
        </div>
    `;
}

function allerSandboxOda() {
    fermerOdaModal();
    window.location.href = 'sandbox.html';
}

async function deconnecterOda() {
    await getOdaSb().auth.signOut();
    changerBoutonVendeurNormal();
    afficherFormulaireConnexion();
}

function installOdaVendeur() {
    // 👉 Remplacez par votre vrai lien
    alert('Mettez ici le lien vers votre app ODA Vendeur (Play Store / App Store).');
}

async function mdpOublieOda() {
    const email = document.getElementById('odaEmail')?.value?.trim();
    if (!email || !email.includes('@')) {
        const errEl = document.getElementById('odaFormError');
        if (errEl) { errEl.textContent = 'Entrez votre email dans le champ ci-dessus.'; errEl.classList.add('show'); }
        return;
    }
    try {
        const { error } = await getOdaSb().auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password.html'
        });
        if (error) throw error;
        const errEl = document.getElementById('odaFormError');
        if (errEl) {
            errEl.style.background = 'rgba(16,185,129,0.2)';
            errEl.style.borderColor = 'rgba(16,185,129,0.4)';
            errEl.style.color = '#6ee7b7';
            errEl.textContent = '✅ Email de réinitialisation envoyé !';
            errEl.classList.add('show');
        }
    } catch (e) {
        const errEl = document.getElementById('odaFormError');
        if (errEl) { errEl.textContent = 'Erreur lors de l\'envoi.'; errEl.classList.add('show'); }
    }
}

// ====== ANIMATION CÉLÉBRATION ======
function lancerCelebrationOda(nomUser, nomBoutique) {
    // Injecter keyframes si absent
    if (!document.getElementById('odaCelebStyles')) {
        const s = document.createElement('style');
        s.id = 'odaCelebStyles';
        s.textContent = `
            @keyframes odaBounceIn {
                0%{transform:scale(0) rotate(-8deg);opacity:0}
                60%{transform:scale(1.12) rotate(2deg)}
                100%{transform:scale(1) rotate(0);opacity:1}
            }
            @keyframes odaCelebFade { from{opacity:0} to{opacity:1} }
            @keyframes odaPulseRing {
                0%{box-shadow:0 0 0 0 rgba(255,107,0,0.7)}
                70%{box-shadow:0 0 0 20px rgba(255,107,0,0)}
                100%{box-shadow:0 0 0 0 rgba(255,107,0,0)}
            }
            @keyframes odaConfetti {
                0%{transform:translateY(-20px) rotate(0deg);opacity:1}
                100%{transform:translateY(110vh) rotate(720deg);opacity:0}
            }
        `;
        document.head.appendChild(s);
    }

    // Créer l'overlay
    const overlay = document.createElement('div');
    overlay.id = 'odaCelebOverlay';
    overlay.style.cssText = `
        position:fixed;inset:0;z-index:999999;
        background:rgba(0,0,0,0.6);backdrop-filter:blur(8px);
        display:flex;align-items:center;justify-content:center;
        animation:odaCelebFade 0.3s ease;
    `;
    overlay.innerHTML = `
        <div style="text-align:center;padding:40px 28px;max-width:320px;animation:odaBounceIn 0.5s ease;">
            <div style="font-size:3.5rem;margin-bottom:6px;">🎉</div>
            <div style="font-size:1.5rem;font-weight:800;color:white;margin-bottom:4px;text-shadow:0 2px 12px rgba(0,0,0,0.4);">
                Bienvenue ${nomUser} !
            </div>
            <div style="font-size:0.85rem;color:rgba(255,255,255,0.7);margin-bottom:6px;">Connexion réussie à</div>
            <div style="
                display:inline-block;padding:6px 18px;border-radius:20px;margin-bottom:24px;
                background:rgba(255,107,0,0.2);border:1px solid rgba(255,107,0,0.4);
                color:#FF6B00;font-weight:700;font-size:0.95rem;
            ">🏪 ${nomBoutique}</div>
            <div style="
                width:52px;height:52px;border-radius:50%;margin:0 auto 20px;
                background:linear-gradient(135deg,#FF6B00,#e55d00);
                display:flex;align-items:center;justify-content:center;
                font-size:1.4rem;animation:odaPulseRing 1s infinite;
            ">✓</div>
            <div style="color:rgba(255,255,255,0.45);font-size:0.78rem;">Redirection vers votre espace...</div>
        </div>
        <div id="odaConfettiBox" style="position:fixed;inset:0;pointer-events:none;overflow:hidden;"></div>
    `;
    document.body.appendChild(overlay);

    // Confettis
    const box = overlay.querySelector('#odaConfettiBox');
    const colors = ['#FF6B00','#FFD700','#FF69B4','#00CED1','#7B68EE','#32CD32','#FFF'];
    for (let i = 0; i < 90; i++) {
        const el = document.createElement('div');
        const size = Math.random() * 10 + 5;
        el.style.cssText = `
            position:absolute;width:${size}px;height:${size}px;
            background:${colors[Math.floor(Math.random()*colors.length)]};
            border-radius:${Math.random()>.5?'50%':'3px'};
            left:${Math.random()*100}%;top:-20px;
            animation:odaConfetti ${Math.random()*2+1.5}s ease ${Math.random()*0.5}s forwards;
        `;
        box.appendChild(el);
    }

    // Changer le bouton vendeur → icône compte orange
    changerBoutonVendeurConnecte();

    // Redirection directe vers sandbox après 2.5s
    setTimeout(() => {
        window.location.href = 'sandbox.html';
    }, 2500);
}

// ====== CHANGEMENT LOGO BOUTON VENDEUR ======
function changerBoutonVendeurConnecte() {
    const btn = document.getElementById('vendorBtn');
    if (!btn) return;
    btn.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" fill="#FF6B00"/>
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#FF6B00" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
    `;
    btn.style.border = '2px solid #FF6B00';
    btn.style.boxShadow = '0 0 0 3px rgba(255,107,0,0.25)';
    btn.title = 'Mon espace vendeur';
}

function changerBoutonVendeurNormal() {
    const btn = document.getElementById('vendorBtn');
    if (!btn) return;
    btn.innerHTML = `<img src="oda-logo.png" alt="ODA" style="width:26px;height:26px;border-radius:6px;object-fit:cover;">`;
    btn.style.border = '2px solid rgba(255,255,255,0.3)';
    btn.style.boxShadow = 'none';
    btn.title = 'Se connecter - Espace Vendeur';
}

// ====== VÉRIFICATION AU CHARGEMENT ======
(async () => {
    try {
        const { data: { session } } = await getOdaSb().auth.getSession();
        if (session?.user) changerBoutonVendeurConnecte();
    } catch(e) {}
})();