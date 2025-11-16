import { Page, Stagehand } from "@browserbasehq/stagehand";
import { ApplicantProfile } from "../types.js";
import { agentFillInfoPrompt } from "./const.js";

interface FieldMapping {
  patterns: string[];
  getValue: (profile: ApplicantProfile) => string;
  type: "text" | "select" | "radio" | "checkbox" | "textarea";
}

// Common field patterns and their mappings
const FIELD_MAPPINGS: FieldMapping[] = [
  // Name fields
  {
    patterns: ["first name", "prénom", "firstname", "given name", "forename"],
    getValue: (p) => p.firstName,
    type: "text",
  },
  {
    patterns: ["last name", "nom", "lastname", "surname", "family name"],
    getValue: (p) => p.lastName,
    type: "text",
  },
  {
    patterns: ["full name", "name", "nom complet"],
    getValue: (p) => `${p.firstName} ${p.lastName}`,
    type: "text",
  },

  // Contact fields
  {
    patterns: ["email", "e-mail", "courriel", "mail"],
    getValue: (p) => p.email,
    type: "text",
  },
  {
    patterns: [
      "phone",
      "telephone",
      "téléphone",
      "mobile",
      "cell",
      "contact number",
    ],
    getValue: (p) => p.phone,
    type: "text",
  },

  // Address fields
  {
    patterns: ["street", "address line", "rue", "adresse"],
    getValue: (p) => p.location,
    type: "text",
  },
  {
    patterns: ["city", "town", "ville", "suburb"],
    getValue: (p) => p.city,
    type: "text",
  },
  {
    patterns: ["state", "province", "region", "état", "région", "territory"],
    getValue: (p) => p.state || "N/A",
    type: "text",
  },
  {
    patterns: ["country", "pays", "nation"],
    getValue: (p) => p.country,
    type: "text",
  },
  {
    patterns: ["postal code", "zip code", "postcode", "code postal"],
    getValue: (p) => p.postalCode || "",
    type: "text",
  },

  // Links
  {
    patterns: ["linkedin", "linkedin url", "linkedin profile"],
    getValue: (p) => p.linkedin || "",
    type: "text",
  },
  {
    patterns: ["github", "github url", "github profile"],
    getValue: (p) => p.github || "",
    type: "text",
  },
  {
    patterns: ["portfolio", "website", "personal website", "site web"],
    getValue: (p) => p.portfolio || p.website || "",
    type: "text",
  },

  // Education
  {
    patterns: [
      "university",
      "college",
      "school",
      "institution",
      "université",
      "école",
    ],
    getValue: (p) => p.education[0]?.institution || "",
    type: "text",
  },
  {
    patterns: ["degree", "diplôme", "qualification"],
    getValue: (p) => p.education[0]?.degree || "",
    type: "text",
  },
  {
    patterns: ["major", "field of study", "program", "programme"],
    getValue: (p) => p.education[0]?.field || "",
    type: "text",
  },
  {
    patterns: ["gpa", "grade point average"],
    getValue: (p) => p.education[0]?.gpa || "",
    type: "text",
  },
  {
    patterns: ["graduation date", "graduation year", "expected graduation"],
    getValue: (p) => p.education[0]?.graduationDate || "",
    type: "text",
  },

  // Work experience
  {
    patterns: ["current company", "current employer", "company name"],
    getValue: (p) => p.workExperience[0]?.company || "",
    type: "text",
  },
  {
    patterns: ["current title", "job title", "position", "role", "poste"],
    getValue: (p) => p.workExperience[0]?.role || "",
    type: "text",
  },
  {
    patterns: ["years of experience", "work experience"],
    getValue: (p) => {
      const years = p.workExperience.length;
      return years > 0 ? years.toString() : "0-1";
    },
    type: "text",
  },

  // Availability
  {
    patterns: [
      "start date",
      "available to start",
      "availability",
      "when can you start",
      "date de début",
      "disponibilité",
    ],
    getValue: (p) => p.availability || "Immediately",
    type: "text",
  },
  {
    patterns: ["notice period", "délai de préavis"],
    getValue: (p) => p.noticePeriod || "Immediate",
    type: "text",
  },

  // Work authorization
  {
    patterns: [
      "work authorization",
      "authorized to work",
      "legal to work",
      "right to work",
      "autorisation de travail",
    ],
    getValue: (p) => (p.workAuthorization ? "Yes" : "No"),
    type: "radio",
  },
  {
    patterns: [
      "require sponsorship",
      "need sponsorship",
      "visa sponsorship",
      "sponsorship required",
    ],
    getValue: (p) => (p.requiresSponsorship ? "Yes" : "No"),
    type: "radio",
  },
  {
    patterns: ["willing to relocate", "relocation", "can you relocate"],
    getValue: (p) => (p.willingToRelocate ? "Yes" : "No"),
    type: "radio",
  },

  // Salary
  {
    patterns: [
      "salary expectation",
      "expected salary",
      "desired salary",
      "salary requirement",
      "salaire",
    ],
    getValue: (p) => p.expectedSalary || "",
    type: "text",
  },

  // Cover letter / Why you're a good fit
  {
    patterns: [
      "cover letter",
      "why you",
      "why are you interested",
      "why do you want",
      "tell us about yourself",
      "describe yourself",
      "lettre de motivation",
    ],
    getValue: (p) => p.coverLetter || "",
    type: "textarea",
  },
];

