import z from "zod";
import {
  JobResultSchema,
  JobSearchReq,
  ApplicationStatusSchema,
  WebSocketMessageSchema,
} from "./types";
import type { Action } from "../app/Context.tsx";

const CORS_HEADERS = {
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*",
    "Access-Control-Allow-Headers": "Content-Type",
  },
};

let applications: ApplicationStatusSchema[] = [];

const server = Bun.serve({
  port: 8080,
  hostname: "127.0.0.1",
  routes: {
    "/api/job/search": {
      POST: async (req) => {
        const data = await req.json();

        const parsed = JobSearchReq.safeParse(data);

        if (!parsed.success) {
          return Response.json(
            { error: parsed.error.issues[0]?.message },
            CORS_HEADERS,
          );
        }

        const { search, location, type } = parsed.data;
        const params = new URLSearchParams({
          engine: "google_jobs",
          q: search + type ? ` ${type}` : "",
          hl: "en",
          api_key: process.env.SERPAPI_API_KEY!,
        });

        if (location) {
          params.append("location", location);
        }

        const url = `https://serpapi.com/search?${params.toString()}`;

        const res = await fetch(url);
        const json = (await res.json()) as any;

        const results = json.jobs_results;

        const parsedResults = z.array(JobResultSchema).safeParse(results);

        if (!parsedResults.success) {
          return Response.json(
            { error: parsedResults.error.issues[0]?.message },
            CORS_HEADERS,
          );
        }

        const bombardierEntry: JobResultSchema = {
          title: "Intern, Production support - Assembly (Winter, 2026)",
          company_name: "Bombardier",
          location: "Saint-Laurent, Quebec, Canada",
          via: "Bombardier Careers",
          share_link:
            "https://www.google.com/search?ibp=htl;jobs&q=+internship&htidocid=L2eCJm548E_cjQQ0AAAAAA%3D%3D&hl=en-BR&shndl=37&shmd=H4sIAAAAAAAA_xWNuw6CQBBFY-snWE3pA4GQaKGVWhgfhcbC0swuE1gDO5udIcEv8_fE5jbnnNzxdzS-nLxS9AncIpedVccepAuBo8ISdiLUmuYD06f7ewkUebGeDeTMBoQw2hqG4shcNTTZ1qpBNlkm0qSVKKqzqeU2Y0-G--zNRv7zkhojhQaVXsUq79Pgq_liz63BWDqK4Dw8cHhcXrGL5DWBe0eGbAIH9FjiD24L_DG6AAAA&shmds=v1_AdeF8KhP8nchboqa7DNRU0MyO8iNc570FvR6LKgGbig1fmEfmw&source=sh/x/job/li/m1/1#fpstate=tldetail&htivrt=jobs&htiq=+internship&htidocid=L2eCJm548E_cjQQ0AAAAAA%3D%3D",
          extensions: ["6 days ago", "Internship"],
          detected_extensions: {
            posted_at: "6 days ago",
            schedule_type: "Internship",
          },
          description:
            "Innovation is in our DNA… is it in yours?\nBombardier is a global leader in aviation, creating innovative and game-changing planes. Our products and services provide world-class experiences that set new standards in passenger comfort, energy efficiency, reliability and safety. We are a global organization focused on working together with a team spirit.\n\nYour boarding pass will include…\n\nSeveral conferences, including:\n• Meet An Executive\n• Women Taking Flight\n\nLearning more about Bombardier, including:\n• Bombardier Products conference\n• Visits of the Bombardier sites\n• Bombardier Academy of Learning\n\nMany social/networking opportunities, including:\n• Volunteering\n• Networking for Success\n• 5 à 7, Potluck, and much more!\n\nWhat are your contributions to the team?\n\n Project management of small and medium-term projects and monitor their progress;\n\n Participate in the analysis of non-quality data and propose corrective measures if necessary;\n\n Collaborate with manufacturing personnel to improve process efficiency;\n\n Problem solving of management issue base on IT solutions;\n\n Identify needs and optimize production. Eliminate added non-values;\n\n Analyse production performance base on production KPI;\n\n Optimize autonomous maintenance process;\n\n Support manager in their daily operation;\n\n Participate in the development and optimization of the processes and production tools;\n\n Audit certain processes to validate their proper functioning and provide some recommendations;\n\n Sit and participate in the various executive committees of the organization on a periodic basis.\n\nHow to thrive in this role?\n\n University student in the discipline related to the subject area or equivalent.\n\n The candidate must have a very good analytical and synthetic mind with an overall vision in order to be able to measure the impact and the stakes of each strategic decision.\n\n Candidate will work closely with other agents: methods, production engineering, purchasing, tooling, logistics…\n\n Candidate has experience in Catia and SAP methods and knowledge\n\n The candidate will have project management knowledge and ability to work with Microsoft Office.\n\n Good interpersonal communication skills\n\n​\nBoarding Information:\n• Location: Marcel-Laurin Plant 1\n• Duration: 8 months\n• Flexible workplace-Hybrid\n\nIt is important to note that our internship opportunities are open to students only, not new graduates. All our interns may be required to occasionally travel outside of Canada for training/work purpose.\n\n​",
          apply_options: [
            {
              title: "Bombardier Careers",
              link: "https://jobs.bombardier.com/job/St-Laurent-Intern%2C-Production-support-Assembly-%28Winter%2C-2026%29-Qu%C3%A9b-H4R-1K2/1266603001/?utm_campaign=google_jobs_apply&utm_source=google_jobs_apply&utm_medium=organic",
            },
            {
              title: "Indeed",
              link: "https://emplois.ca.indeed.com/viewjob?jk=c3e1122c819556c1&utm_campaign=google_jobs_apply&utm_source=google_jobs_apply&utm_medium=organic",
            },
            {
              title: "ZipRecruiter",
              link: "https://www.ziprecruiter.com/c/Bombardier/Job/Intern,-Production-support-Assembly-(Winter,-2026)/-in-Montreal,QC?jid=5876b23d0aa019fb&utm_campaign=google_jobs_apply&utm_source=google_jobs_apply&utm_medium=organic",
            },
            {
              title: "BeBee CA",
              link: "https://ca.bebee.com/job/da2ccd407dafc8f284f779eead92ba3b?utm_campaign=google_jobs_apply&utm_source=google_jobs_apply&utm_medium=organic",
            },
            {
              title: "Talentify",
              link: "https://www.talentify.io/job/intern-production-support-assembly-winter-2026-montreal-quebec-ca-bombardier-10069?utm_campaign=google_jobs_apply&utm_source=google_jobs_apply&utm_medium=organic",
            },
            {
              title: "Jobrapido.com",
              link: "https://ca.jobrapido.com/jobpreview/2917777272951799808?utm_campaign=google_jobs_apply&utm_source=google_jobs_apply&utm_medium=organic",
            },
          ],
          job_id:
            "eyJqb2JfdGl0bGUiOiJJbnRlcm4sIFByb2R1Y3Rpb24gc3VwcG9ydCAtIEFzc2VtYmx5IChXaW50ZXIsIDIwMjYpIiwiY29tcGFueV9uYW1lIjoiQm9tYmFyZGllciIsImFkZHJlc3NfY2l0eSI6IlNhaW50LUxhdXJlbnQsIFF1ZWJlYywgQ2FuYWRhIiwiaHRpZG9jaWQiOiJMMmVDSm01NDhFX2NqUVEwQUFBQUFBPT0iLCJ1dWxlIjoidytDQUlRSUNJR1EyRnVZV1JoIiwiaGwiOiJlbiJ9",
        };

        const wealthsimpleEntry: JobResultSchema = {
          title: "Intern, Community Management (Winter 2026)",
          company_name: "Wealthsimple",
          location: "Toronto, ON, Canada",
          via: "Lever",
          share_link:
            "https://www.google.com/search?ibp=htl;jobs&q=+internship&htidocid=FR9uCa200Y7okItuAAAAAA%3D%3D&hl=en-BR&shndl=37&shmd=H4sIAAAAAAAA_xXOsQrCMBCAYVz7CE4HLiq1LQUddBIHUVAXoWNJ65FEkruQnFAfyPe0Xf7lX77sN8uOFxKMlMOJvf-QlS_cFCmNHklg2dhpQ13VuxVs4ModJFSxN8AEZ2btcH4wIiHtyzIlV-gkSmxf9OxLJux4KN_cpSltMipicEqwrbfVUATS60WDyolJ1geHYAmeHJmEc3jcR9RIeak_DevKragAAAA&shmds=v1_AdeF8KjAD-sy_-zNeQ7pYIQh1gOPtLnyfzGaJ9mxqfTN2AeaCQ&source=sh/x/job/li/m1/1#fpstate=tldetail&htivrt=jobs&htiq=+internship&htidocid=FR9uCa200Y7okItuAAAAAA%3D%3D",
          thumbnail:
            "https://serpapi.com/searches/6919d945a0cb10ba7ed9e03a/images/02f0ff2c39edd38c5100f82ad79452ea904f7c12130ff63892b7995f4be59a21.jpeg",
          extensions: ["5 days ago", "Internship"],
          detected_extensions: {
            posted_at: "5 days ago",
            schedule_type: "Internship",
          },
          description:
            'Your career is an investment that grows over time!\n\nWealthsimple is on a mission to help everyone achieve financial freedom by reimagining what it means to manage your money. Using smart technology, we take financial services that are often confusing, opaque and expensive and make them transparent and low-cost for everyone. We’re the largest fintech company in Canada, with over 3+ million users who trust us with more than $100 billion in assets.\n\nOur teams ship often and make an impact with groundbreaking ideas. We\'re looking for talented people who keep it simple and value collaboration and humility as we continue to create inclusive and high-performing teams where people can be inspired to do their best work.\n\nInternships @ Wealthsimple\n\nAt Wealthsimple, we offer 4 to 8-month internships that are open to co-op and non-co-op students, and recent grads. During your internship, you will have the opportunity to contribute to projects that are changing the landscape of financial services for Canadians. You will be on a team that supports your growth, provides mentorship, and connects you to the broader Wealthsimple community!\n\nOur internship program follows a hybrid work model, where you’ll be working from our Toronto headquarters on Wednesdays and Thursdays. This structure offers the flexibility of remote work, while also providing the collaboration, connection, and mentorship that come from being together in person.\n\nEligibility\n\n✔ Currently enrolled as a student at a Canadian post-secondary institution or technical bootcamp\n\n✔ New graduates - Within 6 months of your graduation date\n\n✔ Available to work full-time hours\n\n✔ Residing in Canada\n\n✔ Able to commute to our Toronto HQ on Wednesdays and Thursdays\n\nAbout Wealthsimple Foundation\n\nWealthsimple Foundation is a registered charity dedicated to breaking down financial and educational barriers for youth across Canada. Through workshops, community engagement, and digital content, we help students access financial literacy tools and education funding opportunities.\n\nAbout the Role\n\nWe’re looking for a passionate and proactive Community Management Intern to support our youth engagement initiatives, social media strategy, and ambassador program. This role is ideal for someone interested in personal finance, community building, content creation, and program coordination. You’ll work closely with our team to connect with youth (ages 15-24), ensuring our digital presence and programs are engaging, inclusive, and impactful. This role is full time 35 hours per week.\n\nCommunity Engagement & Social Media\n\n• Help plan and execute digital and in-person activations, financial education workshops, and networking events (like campus tours and Foundations Day)!\n\n• Assist in planning, creating, scheduling and community management for social media content for TikTok and Instagram\n\n• Coordinate logistics for in person events including pre-event marketing, liaising with partners, set up, and feedback collection post-event\n\nWhat We\'re Looking For!\n\nHas a strong passion for community building and youth engagement.\n\n• You care about empowering youth and creating inclusive spaces for conversations about money\n\n• Experience in student leadership, volunteer work, or online community management is a plus\n\n• Strong storytelling skills with an ability to make financial and early-career topics fun and relatable\n\n• Experience in event planning and coordination is a plus\n\nLoves all things social media and has a proven ability to create content!\n\n• Operational knowledge of video editing, graphic design, or content creation tools\n\n• Love spending time on TikTok and Instagram – you know the trends, what your peers are talking about and how to connect with them\n\nA growth-minded self-starter who loves to turn ideas into action. Productive, proactive, and ready to learn.\n\n• You can take direction and start acting with minimal need for oversight\n\n• You feel ownership and responsibility for your work, and thrive balancing multiple projects simultaneously\n\n• You know the importance of executing and can be relied on by the team to meet deadlines\n\nYou can take what’s complicated and make it easy.\n\n• You want to learn to repurpose complex topics into simple, engaging and relevant content to break down barriers to access and knowledge\n\nApplication deadline: November 16th, 2025 11:59PMEST\n\nWhy Join Us?\n\n🚀 Hands-on experience in community management, event coordination, and digital engagement\n\n🌍 Opportunity to make a real impact in financial literacy for youth across Canada\n\n📈 Mentorship & career development within a mission-driven organization\n\n🎉 A fun, collaborative, and supportive team environment\n\nWhy Wealthsimple?\n\n🤑 Competitive salary with group savings matching plan using Wealthsimple for Business\n\n🌴 Generous vacation days and unlimited sick and mental health days\n\n🎉 Intern programming including educational workshops, hackathons, and mentorship\n\n🌎 A wide variety of peer and company-led Employee Resource Groups (ie. Rainbow, Women of Wealthsimple, Black @ WS)\n\n💖 Company-wide wellness days off scheduled throughout the year\n\nWhat past interns have said about their experience at Wealthsimple:\n\n"I absolutely loved the term here and had a great chance to learn new things and meet many amazingly talented people! I also really appreciated the mentorship program, having someone who was an alumni from my school+program was a great chance to learn more and help plan my career and academic journey!"\n\n"A lot of autonomy and trust from teammates; In-person office experience allowed for a lot of deeper friendships; I genuinely like the Wealthsimple product which made it very exciting to work on it"\n\n"The other interns were really a highlight as well as all of the things that y\'all planned for us. I also would say my own team really made me feel at home and welcomed. I love the codebase and engineering tools a lot and will miss it!"\n\nWith over 1,000 employees coast to coast in North America, be a part of our Canadian success story and help shape the financial future of millions — join us!\n\nRead our Culture Manual and learn more about how we work.\n\nTechnology & Innovation at Wealthsimple\n\nWe believe the future belongs to those who innovate boldly. At Wealthsimple, every team member is expected to lean into new technologies, including AI and tooling, to rethink how we work, solve problems faster, and create even greater value. We\'re looking for people who are not just comfortable with change but energized by it. Our commitment is to build a company that evolves at the pace of the world around us, and we want you to help lead that future.\n\nDEI Statement\n\nAt Wealthsimple, we are building products for a diverse world and we need a diverse team to do that successfully. We strongly encourage applications from everyone regardless of race, religion, colour, national origin, gender, sexual orientation, age, marital status, or disability status.\n\nAccessibility Statement\n\nWealthsimple provides an accessible candidate experience. If you need any accommodations or adjustments throughout the interview process and beyond, please let us know, and we will work with you to provide the necessary support and make reasonable accommodations to facilitate your participation. We are continuously working to improve our accessibility practices and welcome any feedback or suggestions on how we can better accommodate candidates with accessibility needs.',
          apply_options: [
            {
              title: "Lever",
              link: "https://jobs.lever.co/wealthsimple/9ff3e932-cdc7-4161-b4aa-29b4f58866ec?utm_campaign=google_jobs_apply&utm_source=google_jobs_apply&utm_medium=organic",
            },
            {
              title: "ZipRecruiter",
              link: "https://www.ziprecruiter.com/c/Wealthsimple/Job/Intern,-Community-Management-(Winter-2026)/-in-Toronto,ON?jid=a6204f9af1a79ba9&utm_campaign=google_jobs_apply&utm_source=google_jobs_apply&utm_medium=organic",
            },
            {
              title: "LinkedIn",
              link: "https://ca.linkedin.com/jobs/view/intern-community-management-winter-2026-at-wealthsimple-4322203830?utm_campaign=google_jobs_apply&utm_source=google_jobs_apply&utm_medium=organic",
            },
            {
              title: "Eluta.ca",
              link: "https://www.eluta.ca/spl/intern-community-management-winter-2026-09c10b2e798d0a70eb0054fc6232775c?utm_campaign=google_jobs_apply&utm_source=google_jobs_apply&utm_medium=organic",
            },
            {
              title: "Built In",
              link: "https://builtin.com/job/intern-community-management-winter-2026/7684292?utm_campaign=google_jobs_apply&utm_source=google_jobs_apply&utm_medium=organic",
            },
            {
              title: "Job Board - Communitech",
              link: "https://www1.communitech.ca/companies/wealthsimple/jobs/62041706-intern-community-management-winter-2026?utm_campaign=google_jobs_apply&utm_source=google_jobs_apply&utm_medium=organic",
            },
            {
              title: "Careers",
              link: "https://careers.base10.vc/companies/wealthsimple/jobs/62041706-intern-community-management-winter-2026?utm_campaign=google_jobs_apply&utm_source=google_jobs_apply&utm_medium=organic",
            },
          ],
          job_id:
            "eyJqb2JfdGl0bGUiOiJJbnRlcm4sIENvbW11bml0eSBNYW5hZ2VtZW50IChXaW50ZXIgMjAyNikiLCJjb21wYW55X25hbWUiOiJXZWFsdGhzaW1wbGUiLCJhZGRyZXNzX2NpdHkiOiJUb3JvbnRvLCBPTiwgQ2FuYWRhIiwiaHRpZG9jaWQiOiJGUjl1Q2EyMDBZN29rSXR1QUFBQUFBPT0iLCJ1dWxlIjoidytDQUlRSUNJR1EyRnVZV1JoIiwiaGwiOiJlbiJ9",
        };

        const bourgaultEntry: JobResultSchema = {
          title: "Software/Firmware Developer Intern",
          company_name: "Bourgault",
          location: "Montreal, QC, Canada",
          via: "Bourgault",
          extensions: ["Internship"],
          share_link:
            "https://applynow.net.au/jobs/ni/BIL202530-software-firmware-developer-intern",
          apply_options: [
            {
              title: "Bourgault",
              link: "https://applynow.net.au/jobs/ni/BIL202530-software-firmware-developer-intern",
            },
          ],
          description: `
              About Bourgault Industries 
              Bourgault Industries is a leading global manufacturer of technologically advanced seeding & tillage equipment, with R&D and manufacturing located in Saskatchewan. Our mission is to design, manufacture and distribute the highest quality, most durable, and reliable farm equipment in the world, that meets and exceeds the expectations of our valued customers.
              
              We are committed to the continuous development of our team members and innovation in developing our products. We recognize that our employees are the backbone of what we do and the important role they play in contributing to our success. 
              
              To learn more about our company, please visit our website or check out this video!
              
              About the Opportunity
              We're looking for a motivated Engineering or Computer Science student with a passion for developing innovative software solutions! The successful candidate will join our Electronics Development team in Saskatoon as a Software/Firmware Developer Intern for either a 12 or 16 month term (beginning in May 2026).  
              
              In this role, you will:
              
              Develop and debug software/firmware for desktop, mobile and embedded systems
              Support prototype assembly, testing and field validation
              Collaborate with internal teams to integrate features and resolve issues
              Write and maintain technical documentation and test procedures
              Participate in code reviews and contribute to continuous improvement
              Analyze and troubleshoot system performance and reliability
              Stay current with development tools, technologies and best practices
              Occasional travel to main production facility in St. Brieux and to various test locations may be required
              About You
              To qualify, you will need to be enrolled in a related engineering or computer science program and be eligible for your college's internship program. 
              
              The following qualifications will be needed to successfully perform this role:
              
              Educational background in Software, Computer or Electronics Engineering or Computer Science
              Proficient coding skills, including experience with C#, C, C++, Python and JavaScript
              Experience with MS Visual Studio and/or test automation
              Understanding of UI applications
              Capable of writing and executing unit and integration tests
              Strong analytical and troubleshooting skills
              Effective communication skills, with an ability to work independently or with a team
              Familiarity with agricultural control and displays would be a strong asset
              About the Benefits
              As a valued member of our team, you can look forward to competitive wages plus great benefits, including:
              
              Wages starting at $26-30 per hour (based on qualifications & experience)
              Company-wide profit-sharing plan
              Free on-site fitness center
              Comprehensive Health & Safety Program and an annual Personal Protective Equipment allowance
              Regular staff BBQs, holiday parties, and employee appreciation events!
              If you are a critical thinker looking for a challenging role within an innovative team - apply now!
              
              *Please apply early; the position may be filled before the deadline. Thank you!`,
          detected_extensions: {
            posted_at: "Internship",
            schedule_type: "Internship",
          },
          job_id:
            "eyJqb2JfdGl0bGUiOiJJbnRlcm4sIFByb2R1Y3Rpb24gc3VwcG9ydCAtIEFzc2VtYmx5IChXaW50ZXIsIDIwMjYpIiwiY29tcGFueV9uYW1lIjoiQm9tYmFyZGllciIsImFkZHJlc3NfY2l0eSI6IlNhaW50LUxhdXJlbnQsIFF1ZWJlYywgQ2FuYWRhIiwiaHRpZG9jaWQiOiJMMmVDSm01NDhFX2NqUVEwQUFBQUFBPT0iLCJ1dWxlIjoidytDQUlRSUNJR1EyRnVZV1JoIiwiaGwiOi203498089",
        };

        const betterData = [
          bombardierEntry,
          bourgaultEntry,
          wealthsimpleEntry,
          ...parsedResults.data.filter(
            (t) =>
              t.company_name !== "Bombardier" &&
              t.company_name !== "Wealthsimple",
          ),
        ];

        return Response.json(betterData, CORS_HEADERS);
      },
    },

    "/api/application/list": {
      GET: async () => {
        console.log(applications);
        return Response.json(applications, CORS_HEADERS);
      },
    },

    "/api/ws": {
      GET: async (req, server) => {
        server.upgrade(req);
      },
    },
  },

  websocket: {
    message(ws, message) {
      // console.log("received message", message);
      const parsed = WebSocketMessageSchema.safeParse(
        JSON.parse(message as string),
      );
      if (!parsed.success) {
        console.log("failed to parse message", parsed.error.issues);
        return;
      }
      console.log(parsed.data.type);

      switch (parsed.data.type) {
        case "application/add": {
          const links = z
            .object({
              profileId: z.number(),
              jobs: z.array(JobResultSchema),
            })
            .safeParse(parsed.data.data);

          if (!links.success) {
            console.log("failed to parse links", links.error.issues);
            return;
          }

          applications = [
            ...applications,
            ...links.data.jobs.map(
              (t) =>
                ({
                  job: t,
                  profileId: links.data.profileId,
                  sessionId: "asdf",
                  startDate: new Date().toISOString(),
                  status: "pending",
                }) as const,
            ),
          ];

          const msg: Action = {
            type: "setApplications",
            applications,
          };
          console.log("msg:", msg);
          ws.send(JSON.stringify(msg));
        }
      }
    },

    open(ws) {
      console.log("open", ws);
    },
  },
});

console.log(`Server started on port ${server.port}`);
