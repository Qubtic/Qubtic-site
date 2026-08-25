export const projects = [
  {
    slug: 'nexthub',
    title: 'NextHub E-commerce Platform',
    category: 'website',
    client: 'NextHub Retail',
    year: '2023',
    shortDescription: 'A headless e-commerce platform designed for speed and scalability.',
    challenge: 'NextHub was experiencing slow page load times and poor mobile conversion rates on their monolithic legacy platform. They needed a flexible, high-performing solution to handle high traffic spikes during seasonal sales without compromising user experience.',
    solution: 'We architected a headless e-commerce solution using Next.js and Shopify Storefront API. By decoupling the frontend, we delivered sub-second page loads. We implemented a modern edge-caching strategy and completely redesigned the mobile checkout flow for maximum conversion efficiency.',
    results: [
      '150% increase in mobile conversion rate',
      '75% faster average page load time',
      '40% increase in average order value'
    ],
    techStack: ['Next.js', 'Shopify Plus', 'Tailwind CSS', 'Vercel'],
    testimonial: {
      quote: 'The transformation of our digital storefront was nothing short of miraculous. The site is incredibly fast, and the impact on our bottom line was immediate.',
      author: 'Sarah Mitchell',
      role: 'CEO',
      company: 'NextHub Retail',
      rating: 5
    },
    image: '/images/portfolio/project-1.jpg'
  },
  {
    slug: 'analytix-pro',
    title: 'Analytix Pro Dashboard',
    category: 'saas',
    client: 'DataFlow Inc.',
    year: '2023',
    shortDescription: 'A comprehensive data visualization and analytics SaaS for enterprise teams.',
    challenge: 'DataFlow wanted to launch a new SaaS product that could aggregate massive datasets from multiple ad platforms and visualize them in real-time, but their initial prototype was slow and difficult for non-technical users to navigate.',
    solution: 'We built a highly scalable React application powered by a robust Node.js and PostgreSQL backend. We utilized advanced charting libraries and implemented real-time WebSocket connections to ensure data was always current, wrapping it all in an intuitive, customizable dashboard interface.',
    results: [
      'Successfully processed over 1M data points daily',
      'Achieved 10,000 active users in the first 3 months',
      'Reduced user onboarding time by 60%'
    ],
    techStack: ['React', 'Node.js', 'PostgreSQL', 'Socket.io', 'AWS'],
    testimonial: {
      quote: 'qubtic took our complex data requirements and turned them into a beautiful, performant SaaS product that our enterprise clients absolutely love.',
      author: 'David Park',
      role: 'Founder',
      company: 'DataFlow Inc.',
      rating: 5
    },
    image: '/images/portfolio/project-2.jpg'
  },
  {
    slug: 'stocksync',
    title: 'StockSync Inventory App',
    category: 'shopify',
    client: 'StyleHub E-commerce',
    year: '2024',
    shortDescription: 'A custom Shopify app that automates multi-warehouse inventory syncing.',
    challenge: 'StyleHub was struggling with overselling products because their inventory was spread across three different warehouses and not syncing correctly with their Shopify store, leading to canceled orders and frustrated customers.',
    solution: 'We developed a custom private Shopify app using Remix and Prisma that integrates deeply with their existing ERP system. The app automatically reconciles inventory across all locations every 5 minutes and uses intelligent routing to fulfill orders from the most optimal warehouse.',
    results: [
      'Eliminated inventory overselling entirely',
      'Saved 20 hours per week in manual data entry',
      'Improved order fulfillment speed by 35%'
    ],
    techStack: ['Remix', 'Shopify Polaris', 'Prisma', 'PostgreSQL'],
    testimonial: {
      quote: 'The custom app qubtic built has been a game-changer for our operations. It runs silently in the background and has completely eliminated our inventory headaches.',
      author: 'Maria Garcia',
      role: 'E-commerce Director',
      company: 'StyleHub',
      rating: 5
    },
    image: '/images/portfolio/project-3.jpg'
  },
  {
    slug: 'pixel-studio',
    title: 'Pixel Studio Portfolio',
    category: 'framer',
    client: 'Pixel Works Agency',
    year: '2024',
    shortDescription: 'A highly interactive and animated portfolio site built in Framer.',
    challenge: 'Pixel Works, a creative agency, needed a new portfolio website that reflected their high-end design capabilities. They wanted complex scroll-driven animations and a unique navigation experience, but needed to maintain the ability to easily update case studies themselves.',
    solution: 'We leveraged Framer to build a visually striking, highly animated website. We utilized Framer Motion for intricate 3D scroll effects and implemented the Framer CMS, allowing their team to effortlessly publish new projects without touching any code.',
    results: [
      'Awarded "Site of the Day" on Awwwards',
      'Increased inbound client leads by 85%',
      'Reduced content update time to mere minutes'
    ],
    techStack: ['Framer', 'React', 'Framer Motion'],
    testimonial: {
      quote: 'Our new site is a true work of art. qubtic pushed the boundaries of Framer to deliver an experience that wows our prospective clients every single time.',
      author: 'Tom Anderson',
      role: 'Creative Director',
      company: 'Pixel Works',
      rating: 5
    },
    image: '/images/portfolio/project-4.jpg'
  },
  {
    slug: 'medflow',
    title: 'MedFlow Healthcare Platform',
    category: 'saas',
    client: 'HealthFirst Systems',
    year: '2023',
    shortDescription: 'A HIPAA-compliant telemedicine and patient management SaaS.',
    challenge: 'HealthFirst needed to rapidly develop a secure, HIPAA-compliant platform to handle virtual consultations, patient records, and billing, ensuring strict privacy standards were maintained throughout the application.',
    solution: 'We architected a secure cloud infrastructure and built a full-stack Next.js application. We implemented robust end-to-end encryption for video calls using WebRTC and integrated a secure healthcare-specific CRM to manage patient data seamlessly and legally.',
    results: [
      'Achieved 100% HIPAA compliance certification',
      'Facilitated over 50,000 virtual consultations',
      'Zero security breaches since launch'
    ],
    techStack: ['Next.js', 'WebRTC', 'Node.js', 'AWS HIPAA Stack'],
    testimonial: {
      quote: 'Building a healthcare app is incredibly complex due to regulations, but qubtic navigated the technical and security challenges flawlessly.',
      author: 'Lisa Chen',
      role: 'CTO',
      company: 'HealthFirst Systems',
      rating: 5
    },
    image: '/images/portfolio/project-5.jpg'
  },
  {
    slug: 'foodie-express',
    title: 'Foodie Express App',
    category: 'website',
    client: 'FreshBites',
    year: '2024',
    shortDescription: 'A modern progressive web app (PWA) for restaurant ordering.',
    challenge: 'FreshBites wanted to bypass the high fees of third-party delivery apps by creating their own direct-ordering platform that felt like a native app but was accessible directly through the mobile web.',
    solution: 'We developed a lightning-fast Progressive Web App (PWA) using React. We implemented offline capabilities, push notifications for order updates, and a streamlined one-click checkout process utilizing Stripe integration.',
    results: [
      'Captured 30% of orders from third-party apps',
      'Saved over $50k in delivery commission fees',
      'Increased repeat customer rate by 45%'
    ],
    techStack: ['React', 'PWA', 'Stripe', 'Firebase'],
    testimonial: {
      quote: 'Taking control of our own ordering platform was the best business decision we made this year, and qubtic made the transition incredibly smooth.',
      author: 'Mark Thompson',
      role: 'Owner',
      company: 'FreshBites',
      rating: 5
    },
    image: '/images/portfolio/project-6.jpg'
  }
];
