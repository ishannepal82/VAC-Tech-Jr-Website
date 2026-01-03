// src/data/projects.ts

export interface Project {
  id: string;
  title: string;
  author: string;
  author_email: string;
  committee: string;
  description: string;
  github: string;
  is_approved: boolean;
  is_declined: boolean;
  is_completed?: boolean;
  members: { name: string; avatarUrl?: string }[];
  points: number;
  project_timeframe: string;
  required_members: number;
  unknown_members: any[];
  technologies?: string[];
  rejection_reason?: string;
}

// export const allProjects: Project[] = [
//   // --- Available Projects ---
//   {
//     id: 1,
//     name: "Club Website V2",
//     author: "Tech Committee",
//     shortDescription:
//       "Redesign and add new features to our official club website.",
//     fullDescription:
//       "The current website needs a facelift and new functionalities like a member portal, event registration, and a dynamic project showcase. We are looking for frontend and backend developers to join the team.",
//     timeframe: "3 Months",
//     status: "available",
//     technologies: ["Next.js", "Tailwind CSS", "TypeScript", "Supabase"],
//     team: [{ name: "Alex" }, { name: "Brenda" }],
//     points: 250,
//   },
//   {
//     id: 2,
//     name: "Discord Bot Assistant",
//     author: "Community Committee",
//     shortDescription:
//       "A bot to automate roles, post announcements, and manage events.",
//     fullDescription:
//       "To improve our Discord server engagement and management, we are building a custom bot. This is a great project for those interested in Node.js, APIs, and community management tools.",
//     timeframe: "2 Months",
//     status: "available",
//     technologies: ["Node.js", "Discord.js", "TypeScript"],
//     team: [{ name: "Chris" }],
//     points: 150,
//   },
//   // --- Completed Projects ---
//   {
//     id: 3,
//     name: "Automated Attendance Tracker",
//     author: "Operations Committee",
//     shortDescription: "A QR-based system to track member attendance at events.",
//     fullDescription:
//       "This system was built to streamline event check-ins. Members can scan a QR code to mark their attendance, which is then recorded in a central database. The project was a huge success and is used at all our events.",
//     timeframe: "Completed",
//     status: "completed",
//     technologies: ["React", "Firebase", "QR Code Lib"],
//     team: [
//       { name: "David" },
//       { name: "Emily" },
//       { name: "Frank" },
//       { name: "Grace" },
//     ],
//     points: 200,
//     repoUrl: "https://github.com/your-club/attendance-tracker",
//   },
//   {
//     id: 4,
//     name: "Project Voting App",
//     author: "Tech Committee",
//     shortDescription: "A web app for members to vote on new project proposals.",
//     fullDescription:
//       "To democratize the project selection process, we created a simple and secure voting application. Members can log in, view proposals, and cast their votes. This ensures the most popular and impactful projects get built.",
//     timeframe: "Completed",
//     status: "completed",
//     technologies: ["Vue.js", "Firestore"],
//     team: [{ name: "Heidi" }, { name: "Ivan" }, { name: "Judy" }],
//     points: 120,
//     repoUrl: "https://github.com/your-club/voting-app",
//   },
// ];
