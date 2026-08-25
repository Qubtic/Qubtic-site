export const services = [
  {
    slug: 'web-development',
    title: 'Web Development',
    shortDescription: 'High-performance, visually stunning websites built with modern web technologies.',
    longDescription: 'At qubtic, we engineer cutting-edge web applications tailored to your business goals. Utilizing industry-leading technologies like Next.js and React, we ensure that your digital presence is both incredibly fast and robust. Our approach focuses on seamless user experiences, responsive designs, and scalable architectures that grow alongside your business.\n\nWe prioritize SEO optimization and performance, meaning your site not only looks exceptional but also ranks higher on search engines and engages visitors effectively. Whether you need a corporate website, an interactive portal, or a complex web platform, our team is equipped to deliver superior results that drive actual business growth and elevate your brand.',
    icon: 'Globe',
    features: [
      'Custom Next.js & React development',
      'Mobile-first responsive design',
      'Advanced SEO optimization',
      'Lightning-fast page load speeds',
      'Headless CMS integration',
      'Web accessibility (a11y) compliance',
      'Robust security protocols',
      'Continuous maintenance & support'
    ],
    process: [
      { name: 'Discovery', description: 'Understanding your business needs, goals, and target audience.' },
      { name: 'Design', description: 'Creating intuitive wireframes and stunning visual interfaces.' },
      { name: 'Development', description: 'Building the site using the latest modern web frameworks.' },
      { name: 'Testing', description: 'Rigorous QA testing across multiple devices and browsers.' },
      { name: 'Launch', description: 'Smooth deployment to production and going live.' },
      { name: 'Support', description: 'Ongoing monitoring, updates, and optimization.' }
    ],
    techStack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Vercel', 'Sanity CMS'],
    faq: [
      { question: 'How long does a typical web development project take?', answer: 'Most web development projects take between 6 to 12 weeks, depending on the complexity, features required, and the speed of feedback cycles.' },
      { question: 'Do you provide ongoing support after launch?', answer: 'Yes, we offer comprehensive post-launch support and maintenance packages to ensure your website remains secure, up-to-date, and performs optimally.' },
      { question: 'Will my website be mobile-friendly?', answer: 'Absolutely. We follow a mobile-first approach, ensuring that your website provides an exceptional experience across all devices, from smartphones to desktop monitors.' },
      { question: 'Can I update the content myself?', answer: 'Yes, we typically integrate a user-friendly Content Management System (CMS) like Sanity or WordPress, empowering your team to manage content effortlessly.' }
    ]
  },
  {
    slug: 'saas-development',
    title: 'SaaS Development',
    shortDescription: 'Scalable, secure, and feature-rich Software-as-a-Service platforms.',
    longDescription: 'Transform your vision into a powerful, scalable SaaS product with qubtic. We specialize in building end-to-end cloud applications that solve real user problems while offering seamless subscription management and intuitive interfaces. From developing a Minimum Viable Product (MVP) to scaling an enterprise-level platform, we handle every technical aspect so you can focus on growing your business.\n\nOur full-stack development expertise ensures that your SaaS is built on a resilient architecture, capable of handling high traffic and massive data loads securely. We integrate payment gateways, implement complex user roles, and design frictionless onboarding flows to maximize user retention and customer lifetime value.',
    icon: 'Layers',
    features: [
      'Full-stack architecture design',
      'Rapid MVP development',
      'Multi-tenant database structure',
      'Stripe subscription billing integration',
      'Role-based access control (RBAC)',
      'Real-time data processing',
      'Third-party API integrations',
      'Scalable cloud infrastructure'
    ],
    process: [
      { name: 'Discovery', description: 'Validating the core SaaS concept and identifying the target market.' },
      { name: 'Design', description: 'Crafting user flows and interfaces that maximize user retention.' },
      { name: 'Development', description: 'Iterative development focusing on core functionalities.' },
      { name: 'Testing', description: 'Extensive security, load, and automated QA testing.' },
      { name: 'Launch', description: 'Deploying the MVP and setting up cloud infrastructure.' },
      { name: 'Support', description: 'Scaling architecture and adding new features continuously.' }
    ],
    techStack: ['Next.js', 'Node.js', 'PostgreSQL', 'Prisma', 'Stripe', 'AWS'],
    faq: [
      { question: 'What is your approach to building an MVP?', answer: 'We focus on identifying the core value proposition of your product and building essential features first. This allows for a faster time-to-market and early user validation while minimizing initial costs.' },
      { question: 'How do you handle data security?', answer: 'Security is paramount. We implement industry best practices, including end-to-end encryption, secure authentication (like OAuth and JWT), regular security audits, and strict compliance with data protection regulations.' },
      { question: 'Can you scale the application as our user base grows?', answer: 'Yes. We design our SaaS architectures with scalability in mind from day one, utilizing cloud-native services and microservices where appropriate to handle increased traffic and data effortlessly.' },
      { question: 'Do you help with third-party software integrations?', answer: 'Absolutely. We regularly integrate tools like CRM systems, marketing automation platforms, and communication APIs (like Twilio or SendGrid) directly into your SaaS product.' }
    ]
  },
  {
    slug: 'shopify-apps',
    title: 'Shopify App Development',
    shortDescription: 'Custom Shopify apps and integrations to supercharge your e-commerce store.',
    longDescription: 'Unlock the full potential of your e-commerce business with bespoke Shopify app development. Whether you need to automate inventory, synchronize data across platforms, or create unique storefront experiences, qubtic delivers tailored solutions that seamlessly integrate with the Shopify ecosystem. We build robust public and custom apps that enhance functionality and drive sales.\n\nOur team is deeply experienced with the Shopify API, GraphQL, and modern web frameworks to ensure that your applications are fast, secure, and fully compliant with Shopify standards. We help merchants solve complex operational challenges, optimize the checkout experience, and ultimately increase conversion rates through intelligent software solutions.',
    icon: 'ShoppingBag',
    features: [
      'Custom Shopify app development',
      'Public & private app creation',
      'ERP & CRM integrations',
      'Custom checkout extensions',
      'Automated inventory syncing',
      'Advanced reporting & analytics',
      'Headless Shopify solutions',
      'Theme customization & performance'
    ],
    process: [
      { name: 'Discovery', description: 'Analyzing your e-commerce bottlenecks and automation needs.' },
      { name: 'Design', description: 'Designing the app interface following Shopify Polaris guidelines.' },
      { name: 'Development', description: 'Building the app and integrating with Shopify APIs.' },
      { name: 'Testing', description: 'Testing functionality across development stores.' },
      { name: 'Launch', description: 'Submitting to the App Store or deploying to your store.' },
      { name: 'Support', description: 'Ongoing updates to align with Shopify API changes.' }
    ],
    techStack: ['Remix', 'React', 'Shopify Polaris', 'GraphQL', 'Node.js', 'Redis'],
    faq: [
      { question: 'Do you build both public and custom private apps?', answer: 'Yes, we build custom private apps tailored specifically for individual merchants, as well as scalable public apps intended for the Shopify App Store.' },
      { question: 'How do you ensure the app performs well without slowing down the store?', answer: 'We follow Shopify best practices, using optimized API calls, efficient caching strategies, and App Bridge to ensure seamless, fast performance within the Shopify admin and storefront.' },
      { question: 'Can you integrate our existing ERP system with Shopify?', answer: 'Certainly. We have extensive experience integrating third-party systems like NetSuite, SAP, and various fulfillment providers directly into Shopify via custom middleware.' },
      { question: 'What happens when Shopify updates their API?', answer: 'We provide ongoing maintenance services to continuously monitor Shopify API deprecations and update your app proactively to ensure uninterrupted functionality.' }
    ]
  },
  {
    slug: 'framer-development',
    title: 'Framer Development',
    shortDescription: 'Breathtaking, highly animated websites built at the speed of thought on Framer.',
    longDescription: 'Stand out from the competition with a visually stunning, highly interactive Framer website. Framer allows us to bridge the gap between design and development, delivering pixel-perfect, richly animated sites in record time. Perfect for marketing sites, creative portfolios, and landing pages, our Framer solutions captivate audiences and drive conversions.\n\nqubtic excels at pushing the boundaries of what is possible in Framer. We implement custom React components, complex scroll animations, and dynamic CMS integrations to create web experiences that feel alive. If you want a website that leaves a lasting impression without the long development cycles, our Framer expertise is your perfect match.',
    icon: 'Palette',
    features: [
      'Custom Framer website design',
      'Complex scroll & reveal animations',
      'Framer CMS setup & integration',
      'Custom React code overrides',
      'Framer template creation',
      'Responsive design optimization',
      'High-converting landing pages',
      'Framer plugin development'
    ],
    process: [
      { name: 'Discovery', description: 'Defining the creative vision and brand aesthetic.' },
      { name: 'Design', description: 'Prototyping visual layouts directly within the Framer canvas.' },
      { name: 'Development', description: 'Adding interactivity, animations, and custom code components.' },
      { name: 'Testing', description: 'Ensuring smooth animations and responsiveness across devices.' },
      { name: 'Launch', description: 'Publishing the site with custom domains and SEO setup.' },
      { name: 'Support', description: 'Providing training on the Framer CMS and future updates.' }
    ],
    techStack: ['Framer', 'React', 'Framer Motion', 'CSS', 'Figma', 'TypeScript'],
    faq: [
      { question: 'Why should I choose Framer over other platforms?', answer: 'Framer is ideal if you prioritize high-end design, intricate animations, and rapid deployment. It empowers creative layouts that are difficult to achieve quickly on traditional platforms while offering an intuitive CMS.' },
      { question: 'Can you migrate my existing Figma designs to Framer?', answer: 'Yes! We seamlessly translate Figma designs into fully functional Framer websites, preserving your design system while adding powerful web interactivity.' },
      { question: 'Is Framer good for SEO?', answer: 'Absolutely. Framer sites are incredibly fast, semantically structured, and provide built-in tools to manage meta tags, open graph images, and sitemaps effectively.' },
      { question: 'Can you add custom functionality that Framer does not support natively?', answer: 'Yes, since Framer is built on React, we can write custom code overrides and components to introduce complex logic, API integrations, and bespoke interactive elements.' }
    ]
  }
];
