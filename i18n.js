/* ==========================================================================
   i18n.js — TRANSLATIONS
   --------------------------------------------------------------------------
   This file is the ONLY place you need to touch to add/edit translations.
   layout.js and projects.js are untouched — every piece of text there is
   still just the normal English text, used as the fallback whenever a
   translation below is missing or left empty.

   HOW IT WORKS
   - LANGS lists the languages, in the order the toggle button cycles through.
     The site always boots in the first one (English).
   - Every translatable string has an English version (already written, in
     layout.js / projects.js / below) plus one entry per *other* language here.
   - Leave any string here as '' (empty) and that piece of text will just
     keep showing in English until you fill it in — nothing breaks.

   WHERE TO TYPE WHAT
   1) I18N_LABELS   — the text painted onto the drawing (shelves/walls).
                      Key = the `key` of that entry in the LABELS array
                      in projects.js.
   2) I18N_PROJECTS — everything on a project's book page.
                      Key = that project's `id` in projects.js.
   3) I18N_UI       — small interface text (not part of your content):
                      the "Description"/"Preview" labels, the close button,
                      etc. English is written out here since there's no
                      other file it could fall back to.

   ADDING A LANGUAGE (e.g. Swedish)
   This file is the ONLY thing you touch — layout.js, projects.js and
   index.html don't change at all. Three steps, all in this file:
     a) Add its code to LANGS below, e.g. ['en', 'nl', 'sv'].
        (the 2-letter codes are just labels you pick — 'sv' isn't magic,
        it's only ever used as an object key in this file)
     b) In I18N_LABELS and I18N_PROJECTS, add an `sv: { ... }` sibling next
        to every `nl: { ... }` you see, with the same fields inside.
     c) In I18N_UI, add `sv: '...'` next to every `nl: '...'`.
   Until you fill an `sv` entry in, that piece of text just shows in
   English — so you can add the language and translate gradually.
   ========================================================================== */

const LANGS = ['en', 'nl', 'sv'];
// Example with a third language added, for when you're ready — swap the line
// above for this one and follow steps (b) and (c) above:
// const LANGS = ['en', 'nl', 'sv'];

/* --------------------------------------------------------------------------
   1) LABELS — shelf / wall text.
   For each key, fill in `text` (and `sub`, for the contact block entries)
   for every language other than English.

   FONT SIZE: these labels already auto-shrink to fit their box in every
   language (down to 10px), so most of the time you won't need to touch
   size at all. If a translation is still cramped, or you'd simply prefer
   it start smaller, add a `size` (px) next to that language's `text` —
   it overrides that label's normal starting size (set in projects.js)
   for that language only:
     miscellaneous: { nl: { text: 'Diversen', size: 40 } },
   -------------------------------------------------------------------------- */
const I18N_LABELS = {
  // adding Swedish later means giving each of these an `sv: { text: '' }` too,
  // right alongside its `nl: { text: '' }` — e.g.:
  //   libraryTitle: { nl: { text: '' }, sv: { text: '' } },
  libraryTitle:    { nl: { text: 'De Bibliotheek', size: '30'}, sv: {text: 'Biblioteket'}},
  libraryTagline:  { nl: { text: 'Het volledige archief' }, sv: {text: 'Det kompletta arkivet'}},
  coding:          { nl: { text: 'Coderen' }, sv: {text: 'Kodning'}},
  drawnBy:         { nl: { text: 'Tekeningen gemaakt door Neekey'}, sv: {text: 'Teckningar gjorda av Neekey'}},
  projectsHeading: { nl: { text: 'Projecten' }, sv: {text: 'Projekt'}},
  byAuthor:        { nl: { text: 'Door: Lucas Bouwmeester', size: '27' }, sv: {text: 'Dörr: Lucas Bouwmeester', size: '27'}},
  animations:      { nl: { text: 'Animaties' }, sv: {text: 'Animationer'}},
  miscellaneous:   { nl: { text: 'Diversen' }, sv: {text: 'Diverse'}},
  featured:        { nl: { text: '*Uitgelicht*' }, sv: {text: '*Utvald*'}},
  contactPersonal: { nl: { text: '(Persoonlijke) E-mail'}, sv: { text: '(Privat) E-post'}},
  contactOnline:   { nl: { text: '(Online RP) E-mail'}, sv: { text: '(Online-rollspel) E-post'}},
  contactGithub:   { nl: { text: 'Github'}, sv: { text: 'Github'}},
};

/* --------------------------------------------------------------------------
   2) PROJECTS — one entry per project id (see the `id:` of each project in
   projects.js). Fill in whichever fields you want translated; the rest
   quietly fall back to the English text already in projects.js.

   `links` translates the labels of that project's `links` array, in the
   same order — e.g. links: ['Live site', ''] translates only the first link
   and leaves the second (e.g. "Github") in English.

   `description` uses backticks ( ` ` ) instead of quotes, same as in
   projects.js — that's on purpose: only backtick strings can contain real
   line breaks, so leave a blank line between paragraphs to get the same
   spacing as the English text, e.g.:
     description: `First paragraph.

     Second paragraph, with a blank line above it.`

   Adding Swedish later means giving each project an `sv: { ... }` too,
   right alongside its `nl: { ... }`.
   -------------------------------------------------------------------------- */
