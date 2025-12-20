const companies = [
  'TechCorp', 'WebSolutions', 'DataSystems', 'CloudNine', 'CodeMasters',
  'DigitalHive', 'ByteForge', 'NexusLabs', 'QuantumSoft', 'InnoTech',
  'AppVenture', 'DataMinds', 'CloudScape', 'DevHaven', 'CodeCrafters',
  'PixelPerfect', 'LogicLoop', 'WebWizards', 'DataDynamo', 'CloudPioneers'
];

const locations = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
  'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Kochi'
];

const positions = [
  'Software Developer', 'Frontend Engineer', 'Backend Developer', 'Full Stack Developer',
  'DevOps Engineer', 'Data Scientist', 'Machine Learning Engineer', 'UI/UX Designer',
  'Product Manager', 'QA Engineer', 'Mobile App Developer', 'Cloud Architect'
];

const skills = [
  'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'Django', 'Flask',
  'AWS', 'Docker', 'Kubernetes', 'TensorFlow', 'PyTorch', 'SQL', 'NoSQL',
  'GraphQL', 'REST API', 'TypeScript', 'Redux', 'MongoDB', 'PostgreSQL'
];

const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];
const getRandomSubset = (array, max = 5) => {
  const count = Math.floor(Math.random() * max) + 1;
  return [...array].sort(() => 0.5 - Math.random()).slice(0, count);
};

export const generateMockJobs = (count = 1000) => {
  const mockJobs = [];
  
  // Add the initial mock jobs
  mockJobs.push(
    {
      _id: '1',
      company: 'APPDEV INDIA',
      position: 'Mobile App Development Intern',
      jobLocation: 'Chennai, Tamil Nadu',
      jobType: 'internship',
      jobDescription: 'Develop mobile applications for iOS and Android. Work with React Native, Flutter, or native development. Build apps from concept to deployment.',
      capacity: 4,
      salary: '₹22,000 - ₹32,000',
      skillsRequired: ['React Native', 'Flutter', 'Mobile Development', 'JavaScript', 'API Integration'],
      statePriority: 'Tamil Nadu',
      applicationDeadline: '2025-12-29',
      status: 'pending'
    },
    {
      _id: '2',
      company: 'CLOUDTECH SOLUTIONS',
      position: 'Backend Development Intern',
      jobLocation: 'Pune, Maharashtra',
      jobType: 'internship',
      jobDescription: 'Build scalable backend systems using Python, Django, and PostgreSQL. Learn about APIs, microservices, and cloud deployment.',
      capacity: 3,
      salary: '₹28,000 - ₹38,000',
      skillsRequired: ['Python', 'Django', 'PostgreSQL', 'REST APIs', 'Docker'],
      statePriority: 'Maharashtra',
      applicationDeadline: '2025-12-29',
      status: 'pending'
    },
    {
      _id: '3',
      company: 'DESIGN STUDIO INDIA',
      position: 'UI/UX Design Intern',
      jobLocation: 'Hyderabad, Telangana',
      jobType: 'internship',
      jobDescription: 'Create beautiful and intuitive user interfaces. Work with Figma, Sketch, and Adobe XD to design user experiences.',
      capacity: 2,
      salary: '₹20,000 - ₹30,000',
      skillsRequired: ['Figma', 'UI/UX Design', 'Prototyping', 'User Research'],
      statePriority: 'Telangana',
      applicationDeadline: '2025-12-30',
      status: 'pending'
    },
    {
      _id: '4',
      company: 'DIGITAL MARKETING SOLUTIONS',
      position: 'Marketing Intern',
      jobLocation: 'Bangalore, Karnataka',
      jobType: 'internship',
      jobDescription: 'Assist in digital marketing campaigns, social media management, and content creation.',
      capacity: 5,
      salary: '₹15,000 - ₹25,000',
      skillsRequired: ['Digital Marketing', 'Social Media', 'Content Creation', 'SEO'],
      statePriority: 'Karnataka',
      applicationDeadline: '2025-12-31',
      status: 'pending'
    }
  );

  // Generate additional random jobs
  for (let i = 5; i <= count; i++) {
    const company = getRandomElement(companies);
    const position = getRandomElement(positions);
    const location = getRandomElement(locations);
    const salaryMin = Math.floor(Math.random() * 20) + 10; // 10-30k
    const salaryMax = salaryMin + Math.floor(Math.random() * 15) + 5; // 5-20k more than min
    
    mockJobs.push({
      _id: i.toString(),
      company: company,
      position: position,
      jobLocation: `${location}, India`,
      jobType: Math.random() > 0.3 ? 'internship' : 'full-time',
      jobDescription: `Exciting opportunity for a ${position} at ${company}. Join our team to work on cutting-edge projects and enhance your skills.`,
      capacity: Math.floor(Math.random() * 5) + 1, // 1-5 positions
      salary: `₹${salaryMin},000 - ₹${salaryMax},000`,
      skillsRequired: getRandomSubset(skills),
      statePriority: location,
      applicationDeadline: getRandomFutureDate(),
      status: Math.random() > 0.7 ? 'matched' : 'pending',
      matchScore: Math.random().toFixed(2)
    });
  }

  return mockJobs;
};

function getRandomFutureDate() {
  const days = Math.floor(Math.random() * 60) + 1; // 1-60 days from now
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

export const getMockMatches = (count = 20) => {
  return generateMockJobs(count).map(job => ({
    ...job,
    matchReasons: [
      'Skills match 85% of requirements',
      'Location preference matched',
      'Previous experience in similar role'
    ].slice(0, Math.floor(Math.random() * 3) + 1)
  }));
};
