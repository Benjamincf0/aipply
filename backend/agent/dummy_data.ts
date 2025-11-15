import { ApplicantProfile } from "../types.js";

export const APPLICANT_PROFILE: ApplicantProfile = {
  // Basic Information
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  phone: "+1-555-123-4567",
  location: "San Francisco, CA, USA",
  city: "San Francisco",
  state: "CA",
  country: "United States",
  postalCode: "94102",

  // Links
  linkedin: "https://www.linkedin.com/in/johndoe",
  github: "https://github.com/johndoe",
  portfolio: "https://johndoe.dev",
  website: "https://johndoe.com",

  // Work Experience
  workExperience: [
    {
      company: "Tech Corp",
      role: "Software Engineer Intern",
      duration: "6 months",
      startDate: "June 2024",
      endDate: "December 2024",
      responsibilities: [
        "Developed and maintained RESTful APIs using Node.js and Express",
        "Collaborated with cross-functional teams to deliver features",
        "Implemented automated testing with Jest and increased code coverage by 30%",
        "Optimized database queries resulting in 40% performance improvement",
      ],
    },
    {
      company: "Startup Inc",
      role: "Frontend Developer Intern",
      duration: "4 months",
      startDate: "January 2024",
      endDate: "May 2024",
      responsibilities: [
        "Built responsive web applications using React and TypeScript",
        "Integrated third-party APIs and managed state with Redux",
        "Worked closely with designers to implement pixel-perfect UI components",
      ],
    },
  ],

  // Education
  education: [
    {
      institution: "University of California, Berkeley",
      degree: "Bachelor of Science",
      field: "Computer Science",
      graduationDate: "May 2025",
      gpa: "3.8",
    },
  ],

  // Skills
  technicalSkills: [
    "JavaScript",
    "TypeScript",
    "Python",
    "React",
    "Node.js",
    "Express",
    "MongoDB",
    "PostgreSQL",
    "Git",
    "Docker",
    "AWS",
    "REST APIs",
    "GraphQL",
    "Jest",
    "HTML/CSS",
  ],
  softSkills: [
    "Team collaboration",
    "Problem-solving",
    "Communication",
    "Time management",
    "Adaptability",
  ],

  // Projects
  projects: [
    {
      name: "E-commerce Platform",
      description:
        "Built a full-stack e-commerce platform with user authentication, product catalog, shopping cart, and payment integration using Stripe API",
      technologies: ["React", "Node.js", "MongoDB", "Express", "Stripe"],
      link: "https://github.com/johndoe/ecommerce-platform",
      startDate: "March 2024",
      endDate: "May 2024",
    },
    {
      name: "Real-time Chat Application",
      description:
        "Developed a real-time chat application with WebSocket support, user presence indicators, and message history persistence",
      technologies: ["React", "Socket.io", "Node.js", "Redis", "PostgreSQL"],
      link: "https://github.com/johndoe/chat-app",
      startDate: "January 2024",
      endDate: "February 2024",
    },
    {
      name: "Task Management Tool",
      description:
        "Created a collaborative task management tool with drag-and-drop interface, real-time updates, and team collaboration features",
      technologies: [
        "TypeScript",
        "Next.js",
        "Prisma",
        "PostgreSQL",
        "TailwindCSS",
      ],
      link: "https://github.com/johndoe/task-manager",
      startDate: "October 2023",
      endDate: "December 2023",
    },
  ],

  // Additional Information
  coverLetter:
    "I am a passionate and driven computer science student with a strong foundation in full-stack development. Through my internships and personal projects, I have gained extensive experience in building scalable web applications and working with modern technologies. I am eager to contribute to innovative projects and continue growing as a software engineer. I am particularly interested in roles that allow me to work on challenging problems and collaborate with talented teams.",
  availability: "Immediately available",
  workAuthorization: "Authorized to work in the United States",
  requiresSponsorship: false,
  willingToRelocate: true,
  expectedSalary: "$80,000 - $100,000",
  noticePeriod: "2 weeks",

  // Resume
  resumePath: "./resume.pdf",
};