const I18N_PROJECTS = {
  thelibrary: { 
    nl: { title: 'De Bibliotheek', type: 'Creativiteit - Archief - AI', status: 'Voltooid & onderhouden', date: 'September - 2026', group: 'Neekey: Tekeningen – Ikzelf: Programmeren en ontwerpen', duration: 'Opdrachten: 12 dagen - Programmeren: 1 dag', description: `
    Rond begin augustus 2026 besefte ik dat ik een overzichtspagina voor al mijn projecten nodig had, aangezien de pagina op mijn portfolio hopeloos verouderd was. Ik vroeg een vriendin, Neekey, om een ​​'bibliotheek' voor de pagina te ontwerpen en te illustreren. Toen zij klaar was met de illustraties, kon ik aan de laatste details werken en het project tot leven brengen. 

    Voor het eerst besloot ik het meeste programmeerwerk aan AI over te laten, vooral omdat ik weinig vrije tijd had. Ik ben geen groot voorstander van AI, dus wilde ik het creatieve gedeelte van het project, en dan vooral het ontwerp, volledig in eigen hand houden. Ik zette AI vooral in voor optimalisatie, responsiveness en een deel van de technische implementatie. 

    Hoewel dit project voor mij enigszins experimenteel was, ben ik blij met het eindresultaat.`, 
    links: ['Live website', 'Github'] },


    sv: { title: 'Biblioteket', type: 'Kreativitet – Arkiv – AI', status: 'Slutfört och underhållet', date: 'September 2026', group: 'Neekey: Teckningar – Jag: Programmering och design', duration: 'Uppdrag: 12 dagar – Programmering: 1 dag', description: `
    I början av augusti 2026 insåg jag att jag behövde en navigeringssida för alla mina projekt, eftersom den på min portfolio var kraftigt föråldrad. Jag gav en vän, Neekey, i uppdrag att designa och illustrera ett bibliotekstema till sidan. När hon var klar med illustrationerna kunde jag börja arbeta med finliret och ge liv åt projektet. 

    För första gången valde jag att låta AI sköta merparten av kodningen, främst för att jag hade ont om tid. Jag är inte någon större anhängare av AI, så jag ville behålla den kreativa delen av projektet, särskilt designen,  helt för egen del. Jag använde AI främst för optimering, responsivitet och delar av den mer tekniska implementeringen. 

    Även om projektet var något av ett experiment för mig är jag nöjd med slutresultatet.`, 
    links: ['Live-webbplats', 'Github']},
  },

  cursor:     { 
    nl: { title: 'Onderzoek cursor', type: 'Onderzoeksartikel - Expo - Interactie', status: 'Voltooid', date: 'Juni - 2026', group: 'Individueel', duration: '1 maand', description: `
    Voor mijn laatste les in de specialisatie softwareontwikkeling moest ik een onderzoeksverslag schrijven en een website maken die aansloot bij het onderwerp van dat verslag.

    Op de website kun je diverse elementen van een fictieve krant aanpassen; deze krant fungeert tevens als interactieve handleiding. Via de rode knop heb je toegang tot het instellingenmenu, waarmee je verschillende aspecten van de krant kunt wijzigen en de werking ervan kunt verkennen.`, 
    links: ['Live website', 'Onderzoeksartikel', 'Github'] },
    

    sv: { title: 'Forskning om muspekare', type: 'Forskningsuppsats – Expo – Interaktion', status: 'Färdig', date: 'Juni - 2026', group: 'Individuellt', duration: '1 månad', description: `
    För min sista kurs inom inriktningen mjukvaruutveckling skulle jag skriva en uppsats och skapa en webbplats kopplad till uppsatsens ämne.

    På webbplatsen kan man anpassa olika delar av en fiktiv tidning, som samtidigt fungerar som en interaktiv genomgång. Via inställningsmenyn – som nås genom den röda knappen – kan man ändra olika aspekter av tidningen och utforska hur den fungerar. `, 
    links: ['Live-webbplats', 'Forskningsuppsats', 'Github'] } 
  },

  nen:        { 
    nl: { title: 'HxH krachtsysteem', type: 'Backend - Randomizer - HxH', status: 'Voltooid', date: 'Juni - 2026', group: 'Individueel', duration: '1 volledige nacht', description: `
    Voor mijn eindopdracht TypeScript had ik twee opties: de door de docenten voorbereide opdracht uitvoeren of een eigen idee pitchen. Als mijn pitch goed genoeg was, mocht ik mijn eigen project voor de eindopdracht maken. Laten we zeggen dat de pitch slaagde en dat ik uiteindelijk dit heb gemaakt.

    Ik heb het krachtsysteem uit *Hunter x Hunter*, bekend als 'Nen', nagebouwd. Even ter toelichting: wanneer je in *HxH* Nen leert, word je ingedeeld in een van de zes types. Vijf daarvan zijn de hoofdtypes, terwijl het zesde type – Specialisatie – bedoeld is voor vaardigheden die niet netjes in de andere categorieën passen.

    Je kunt ook zien welke types aan jouw eigen type grenzen. Hoewel je vaardigheden van deze aangrenzende types kunt gebruiken, ben je er doorgaans minder efficiënt in dan in je primaire type.

    Het was een leuk project dat ik snel kon afronden. Ik denk dat ik ongeveer drie uur kwijt was aan het daadwerkelijke programmeren, gevolgd door nog eens drie uur karaoke zingen tijdens de nacht doorwerken.  `, 
    links: ['Live website', 'Github'] },


     sv: { title: 'HxH kraftsystem', type: 'Backend – Slumpgenerator – HxH', status: 'Färdig', date: 'Juni - 2026', group: 'Individuellt', duration: '1 hel natt', description: `
    Inför mitt slutprojekt i TypeScript hade jag två alternativ: att genomföra uppgiften som lärarna tagit fram eller att presentera en egen idé. Om idén var tillräckligt bra fick jag göra ett eget projekt. Låt oss bara säga att presentationen gick bra, och att det slutade med att jag skapade det här.

    Jag återskapade kraftsystemet från *Hunter x Hunter*, känt som Nen. Som en kort bakgrund: när man lär sig Nen i *HxH* hamnar man i en av sex kategorier. Fem av dessa är huvudkategorier, medan den sjätte – specialisering – är till för förmågor som inte passar in i de övriga kategorierna.

    Man kan också se vilka kategorier som ligger intill ens egen. Även om man kan använda förmågor från dessa närliggande kategorier, är man oftast inte lika effektiv med dem som med sin primära kategori.

    Projektet var roligt och gick snabbt att genomföra. Jag tror att jag lade ungefär tre timmar på själva programmeringen, följt av ytterligare tre timmar med karaoke under den där natten då vi satt uppe och jobbade.`, 
    links: ['Live-webbplats', 'Github']},
  },

  lypmy:      { 
    nl: { title: 'LYPMY', type: 'Applicatie - UI/UX - Chatplatform - Sociaal contact', status: 'Onvoltooid & Lopend', date: 'September 2026 -> Nu', group: 'Sophie: Backend – Ik: Frontend & Design', duration: 'Lopend', description: `
    LYMPY is een chatplatform dat mensen aanmoedigt om actief te delen wat ze die week hebben gedaan. Het idee is simpel: je moet per week 2 tot 5 foto's uploaden voor elke groepschat waarin je zit. Zodra de wekelijkse deadline is verstreken, worden de foto's samengevoegd tot een collage en in de groepschat gedeeld, zodat iedereen ze kan zien.

    De voorwaarde is dat je daadwerkelijk foto's deelt; doe je dat niet, dan verlies je voor die week de toegang tot de groepschat. Het doel is om mensen aan te sporen echt met elkaar te interageren, in plaats van gesprekken langzaam te laten doodbloeden.

    Ik werk voornamelijk aan de frontend, en dan vooral aan de UI/UX, responsiveness en toegankelijkheid. Een functie waar ik erg blij mee ben, is het systeem voor 'patch notes'; hiermee kunnen zowel wij als de gebruikers nieuwe wijzigingen en updates bijhouden.

    Leuk weetje: de naam LYMPY staat voor "Lucas, Your Parents Miss You" (Lucas, je ouders missen je). Sophie vond het grappig om te verwijzen naar de reden waarom ik oorspronkelijk op het idee kwam: ik was voor mijn stage naar het buitenland verhuisd. `, 
    links: ['Live website', 'Github']},
  

    sv: { title: 'LYPMY', type: 'Applikation – UI/UX – Chattplattform – Socialt umgänge', status: 'Oavslutat och pågående', date: 'September 2026 -> Nu', group: 'Sophie: Backend – Jag: Frontend & Design', duration: 'Pågående', description: `
    LYMPY är en chattplattform som ska uppmuntra människor att aktivt dela med sig av vad de har gjort under veckan. Konceptet är enkelt: du måste ladda upp 2–5 bilder i veckan för varje gruppchatt du är med i. När veckans tidsfrist har löpt ut sammanställs bilderna till ett collage som delas i gruppchatten så att alla kan se det.

    Haken är att du faktiskt måste dela bilder; om du inte gör det förlorar du tillgången till gruppchatten under den veckan. Syftet är att uppmuntra människor att faktiskt interagera med varandra istället för att låta samtalen sakta rinna ut i sanden.

    Jag arbetar främst med frontend-utveckling, särskilt UI/UX, responsivitet och tillgänglighet. En funktion jag är särskilt nöjd med är systemet för versionsinformation (patch notes), som gör att både vi och användarna kan hålla koll på nyligen lanserade ändringar och uppdateringar.

    En kul detalj: namnet LYMPY står för ”Lucas, Your Parents Miss You” (Lucas, dina föräldrar saknar dig). Sophie tyckte att det vore roligt att anspela på anledningen till att jag fick idén från början: jag hade flyttat utomlands för min praktik.  `, 
    links: ['Live-webbplats', 'Github']}  
  },

  azurae:     { 
    nl: { title: 'Het verhaal van Azurae', type: 'Verhaal - Mythe - Boek', status: 'Onvoltooid', date: 'November - 2025', group: 'Individueel', duration: '2 weken', description: `
    Het verhaal van Azurae is een webapplicatie die gebaseerd is op een mythe die ik voor de les Engels heb geschreven. Het begon als een leuk nevenproject waaraan ik naast de eigenlijke opdracht werkte. Uiteindelijk heb ik het na het verstrijken van de deadline laten rusten, aangezien wat ik al had voltooid voldoende was voor de opdracht.

    De mythe zelf is onvoltooid gebleven, omdat ik de woordlimiet bereikte voordat ik het verhaal volledig kon uitwerken.

    Voor de les moest ik onderzoek doen naar een historisch onderwerp op het gebied van mythen dat mijn interesse wekte. Ik besloot me bij mijn onderzoek vooral te richten op de oorsprong en geschiedenis van de zeven hoofdzonden; dit vormde een van de belangrijkste inspiratiebronnen voor zowel de mythe als de webapplicatie.  `, 
    links: ['Live website', 'Onderzoeksartikel', 'Github'] },


    sv: { title: 'Berättelsen om Azurae', type: 'Berättelse – Myt – Bok', status: 'Oavslutat', date: 'November - 2025', group: 'Individuellt', duration: '2 veckor', description: `
    "Berättelsen om Azurae" är en webbapplikation som bygger på en myt jag skrev till en engelsklektion. Det började som ett roligt sidoprojekt som jag arbetade med parallellt med själva skoluppgiften. När inlämningsdatumet väl hade passerat lade jag projektet åt sidan, eftersom det jag redan hunnit göra räckte gott och väl för uppgiften.

    Själva myten är ofullbordad eftersom jag nådde ordgränsen innan jag hann utveckla berättelsen fullt ut.

    För kursen behövde jag göra efterforskningar kring ett historiskt ämne med koppling till myter som jag fann intressant. Jag valde att i första hand fokusera på ursprunget och historien bakom de sju dödssynderna, vilket blev en av de främsta inspirationskällorna till både myten och webbapplikationen.`, 
    links: ['Live-webbplats', 'Forskningsuppsats', 'Github'] } 
  },

  gachiakuta: { 
    nl: { title: 'Gachiakuta Game', type: 'Frontend - UI/UX - Ontwerp van vechtspellen', status: 'Onvoltooid', date: 'November - 2025', group: 'Individueel', duration: '1 volledige nacht', description: `
    Gachiakuta is een anime-/mangareeks die de laatste tijd behoorlijk populair is geworden. Ik kwam online een concept en ontwerp tegen voor een Gachiakuta-vechtspel en besloot te proberen de frontend ervan na te maken.

    Ik herinner me niet veel details van het programmeerwerk, aangezien ik nauwelijks had geslapen... Wat ik me wel herinner, is dat ik tijdens die nacht doorwerken veel nieuwe dingen moest leren om het te kunnen ontwikkelen. Ook moest ik proberen de ontwerpafbeeldingen na te maken en veel screenshots van het concept gebruiken; dat was een interessant proces. `, 
    links: ['Live website', 'Github', 'Conceptidee']},


    sv: { title: 'Gachiakuta Game', type: 'Frontend – UI/UX – Design av fightingspel', status: 'Oavslutat', date: 'November - 2025', group: 'Individuellt', duration: '1 hel natt', description: `
    Gachiakuta är en anime- och mangaserie som har blivit ganska populär på sistone. Jag hittade konceptet och designen för ett Gachiakuta-fightingspel på nätet och bestämde mig för att försöka återskapa dess gränssnitt.

    Jag minns inte så många detaljer från själva programmeringen, eftersom jag var helt sömnlös... Det jag däremot minns är att jag behövde lära mig en hel del under den där natten för att kunna utveckla det. Jag fick också försöka återskapa designbilderna och ta skärmdumpar av olika delar från konceptet, vilket var en intressant process.`, 
    links: ['Live-webbplats', 'Github', 'Konceptidé']}  
  },

  neocity:    {
   nl: { title: 'Neocity-li', type: 'Full-stack - Neocity - Interactief - API', status: 'Voltooid', date: 'Juni - 2026', group: 'Individueel', duration: 'Ontwerpen: 3 uur - Programmeren: 19 uur', description: `
  Voor het vak "Interface" moesten we een groot eindproject maken waaraan we gedurende alle vier de semesters werkten. Het idee was dat alles wat we in de verschillende onderdelen van het curriculum hadden geleerd, samenkwam in dit ene grote eindproject.

  Nu je de context kent, ga ik uitleggen hoe je een project *niet* moet aanpakken. Hoewel we er negen maanden de tijd voor hadden, begon ik er pas twee dagen voor de deadline aan. Op de een-na-laatste dag ontwierp ik Neocity. Op de laatste dag moest ik negentien uur achter elkaar programmeren, met slechts één korte pauze.

  Desondanks ben ik ontzettend blij met het resultaat, ook al slaan sommige programmeertechnieken die ik gebruikte nergens op. Zo zijn de contouren van de huizen bijvoorbeeld gemaakt met SCSS-boxen en randen (borders), en werkte de API voor het restaurant slechts één dag voordat hij ermee ophield.

  Ik heb veel geleerd van dit project van één dag. Het was de eerste keer dat ik met React werkte, en aanvankelijk vond ik het totaal overbodig. Maar na er bijna een hele dag mee bezig te zijn geweest, begon ik het erg te waarderen en gebruik ik React nu veel vaker. Ook heb ik geleerd om geen vormen te tekenen met CSS-randen en – nog belangrijker – om veel eerder aan grote projecten te beginnen dan anderhalve dag voor de deadline.

  Korte toelichting: Neocity-li staat voor "Neocity Light" en de sfeer van de stad is sterk geïnspireerd door een van mijn absolute favoriete games: Stray.`, 
  links: ['Live website', 'Github']},


  sv: { title: 'Neostad-li', type: 'Fullstack – Neocity – Interaktivt – API', status: 'Färdig', date: 'Juni - 2026', group: 'Individuellt', duration: 'Design: 3 timmar – Programmering: 19 timmar', description: `
  Inom ramen för kursen "Interface" skulle vi genomföra ett omfattande slutprojekt som löpte över alla fyra terminer. Tanken var att samla kunskaperna från de olika delkurserna i ett enda stort slutprojekt.

  Med den bakgrunden ska jag nu berätta hur man *inte* bör gå tillväga när man utvecklar ett projekt. Trots att vi hade nio månader på oss påbörjade jag arbetet först två dagar före deadline. Jag designade Neocity under den näst sista dagen, och på själva slutdagen programmerade jag i 19 timmar i sträck med bara en enda paus.

  Trots detta är jag väldigt nöjd med slutresultatet, även om vissa av programmeringsteknikerna jag använde är helt ologiska. Husens konturer är till exempel skapade med hjälp av SCSS-boxar med ramar, och API:et för restaurangen fungerade bara i en dag innan det slutade fungera.

  Jag lärde mig mycket av detta projekt som i praktiken genomfördes på en dag. Det var första gången jag använde React, och till en början tyckte jag att det kändes helt onödigt. Men efter att ha arbetat med det i nästan en hel dag började jag verkligen uppskatta det, och numera använder jag React flitigt. Jag lärde mig också att man inte bör rita saker med hjälp av CSS-ramar – och framför allt att man bör påbörja stora projekt långt tidigare än 1,5 dagar före deadline.

  En liten notering: Neocity-li står för "Neocity Light", och stadens känsla är starkt inspirerad av ett av mina absoluta favoritspel, Stray.  `, 
  links: ['Live-webbplats', 'Github']}  
  },

  lifestyle:  { 
    nl: { title: 'Lifestyle-animatie', type: 'Animatie van 3 frames', status: 'Onvoltooid', date: 'Juni - 2026', group: 'Individueel', duration: '7 uur', description: `
    Een korte animatie die ik heb gemaakt voor een creatieve opdracht bij het vak 'Lifestyle'. Bij de meeste creatieve opdrachten waarbij ik zelf mag bepalen wat ik maak, kies ik voor animaties.

    Het idee achter het verhaal was dat, ook al heb je ergens geen zin in, je je er toch toe zetten je leven een stuk leuker kan maken. Dat is echter niet echt terug te zien in de animatie, omdat deze nog niet af is. Ik vond het vooral erg leuk om eraan te werken.  ` },
    
    sv: { title: 'Livsstilsanimation', type: 'Animering med 3 bildrutor', status: 'Oavslutat', date: 'Juni - 2026', group: 'Individuellt', duration: '7 timmar', description: `
    En liten animation som jag gjorde till en kreativ uppgift i kursen ”Lifestyle”. När det gäller kreativa uppgifter där jag själv får bestämma vad jag vill skapa, väljer jag oftast att göra animationer.

    Tanken bakom berättelsen var att även om man inte har lust att göra något, kan det göra livet mycket roligare om man ändå bestämmer sig för att genomföra det. Det framgår dock inte riktigt av animationen, eftersom den inte är färdigställd. Jag tyckte helt enkelt att det var väldigt roligt att skapa den. ` },
  },

  metrohall:  { 
    nl: { title: 'Metrohal-scène', type: 'Animation med 8 bildrutor', status: 'Onvoltooid', date: 'December - 2025', group: 'Individueel', duration: '14 uur', description: `
    Een korte animatie die ik maakte toen ik tijdens schooltijd even pauze wilde van het programmeren.

    Ja, ik weet dat de friet veel te goedkoop is.  `},

    sv: { title: 'Sekvensen i Metro Hall', type: 'Animatie van 8 frames', status: 'Oavslutat', date: 'December - 2025', group: 'Individuellt', duration: '14 timmar', description: `
    En liten animation jag gjorde när jag behövde en paus från programmeringen under skoltid.

    Ja, jag vet att pommes fritesen är alldeles för billiga.  `} 
    
    },


  cv:         { 
    nl: { title: 'CV', description: `
     Bekijk mijn CV en krijg een snel overzicht van mijn vaardigheden en ervaringen! `, 
      links: ['Bekijk het Nederlandse CV', 'Bekijk het Engelse CV'] }, 

    
    sv: { title: 'CV', description: `
     Ta en titt på mitt CV och få en snabb överblick över mina färdigheter och erfarenheter! `, 
      links: ['Titta på det nederländska CV:t', 'Titta på det engelska CV:t'] }, 
  },


  portfolio:  { 
    nl: { title: 'Portfolio website', type: 'Frontend, interactief, ASCII, kunstwerk', status: 'Onvoltooid', date: 'Februari 2026 -> Mei 2026', group: 'Individueel', duration: 'bijna 250 uur', description: `
    Mijn portfolio-website is het grootste project dat ik ooit heb ontwikkeld. De reden dat ik hem maakte, was dat mijn mentor sterk aanraadde een website over mezelf te creëren; dit zou het makkelijker maken om aangenomen te worden voor stages.

Om de een of andere reden leek het me een geweldig idee om geen traditioneel portfolio te maken, maar juist een creatief exemplaar dat draaide om interactie en storytelling. Dat betekende dat ik, naast het programmeren, een ontwerp moest maken waarmee mensen konden interageren en waarbij ze een basisverhaallijn konden ontdekken. O ja, ik moet ook nog even vermelden dat ik besloot om in het hele project geen enkele afbeelding te gebruiken. Ik wilde in plaats daarvan ASCII-art gebruiken en vond het indrukwekkend om uitsluitend dat formaat toe te passen. Dat idee pakte echter heel verkeerd uit.

Voor het ontwerp en de verhaallijn had ik niet veel gepland, dus besloot ik gewoon op mijn gevoel af te gaan. Ik schreef wat basisideeën op en maakte schetsen voor elke pagina. Ik koos voor een volledig zwart-wit kleurenpalet, geïnspireerd door de korte animatie "Ninjago: Monstrosity". Bekijk de links voor de animatie.

In die animatie zat het hoofdpersonage vast in een "verlaten oord" na een wereldschokkende gebeurtenis. Omdat ik altijd al een groot fan ben geweest van het horrorgenre "Liminal", besloot ik mijn belangrijkste reiselement te baseren op het concept van "no-clipping".

Vanuit die inspiratie kreeg de verhaallijn van mijn portfolio de volgende opzet: in de wereld die ik creëerde, reis je door verschillende rijken om nieuwe plekken te ontdekken. Het hoofdpersonage – ikzelf dus – reist door deze rijken en probeert de weg terug naar huis te vinden, terwijl jij als gebruiker beslist waar je naartoe gaat.

De ontwerpen voor de portalen naar andere rijken waren erg gaaf. Sommige waren duidelijk zichtbaar, zoals een deur, terwijl andere veel beter verborgen waren. Om te reizen moest je op de portalen klikken; een kompas gaf aan of je vanaf die locatie naar een nieuw rijk kon reizen.

O ja, nog iets: alle ontwerpen waren gemaakt in ASCII, wat ik zelf moest creëren en vormgeven. Een van de redenen waarom dit project zo lang duurde, was dat ik minstens een derde van de tijd kwijt was aan het simpelweg typen van ASCII...

Helaas heb ik het nooit kunnen afronden. Ik had er nog veel meer plannen voor, maar uiteindelijk kwam ik tijd tekort.

Ik heb veel geleerd van dit project. Werken zonder afbeeldingen was een hele opgave, maar ik leerde wel hoe ik 'pre' en 'clamp' goed moest gebruiken – kennis die ik tot op de dag van vandaag in veel projecten toepas. Ook leerde ik ASCII-art maken en werken met ASCII-compilers, al ben ik niet van plan om in de toekomst nog veel met ASCII te doen.

Maar het belangrijkste dat ik heb geleerd, is dat je – als je gepassioneerd bent over een project – er consequent tijd in moet steken. Ik heb veel ideeën en plannen voor projecten (of dingen in het algemeen), maar vaak maak ik ze niet af omdat ik bang ben dat ik het verkeerd doe of tijd tekortkom. Ik heb geleerd dat je bij alles wat je nieuw begint onvermijdelijk tegen tegenslagen aanloopt, en dat dat prima is. Hoewel ik vanaf het begin wist dat ik dit project waarschijnlijk niet zou kunnen afronden, was ik toch blij met wat ik had weten te creëren.

Kortom: als je ergens trots op wilt zijn, moet je er gewoon aan beginnen en er de nodige uren in steken. Uiteindelijk zul je er altijd met een glimlach op terugkijken.

In dit gedeelte deel ik enkele leuke weetjes, plannen en ervaringen:

• De hele wereld heet "The World of Realms". Het idee was dat alle 'realms' (rijken) op dezelfde planeet bestaan, maar dat ze er elk net iets anders uitzien – waarbij de verschillen uiteindelijk extreem worden. De portalen brengen je niet naar een ander multiversum, maar naar een andere laag van de planeet. Ik schrijf deze beschrijving zeven maanden nadat ik aan mijn portfolio begon, en ik besef dat het idee erg lijkt op de film "The Backrooms" van Kane Parsons.

• Er zit daadwerkelijk een krachtsysteem in de rijken verwerkt. Als je goed naar het kompas kijkt, zie je dat het een erg ingewikkeld ontwerp heeft. Het kompas fungeerde eigenlijk als de magische cirkel voor het krachtensysteem. KIJK IN JE SCHETSBOEK ALS JE THUIS BENT, LUCAS!

• Tijdens de ontwikkeling stuitte ik ooit op een bug die zo groot was dat het me zes uur kostte om hem op te lossen. En weet je wat het probleem was? Ik had op een willekeurige regel de verkeerde haakjes gebruikt...

• Ook heb ik samen met mijn beste vriend vijf uur besteed aan het corrigeren van alle grammaticale fouten. Dankjewel, Alex.

• Oorspronkelijk was ik van plan om het portfolio onderdeel te laten zijn van een grotere website. Op die website zou een sectie komen met de naam "Crossroad-1". Van daaruit kon je kiezen om naar drie verschillende werelden te gaan. De eerste wereld was het gebouw "I Want You for the Company", dat zou leiden naar het gedeelte van de website over stages. De tweede wereld heette het "Realm of Monsters"; ik was van plan een korte animatiefilm te maken over het betreden ervan, maar ik ben niet verder gekomen dan het storyboard. De derde wereld heette "The BeforeRealm" en zou leiden naar een ijzig labyrint.  

• Leuk weetje: op de eerste pagina sneeuwt het. Althans, zo dacht ik dat mensen het zouden zien. De meeste mensen dachten echter dat het as van het kampvuur was. Ik heb het zo gelaten, omdat ik vind dat de schoonheid van creatieve omgevingen juist schuilt in het feit dat mensen dingen op hun eigen manier kunnen zien.`, 
    links: ['Live website', 'Github', 'ASCII', 'Liminal', 'Ninjago: Monstrosity']},

    sv: { title: 'Portföljwebbplats', type: 'Frontend, interaktivt, ASCII, grafik', status: 'Oavslutat', date: 'Februari 2026 –> Maj 2026', group: 'Individuellt', duration: 'nästan 250 timmar', description: `
     Min portföljwebbplats är det största projekt jag någonsin har utvecklat. Anledningen till att jag skapade den var att min mentor starkt rekommenderade att jag skulle göra en webbplats om mig själv för att öka mina chanser att få praktikplatser.

Av någon anledning tyckte jag att det vore en bra idé att inte göra en traditionell portfölj, utan istället skapa en kreativ variant med fokus på interaktion och berättande. Det innebar att jag, utöver själva programmeringen, behövde ta fram en design som besökarna kunde interagera med och en grundläggande berättelse de kunde utforska. Just det, en sak jag bör nämna är att jag bestämde mig för att inte använda en enda bild i hela projektet. Jag ville istället använda ASCII-konst och tyckte att det vore imponerande att hålla sig till enbart det formatet. Den idén slog dock rejält fel.

När det gällde designen och berättelsen hade jag inte planerat så mycket, så jag bestämde mig för att bara ”följa strömmen”. Jag skrev ner några grundläggande idéer och skissade upp varje sida. Jag valde en helt svartvit färgpalett, eftersom jag hämtat inspiration till stilen från en kortanimation vid namn ”Ninjago: Monstrosity”. Se länkarna för att titta på animationen.

I animationen var huvudpersonen strandsatt i ett ”övergivet land” efter en världsomvälvande händelse. Jag har alltid gillat skräckgenren ”Liminal”, så jag bestämde mig för att låta mitt huvudsakliga sätt att förflytta sig bygga på idén om ”no-clipping” (att kunna gå igenom väggar eller fasta objekt).

Med den inspirationen som grund utformades berättelsen i min portfölj på följande sätt: I den värld jag skapade reser man genom olika riken för att utforska nya platser. Huvudpersonen – alltså jag – färdas genom dessa riken i ett försök att hitta tillbaka till mitt hemrike, samtidigt som du som användare fattar beslut om vart vi ska ta vägen.

Designen för portalerna till de andra rikena var riktigt häftig. Vissa var uppenbara, som en dörr, medan andra var mycket mer dolda. För att resa behövde man klicka på portalerna, och en kompass visade om det gick att ta sig till ett nytt rike från den aktuella platsen.

Just det, en sak till: all grafik var gjord i ASCII-format, vilket jag var tvungen att skapa och designa helt på egen hand. En av anledningarna till att det här projektet tog så lång tid var att minst en tredjedel av tiden gick åt till att bara skriva ASCII-tecken...

Tyvärr lyckades jag aldrig slutföra det. Jag hade många fler planer för projektet, men tiden rann till slut ut.

Jag lärde mig mycket av det här projektet. Att arbeta utan bilder var besvärligt, men jag lärde mig att använda "pre" och "clamp" på rätt sätt – kunskaper som jag fortfarande har nytta av i många projekt. Jag lärde mig också att skapa ASCII-konst och arbeta med ASCII-kompilatorer, även om jag inte planerar att arbeta särskilt mycket med ASCII i framtiden.

Men det viktigaste jag lärde mig är att om man brinner för ett projekt måste man lägga ner tid på det kontinuerligt. Jag har massor av idéer och planer för projekt – eller saker i allmänhet – men ofta fullföljer jag dem aldrig eftersom jag är rädd att göra fel eller att tiden inte ska räcka till. Jag insåg att när man påbörjar något nytt kommer man oundvikligen att stöta på motgångar, och det är helt okej. Även om jag från början visste att jag förmodligen inte skulle kunna slutföra projektet, var jag ändå nöjd med det jag lyckades skapa.

Kort sagt: om du vill kunna vara stolt över något är det bara att sätta igång och lägga ner arbetet. I slutändan kommer du alltid att kunna se tillbaka på det med ett leende.

Här är några roliga fakta, planer och erfarenheter som jag vill dela med mig av:

• Hela världen kallas "The World of Realms". Tanken var att alla riken (realms) skulle finnas på samma planet, men att de såg lite olika ut – och att skillnaderna med tiden blev extrema. Portalerna skickar dig inte till ett annat multiversum, utan snarare till ett annat skikt av planeten. Jag skriver den här beskrivningen sju månader efter att jag började arbeta med min portfolio, och jag inser att idén påminner mycket om filmen "The Backrooms" av Kane Parsons.

• Det finns faktiskt ett kraftsystem i dessa riken. Om du tittar närmare på kompassen ser du att den har en mycket komplicerad utformning. Kompassen fungerade i själva verket som en magisk cirkel för kraftsystemet. KOLLA SKISSBOKEN DÄRHEMMA, LUCAS!

• Under utvecklingsarbetet stötte jag en gång på ett så pass allvarligt fel att det tog mig sex timmar att åtgärda det. Och vet du vad problemet var? Jag hade använt fel sorts parenteser på en slumpmässig rad...

• Jag fick också ägna fem timmar åt att rätta till alla grammatiska fel tillsammans med min bästa vän. Tack, Alex.

• Från början var tanken att portfolion skulle vara en del av en större webbplats. På webbplatsen fanns en sektion med namnet ”Crossroad-1”. Därifrån skulle man kunna välja att bege sig till tre olika världar. Den första världen var byggnaden ”I Want You for the Company”, som skulle leda vidare till webbplatsens avsnitt om praktikplatser. Den andra världen kallades ”Realm of Monsters”, och jag hade planerat att göra en animerad kortfilm om hur man tog sig in i den. Jag hann dock bara färdigställa storyboarden till filmen. Den tredje världen kallades ”The BeforeRealm” och skulle ha lett till en isig labyrint. 

• Kul detalj: på första sidan snöar det. Eller det var i alla fall så jag tänkte att folk skulle uppfatta det. De flesta trodde snarare att det var aska från lägerelden. Jag lät det vara så, eftersom jag tycker att det fina med kreativa miljöer är att människor kan se saker på sitt eget sätt.`, 
    links: ['Live-webbplats', 'Github', 'ASCII', 'Liminal', 'Ninjago: Monstrosity' ]}  ,
  },

  ikea:      { 
    nl: { title: 'De IKEA-kamers', type: 'Minigames - Feest - Sociaal - Plezier', status: 'Onvoltooid & Lopend', date: 'September 2026 -> Nu', group: 'Individueel', duration: 'Lopend', description: `
    Een website met party-minigames in IKEA-thema

    Ik heb dit project gemaakt om te oefenen met React en JS.`, 
    links: ['Live website', 'Github']},
  

    sv: { title: 'IKEA-rummen', type: 'Minispel - Fest - Socialt - Kul', status: 'Oavslutat och pågående', date: 'September 2026 -> Nu', group: 'Individuellt', duration: 'Pågående', description: `
    En webbplats med partyminispel på Ikea-tema

    Jag skapade det här projektet för att öva på React och JS.`, 
    links: ['Live-webbplats', 'Github']}  
  },

gamblingrpg:      { 
    nl: { type: 'RPG - webpagina - Onserieusheid - Make-a-thon - Gokken', status: 'Afgerond', date: 'April 2026', group: 'Sophie: Game-ontwikkeling (Fullstack) - Thijs & Alaa: Game-ontwikkeling (Ontwerp) - Thomas: Webpagina (Backend) - Ikzelf: Webpagina (Frontend & ontwerp)', duration: '3.5 dagen', description: `
    WAARSCHUWING: Dit project is eigenlijk een grap en totaal niet serieus bedoeld! 

    Dit project is ontwikkeld tijdens een driedaagse 'make-a-thon', samen met vier klasgenoten. Het thema was "Red de wereld", maar we besloten onze eigen weg te gaan en maakten in plaats daarvan een leuke RPG. 

    We hadden van tevoren afgesproken dat het vooral om het plezier ging en niet om het winnen. Tijdens die dagen heb ik dan ook maar twee uur geslapen, meer dan twintig blikjes Red Bull gedronken en van alles gedaan dat niets met programmeren te maken had. 

    Het eindresultaat zag er grappig uit en het ontwerp was niet best, maar we hebben enorm veel plezier gehad. Het verbaasde ons dan ook niet dat we uiteindelijk als laatste eindigden in de competitie. 

    Leuk weetje (voor jou, niet voor mij): op de laatste dag werd ik ziek door het slaapgebrek en de Red Bull. Het ergste was nog dat ik diezelfde nacht op vakantie zou gaan. Ik moest dus acht uur lang in de auto zitten...

    - Het was het waard :)`, 
    links: ['Live website', 'Github']},
  

    sv: { type: 'Rollspel – webbsida – lekfullhet – Make-A-Thon – hasardspel', status: 'Färdig', date: 'April 2026', group: 'Sophie: Spelutveckling (Fullstack) - Thijs & Alaa: Spelutveckling (Design) - Thomas: Webbsida (Backend) - Jag själv: Webbsida (Frontend & design)', duration: '3,5 dagar', description: `
    VARNING: Det här projektet är i princip ett skämt och inte alls seriöst! 

    Projektet togs fram under ett tre dagar långt "make-a-thon" tillsammans med fyra av mina klasskamrater. Temat var "Rädda världen", men vi bestämde oss för att köra vårt eget race och skapade istället ett roligt rollspel. 

    Vi bestämde oss redan från början för att vi var där för att ha kul, snarare än för att vinna. Under dessa dagar sov jag därför bara två timmar, drack över 20 burkar Red Bull och ägnade mig åt en hel del annat än själva programmeringen. 

    Resultatet blev ett projekt som såg komiskt ut och var dåligt utformat, men vi hade väldigt roligt. Vi blev inte särskilt förvånade över att hamna sist i tävlingen. 

    Rolig fakta (för er, inte för mig): Jag blev sjuk sista dagen på grund av sömnbristen och all Red Bull. Det värsta var att jag skulle åka på semester natten därpå. Så jag fick sitta i en bil i åtta timmar...

    – Det var värt det :)`, 
    links: ['Live-webbplats', 'Github']}  
  },

  // Add a new project later? Just add `yourNewId: { nl: { ... } }` here,
  // matching its `id` in projects.js — it isn't required, translations
  // simply won't show for it until you do.
};

