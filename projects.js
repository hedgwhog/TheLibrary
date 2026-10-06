/* projects.js — your content
   1) LABELS   text painted onto the empty shelves / walls of the drawing
   2) PROJECTS one entry per book. `shelf` = an id from layout.js
*/

/* --------------------------------------------------------------------------
   LABELS
   Positions are in image pixels of library.jpg (1920 x 1080). Text scales with
   the drawing. Use x/y/w/h for a flat box, or `quad` (4 corners: top-left,
   top-right, bottom-right, bottom-left) to lay text onto something in
   perspective, like the right wall or the table top.

   Optional fields: size (px), align 'left|center|right', valign 'top|center|bottom',
   font 'title|body', italic, color, spacing (letter-spacing px), opacity,
   rotate (deg, flat boxes only), href (makes it a link), fit:false (don't shrink)
   Use \n for a line break.
   -------------------------------------------------------------------------- */
const LABELS = [
  // `key` links this label to its translation in i18n.js (I18N_LABELS).
  // Leave `key` off a label and it will just always show its `text`/`sub` as-is (never translated).
  { key: 'libraryTitle',    text: 'The Library',                x: 930, y: 335, w: 280, h: 70, size: 40, font: 'title', align: 'center' },
  { key: 'libraryTagline',  text: 'The complete archive', x: 915, y: 408, w: 280, h: 40, size: 24, italic: true, opacity: .8, align: 'center' },
  { key: 'coding',          text: 'Coding',       x: 424, y: 172, w: 194, h: 169, size: 44, font: 'title', align: 'center' },
  { key: 'drawnBy',         text: 'Drawings made by Neekey',         x: 640, y: 287, w: 124, h: 54,  size: 30, font: 'title', align: 'center' },
  { key: 'projectsHeading', text: 'Projects',       x: 1318, y: 283, w: 181, h: 153, size: 36, font: 'title', align: 'center' },
  { key: 'byAuthor',        text: 'By: Lucas Bouwmeester', x: 930, y: 512, w: 360, h: 76, size: 30, font: 'title', align: 'center' },
  { key: 'animations',      text: 'Animations',     x: 522, y: 712, w: 273, h: 36, size: 24, font: 'title', align: 'center', spacing: 4 },

  // right wall panel, in perspective
  { key: 'miscellaneous', text: 'Miscellaneous', quad: [[1615,225],[1890,122],[1890,230],[1615,284]], w: 300, h: 64, size: 52, font: 'title', align: 'center'},
  { key: 'featured', text: '*Featured*', quad: [[790,835],[1115,837],[1140,927],[755,931]], w: 340, h: 90, size: 44, font: 'title', align: 'center' },

  // contact block on the dark wall below the right-hand shelves (in perspective)
  // `text` = small heading, `sub` = the line under it. Change both and the link (href).
  // (the `sub` line here is an address, not really "content" to translate, but you can still
  // give it a translated `sub` in i18n.js if you ever want a different label per language)
  { key: 'contactPersonal', text: '(Personal) Email:', sub: 'lucasbouwmeester@gmail.com', quad: [[1680, 768], [1860, 882], [1860, 939], [1680, 817]], w: 213, h: 49, size: 17, align: 'left', href: 'lucasbouwmeester@gmail.com' },
  { key: 'contactOnline', text: '(Online RP) Email:', sub: 'hedgwhog@gmail.com', quad: [[1680, 825], [1860, 949], [1860, 1006], [1680, 873]], w: 219, h: 48, size: 17, align: 'left', href: 'hedgwhog@gmail.com' },
  { key: 'contactGithub', text: 'Github:', sub: 'github.com/lucas-bouwmeester', quad: [[1680, 881], [1860, 1015], [1860, 1072], [1680, 930]], w: 224, h: 49, size: 17, align: 'left', href: 'https://github.com/lucas-bouwmeester' },
];


