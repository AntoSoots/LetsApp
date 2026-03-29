# Tehop AI Sourcing App

Ettevõttetaseme mobiilirakendus AI-põhiseks toodete hankimiseks. Kasutajad kirjeldavad või pildivad toodet ning tehisintellektisüsteem leiab parimad ostuvõimalused üle veebi — järjestatuna hinna, kvaliteedi ja tarnekiiruse alusel.

## Funktsioonid

- 📸 **Pilt + Tekst** — Kirjelda toodet tekstis või pildista see
- 🤖 **GPT-4o-mini Vision** — AI täpsustab päringu optimaalseteks e-kaubanduse otsingutermideks
- 🌐 **Mitme allika otsing** — Otsib globaalselt Serper.dev Shopping API kaudu
- 💚 **Odavaim / ⭐ Parim / ⚡ Kiireim** — Kolm kategooriareitingut iga otsingu kohta
- 🇪🇪🇪🇺🌍 **Regioonitfilter** — Eesti, Euroopa või globaalne hankimine
- 🔒 **Turvakontroll** — Müüja maine ja HTTPS-i kontroll
- 🔔 **Tõuketeavitused** — Teavitus, kui tulemused on valmis (kuni 5 min)
- 💾 **Püsiv ajalugu** — Hiljutised otsingud salvestatakse kohalikult AsyncStorage abil
- 🌍 **Mitmekeelne** — Eesti ja inglise keel (i18next)

## Tehnoloogiline stäkk

| Kiht | Tehnoloogia |
|------|-------------|
| Mobiilirakendus | React Native 0.79.7 + Expo SDK 55.0.9 |
| Navigatsioon | Expo Router 55.0.8 (v4 failipõhine marsruutimine) |
| Stiilimine | NativeWind 4.2.3 (Tailwind CSS 3.4.19) |
| Keel | TypeScript 6.0.2 (range režiim) |
| i18n | i18next 26.0.1 + react-i18next 17.0.1 (ET / EN) |
| Backend | Vercel serverlessid funktsioonid (Node.js) |
| AI | OpenAI GPT-4o-mini |
| Otsing | Serper.dev Shopping API |
| Andmebaas | Supabase (PostgreSQL) |
| Teavitused | Expo Push Notifications |
| Salvestus | AsyncStorage 3.0.2 |
| React | 19.2.4 |
| Node.js | ^25.8.2 (praegune stabiilne väljalase) |

## Projekti struktuur

```
├── app/                    # Expo Router ekraanid
│   ├── _layout.tsx         # Juurpaigutus (i18n Provider + navigeerimispink)
│   ├── index.tsx           # Avakuva / Sisestuskuva
│   ├── processing.tsx      # "AI mõtleb" animeeritud kuva
│   └── results.tsx         # Toodete tulemused filtreerimisega
├── components/
│   ├── ImagePickerComponent.tsx  # Kaamera/galerii pildi valimine
│   ├── LanguageSwitcher.tsx      # ET ↔ EN keelevahetaja
│   ├── ProductCard.tsx           # Rikkalik toodetekaart
│   ├── FilterBar.tsx             # Kategooria- ja regioonifiltrid
│   └── LoadingOverlay.tsx        # Täisekraani laadimise olek
├── hooks/
│   ├── useProductSearch.ts       # Otsingu olekuhaldus
│   └── useNotifications.ts       # Tõuketeavituste registreerimine
├── services/
│   ├── api.ts                    # Axios API klient
│   ├── notifications.ts          # Expo Notifications teenus
│   └── storage.ts                # AsyncStorage abifunktsioonid
├── i18n/
│   ├── index.ts                  # i18next konfiguratsioon
│   └── locales/
│       ├── en.json               # Ingliskeelsed tõlked
│       └── et.json               # Eestikeelsed tõlked
├── types/index.ts               # Jagatud TypeScripti tüübid
├── constants/colors.ts          # Disainisüsteemi värvid
├── api/                         # Vercel serverless funktsioonid
│   ├── analyze.ts               # POST /api/analyze (AI päringu genereerimine)
│   └── search.ts                # POST/GET /api/search (toodete otsing)
└── global.css                   # NativeWind / Tailwind CSS sisend
```

## Alustamine

### Eeldused

