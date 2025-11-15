import "dotenv/config";
import { Page, Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";
import { JobSchema, ApplicantProfile } from "../types.js";
import { convertToURLGoogleSearch } from "../utils/utils.js";

let BROWSERBASE_PROJECT_ID: string;
let BROWSERBASE_API_KEY: string;
let GOOGLE_GENERATIVE_AI_API_KEY: string;
try {
  BROWSERBASE_PROJECT_ID = process.env.BROWSERBASE_PROJECT_ID!;
  BROWSERBASE_API_KEY = process.env.BROWSERBASE_API_KEY!;
  GOOGLE_GENERATIVE_AI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY!;
} catch (e) {
  throw new Error(
    "BROWSERBASE_PROJECT_ID and BROWSERBASE_API_KEY must be set in environment variables to run this example. Please check your .env file."
  );
}

const stagehand = new Stagehand({
  env: "LOCAL",
  apiKey: GOOGLE_GENERATIVE_AI_API_KEY,
  model: "google/gemini-2.0-flash-exp",
});

const RELEVANT_KEYWORDS = [
  "software engineer",
  "software engineering",
  "swe",
  "software developer",
  "software development",
  "devops",
  "full-stack",
  "full stack",
  "backend",
  "back-end",
];

const INTERN_KEYWORDS = ["intern", "internship", "co-op", "coop"];

const JOB_BOARDS = [
  "https://www.linkedin.com/jobs",
  "https://www.indeed.com",
  "https://angel.co/jobs",
];

async function findCareerPage(
  company: string,
  stagehand: Stagehand,
  page: Page
) {
  try {
    // Navigate to Google search for the company's careers page
    const query = `${company} careers page`;
    const url = convertToURLGoogleSearch(query);

    try {
      await page.goto(url, { waitUntil: "networkidle" });
    } catch (gotoError) {
      console.warn(
        `⚠️ Timeout waiting for Google search, continuing anyway...`
      );
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    // Find and click the first search result that is the company's careers page
    const actions = await stagehand.observe(
      `Click on the first search result that is the careers page for ${company}. Look for links that contain the company name and words like "careers", "jobs", or "join us".`
    );

    if (actions.length > 0) {
      // Click on the first matching search result
      await stagehand.act(actions[0]);

      // Wait for the page to fully load with timeout handling
      try {
        await page.waitForLoadState("networkidle", 10000);
      } catch (waitError) {
        console.warn(
          `⚠️ Timeout waiting for page to reach networkidle, continuing anyway...`
        );
        // Give it a bit more time for any pending resources
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }

      // Return the URL of the careers page we just navigated to
      const careerPageURL = page.url();
      console.log(`✓ Found careers page for ${company}: ${careerPageURL}`);
      return careerPageURL;
    }

    console.warn(`⚠️ Could not find careers page link for ${company}`);
    return undefined;
  } catch (error) {
    console.error(
      `❌ Error in findCareerPage for ${company}: ${(error as Error).message}`
    );
    return undefined;
  }
}

async function findSpecificJobOnCareerPage(
  job: JobSchema,
  stagehand: Stagehand,
  page: Page
): Promise<boolean> {
  const MAX_PAGINATION_PAGES = 5;
  let currentPage = 0;

  console.log(`\n🔍 Searching for job: "${job.title}" at ${job.company}`);

  if (!job.applyUrl) {
    console.warn(`⚠️ No career page URL provided for ${job.title}`);
    return false;
  }

  try {
    // Navigate to the career page
    await page.goto(job.applyUrl, { waitUntil: "networkidle" });

    while (currentPage < MAX_PAGINATION_PAGES) {
      currentPage++;
      console.log(`   Scanning page ${currentPage}/${MAX_PAGINATION_PAGES}...`);

      // Look for the specific job on the current page
      const jobListingActions = await stagehand.observe(
        `Find and click on the job listing for the position "${job.title}" ${
          job.description
            ? `with description containing "${job.description.substring(
                0,
                100
              )}"`
            : ""
        }. Look for job cards, job titles, or job links that match this position.`
      );

      if (jobListingActions.length > 0) {
        console.log(`   ✓ Found job listing on page ${currentPage}`);
        // Click on the job listing to open details
        await stagehand.act(jobListingActions[0]);
        try {
          await page.waitForLoadState("networkidle", 10000);
        } catch {
          console.warn(`   ⚠️ Timeout waiting for job details, continuing...`);
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
        console.log(`   ✓ Opened job details page`);
        return true;
      }

      // If not found, try to find pagination button
      if (currentPage < MAX_PAGINATION_PAGES) {
        console.log(
          `   Job not found on page ${currentPage}, checking for next page...`
        );

        const paginationActions = await stagehand.observe(
          `Find and click the "Next" button or pagination button to go to the next page of job listings. Look for buttons with text like "Next", "Next Page", "→", or page numbers.`
        );

        if (paginationActions.length > 0) {
          console.log(`   → Moving to next page...`);
          await stagehand.act(paginationActions[0]);
          // Wait for the page to load
          try {
            await page.waitForLoadState("networkidle", 10000);
          } catch {
            console.warn(`   ⚠️ Timeout waiting for pagination, continuing...`);
          }
          // Add a small delay to ensure content is loaded
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          console.log(`   ℹ️ No more pages available`);
          break;
        }
      }
    }

    console.warn(
      `⚠️ Could not find job "${job.title}" after searching ${currentPage} page(s)`
    );
    return false;
  } catch (error) {
    console.error(
      `❌ Error searching for job "${job.title}":`,
      (error as Error).message
    );
    return false;
  }
}

async function fillApplicationForm(
  job: JobSchema,
  applicantProfile: ApplicantProfile,
  stagehand: Stagehand,
  page: Page
): Promise<"submitted" | "failed" | "partial"> {
  console.log(
    `\n📝 Starting application form for: "${job.title}" at ${job.company}`
  );

  try {
    // Prepare applicant information as a context string for the agent
    const applicantContext = `
      APPLICANT INFORMATION:
      Name: ${applicantProfile.firstName} ${applicantProfile.lastName}
      Email: ${applicantProfile.email}
      Phone: ${applicantProfile.phone}
      Location: ${applicantProfile.location}
      City: ${applicantProfile.city}
      State: ${applicantProfile.state || "N/A"}
      Country: ${applicantProfile.country}
      Postal Code: ${applicantProfile.postalCode || "N/A"}

      LinkedIn: ${applicantProfile.linkedin || "N/A"}
      GitHub: ${applicantProfile.github || "N/A"}
      Portfolio: ${applicantProfile.portfolio || "N/A"}
      Website: ${applicantProfile.website || "N/A"}

      WORK EXPERIENCE:
      ${applicantProfile.workExperience
        .map(
          (exp, idx) => `
      ${idx + 1}. ${exp.role} at ${exp.company}
        Duration: ${exp.startDate} - ${exp.endDate || "Present"}
        Responsibilities: ${exp.responsibilities.join("; ")}`
        )
        .join("\n")}

      EDUCATION:
      ${applicantProfile.education
        .map(
          (edu, idx) => `
      ${idx + 1}. ${edu.degree} in ${edu.field}
        Institution: ${edu.institution}
        Graduation: ${edu.graduationDate}
        GPA: ${edu.gpa || "N/A"}`
        )
        .join("\n")}

      TECHNICAL SKILLS:
      ${applicantProfile.technicalSkills.join(", ")}

      SOFT SKILLS:
      ${applicantProfile.softSkills.join(", ")}

      PROJECTS:
      ${applicantProfile.projects
        .map(
          (proj, idx) => `
      ${idx + 1}. ${proj.name}
        Description: ${proj.description}
        Technologies: ${proj.technologies.join(", ")}
        Link: ${proj.link || "N/A"}
        Period: ${proj.startDate || "N/A"} - ${proj.endDate || "N/A"}`
        )
        .join("\n")}

      ADDITIONAL INFORMATION:
      Cover Letter: ${applicantProfile.coverLetter || "N/A"}
      Availability: ${applicantProfile.availability || "N/A"}
      Work Authorization: ${applicantProfile.workAuthorization || "N/A"}
      Requires Sponsorship: ${
        applicantProfile.requiresSponsorship ? "Yes" : "No"
      }
      Willing to Relocate: ${applicantProfile.willingToRelocate ? "Yes" : "No"}
      Expected Salary: ${applicantProfile.expectedSalary || "N/A"}
      Notice Period: ${applicantProfile.noticePeriod || "N/A"}
      Resume Path: ${applicantProfile.resumePath}
    `;

    console.log(`   🤖 Using AI agent to fill out application form...`);

    // Use Stagehand's agent to intelligently fill out the form
    const agent = stagehand.agent({
      systemPrompt: `You are an AI assistant helping to fill out job application forms. You have access to the applicant's complete information.

      ${applicantContext}

      Your task is to:
      1. Fill out ALL form fields on the page using the applicant information provided above
      2. Handle any type of field: text inputs, dropdowns, checkboxes, textareas, etc.
      3. For file upload fields (resume/CV), note them but skip them (they will be handled separately)
      4. Navigate through multi-step forms by clicking "Next" or "Continue" buttons
      5. IMPORTANT: When you encounter a "Submit" or "Submit Application" button, DO NOT CLICK IT. Instead, report that you've reached the final submission page.
      6. Be intelligent about matching form field labels to the applicant data - use context to determine the best value to fill
      7. For unexpected questions, use your best judgment based on the applicant's profile and the context of the question

      Remember: Fill out everything EXCEPT the final submit button. Stop when you reach the submit button and report success.`,
    });

    // Execute the agent to fill the form
    const result = await agent.execute(
      `Fill out this job application form completely using the applicant information provided. Navigate through all form steps, but DO NOT click the final "Submit" button. Stop when you see the submit button and report that you've completed filling the form.`
    );

    console.log(`   Agent Result: ${JSON.stringify(result, null, 2)}`);

    // Check if we've reached the submit button
    const hasSubmitButton = await stagehand.observe(
      `Find the final "Submit" or "Submit Application" button. Look for buttons with text like "Submit", "Submit Application", "Send Application", "Complete Application", or similar final submission buttons.`
    );

    if (hasSubmitButton.length > 0) {
      console.log(
        `   ✓ Application form completed - reached submit button (not clicked)`
      );
      return "submitted";
    }

    // If agent completed but no submit button found, check the page state
    const pageState = await stagehand.extract(
      `What is the current state of this page? Is it:
      1. A form with more fields to fill
      2. A final submission page with a submit button
      3. A confirmation page showing the application was submitted
      4. Something else`,
      z.object({
        state: z.string(),
        hasFormFields: z.boolean(),
        hasSubmitButton: z.boolean(),
      })
    );

    console.log(`   Page State: ${pageState.state}`);

    if (pageState.hasSubmitButton) {
      console.log(
        `   ✓ Application form completed - submit button available (not clicked)`
      );
      return "submitted";
    } else if (pageState.hasFormFields) {
      console.log(
        `   ⚠️ Form still has fields - agent may not have completed all steps`
      );
      return "partial";
    } else {
      console.log(`   ℹ️ Uncertain page state, assuming partial completion`);
      return "partial";
    }
  } catch (error) {
    console.error(
      `   ❌ Error filling application form: ${(error as Error).message}`
    );
    return "failed";
  }
}