/* --------------------------------------------------------------------------
   PROJECTS
   One entry per book. `shelf` is a hitbox id from layout.js.

   {
     id:          'unique-slug',            // also the link:  index.html#unique-slug
     shelf:       'bigBooksRight',          // which shelf opens this project
     title:       'Shown above the cursor and at the top of the book',

     // left page, in this order (leave any of them out and that line disappears)
     type:        'Web app',
     writtenIn:   'JavaScript, HTML, CSS',
     status:      'Finished',
     date:        'September 2026',
     group:       'Solo',
     duration:    '3 months',
     description: `The big text. Blank line = new paragraph.
                   Simple HTML such as <em> or <a href> works.`,
     images:      IMG,                      // the two small images (see below)

     // right page
     mp4:         'videos/my-clip.mp4',     // OPTIONAL: shows a video (with controls) in the iframe square instead. Takes priority over `url` for that square if both are set.
     url:         'https://…',              // first page shown in the iframe (optional)
     frameWidth:  1280,                     // width the site renders at inside the iframe (optional)
     links:       [ { label: 'Live site', href: 'https://…' } ],
   }

   Shelves that are free to use (or delete a project below to free its shelf):
   see the ids in layout.js. `globe` and `lowerDrawers` are not wired up yet.

   TRANSLATIONS: nothing to change here. Each project's `id` below is also its key
   in i18n.js (I18N_PROJECTS), so translated title/type/writtenIn/status/date/group/
   duration/description/link-labels for a project go there, keyed by that same id.
   -------------------------------------------------------------------------- */

// The two small images shown on the left page. Put your own files in /images and
// change the paths here to use them everywhere, or give a project its own list:
//   images: ['images/my-shot-1.png', 'images/my-shot-2.png']
const IMG = ['images/placeholder-1.png', 'images/placeholder-2.png'];
const IMGTheLibrary = ['commisions/library.jpg', 'commisions/book.jpg'];
const IMGneocity = ['images/neocity-1.png', 'images/neocity-2.avif'];
const IMGgachiakuta = ['images/gachiakuta-1.png', 'images/gachiakuta-2.png'];
const IMGlypmy = ['images/lypmy-1.png', 'images/placeholder-2.png'];
const IMGportfolio = ['images/portfolio-1.png', 'images/portfolio-2.png'];
const IMGazurae = ['images/azurae-1.png', 'images/azurae-2.png'];
const IMGnen = ['images/nen-1.jpg', 'images/nen-2.jpeg'];
const IMGcursor = ['images/cursor-1.png', 'images/cursor-2.png'];
const IMGmetrohall = ['images/metrohall-1.png', 'images/placeholder-2.png'];