- Node.js ^25.8.2 (praegune stabiilne väljalase — alla laadida [nodejs.org](https://nodejs.org))
- Expo CLI: `npm install -g expo-cli`
- Expo konto (tõuketeavituste jaoks)

### Paigaldamine

```bash
git clone <repo-url>
cd LetsApp
npm install
cp .env.example .env
# Täida .env failis oma API võtmed
```

### Keskkonna muutujad

Kopeeri `.env.example` failiks `.env` ja täida:

| Muutuja | Kirjeldus |
|---------|-----------|
| `OPENAI_API_KEY` | OpenAI API võti (vajalik GPT-4o-mini ligipääs) |
| `SERPER_API_KEY` | Serper.dev API võti ostuotsinguks |
| `SUPABASE_URL` | Sinu Supabase projekti URL |
| `SUPABASE_ANON_KEY` | Supabase anonüümne/avalik võti |
| `SUPABASE_SERVICE_KEY` | Supabase teenuse rolli võti (ainult backend) |
| `EXPO_PUBLIC_API_URL` | Sinu Vercel kasutuselevõtu URL |

## Mobiilis testimine Expo Go abil

### Samm-sammuline juhend

1. **Paigalda Expo Go** oma telefoni:
   - iOS: [App Store — Expo Go](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Google Play — Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Käivita arendusserver:**
   ```bash
   npx expo start
   ```
   Terminalis ilmub QR-kood.

3. **Skaneeri QR-kood:**
   - **iOS**: Ava kaamera rakendus, suuna kaamera QR-koodi peale. Toksake ilmuvat teadet.
   - **Android**: Ava Expo Go rakendus → toksake **"Scan QR code"** → skaneeri kood.

4. Rakendus laaditakse alla sinu telefonile ja käivitub automaatselt.

> **Märkus:** Arendusserver ja telefon peavad olema samas WiFi-võrgus.

### Tootmistestimine (hiljem)

#### TestFlight (iOS)

1. Loo [EAS Build](https://docs.expo.dev/build/introduction/) konfiguratsioon:
   ```bash
   npm install -g eas-cli
   eas build:configure
   eas build --platform ios
   ```
2. Lae `.ipa` üles [App Store Connecti](https://appstoreconnect.apple.com).
3. Lisa TestFlight testijad e-posti aadressi kaudu.
4. Testijad saavad TestFlight rakenduse kaudu kutse.

#### Google Play Console (Android)

1. Ehita APK või AAB:
   ```bash
   eas build --platform android
   ```
2. Logi sisse [Google Play Console'i](https://play.google.com/console).
3. Loo uus rakendus → Sisemise testimise rada → Lae üles `.aab` fail.
4. Lisa testijad e-posti aadressi kaudu.

## Supabase skeem

Käivita see SQL oma Supabase projektis:

```sql
-- Otsingu päringute tabel
create table search_requests (
  id uuid primary key,
  text_input text,
  has_image boolean default false,
  filters jsonb,
  expo_push_token text,
  status text default 'processing',
  ai_query text,
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- Otsingu tulemuste tabel
create table search_results (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references search_requests(id),
  title text,
  description text,
  price numeric,
  currency text,
  total_cost numeric,
  shipping_cost numeric,
  estimated_delivery_days int,
  rating numeric,
  review_count int,
  image_url text,
  purchase_url text,
  seller text,
  seller_reputation text,
  origin text,
  is_secure boolean,
  brand text,
  category text,
  created_at timestamptz default now()
);

-- Indeksid
create index on search_requests(status);
create index on search_results(request_id);
create index on search_results(category);
```

## Backendi kasutuselevõtt (Vercel)

```bash
npm install -g vercel
vercel --prod
```

Lisa keskkonna muutujad Vercel armatuurlaual või käsuga `vercel env add`.

## Rakenduse voog

```
Avakuva
  │  Kasutaja sisestab teksti + valikulise pildi
  │  Valib regioonifiltrid
  ↓
POST /api/analyze
  │  AI genereerib optimeeritud otsingupäringu
  │  Salvestab päringu Supabase'i
  ↓
Töötlemiskuva
  │  Animeeritud sammud
  │  Küsitlus GET /api/analyze iga 8s tagant (eksponentsiaalne viivitus)
  ↓
POST /api/search (taustaprotsess)
  │  Toob tooted Serper.dev kaudu
  │  Kategoriseerib: odavaim / parim / kiireim
  │  Salvestab Supabase'i
  │  Saadab tõuketeavituse
  ↓
Tulemuste kuva
  │  Kuvab tootekaardid
  │  Filtreerimine kategooria ja regiooni järgi
  │  Ava pakkumised brauseris
```

## Disainisüsteem

Rakendus kasutab tumedat merevärvi teemat:

| Token | Väärtus | Kasutus |
|-------|---------|---------|
| Taust | `#0F172A` | Ekraanide tausta |
| Pind | `#1E293B` | Kaardid, sisendid |
| Primaarne | `#6366F1` | Nupud, aktiivsed olekud |
| Odavaim | `#10B981` | Roheline hinnakategooria |
| Parim | `#6366F1` | Lilla kvaliteedikategooria |
| Kiireim | `#F59E0B` | Kollane kiiruskategooria |

## Litsents

MIT
