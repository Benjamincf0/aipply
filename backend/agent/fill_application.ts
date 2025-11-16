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
      systemPrompt: `You are an AI assistant helping to fill out job application forms. 

        IMPORTANT: Use the applicant information provided below to fill form fields. Match the field label/question to the appropriate data.

        ${applicantContext}

        RULES:
        1. Always use actual values from the applicant information above - NEVER use placeholder text like "string"
        2. Match form field labels to the appropriate applicant data (e.g., "First Name" → "${applicantProfile.firstName}")
        3. For dropdown/select fields, choose the option that best matches the applicant's data
        4. For yes/no questions, use your best judgment based on the applicant's profile
        5. For file uploads, skip them (handled separately)
        6. Fill each field with real, specific information from the applicant profile

        Work methodically and accurately.`,
    });
    const MAX_ITERATIONS = 100;
    let iteration = 0;
    let consecutiveFailures = 0;
    let consecutiveNoFieldsFound = 0;

    const applyButton = await stagehand.observe(
      "Find any 'Apply' or 'Postuler'button. Ignore 'Apply to Indeed' or 'Apply with LinkedIn' buttons.",
    );
    if (applyButton.length > 0) {
      console.log("Found apply button, clicking...");
      await stagehand.act(applyButton[0]);
      await page
        .waitForLoadState("networkidle", { timeout: 10000 })
        .catch(() => {
          console.log("Initial page load timeout (continuing anyway)");
        });
      // Give the page a moment to settle after clicking apply
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    while (iteration < MAX_ITERATIONS) {
      iteration++;

      await page
        .waitForLoadState("domcontentloaded", { timeout: 5000 })
        .catch(() => {});
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
            "Fix the validation error by re-entering the correct value from the applicant information. Use the actual applicant data, not placeholder text.",
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
        "Find all empty or unfilled text inputs, text areas, dropdowns, and radio buttons that need to be filled",
      );
      console.log(
        `Iteration ${iteration}: Found ${fields.length} unfilled fields`,
      );

      if (fields.length === 0) {
        // all fields are filled, find next or submit button
        console.log(
          "No unfilled fields found, looking for next/submit button...",
        );
        consecutiveNoFieldsFound++;

        const nextButton = await stagehand.observe(
          "Find next/continue button.",
        );
        const submitButton = await stagehand.observe(
          "Find final submit button.",
        );

        console.log(
          `Found ${submitButton.length} submit buttons, ${nextButton.length} next buttons`,
        );

        if (submitButton.length > 0) {
          console.log(
            "Application completed - reached submit button (not clicked)",
          );
          return "submitted";
        }
        if (nextButton.length > 0) {
          console.log("Clicking next button...");
          await stagehand.act(nextButton[0]);
          await page
            .waitForLoadState("networkidle", { timeout: 10000 })
            .catch(() => {
              console.log("Next page load timeout (continuing anyway)");
            });
          consecutiveFailures = 0;
          consecutiveNoFieldsFound = 0;
          iteration = 0;
          continue;
        }

        // If no fields, no next button, and no submit button for multiple iterations, likely stuck
        if (consecutiveNoFieldsFound > 5) {
          console.log(
            "No fields or buttons found for multiple iterations, likely completed or stuck",
          );
          return "partial";
        }
        console.log("No next/submit buttons found, will retry...");
        // Wait a bit for page to load
        await new Promise((resolve) => setTimeout(resolve, 1000));
        consecutiveFailures++;
      } else {
        consecutiveFailures = 0;
        consecutiveNoFieldsFound = 0;
        console.log(`Attempting to fill a field...`);
        const result = await agent.execute({
          instruction: `Find the next empty form field and fill it with the appropriate value from the applicant information in your system prompt. Use the actual data (names, email, phone, etc.) - do NOT use placeholder text. Match the field label to the correct applicant data.`,
          maxSteps: 5,
          highlightCursor: true,
        });
        console.log(
          `Agent execution result: ${result.success ? "Success" : "Failed"}`,
        );
        await page
          .waitForLoadState("networkidle", { timeout: 5000 })
          .catch(() => {});
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
