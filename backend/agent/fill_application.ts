import { Page, Stagehand } from "@browserbasehq/stagehand";
import { ApplicantProfile, JobSchema } from "../types.js";

export async function fillApplicationForm(
  applicantProfile: ApplicantProfile,
  stagehand: Stagehand,
  page: Page,
): Promise<"submitted" | "failed" | "partial"> {
  try {
    // Prepare applicant information as a context string for the agent
    console.log("Filling application form for ", page.url());
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
        Responsibilities: ${exp.responsibilities.join("; ")}`,
          )
          .join("\n")}

        EDUCATION:
        ${applicantProfile.education
          .map(
            (edu, idx) => `
        ${idx + 1}. ${edu.degree} in ${edu.field}
        Institution: ${edu.institution}
        Graduation: ${edu.graduationDate}
        GPA: ${edu.gpa || "N/A"}`,
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
        Period: ${proj.startDate || "N/A"} - ${proj.endDate || "N/A"}`,
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
    const MAX_ITERATIONS = 50;
    let iteration = 0;
    let consecutiveFailures = 0;

    while (iteration < MAX_ITERATIONS) {
      iteration++;

      await page.waitForLoadState("domcontentloaded", 1000).catch(() => {});
      const errors = await stagehand.observe(
        "Find any error messages or validation warnings",
      );
      if (errors.length > 0) {
        console.log("Validation errors found:", errors);
        // Handle errors
        consecutiveFailures++;
        if (consecutiveFailures > 3) {
          console.error("Too many validation errors, exiting");
          return "failed";
        }
        // Try to find and correct the invalid field
        await agent.execute({
          instruction:
            "Fix the validation error by re-entering the correct value",
          maxSteps: 3,
        });
        continue;
      }

      // skip sign in pages
      const isSignInPage = await stagehand.observe(
        "Check if sign-in is REQUIRED to proceed (not optional 'Save progress')",
      );
      if (isSignInPage.length > 0) {
        console.log("Redirected to sign-in page, cannot proceed further.");
        return "failed";
      }

      // terms and conditions
      const terms = await stagehand.observe(
        "Find unchecked terms and conditions or consent checkboxes",
      );
      if (terms.length > 0) {
        for (const term of terms) {
          await stagehand.act(term);
        }
      }

      // captcha
      const captcha = await stagehand.observe(
        "Detect if there's a CAPTCHA challenge or Human Check on the page",
      );
      if (captcha.length > 0) {
        console.log("CAPTCHA detected, cannot proceed further.");
        return "partial";
      }

      const resumeUpload = await stagehand.observe(
        "Find required resume/CV upload field",
      );
      if (resumeUpload.length > 0) {
        await agent.execute({
          instruction:
            "Upload the applicant's resume to the resume upload field.",
          maxSteps: 2,
        });
      }

      const fields = await stagehand.observe(
        "Find all unfilled form inputs, selects, checkboxes, radio buttons",
      );
      if (fields.length === 0) {
        // all fields are filled, find next or submit button
        const nextButton = await stagehand.observe(
          "Find next/continue button.",
        );
        const submitButton = await stagehand.observe(
          "Find final submit button.",
        );

        if (submitButton.length > 0) {
          console.log(
            "Application completed - reached submit button (not clicked)",
          );
          return "submitted";
        }
        if (nextButton.length > 0) {
          await stagehand.act(nextButton[0]);
          await page.waitForLoadState("networkidle", 2000);
          consecutiveFailures = 0;
          iteration = 0;
          continue;
        }
        consecutiveFailures++;
      } else {
        consecutiveFailures = 0;
        const result = await agent.execute({
          instruction: `Fill the next empty field.`,
          maxSteps: 5,
          highlightCursor: true,
        });
        await page.waitForLoadState("networkidle", 2000);
        if (result.success === false) {
          consecutiveFailures++;
        }
      }
      if (consecutiveFailures > 3) {
        return "partial";
      }
    }
    return "partial";
  } catch (error: Error | any) {
    console.error(`Error: ${error.message}`);
    // Take screenshot for debugging
    await page.screenshot({
      path: `error-${Date.now()}.png`,
    });
    return "failed";
  }
}