const PROJECTS = [
  {
    id: 'thelibrary', shelf: 'bigBooksRight',
    title: 'The Library',
    type: 'Creativity - Archive - AI',
    writtenIn: 'HTML - CSS - JavaScript',
    status: 'Finished & Maintained',
    date: 'September - 2026',
    group: 'Neekey: Drawings - Myself: Coding & Designing',
    duration: 'Commissions: 12 days - Coding: 1 day',
    description: `Around the beginning of August 2026, I realized that I needed a navigation page for all of my projects, since the one on my portfolio was severely outdated. I commissioned one of my friends, Neekey, to design and illustrate a library for the page. Once she finished the illustrations, I could start working on the final touches and bring the project to life.
    
    For the first time, I decided to let AI handle most of the coding, mainly because I was running low on free time. I’m not the biggest fan of AI, so I wanted to keep the creative side of the project—particularly the design—entirely my own. I used AI primarily for optimization, responsiveness, and some of the more technical implementation.

    Even though this project was somewhat experimental for me, I’m happy with how it turned out.
`,
    images: IMGTheLibrary,
    url: 'https://hedgwhog.com',
    links: [{ label: 'Live site', href: 'https://hedgwhog.com' }, { label: 'Github', href: 'https://github.com/hedgwhog/TheLibrary' } ],
  },
  {
    id: 'gamblingrpg', shelf: 'bigBooksLeft',
    title: 'Zombie Slayer Shooter 5000',
    type: 'RPG - webpage - Unseriousness - Make-A-Thon - Gambling',
    writtenIn: 'HTML - CSS - JS - PHP',
    status: 'Finished',
    date: 'April - 2026',
    group: 'Sophie: Gamedevelopment (Fullstack) - Thijs & Alaa: Gamedevelopment (Designs) - Thomas: Webpage (Backend) - Myself: Webpage (Frontend & design)',
    duration: '3.5 days',
    description: `WARNING: This project is basically a joke and very unserious!
    
    This project was developed in a 3 day Make-a-thon together with 4 of my classmates. The theme for it was "Save the world", but we decided to do our own thing instead and made a fun RPG.

    We decided beforehand that we were here for the fun of it, and not the focus of winning. So during the days I only slept for 2 hours, drank 20+ redbulls and did a lot of other things outside programming.

    The project ended up looking funny and was poorly designed, but it was a lot of fun. We weren't to suprised to be the lowest scoring team out of all the competition. 

    Fun fact (For you, not for me): I ended up sick at the final day from the lack of sleep and the redbull. The worst thing was, that I went on vacation the incoming night. So I had to sit in a car for 8 hours..... 
    
    - It was worth it :) 
    `,
    images: IMG,
    url: 'https://gamblingrpg.hedgwhog.com',
    links: [{ label: 'Live site', href: 'https://gamblingrpg.hedgwhog.com' }, { label: 'Github', href: 'https://github.com/hedgwhog/gamblingrpg' } ],
  },
  {
    id: 'cursor', shelf: 'leaningBook',
    title: 'Research Cursors',
    type: 'Research paper - Expo - Interaction',
    writtenIn: 'JavaScript - HTML - CSS',
    status: 'Finished',
    date: 'June 2026',
    group: 'Individually',
    duration: '1 month',
    description: `For my final class in the software development branch I chose, I had to write a research paper and create a website related to the topic of that paper.

    On the website, you can customize various elements of a fake newspaper, which also serves as an interactive tutorial. The settings menu, accessed through the red button, allows you to change different aspects of the newspaper and explore how it works.
`,
    images: IMGcursor,
    url: 'https://cursor.hedgwhog.com',
    links: [{ label: 'Live site', href: 'https://cursor.hedgwhog.com' }, { label: 'Research paper', href: 'papers/research_cursor.pdf' }, { label: 'Github', href: 'https://github.com/hedgwhog/Cursor' } ],
  },
  // {
  //   id: 'project-4-empty', shelf: 'topLeftBooks',
  //   title: 'Blank',
  //   type: '',
  //   writtenIn: '',
  //   status: '',
  //   group: '',
  //   duration: '',
  //   description: ``,
  //   images: IMG,
  //   url: '',
  //   links: [],
  // },
  {
    id: 'nen', shelf: 'centerRow5',
    title: 'HxH powersystem',
    type: 'Backend - Randomizer - HxH',
    writtenIn: 'TypeScript - HTML',
    status: 'Finished',
    date: 'June 2026',
    group: 'Individually',
    duration: '1 allnighter',
    description: `For my TypeScript final, I had two options: complete the assignment prepared by the teachers or pitch an idea of my own. If the pitch was good enough, I could make my own project for the final. Let’s just say the pitch went well, and I ended up making this.

I recreated the power system from Hunter Hunter, known as Nen. For some quick context, when you learn Nen in HxH, you fall into one of six types. Five of these are the main types, while the sixth, Specialization, is for abilities that don’t fit neatly into the other categories.

You can also see which types are adjacent to your own. While you can use abilities from these neighboring types, you are generally less efficient at using them than your primary type.

The project was quick and fun to make. I think I spent around three hours actually programming it, followed by another three hours singing karaoke during the all-nighter.
`,
    images: IMGnen,
     url: 'https://nen.hedgwhog.com',
    links: [{ label: 'Live site', href: 'https://nen.hedgwhog.com' }, { label: 'Github', href: 'https://github.com/hedgwhog/nen' }],
  },
  // {
  //   id: 'project-6-empty', shelf: 'rightWallBigA',
  //   title: 'Blank',
  //   type: '',
  //   writtenIn: '',
  //   status: '',
  //   group: '',
  //   duration: '',
  //   description: ``,
  //   images: IMG,
  //   url: '',
  //   links: [],
  // },
  {
    id: 'lypmy', shelf: 'floorStackRight',
    title: 'LYMPY',
    type: 'Application - UI/UX - Chat platform - Socializing',
    writtenIn: 'PHP - HTMl - CSS - JS',
    status: 'Unfinished & Ongoing',
    date: 'September 2026 -> Now',
    group: 'Sophie: Backend - Myself: Frontend & Design',
    duration: 'Ongoing',
    description: `LYMPY is a chat platform designed to encourage people to actively share what they’ve been up to during the week. The idea is simple: you have to upload 2–5 photos per week for every group chat you’re part of. Once the weekly deadline passes, the photos are turned into a collage and shared in the group chat for everyone to see.

The catch is that you have to share photos If you don’t, you lose access to the group chat for that week. The goal is to encourage people to actually interact with each other instead of letting conversations slowly die out.

I mostly work on the frontend, particularly the UI/UX, responsiveness, and accessibility. One feature I’m especially happy with is the patch notes system, which allows both us and the users to keep track of newly released changes and updates.

Fun fact: the name LYMPY stands for “Lucas, Your Parents Miss You.” Sophie thought it would be funny to reference the reason I came up with the idea in the first place: I had moved abroad for my internship.
`,
    images: IMGlypmy,
    url: 'https://lypmy.hedgwhog.com',
    links: [{ label: 'Live site', href: 'https://lypmy.hedgwhog.com' }, { label: 'Github', href: 'https://github.com/hedgwhog/LYPMY' } ],
  },
  // {
  //   id: 'project-8-empty', shelf: 'topStack',
  //   title: 'Blank',
  //   type: '',
  //   writtenIn: '',
  //   status: '',
  //   group: '',
  //   duration: '',
  //   description: ``,
  //   images: IMG,
  //   url: '',
  //   links: [],
  // },
  // {
  //   id: 'project-9-empty', shelf: 'topRightBooks',
  //   title: 'Blank',
  //   type: '',
  //   writtenIn: '',
  //   status: '',
  //   group: '',
  //   duration: '',
  //   description: ``,
  //   images: IMG,
  //   url: '',
  //   links: [],
  // },
  // {
  //   id: 'project-10-empty', shelf: 'centerRow1',
  //   title: 'Blank',
  //   type: '',
  //   writtenIn: '',
  //   status: '',
  //   group: '',
  //   duration: '',
  //   description: ``,
  //   images: IMG,
  //   url: '',
  //   links: [],
  // },
  // {
  //   id: 'project-11-empty', shelf: 'centerRow2',
  //   title: 'Blank',
  //   type: '',
  //   writtenIn: '',
  //   status: '',
  //   group: '',
  //   duration: '',
  //   description: ``,
  //   images: IMG,
  //   url: '',
  //   links: [],
  // },
  {
    id: 'azurae', shelf: 'centerRow3',
    title: 'Story of Azurae',
    type: 'Story - Myth - Book',
    writtenIn: 'HTML - CSS - JS',
    status: 'Unfinished',
    date: 'November - 2025',
    group: 'Individually',
    duration: '2 weeks',
    description: `The Story of Azurae is a web application based on a myth I wrote for English class. It started as a fun side project that I worked on alongside the assignment. Eventually, I put it aside after the deadline passed, since what I had completed was already sufficient for the assignment.

The myth itself is unfinished because I reached the word limit before I could fully develop the story.

For the class, I had to research a historical topic related to myths that interested me. I decided to focus my research primarily on the origins and history of the Seven Deadly Sins which became one of the main inspirations for the myth and the web application.
`,
    images: IMGazurae,
    url: 'https://azurae.hedgwhog.com',
    links: [{ label: 'Live site', href: 'https://azurae.hedgwhog.com' }, { label: 'Research paper', href: 'papers/research_myth_azurae.pdf' }, { label: 'Github', href: 'https://github.com/hedgwhog/azurae' }]
  },
  {
    id: 'gachiakuta', shelf: 'centerRow4',
    title: 'Gachiakuta Game',
    type: 'Frontend - UI/UX - Fighting game design',
    writtenIn: 'HTML - CSS - JS',
    status: 'Unfinished',
    date: 'November 2025',
    group: 'Individually',
    duration: '1 allnighter',
    description: `Gachiakuta is an anime/manga series that is getting quite popular lately. I found the concept and design for a Gachiakuta fighting game online and decided to try to recreate the frontend of it.

I don't remember too many details from programming it, since I was running on no sleep... What I do remember is that I had to learn a lot of things during that all-nighter to be able to develop it. I also had to try to recreate the design images and screenshot a lot of things from the concept, which was interesting to do.`,
    images: IMGgachiakuta,
    url: 'https://gachiakuta.hedgwhog.com',
    links: [{ label: 'Live site', href: 'https://gachiakuta.hedgwhog.com' }, { label: 'Github', href: 'https://github.com/hedgwhog/gachiakuta' }, { label: 'Concept idea', href: 'https://www.instagram.com/reel/DP2guLcDNh4/?stkn=cnM1YjZrMWZzOWZ5' }],
  },
  {
    id: 'neocity', shelf: 'topMiddleBooks',
    title: 'Neocity-li',
    type: 'Fullstack - Neocity - Interactive - API',
    writtenIn: 'React - SCSS - Three.js - GSAP',
    status: 'Finished',
    date: 'June 2026',
    group: 'Individually',
    duration: 'Designing: 3 hours - Coding: 19 hours',
    description: `For my class called "Interface", we had to create one final big project that we worked on throughout all 4 semesters. The idea was that everything we learned from each curriculum would come together in one big final project.

Now that you know the context, I'll explain how NOT to develop a project properly. Even though we had 9 months to work on this, I started it 2 days before the deadline. On the second-to-last day, I designed Neocity. On the final day, I had to program it for 19 hours straight, with only one break.

With that being said, I'm extremely happy with how it turned out, even though some of the programming techniques I used make absolutely no sense. For example, all the outlines of the houses are made using SCSS boxes with borders, and the API for the restaurant only worked for one day before it broke.

I learned a lot from this one-day project. It was my first time using React, and at first I thought React was severely unnecessary. However, after working with it for almost a full day, I ended up really liking it and now use React a lot more. I also learned not to draw things using CSS borders and, more importantly, to start big projects much earlier than 1.5 days before the deadline.

Quick note: Neocity-li means "Neocity Light", and the feel of the city is heavily inspired by one of my all-time favorite games, Stray.`,
    images: IMGneocity,
    url: 'https://neocity.hedgwhog.com/',
    links: [{ label: 'Live site', href: 'https://neocity.hedgwhog.com' }, { label: 'Github', href: 'https://github.com/hedgwhog/neocity-li' }],
  },
  // {
  //   id: 'project-15-empty', shelf: 'centerRow6',
  //   title: 'Blank',
  //   type: '',
  //   writtenIn: '',
  //   status: '',
  //   group: '',
  //   duration: '',
  //   description: ``,
  //   images: IMG,
  //   url: '',
  //   links: [],
  // },
  // {
  //   id: 'project-16-empty', shelf: 'centerRow7',
  //   title: 'Blank',
  //   type: '',
  //   writtenIn: '',
  //   status: '',
  //   group: '',
  //   duration: '',
  //   description: ``,
  //   images: IMG,
  //   url: '',
  //   links: [],
  // },
  {
    id: 'ikea', shelf: 'ladderBooks',
    title: 'The Ikea-rooms',
    type: 'Minigames - Party - Social - Fun',
    writtenIn: 'React - JS',
    status: 'Unfinished & Ongoing',
    date: 'September 2026 -> Now',
    group: 'Indivdually',
    duration: 'Ongoing',
    description: `A party minigame website with the theme of Ikea
    
    I made this project to practice React and JS.`,
    images: IMG,
    url: 'https://ikea.hedgwhog.com/',
    links: [{ label: 'Live site', href: 'https://ikea.hedgwhog.com' }, { label: 'Github', href: 'https://github.com/hedgwhog/ikea-minigames' }],
  },
  {
    id: 'lifestyle', shelf: 'lowerLeftBooks',
    title: 'Lifestyle animation',
    type: '3 frame animation',
    writtenIn: 'FlipaClip',
    status: 'unfinished',
    date: 'June 2026',
    group: 'Individually',
    duration: '7 hours',
    description: `A small animation I made for the creative assignment for my class called "Lifestyle". For most creative assignments where I can decide what I want to make, I choose to make animations.

The idea behind the story was that even if you don't want to do something, committing to it anyway can make your life a lot more fun. You can't really tell that from the animation, though, since it isn't finished. I just had a great time making it.`,
    mp4: 'mp4/leefstijl.mp4',
  },
  // {
  //   id: 'project-19-empty', shelf: 'lowerThinBooks',
  //   title: 'Blank',
  //   type: '',
  //   writtenIn: '',
  //   status: '',
  //   group: '',
  //   duration: '',
  //   description: ``,
  //   images: IMG,
  //   url: '',
  //   links: [],
  // },
  // {
  //   id: 'project-20-empty', shelf: 'lowerBigBooks',
  //   title: 'Blank',
  //   type: '',
  //   writtenIn: '',
  //   status: '',
  //   group: '',
  //   duration: '',
  //   description: ``,
  //   images: IMG,
  //   url: '',
  //   links: [],
  // },
  {
    id: 'metrohall', shelf: 'lowerSmallShelf',
    title: 'Metro hall sequence',
    type: '8 frames animation',
    writtenIn: 'FlipaClip',
    status: 'Unfinished',
    date: 'December 2025',
    group: 'Individually',
    duration: '14 hours',
    description: `A small animation I made when I needed a break from coding during school hours.

Yes, I know the fries are way too cheap.`,
    images: IMGmetrohall,
    mp4: 'mp4/metrohall.mp4',
    links: [],
  },
  // {
  //   id: 'project-22-empty', shelf: 'rightWallTop',
  //   title: 'Blank',
  //   type: '',
  //   writtenIn: '',
  //   status: '',
  //   group: '',
  //   duration: '',
  //   description: ``,
  //   images: IMG,
  //   url: '',
  //   links: [],
  // },
  // {
  //   id: 'project-23-empty', shelf: 'rightWallCases',
  //   title: 'Blank',
  //   type: '',
  //   writtenIn: '',
  //   status: '',
  //   group: '',
  //   duration: '',
  //   description: ``,
  //   images: IMG,
  //   url: '',
  //   links: [],
  // },
  // {
  //   id: 'project-24-empty', shelf: 'rightWallMid',
  //   title: 'Blank',
  //   type: '',
  //   writtenIn: '',
  //   status: '',
  //   group: '',
  //   duration: '',
  //   description: ``,
  //   images: IMG,
  //   url: '',
  //   links: [],
  // },
  // {
  //   id: 'project-25-empty', shelf: 'rightWallLowA',
  //   title: 'Blank',
  //   type: '',
  //   writtenIn: '',
  //   status: '',
  //   group: '',
  //   duration: '',
  //   description: ``,
  //   images: IMG,
  //   url: '',
  //   links: [],
  // },
  // {
  //   id: 'project-26-empty', shelf: 'rightWallLowB',
  //   title: 'Blank',
  //   type: '',
  //   writtenIn: '',
  //   status: '',
  //   group: '',
  //   duration: '',
  //   description: ``,
  //   images: IMG,
  //   url: '',
  //   links: [],
  // },
  {
    id: 'cv', shelf: 'rightWallBigB',
    title: 'CV',
    type: '',
    writtenIn: '',
    status: '',
    group: '',
    duration: '',
    description: `Take a look at my CV and get a quick overview of my skills & experiences!`,
    url: 'papers/CV_Lucas_Bouwmeester_English.pdf',
    links: [{ label: 'Check English CV', href: 'papers/CV_Lucas_Bouwmeester_English.pdf' }, { label: 'Check Dutch CV', href: 'papers/CV_Lucas_Bouwmeester_Dutch.pdf' }],
  },
  // {
  //   id: 'project-28-empty', shelf: 'rightWallCrates',
  //   title: 'Blank',
  //   type: '',
  //   writtenIn: '',
  //   status: '',
  //   group: '',
  //   duration: '',
  //   description: ``,
  //   images: IMG,
  //   url: '',
  //   links: [],
  // },
  // {
  //   id: 'project-29-empty', shelf: 'floorOpenBook',
  //   title: 'Blank',
  //   type: '',
  //   writtenIn: '',
  //   status: '',
  //   group: '',
  //   duration: '',
  //   description: ``,
  //   images: IMG,
  //   url: '',
  //   links: [],
  // },
  {
    id: 'portfolio', shelf: 'floorStackLeft',
    title: 'Portfolio website',
    type: 'Frontend - Interactive - ASCII - Artwork',
    writtenIn: 'HTML - SCSS - JS',
    status: 'Unfinished',
    date: 'February 2026 -> May 2026',
    group: 'Individually',
    duration: 'almost 250 hours',
    description: `My portfolio website is the biggest project I have ever developed. The reason I made it was because my mentor highly recommended creating a website about myself to make it easier to get accepted for internships.

For some reason, I thought it would be a great idea not to make a traditional portfolio, but instead create a creative one focused on interaction and storytelling. That meant that, outside of coding, I had to create a design that people could interact with and figure out a basic storyline. Oh yeah, something I should mention is that I decided not to use a single image in the entire project. I wanted to use ASCII art instead, and I thought it would be impressive to only use that format. This idea backfired on me severely.

For the design and storyline, I didn't really have much planned, so I decided to just "go with the flow". I wrote down some basic ideas and made sketches for every page. I made the color palette completely black and white, since I got the idea for the style from a short animation called "Ninjago: Monstrosity". Check the links for the animation.

In the animation, the main character was stuck in a "forsaken land" after a world-changing event. I've always been a big fan of the horror genre "Liminal", so I decided that my main traveling element would be based on the idea of "no-clipping".

From that inspiration, my portfolio's storyline was structured as follows. In the world I created, you travel through different realms to explore new places. The main character, aka me, is traveling through these realms trying to find my way back to my home realm, while you, the user, make decisions about where to go.

The designs for the portals to other realms were really cool. Some of them were obvious, like a door, while others were much more hidden. To travel, you had to click on the portals, and the compass would indicate whether you could travel to a new realm from that location.

Oh yeah, also: all the designs were made in ASCII, which I had to create and design myself. One of the reasons this project took so long is that at least 1/3 of the time I spent on it was just typing ASCII...

Sadly, I was never able to finish it. I had a lot more plans for it, but I eventually ran out of time.

I learned a lot from this project. Working without images was a pain, but I learned how to use "pre" and "clamp" properly, and I still use that knowledge in many projects to this day. I also learned how to create ASCII art and work with ASCII compilers, even though I don't plan on working with ASCII much ever again.

But the most important thing I learned is that if you are passionate about a project, you need to spend consistent time working on it. I have a lot of ideas and plans for projects, or just things in general, but I often never see them through because I'm afraid I'll do them wrong or run out of time. I learned that whenever you start something new, you will inevitably run into setbacks, and that's fine. Even though I knew from the start that I probably wouldn't be able to finish this project, I was still happy with what I managed to create.

Basically, what I'm trying to say is: if you want to be proud of something, just start it and put the hours in. In the end, you'll always be able to look back on it with a smile.

This section includes some fun facts, plans, and experiences I want to share:

• The entire world is called "The World of Realms". The idea was that all the realms exist on the same planet, but each one looks slightly different, with the differences eventually becoming extreme. The portals don't send you to a different multiverse, but rather to another layer of the planet. I'm writing this description 7 months after I first started working on my portfolio, and I realize that the idea sounds very similar to the movie "The Backrooms" by Kane Parsons.

• There is actually a power system in the realms. If you check the compass, you'll notice that it has a very complicated design. The compass was actually the magic circle for the power system. CHECK SKETCHBOOK BACK HOME, LUCAS!

• During development, I once had a bug/error so big that it took me 6 hours to fix. And you know what the issue was? I used the wrong brackets on a random line...

• I also had to spend 5 hours fixing all the grammar issues together with my best friend. Thank you, Alex.

• Originally, I planned to make the portfolio part of a larger website. On the website, there is a section labeled "Crossroad-1". From that point, you would have the choice to go into three different realms. The first realm was the "I Want You for the Company" building, which would lead to the internship section of the website. The second realm was called the "Realm of Monsters", and I had planned to make an animated short about entering it. I was only able to finish the storyboard for it. The third realm was called "The BeforeRealm", and it would have led to an icy labyrinth.

• Fun fact: on the first page, it is snowing. Or at least, that's how I thought people would see it. Most people thought it was ash from the campfire instead. I left it like this because I think the beauty of creative environments is that people can see things in their own way.

  `,
    images: IMGportfolio,
    url: 'https://portfolio.hedgwhog.com',
    links: [{ label: 'Live site', href: 'https://portfolio.hedgwhog.com' }, { label: 'Github', href: 'https://github.com/hedgwhog/portfolio' }, { label: 'ASCII', href: 'https://github.com/hedgwhog/ASCII-art' }, {label: 'Liminal', href: 'https://en.wikipedia.org/wiki/Liminal_space' }, { label: 'Ninjago: Monstrosity', href: 'https://www.youtube.com/watch?v=EbIxh8Nq9zU&t=4s' }],
  },
];
