// Source content ported from nateponds.com and nateponds/nateponds.com.
// Keep copy, labels, ordering, and URLs in this module so the page composition
// stays intentionally small and the original portfolio remains easy to audit.
export const site = {
  name: 'nateponds',
  title: 'Nathaniel Ryan Ponce | SysAdmin & DevSecOps',
  kicker: 'University of San Carlos - BSCS Student',
  heading: 'Nathaniel Ryan Ponce',
  role: 'SysAdmin & DevSecOps · Computer Science',
  description:
    'Building resilient systems and clean software — from bare-metal servers to full-stack web. Currently studying at USC while keeping the infrastructure running and the servers humming.',
  heroEyebrow: 'USC CS Student & Sysadmin',
  heroEyebrowSuffix: 'Served from Ubuntu LTS',
  githubRepository: 'https://github.com/nateponds/nateponds.com',
  githubProfile: 'https://github.com/nateponds',
  linkedin: 'https://www.linkedin.com/',
  email: 'nathanielryanponce@gmail.com',
  phone: '+63 (956) 358-5873',
  phoneHref: 'tel:+639563585873',
  about: {
    kicker: 'About / Background',
    titleLead: 'Hi, call me',
    titleAccent: 'Nathan',
    paragraphs: [
      'My name is Nathaniel Ryan Ponce, a Computer Science student at the University of San Carlos with a growing focus on system administration, DevSecOps, and full-stack web development.',
      'I like working close to the machine: Linux servers, deployment flows, web infrastructure, and the practical side of keeping things online. I am expanding my depth in cybersecurity so the systems I build are as secure as they are stable.',
      'This portfolio is both a personal website and a live project, served from my own Ubuntu Server setup with an AMD Ryzen 3 4300GE and 16 GB DDR5 RAM.',
    ],
  },
  terminalLines: [
    ['whoami', 'nathaniel / cs-student / sysadmin'],
    [
      'current_focus',
      'learning by building real systems, not just studying about them',
    ],
    [
      'driven_motivation',
      'I am always eager to learn new technologies and adapt to changes',
    ],
  ],
  stack: {
    kicker: 'Stack / Tools',
    title: 'Technologies I work with and learn',
  },
  focusAreas: [
    {
      number: '01',
      title: 'Systems',
      text: 'I enjoy understanding how servers, networks, and deployments work behind the scenes.',
    },
    {
      number: '02',
      title: 'Software',
      text: 'I build with HTML, CSS, JavaScript, and backend concepts while expanding toward full-stack development.',
    },
    {
      number: '03',
      title: 'Growth',
      text: 'I treat each project as a chance to improve my structure, project design management, and problem-solving process.',
    },
  ],
  projectsKicker: 'Featured Projects',
  projectsTitle: 'Hosted builds with sharp edges and practical systems.',
  projects: [
    {
      number: '01',
      name: 'Darius',
      description:
        'A personal expense tracker for logging daily spending, organizing accounts and categories, and reviewing where your money goes over time.',
      stacks: ['Next.js', 'React', 'Tailwind CSS', 'Supabase', 'TypeScript'],
      status: 'green',
      url: 'https://darius.nateponds.com',
      featured: true,
      image: '/assets/portfolio/darius.png',
      imageAlt: 'Darius',
    },
    {
      number: '02',
      name: 'SWAPPR',
      description:
        'A prototype study-buddy matching platform developed by Freya Hermosilla and publicly served by Nathaniel Ponce, using matchmaking-style logic to help students find compatible partners.',
      stacks: ['HTML', 'Tailwind CSS', 'Node.js', 'MySQL'],
      status: 'yellow',
      url: 'https://swappr.nateponds.com',
      featured: true,
      image: '/assets/portfolio/swappr.png',
      imageAlt: 'SWAPPR',
    },
    {
      number: '03',
      name: 'Aqualine',
      description:
        'A custom logistics and inventory database system developed by Joannah Bael and Nathaniel Ponce for Aqualine, a water refilling station, to streamline tracking and daily operations.',
      stacks: ['HTML', 'CSS', 'JS', 'PHP', 'MySQL'],
      status: 'green',
      url: 'https://aqualine.nateponds.com',
      featured: true,
      image: '/assets/portfolio/aqualine.jpg',
      imageAlt: 'Aqualine',
    },
    {
      number: '04',
      name: 'Linko',
      description:
        'A planned supplier-matching platform for MSMEs and wholesale providers, designed to improve supplier discovery, client acquisition, and supply-chain coordination for growing businesses.',
      stacks: ['React', 'CSS', 'Node.js', 'Express.js', 'PostgreSQL'],
      status: 'green',
      url: 'https://linko.nateponds.com',
      featured: true,
      image: '/assets/portfolio/linko.png',
      imageAlt: 'Linko',
    },
  ],
  contact: {
    kicker: 'Contact / Open Channel',
    titleLead: 'Built to',
    titleAccent: 'scale',
    titleSecondLead: 'Engineered to',
    titleSecondAccent: 'execute',
    description:
      'Have a project idea, internship opportunity, or systems problem that needs a steady pair of hands? I am open to conversations around system builds, infrastructure, security-minded workflows, and student-led technical projects.',
    availability: 'Available for Internship',
    emailNote:
      'Best for collaboration ideas, build requests, school projects, infrastructure questions, and opportunities where practical systems work matters.',
    githubLabel: 'Code, experiments, and hosted projects',
    linkedinLabel: 'Professional updates and opportunities',
  },
  footer: {
    copyright: '© 2026 Nathaniel Ryan Ponce. All rights reserved.',
    credit: 'Designed, built, and served by Nathaniel Ponce.',
  },
};

