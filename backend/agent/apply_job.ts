import { Page, Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";
import { JobSchema, ApplicantProfile } from "../types.js";

async function findSpecificJobOnCareerPage(
  job: JobSchema,
  stagehand: Stagehand,
  page: Page
): Promise<boolean> {
  const MAX_PAGINATION_PAGES = 5;
  let currentPage = 0;

  console.log(`\nSearching for job: "${job.title}" at ${job.company}`);

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
  const MAX_ITERATIONS = 50;
  let iteration = 0;

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
Requires Sponsorship: ${applicantProfile.requiresSponsorship ? "Yes" : "No"}
Willing to Relocate: ${applicantProfile.willingToRelocate ? "Yes" : "No"}
Expected Salary: ${applicantProfile.expectedSalary || "N/A"}
Notice Period: ${applicantProfile.noticePeriod || "N/A"}
Resume Path: ${applicantProfile.resumePath}
`;

    console.log(
      `   🤖 Using AI agent to fill out application form iteratively...`
    );

    // Use Stagehand's agent to intelligently fill out the form
    const agent = stagehand.agent({
      systemPrompt: `You are an AI assistant helping to fill out job application forms. You have access to the applicant's complete information.

${applicantContext}

Your task is to fill out form fields ONE AT A TIME. For each field you encounter:
1. Identify the field label/question
2. Determine the appropriate value from the applicant information above
3. Fill the field with that value
4. For unexpected questions, use your best judgment based on the applicant's profile
5. For file upload fields (resume/CV), skip them (they will be handled separately)
6. After filling a field, move to the next empty field
7. When all fields on the current page are filled, look for a "Next" or "Continue" button and click it
8. IMPORTANT: When you see a "Submit" or "Submit Application" button, DO NOT CLICK IT. Instead, report that you've reached the final submission page.

Work methodically: fill one field, then move to the next. Be thorough and fill every field you can.`,
    });

    // Iteratively fill fields one by one
    while (iteration < MAX_ITERATIONS) {
      iteration++;
      console.log(`   📋 Iteration ${iteration}: Processing form fields...`);

      // Check if we've reached the submit button
      const submitButtonCheck = await stagehand.observe(
        `Find the final "Submit" or "Submit Application" button. Look for buttons with text like "Submit", "Submit Application", "Send Application", "Complete Application", or similar final submission buttons.`
      );

      if (submitButtonCheck.length > 0) {
        console.log(
          `   ✓ Application form completed - reached submit button (not clicked)`
        );
        return "submitted";
      }

      // Use agent to fill the next field or navigate
      const result = await agent.execute({
        instruction: `Look at the current page. Find the next empty form field that needs to be filled. Fill it out using the applicant information provided. If all fields on this page are filled, look for a "Next" or "Continue" button and click it to proceed to the next step. DO NOT click any "Submit" button.`,
        highlightCursor: true,
      });

      console.log(`   Agent action completed`);

      // Wait a bit for the page to update
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check if there are still empty fields or if we need to navigate
      const pageState = await stagehand.extract(
        `Analyze the current page. Are there:
        1. Empty form fields that still need to be filled?
        2. A "Next" or "Continue" button to proceed?
        3. A "Submit" button (final step)?
        4. No more fields and no navigation buttons?`,
        z.object({
          hasEmptyFields: z.boolean(),
          hasNextButton: z.boolean(),
          hasSubmitButton: z.boolean(),
          isComplete: z.boolean(),
        })
      );

      if (pageState.hasSubmitButton) {
        console.log(
          `   ✓ Application form completed - submit button available (not clicked)`
        );
        return "submitted";
      }

      if (pageState.isComplete && !pageState.hasNextButton) {
        console.log(`   ✓ All fields filled, form appears complete`);
        return "submitted";
      }

      // If no empty fields but there's a next button, the agent should have clicked it
      // Continue to next iteration
      if (!pageState.hasEmptyFields && pageState.hasNextButton) {
        console.log(`   → Moving to next form step...`);
        continue;
      }

      // If there are still empty fields, continue filling
      if (pageState.hasEmptyFields) {
        console.log(`   → More fields to fill, continuing...`);
        continue;
      }

      // If we're stuck, break
      console.log(`   ⚠️ No clear action available, checking status...`);
      break;
    }

    // Final check for submit button
    const finalSubmitCheck = await stagehand.observe(
      `Find the final "Submit" or "Submit Application" button.`
    );

    if (finalSubmitCheck.length > 0) {
      console.log(
        `   ✓ Application form completed - reached submit button (not clicked)`
      );
      return "submitted";
    }

    console.log(`   ⚠️ Reached maximum iterations (${MAX_ITERATIONS})`);
    return "partial";
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

export { applyToJobs };
