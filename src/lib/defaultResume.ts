import { ResumeDocument } from "@/lib/schema";

export const defaultResume: ResumeDocument = {
  meta: {
    title: "John Doe Resume",
    pdfTitle: "John Doe Resume",
    updatedAt: new Date().toISOString(),
  },
  header: {
    name: "John Doe",
    location: "Austin, TX",
    phone: "(555) 010-0198",
    email: "john.doe@example.com",
    linkedin: "john-doe",
    github: "johndoe",
    links: [],
  },
  blocks: [
    {
      id: "sec-education",
      type: "education",
      title: "Education",
      visible: true,
      items: [
        {
          kind: "education",
          school: "Example State University",
          location: "Austin, TX",
          degreeLine: "Master of Science in Computer Science --- GPA: 3.9/4.0",
          dateRight: "Aug 2024 -- Jun 2026",
          bullets: [],
        },
        {
          kind: "education",
          school: "City University",
          location: "Austin, TX",
          degreeLine: "Bachelor of Science in Computer Science --- GPA: 3.8/4.0",
          dateRight: "May 2024",
          bullets: [
            "Relevant Coursework: Data Structures & Algorithms, Databases, Operating Systems, Distributed Systems, Software Design & Testing",
          ],
        },
      ],
    },
    {
      id: "sec-experience",
      type: "experience",
      title: "Experience",
      visible: true,
      items: [
        {
          kind: "experience",
          role: "Software Engineering Intern",
          dateRight: "Jun 2025 -- Aug 2025",
          company: "Acme Technologies",
          location: "Remote",
          bullets: [
            "Built full-stack features using React and Node.js for a customer onboarding platform used by 10+ internal teams.",
            "Designed REST APIs with validation and logging to support reliable data exchange and end-to-end testing.",
            "Collaborated in a 5-person agile team across 6 sprints, delivering 8+ tracked tasks and improving release quality.",
          ],
        },
        {
          kind: "experience",
          role: "Software Engineering Intern",
          dateRight: "May 2024 -- Aug 2024",
          company: "BlueSky Analytics",
          location: "Austin, TX",
          bullets: [
            "Refactored backend services and SQL queries supporting internal reporting tools used by 4 business teams.",
            "Debugged production issues and improved regression test coverage for bi-weekly releases.",
          ],
        },
      ],
    },
    {
      id: "sec-projects",
      type: "projects",
      title: "Projects",
      visible: true,
      items: [
        {
          kind: "projects",
          left: "Interview Practice Platform | React, TypeScript, Python/FastAPI, AWS",
          dateRight: "2025--Present",
          bullets: [
            "Developed an interview practice platform processing 300+ responses with structured scoring and feedback generation.",
            "Extended the system with improved prompt pipelines, analytics dashboards, and iterative scoring logic.",
          ],
        },
        {
          kind: "projects",
          left: "DropZone | SwiftUI, iOS",
          dateRight: "2024",
          bullets: [
            "Built a clipboard manager with smooth UI, predictable state management, and fast interactions.",
            "Tested across lifecycle events on simulators and physical devices to ensure stability.",
          ],
        },
        {
          kind: "projects",
          left: "Code Review Assistant | Python",
          dateRight: "2024",
          bullets: [
            "Created an automated code analysis tool that processes 40+ repositories to generate structured diagnostics.",
            "Improved signal quality by refining parsing logic and output formatting.",
          ],
        },
      ],
    },
    {
      id: "sec-skills",
      type: "skills",
      title: "Skills",
      visible: true,
      items: [
        {
          kind: "skills",
          categories: [
            {
              label: "Languages",
              value: "Python, JavaScript/TypeScript, Java, C++, SQL, Swift",
            },
            {
              label: "Frontend",
              value: "React, HTML5, CSS3, component-based UI development",
            },
            {
              label: "Backend",
              value: "Node.js, FastAPI, REST APIs, server-side application design",
            },
            {
              label: "AI & Data",
              value: "LLM prompting, evaluation pipelines, structured text processing, analytics dashboards",
            },
            {
              label: "Tools & Practices",
              value: "Git/GitHub, Agile/Scrum, unit testing, code reviews, debugging, technical documentation",
            },
          ],
        },
      ],
    },
  ],
};