export const statusMeta = {
  green: { dot: 'dot-green', label: 'Live', available: true },
  live: { dot: 'dot-green', label: 'Live', available: true },
  yellow: { dot: 'dot-yellow', label: 'Under Maintenance', available: false },
  red: { dot: 'dot-red', label: 'Offline', available: false },
  blue: { dot: 'dot-blue', label: 'Planning', available: false },
};

export const projectStacks = [
  ['HTML', 'stack-html'],
  ['CSS', 'stack-css'],
  ['JS', 'stack-js'],
  ['PHP', 'stack-php'],
  ['MySQL', 'stack-mysql'],
  ['C', 'stack-c'],
  ['C++', 'stack-cpp'],
  ['C#', 'stack-csharp'],
  ['Node.js', 'stack-node'],
  ['Express.js', 'stack-express'],
  ['MongoDB', 'stack-mongodb'],
  ['PostgreSQL', 'stack-postgresql'],
  ['Tailwind CSS', 'stack-tailwind'],
  ['React', 'stack-react'],
  ['Next.js', 'stack-nextjs'],
  ['Supabase', 'stack-supabase'],
  ['TypeScript', 'stack-typescript'],
].map(([name, className]) => ({ name, className }));

export const technologies = [
  ['Cloudflare', '/assets/portfolio/cloudflare.svg'],
  ['Tailscale', '/assets/portfolio/tailscale.svg', true],
  ['Apache', '/assets/portfolio/apache.svg'],
  ['Nginx', '/assets/portfolio/nginx.svg'],
  ['Docker', '/assets/portfolio/docker.svg'],
  ['Ubuntu', '/assets/portfolio/ubuntu.svg'],
  ['Git', '/assets/portfolio/git.svg'],
  ['GitHub', '/assets/portfolio/github.svg', true],
  ['C', '/assets/portfolio/c.svg'],
  ['C++', '/assets/portfolio/cpp.svg'],
  ['C#', '/assets/portfolio/csharp.svg'],
  ['HTML', '/assets/portfolio/html.svg'],
  ['CSS', '/assets/portfolio/css.svg'],
  ['JavaScript', '/assets/portfolio/javascript.svg'],
  ['Java', '/assets/portfolio/java.svg'],
  ['React.js', '/assets/portfolio/react.svg'],
  ['PHP', '/assets/portfolio/php.svg'],
  ['Node.js', '/assets/portfolio/node.svg'],
  ['MySQL', '/assets/portfolio/mysql.svg'],
  ['PostgreSQL', '/assets/portfolio/postgresql.svg'],
].map(([name, icon, inverted = false]) => ({ name, icon, inverted }));

export const initialProjects = site.projects;