/* --------------------------------------------------------------------------
   3) UI — small interface text. English is filled in (it has to live
   somewhere); add the Dutch versions. (Adding Swedish later: give each of
   these an `sv: '...'` too, next to its `nl: '...'`.)
   -------------------------------------------------------------------------- */
const I18N_UI = {
  description: { en: 'Description',      nl: 'Beschrijving', sv: 'Beskrivning'},
  preview:     { en: 'Preview',          nl: 'Voorbeeld', sv: 'Förhandsvisning'},
  noPreview:   { en: 'no live preview',  nl: 'geen live-voorbeeld', sv: 'ingen förhandsgranskning i realtid'},
  loading:     { en: 'loading…',         nl: 'laden…', sv: 'belastning…'},
  closeBook:   { en: 'Close book',       nl: 'Boek sluiten', sv: 'Stäng boken'},
  openSite:    { en: 'Open site',        nl: 'Site openen', sv: 'Öppna webbplatsen'},

  // labels in front of each field on a project's left page, e.g. "Type:"
  typeLabel:      { en: 'Type',       nl: 'Type', sv: 'Typ'},
  writtenInLabel: { en: 'Written in', nl: 'Geschreven in', sv: 'Skriven på'},
  statusLabel:    { en: 'Status',     nl: 'Status', sv: 'Status'},
  dateLabel:      { en: 'Date',       nl: 'Datum', sv: 'Datum'},
  groupLabel:     { en: 'Group',      nl: 'Groep', sv: 'Grupp'},
  durationLabel:  { en: 'Duration',   nl: 'Duur', sv: 'Varaktighet'},

  // Shown as the hover tooltip on the language-toggle flag on the drawing:
  // "language" + a flag emoji, written/picked in that language's own name —
  // so hovering while the site is in English shows "Language 🇬🇧", hovering
  // in Dutch shows "Taal 🇳🇱". EDIT THE EMOJI RIGHT HERE to change the flag —
  // this is the only place it's set. Order is "word, flag"; flip it to
  // "flag, word" if you'd rather the emoji come first.
  languageName: { en: 'Toggle language 🇬🇧', nl: 'Taal wisselen 🇳🇱', sv: 'Växla språk 🇸🇪' },
};