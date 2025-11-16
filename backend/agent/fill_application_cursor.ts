import { Page, Stagehand } from "@browserbasehq/stagehand";
import { ApplicantProfile } from "../types.js";
import { agentFillInfoPrompt } from "./const.js";
import z from "zod";

function getFileTypeFromQuery(query: string) {
  if (query.toLowerCase().includes("resume")) return "resume";
  if (query.toLowerCase().includes("cover letter")) return "cover letter";
  if (query.toLowerCase().includes("transcript")) return "transcript";
  return "file";
}

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
      {
        query: "Find Country field",
        value: applicantProfile.country,
      },
    ];

    const commonDropdownFields = [
      {
        query: "Find Country dropdown field' dropdown field",
        value: applicantProfile.country,
      },
      {
        query: "Find State/Province dropdown field",
        value: applicantProfile.state,
      },
    ];

    const commonRadioFields = [
      {
        query: "Find eligible to work in Canada radio button",
        value: applicantProfile.legallyAllowedToWorkInCanada ? "Yes" : "No",
      },
      {
        query: "Find eligible for internship/coop radio button",
        value: applicantProfile.eligibleForCoop ? "Yes" : "No",
      },
      {
        query: "Find enrolled in a co-op program radio button",
        value: applicantProfile.eligibleForCoop ? "Yes" : "No",
      },
    ];

    const inputFileFields = [
      {
        query: "Find resume/CV upload field",
        value: applicantProfile.resumePath || "",
      },
      {
        query: "Find cover letter upload field",
        value: applicantProfile.coverLetterPath || "",
      },
      {
        query: "Find School Transcript upload field",
        value: applicantProfile.schoolTranscriptPath || "",
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

    for (const field of commonDropdownFields) {
      if (!field.value) continue;

      try {
        const elements = await stagehand.observe(field.query);
        if (elements.length > 0) {
          await stagehand.act({
            ...elements[0],
            description: "click the 'select for Country*' dropdown",
            method: "click",
            arguments: [field.query],
          });
          await stagehand.act({
            ...elements[0],
            method: "choose",
            arguments: [field.value],
          });
          filledCount++;
          console.log(`Selected "${field.query}" with "${field.value}"`);
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      } catch (error: any) {
        console.log(`Could not fill ${field.query}: ${error.message}`);
      }
    }

    for (const field of commonRadioFields) {
      if (!field.value) continue;
      try {
        const elements = await stagehand.observe(field.query);
        if (elements.length > 0) {
          await stagehand.act({
            ...elements[0],
            method: "click",
            description: `click the ${field.value} radio button for the question ${field.query}`,
            arguments: [field.value],
          });
          filledCount++;
          console.log(`Selected "${field.query}" with "${field.value}"`);
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      } catch (error: any) {
        console.log(`Could not fill ${field.query}: ${error.message}`);
      }
    }

    for (const field of inputFileFields) {
      if (!field.value) continue;
      try {
        const elements = await stagehand.observe(field.query);
        if (elements.length > 0) {
          const fileType = getFileTypeFromQuery(field.query);

          const checkResumeUpload = await stagehand.extract(
            `Detect if the applicant has uploaded their ${fileType}`,
            z.boolean(),
          );

          if (checkResumeUpload) {
            const resumePath = applicantProfile.resumePath || "";

            if (resumePath) {
              const fileInput = page.locator("input[type=file]");
              await fileInput.setInputFiles(resumePath);
            }
          }
          filledCount++;
          console.log(
            `Uploaded file for "${field.query}" with "${field.value}"`,
          );
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      } catch (error: any) {
        console.log(
          `Could not upload file for ${field.query}: ${error.message}`,
        );
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

      // Detect fields by type with more specific queries
      console.log("\n=== Detecting unfilled fields by type ===");

      const fieldsByType: {
        text: any[];
        dropdown: any[];
        radio: any[];
        checkbox: any[];
      } = {
        text: [],
        dropdown: [],
        radio: [],
        checkbox: [],
      };

      // Text inputs and textareas
      try {
        const textFields = await stagehand.observe(
          "Find all empty text input fields, including those for name, email, phone, address, etc.",
        );
        fieldsByType.text.push(...textFields);
        console.log(`Found ${textFields.length} text input fields`);
      } catch (error: any) {
        console.log(`Could not find text fields: ${error.message}`);
      }

      // Textareas separately
      try {
        const textareas = await stagehand.observe(
          "Find all empty textarea fields for longer text like cover letters or descriptions",
        );
        fieldsByType.text.push(...textareas);
        console.log(`Found ${textareas.length} textarea fields`);
      } catch (error: any) {
        console.log(`Could not find textarea fields: ${error.message}`);
      }

      // Dropdowns/Select elements
      try {
        const dropdowns = await stagehand.observe(
          "Find all unselected dropdown select menus",
        );
        fieldsByType.dropdown.push(...dropdowns);
        console.log(`Found ${dropdowns.length} dropdown fields`);
      } catch (error: any) {
        console.log(`Could not find dropdown fields: ${error.message}`);
      }

      // Radio buttons
      try {
        const radioGroups = await stagehand.observe(
          "Find all radio button groups where no option is selected yet",
        );
        fieldsByType.radio.push(...radioGroups);
        console.log(`Found ${radioGroups.length} radio button groups`);
      } catch (error: any) {
        console.log(`Could not find radio fields: ${error.message}`);
      }

      // Required checkboxes (not already checked)
      try {
        const checkboxes = await stagehand.observe(
          "Find all checkboxes that are not yet checked",
        );
        fieldsByType.checkbox.push(...checkboxes);
        console.log(`Found ${checkboxes.length} required checkbox fields`);
      } catch (error: any) {
        console.log(`Could not find checkbox fields: ${error.message}`);
      }

      const totalFields = Object.values(fieldsByType).reduce(
        (sum, fields) => sum + fields.length,
        0,
      );
      console.log(`\nTotal unfilled fields found: ${totalFields}`);

      // Separate required and optional for each type
      const separateRequiredOptional = (fields: any[]) => {
        const required = fields.filter(
          (f: any) =>
            f.description?.toLowerCase().includes("*") ||
            f.description?.toLowerCase().includes("required"),
        );
        const optional = fields.filter(
          (f: any) =>
            !f.description?.toLowerCase().includes("*") &&
            !f.description?.toLowerCase().includes("required"),
        );
        return { required, optional };
      };

      // Process fields by type - handle required fields first
      const processingOrder = [
        { type: "text", fields: separateRequiredOptional(fieldsByType.text) },
        {
          type: "dropdown",
          fields: separateRequiredOptional(fieldsByType.dropdown),
        },
        { type: "radio", fields: separateRequiredOptional(fieldsByType.radio) },
        {
          type: "checkbox",
          fields: separateRequiredOptional(fieldsByType.checkbox),
        },
      ];

      let totalProcessed = 0;
      for (const { type, fields } of processingOrder) {
        const fieldsToProcess = [...fields.required];

        if (fieldsToProcess.length === 0) continue;

        console.log(
          `\n=== Processing ${fieldsToProcess.length} ${type} fields (${fields.required.length} required) ===`,
        );

        for (let i = 0; i < Math.min(fieldsToProcess.length, 10); i++) {
          const field = fieldsToProcess[i];
          const fieldDescription = field.description || "unknown field";
          const isRequired = fields.required.includes(field);

          console.log(
            `\n[${i + 1}/${Math.min(fieldsToProcess.length, 10)}] ${type.toUpperCase()}: "${fieldDescription}"${isRequired ? " (REQUIRED)" : ""}`,
          );

          try {
            let instruction = "";

            // Create type-specific instructions
            if (type === "text") {
              instruction = `Fill the text field "${fieldDescription}" with the appropriate value from the applicant profile. Type the value into the input field.`;
            } else if (type === "dropdown") {
              instruction = `Select an appropriate option from the dropdown menu "${fieldDescription}" based on the applicant profile. Click the dropdown and choose the best matching option.`;
            } else if (type === "radio") {
              instruction = `Select the appropriate radio button option for "${fieldDescription}" based on the applicant profile. Click on the correct radio button.`;
            } else if (type === "checkbox") {
              instruction = `Check the checkbox for "${fieldDescription}" if it's required or appropriate. Click on the checkbox to check it.`;
            }

            const result = await agent.execute({
              instruction,
              maxSteps: 3,
            });

            if (result.success) {
              console.log(`Successfully processed ${type} field`);
              totalProcessed++;
            } else {
              console.log(`Failed to process ${type} field`);
            }
          } catch (error: any) {
            console.log(`Error processing ${type} field: ${error.message}`);
          }

          await new Promise((resolve) => setTimeout(resolve, 600));
        }
      }

      console.log(`\n=== Processed ${totalProcessed} fields ===`);

      // Check if we made progress
      if (totalFields === previousFieldCount) {
        noProgressCount++;
        console.log(
          `\nNo progress made (${noProgressCount}/3) - same number of unfilled fields`,
        );

        if (noProgressCount >= 3) {
          console.log(
            "Stuck after 3 attempts with no progress. Trying to proceed...",
          );
          noProgressCount = 0;
        }
      } else {
        noProgressCount = 0;
        console.log(
          `\nProgress: ${previousFieldCount} → ${totalFields} unfilled fields`,
        );
      }
      previousFieldCount = totalFields;

      // Check for submit button (ggs were done)
      const submitButton = await stagehand.observe(
        "Find final submit button (not next/continue)",
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
        try {
          // Use the agent to click the button for more reliable interaction
          const result = await agent.execute({
            instruction:
              "Click the next or continue button to proceed to the next page of the application form",
            maxSteps: 2,
          });
          if (result.success) {
            console.log("Successfully clicked next button");
          } else {
            console.log(
              "Agent reported failure clicking next button, but proceeding anyway",
            );
          }
        } catch (error: any) {
          console.log(`Error clicking next button: ${error.message}`);
        }
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