async function smartFillForm(
  page: Page,
  applicantProfile: ApplicantProfile,
  stagehand: Stagehand,
): Promise<number> {
  let filledCount = 0;

  try {
    // Use Stagehand to find and fill common fields one by one
    const commonFields = [
      {
        query: "Find first name input field",
        value: applicantProfile.firstName,
      },
      { query: "Find last name input field", value: applicantProfile.lastName },
      { query: "Find email input field", value: applicantProfile.email },
      { query: "Find phone number input field", value: applicantProfile.phone },
      { query: "Find city input field", value: applicantProfile.city },
      {
        query: "Find postal code or zip code input field",
        value: applicantProfile.postalCode || "",
      },
      {
        query: "Find LinkedIn URL input field",
        value: applicantProfile.linkedin || "",
      },
    ];

    for (const field of commonFields) {
      if (!field.value) continue;

      try {
        const elements = await stagehand.observe(field.query);
        if (elements.length > 0) {
          await stagehand.act({
            ...elements[0],
            method: "fill",
            arguments: [field.value],
          });
          filledCount++;
          console.log(`✓ Filled "${field.query}" with "${field.value}"`);
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      } catch (error: any) {
        // Field not found or couldn't be filled, continue
        console.log(`Could not fill ${field.query}: ${error.message}`);
      }
    }
  } catch (error: any) {
    console.error(`Error in smartFillForm: ${error.message}`);
  }

  return filledCount;
}

export async function fillApplicationForm(
  applicantProfile: ApplicantProfile,
  stagehand: Stagehand,
  page: Page,
): Promise<"submitted" | "failed" | "partial"> {
  try {
    console.log("Filling application form for", page.url());

    // Create agent for handling unexpected fields
    const agent = stagehand.agent({
      systemPrompt: agentFillInfoPrompt,
    });

    // Click apply button if present (but not Next/Continue buttons)
    const applyButton = await stagehand.observe(
      "Find 'Apply Now' or 'Postuler' button that opens the job application form. Do NOT select Next, Continue, or navigation buttons.",
    );
    if (applyButton.length > 0) {
      console.log("Found apply button, clicking...");
      await stagehand.act(applyButton[0]);
      await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait for form to load
    } else {
      console.log("Form is visible. Filling info");
    }

    const MAX_PAGES = 10;
    let currentPage = 0;
    let previousFieldCount = -1;
    let noProgressCount = 0;

    while (currentPage < MAX_PAGES) {
      currentPage++;
      console.log(`\n=== Processing form page ${currentPage} ===`);

      // Wait for page to be ready
      await page.waitForLoadState("domcontentloaded").catch(() => {});
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Check for errors
      const errors = await stagehand.observe(
        "Find any error messages or validation warnings",
      );
      if (errors.length > 0) {
        console.log("Validation errors found:", errors);
        // Try to fix them with agent
        await agent.execute({
          instruction:
            "Fix the validation errors by re-entering correct values",
          maxSteps: 3,
        });
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }

      // Check for mandatory sign-in requirement (not optional "save progress")
      const isSignInPage = await stagehand.observe(
        "Find mandatory login form that blocks the application (with username/password fields and no way to proceed without signing in)",
      );
      if (isSignInPage.length > 0) {
        // Double-check: see if there's also a way to continue without signing in
        const skipSignIn = await stagehand.observe(
          "Find 'Continue without signing in' or 'Apply as guest' button",
        );
        if (skipSignIn.length === 0) {
          console.log("Sign-in required, cannot proceed");
          return "failed";
        } else {
          console.log("Found way to skip sign-in, continuing...");
          await stagehand.act(skipSignIn[0]);
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }

      // Check for CAPTCHA
      const captcha = await stagehand.observe(
        "Detect if there's a CAPTCHA challenge",
      );
      if (captcha.length > 0) {
        console.log("CAPTCHA detected, cannot proceed");
        return "failed";
      }

      // Handle terms and conditions
      const terms = await stagehand.observe(
        "Find unchecked required terms and conditions or consent checkboxes",
      );
      if (terms.length > 0) {
        console.log(`Found ${terms.length} terms/consent checkboxes`);
        for (const term of terms) {
          await stagehand.act(term);
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      }

      // Smart fill using pattern matching
      console.log("\nStarting smart form fill...");
      const filledByPattern = await smartFillForm(
        page,
        applicantProfile,
        stagehand,
      );
      console.log(`Auto-filled ${filledByPattern} fields using patterns`);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check for remaining empty fields and prioritize required ones
      const allFields = await stagehand
        .observe("Find all empty text inputs and textareas fields")
        .catch();

      const dropDowns = await stagehand
        .observe("FInd all empty dropdowns fields")
        .catch();
      allFields.push(...dropDowns);

      const radioButtons = await stagehand
        .observe("Find all unselected radio button groups")
        .catch();
      allFields.push(...radioButtons);

      const checkboxes = await stagehand
        .observe("Find all unchecked required checkboxes")
        .catch();
      allFields.push(...checkboxes);

      console.log(`\nFound ${allFields.length} remaining unfilled fields`);

      // Separate required and optional fields
      const requiredFields = allFields.filter(
        (field: any) =>
          field.description?.toLowerCase().includes("*") ||
          field.description?.toLowerCase().includes("required"),
      );
      const optionalFields = allFields.filter(
        (field: any) =>
          !field.description?.toLowerCase().includes("*") &&
          !field.description?.toLowerCase().includes("required"),
      );

      console.log(
        `  - ${requiredFields.length} required fields, ${optionalFields.length} optional fields`,
      );

      // Process required fields first, then optional
      const fieldsToFill = [...requiredFields];

      if (fieldsToFill.length > 0 && fieldsToFill.length < 20) {
        console.log("Using AI agent to fill fields intelligently...");

        for (let i = 0; i < Math.min(fieldsToFill.length, 15); i++) {
          const field = fieldsToFill[i];
          const fieldDescription = field.description || "unknown field";

          console.log(
            `\n[${i + 1}/${Math.min(fieldsToFill.length, 15)}] Processing: "${fieldDescription}"`,
          );

          try {
            // Use agent to intelligently fill this specific field
            const result = await agent.execute({
              instruction: `Fill the form "${fieldDescription}"`,
              maxSteps: 4,
            });

            if (result.success) {
              console.log(`Successfully filled field`);
            } else {
              console.log(`Failed to fill field`);
            }
          } catch (error: any) {
            console.log(`Error filling field: ${error.message}`);
          }

          await new Promise((resolve) => setTimeout(resolve, 800));
        }

        // Check if we made progress
        if (allFields.length === previousFieldCount) {
          noProgressCount++;
          console.log(
            `\nNo progress made (${noProgressCount}/3) - same number of unfilled fields`,
          );

          if (noProgressCount >= 3) {
            console.log(
              "Stuck after 3 attempts with no progress. Trying to proceed...",
            );
            // Reset counter and try to move forward
            noProgressCount = 0; // TODO: smth idk
          }
        } else {
          noProgressCount = 0;
          console.log(
            `\nProgress: ${previousFieldCount} → ${allFields.length} unfilled fields`,
          );
        }
        previousFieldCount = allFields.length;
      }

      // Check for submit button (ggs were done)
      const submitButton = await stagehand.observe(
        "Find final submit or 'soumettre' button (not next/continue)",
      );
      if (submitButton.length > 0) {
        console.log("\nApplication completed - reached submit button!");
        return "submitted";
      }

      // Check for next/continue button
      const nextButton = await stagehand.observe(
        "Find next or continue button to go to the next page",
      );
      if (nextButton.length > 0) {
        console.log("Clicking next/continue button...");
        await stagehand.act(nextButton[0]);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        continue;
      }

      // If no submit and no next button, we might be stuck
      console.log("No submit or next button found");

      // Try one more time to see if we missed anything
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const submitRetry = await stagehand.observe("Find submit button");
      if (submitRetry.length > 0) {
        console.log("\nApplication completed - found submit button!");
        return "submitted";
      }

      // If we've been on this page for a while with no progress, exit
      if (currentPage > 3) {
        console.log("Seems stuck, marking as partial");
        return "partial";
      }
    }

    console.log("Reached maximum pages, marking as partial");
    return "partial";
  } catch (error: Error | any) {
    console.error(`Error: ${error.message}`);
    await page
      .screenshot({
        path: `error-${Date.now()}.png`,
      })
      .catch(() => {});
    return "failed";
  }
}