async function applyToJobs(
  jobs: JobSchema[],
  applicantProfile: ApplicantProfile,
  stagehand: Stagehand,
  page: Page
): Promise<{
  applied: number;
  failed: number;
  skipped: number;
  results: Array<{
    job: JobSchema;
    status: "applied" | "failed" | "skipped";
    reason?: string;
  }>;
}> {
  const results: Array<{
    job: JobSchema;
    status: "applied" | "failed" | "skipped";
    reason?: string;
  }> = [];

  let applied = 0;
  let failed = 0;
  let skipped = 0;

  console.log(`\n${"=".repeat(60)}`);
  console.log(`🚀 Starting job application automation`);
  console.log(`   Total jobs to process: ${jobs.length}`);
  console.log(`${"=".repeat(60)}\n`);

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    console.log(
      `\n[${i + 1}/${jobs.length}] Processing: "${job.title}" at ${job.company}`
    );

    // Check if job has a career page URL
    if (!job.applyUrl) {
      console.warn(`⊘ Skipping - No career page URL available`);
      skipped++;
      results.push({
        job,
        status: "skipped",
        reason: "No career page URL",
      });
      continue;
    }

    try {
      // Step 1: Find the specific job on the career page
      const jobFound = await findSpecificJobOnCareerPage(job, stagehand, page);

      if (!jobFound) {
        console.warn(`⊘ Skipping - Could not locate job on career page`);
        skipped++;
        results.push({
          job,
          status: "skipped",
          reason: "Job not found on career page",
        });
        continue;
      }

      // Step 2: Look for the apply button and click it
      console.log(`   Looking for apply button...`);
      const applyButtonActions = await stagehand.observe(
        `Find and click the "Apply" button for this job. Look for buttons with text like "Apply", "Apply Now", "Submit Application", "Easy Apply", or similar.`
      );

      if (applyButtonActions.length === 0) {
        console.warn(`⊘ Skipping - No apply button found`);
        skipped++;
        results.push({
          job,
          status: "skipped",
          reason: "No apply button found",
        });
        continue;
      }

      console.log(`   ✓ Found apply button, clicking...`);
      await stagehand.act(applyButtonActions[0]);

      // Wait for application page to load
      try {
        await page.waitForLoadState("networkidle", 5000);
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      // Step 3: Fill out the application form
      const applicationStatus = await fillApplicationForm(
        job,
        applicantProfile,
        stagehand,
        page
      );

      if (applicationStatus === "submitted") {
        console.log(
          `✅ Successfully applied to "${job.title}" at ${job.company}`
        );
        applied++;
        results.push({
          job,
          status: "applied",
        });
      } else if (applicationStatus === "partial") {
        console.warn(`⚠️ Partially completed application for "${job.title}"`);
        failed++;
        results.push({
          job,
          status: "failed",
          reason: "Form partially completed",
        });
      } else {
        console.error(`❌ Failed to apply to "${job.title}"`);
        failed++;
        results.push({
          job,
          status: "failed",
          reason: "Form submission failed",
        });
      }

      // Add delay between applications to avoid rate limiting
      if (i < jobs.length - 1) {
        const delay = 3000 + Math.random() * 2000; // 3-5 seconds
        console.log(
          `   ⏳ Waiting ${Math.round(
            delay / 1000
          )}s before next application...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    } catch (error) {
      console.error(
        `❌ Unexpected error processing "${job.title}": ${
          (error as Error).message
        }`
      );
      failed++;
      results.push({
        job,
        status: "failed",
        reason: (error as Error).message,
      });
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`📊 Application Summary`);
  console.log(`${"=".repeat(60)}`);
  console.log(`   ✅ Successfully applied: ${applied}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   ⊘ Skipped: ${skipped}`);
  console.log(`   📝 Total processed: ${jobs.length}`);
  console.log(`${"=".repeat(60)}\n`);

  return {
    applied,
    failed,
    skipped,
    results,
  };
}

async function getJobsFromJobBoard(
  jobBoard: string,
  jobBoardURL: string,
  stagehand: Stagehand,
  page: Page
) {
  let jobs: JobSchema[] = [];
  try {
    // 1. Navigate to the job board page
    await page.goto(jobBoardURL, { waitUntil: "networkidle" });

    // 2. Find the first 3 job listing cards/containers on this page
    const [jobCards] = await stagehand.observe(
      "Find the first 3 job listing cards/containers on this page"
    );

    // 3. Extract the data from those cards
    const jobData = await stagehand.extract(
      "Extract the job title, company name, and location from the first 3 job listing cards/containers on this page",
      z.object({
        jobs: z.array(JobSchema),
      })
    );
    console.log("\n\n\n\n\n\n\nJob data:");
    console.log(JSON.stringify(jobData.jobs, null, 2));
    jobs = jobData.jobs;

    for (const job of jobs) {
      console.log(
        `\n🔍 Searching for career page for: ${job.title} at ${job.company}`
      );

      // Instead of clicking Indeed's apply button, directly search for the company's career page
      const careerPageURL = await findCareerPage(job.company, stagehand, page);

      if (careerPageURL) {
        job.applyUrl = careerPageURL;
        console.log(`✓ Found career page: ${careerPageURL}`);
      } else {
        console.warn(
          `⚠️ Could not find career page for ${job.company}, skipping this job`
        );
      }

      // Return to job board to process next job
      try {
        await page.goto(jobBoardURL, { waitUntil: "networkidle" });
      } catch (gotoError) {
        console.warn(`⚠️ Timeout returning to job board, continuing anyway...`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    return jobs;
  } catch (error) {
    console.error("Error getting one job:", error);
    throw error;
  }
}

async function getJobPostings(jobBoardURL: string, page: Page) {
  const jobs: JobSchema[] = [];
  try {
    await page.goto(jobBoardURL, { waitUntil: "networkidle" });

    const jobs = await stagehand.extract(
      `Extract all job listings on this page. For each job, get:
        - Job title
        - Company name
        - Location (if available)
        - A brief description or job type
        Focus on finding intern or internship positions related to software engineering, development, devops, full-stack, or backend roles.`,
      z.object({
        jobs: z.array(JobSchema),
      })
    );

    const relevantJobs = jobs.jobs.filter((job) => {
      const titleLower = job.title.toLowerCase();
      const descLower = (job.description || "").toLowerCase();
      const combinedText = titleLower + " " + descLower;

      // Check if it's an intern position
      const isIntern = INTERN_KEYWORDS.some((keyword) =>
        combinedText.includes(keyword)
      );

      // Check if it's a relevant tech role
      const isRelevantRole = RELEVANT_KEYWORDS.some((keyword) =>
        combinedText.includes(keyword)
      );

      return isIntern && isRelevantRole;
    });

    const jobsWithLinks = [];

    for (const job of relevantJobs) {
      if (job.applyUrl) {
        try {
          const [applyButton] = await stagehand.observe(
            `Find the apply button or link for the job titled "${job.title}" at ${job.company}. Look for buttons or links with text like "Apply", "Apply Now", "Easy Apply", "Quick Apply", or similar.`
          );

          if (applyButton) {
            let applyUrl = null;

            if (applyButton.selector) {
              // await stagehand.act(applyButton.selector);
              applyUrl = await stagehand.extract(
                `Extract the URL from the apply button or link for the job titled "${job.title}" at ${job.company}.`
              );
            }

            jobsWithLinks.push({
              ...job,
              applyUrl: applyUrl || "Found but URL extraction failed",
              applyButtonSelector: applyButton.selector,
            });

            console.log(
              `✓ Found apply link for: ${job.title} at ${job.company}`
            );
          }
        } catch (error) {}
      }
    }
    await stagehand.close();
    return jobsWithLinks;
  } catch (error) {
    console.error("Error initializing Stagehand:", error);
    throw error;
  } finally {
    await stagehand.close();
  }
}

async function main() {
  const stagehand = new Stagehand({
    env: "LOCAL",
    model: "google/gemini-2.0-flash-lite",
  });

  try {
    await stagehand.init();

    console.log(`Stagehand Session Started`);
    console.log(
      `Watch live: https://browserbase.com/sessions/${stagehand.browserbaseSessionId}`
    );

    const page = stagehand.context.pages()[0];

    const url =
      "https://ca.indeed.com/jobs?q=software&l=Canada&sc=0kf%3Aattr%28VDTG7%29%3B&from=searchOnDesktopSerp&cf-turnstile-response=0.jJkCaq4LJ5ztCbxHrL_bf29njqxnn1cM1Iy9rt1r0YqA0U0j3Wlb0ay9tUSQwLZyaTsug040eQQdJhqe-7dFQAmOjmHBenGm3THS-KiUjlnZeDyk64ib96n3j0Bha2Bd-SSStwAnAhyhb2S5kIRsou5tP3xZw1xfq7IGv2pt0Rj2Qin9qAXQGrKEyIULhlscHdLGhyNGNb8ZHWBDfT7Zz4glnWeohsOS-BsDvMqo-u9cjb3q18M7ncZgMnrjUSGz4Aak6TzQSy1f5rl3unSYE6kbO8a8u9NxTvcPfPHRA2LChsxfL5oEKM9x0H2bdpb5N8irVL0gdg8_BaXxEl5C7kFMGOdupSxylFTcvMdnLiO6n4tQmVf-bFtyftvAszXw_bxqdzwdyKRcEAw6WHcWBz_eGDjEKLGQVb7rJxjzGn-x029Nzl2lkn8AJtICEZLnFn0jhOG8b-4s1oAVuv2K4xI9Zj3hXB8a_jIpmW66KZS90kMN73NQY9oHeMFcSVyN4Mod0M47Dj2zpffpbNvM4z07MCOCj36-WJyGn36oO5ImMKjoah7wPfJroAN9TZ2gAeYcPumoFStitJhE58yql7p-tzLGTCgDz7Dzct9akDhGTXtkULGZsZIP_e0OZFMU3ZOmpMFrnG1Re5paz7j2yz-SlrV8Aqmcl_m-WnCYt-Q0_f0799_ZCelbecKSZVRg6AUknClFKHRR3tMDYLXYo4zZdkxRemJ9vS1tyqN3xU-As9k-KJHqLWiEYJn-eAE-qpC_8dLGyA_YGcXPkiTB98MLzLtv0WbptpS7KM8RoG-J7pGOwFmpyqlD6ZFCOtk5i0wKZLjFvTPtDsCt1QnRuCuIEuSrWmDfzFAoY71icR_sfPwI2dunz4-lldDHTE1LUjKY47gSW8bZBOAYniwW6_txkFABYrqSlRatbPCSarhJtH94h2gf-VJiSdn-sm-q.ZehbZpPgE7bqFbo2nRfR-A.b3956a71a9ba12ecf83c7b3fa57c8335fd127669da55eb5703bfd6fa52163bfb&vjk=76a942e318581cd4&advn=1606445599330783";

    // Step 1: Collect jobs from job board
    console.log("\n🔎 Phase 1: Collecting jobs from job board...\n");
    const jobs = await getJobsFromJobBoard("indeed", url, stagehand, page);
    console.log(`\n✓ Collected ${jobs.length} jobs from job board`);
    console.log(JSON.stringify(jobs, null, 2));

    // Step 2: Filter jobs that have career page URLs
    const jobsWithCareerPages = jobs.filter((job) => job.applyUrl);
    console.log(
      `\n✓ Found ${jobsWithCareerPages.length} jobs with career page URLs`
    );

    if (jobsWithCareerPages.length === 0) {
      console.log("\n⚠️ No jobs with career page URLs found. Exiting...");
      return;
    }

    // Step 3: Apply to jobs using the applicant profile
    console.log("\n🚀 Phase 2: Starting automated job applications...\n");
    const applicationResults = await applyToJobs(
      jobsWithCareerPages,
      APPLICANT_PROFILE,
      stagehand,
      page
    );

    // Step 4: Display detailed results
    console.log("\n📋 Detailed Results:\n");
    for (const result of applicationResults.results) {
      const statusIcon =
        result.status === "applied"
          ? "✅"
          : result.status === "skipped"
          ? "⊘"
          : "❌";
      console.log(
        `${statusIcon} ${result.job.title} at ${
          result.job.company
        } - ${result.status.toUpperCase()}`
      );
      if (result.reason) {
        console.log(`   Reason: ${result.reason}`);
      }
    }

    console.log("\n✅ Job application automation completed!");
  } catch (error) {
    console.error("Detailed error:", error);
    throw error;
  } finally {
    await stagehand.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
