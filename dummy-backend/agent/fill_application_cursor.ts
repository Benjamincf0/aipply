import { Page, Stagehand } from "@browserbasehq/stagehand";
import { ApplicantProfileSchema } from "../types";
import { agentFillInfoPrompt } from "./const.js";

interface FieldMapping {
  patterns: string[];
  getValue: (profile: ApplicantProfileSchema) => string;
  type: "text" | "select" | "radio" | "checkbox" | "textarea";
}

export async function fillApplicationForm(
  applicantProfile: ApplicantProfileSchema,
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
      await stagehand.act(applyButton[0]!);
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
          await stagehand.act(skipSignIn[0]!);
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
          "Find all dropdown select menus that need a selection",
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
          "Find all required checkboxes that are not yet checked",
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
        const fieldsToProcess = [...fields.required, ...fields.optional];

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
