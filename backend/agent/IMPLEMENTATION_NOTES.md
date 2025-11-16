# Job Application Form Filler - Implementation Notes

## Overview

This implementation uses a **hybrid approach** to fill out job application forms automatically, combining pattern-based field detection with AI-powered intelligent responses.

## Files

- **`fill_application_cursor.ts`**: New improved implementation (currently in use)
- **`fill_application.ts`**: Original implementation (backup)
- **`index.ts`**: Entry point that runs the agent
- **`dummy_data.ts`**: Sample applicant profile data

## How It Works

### 1. **Smart Fill (Pattern-Based)**

The system first attempts to auto-fill common fields by:

- Using Stagehand's `observe()` to find fields like "first name", "email", "phone", etc.
- Automatically filling them with real data from the applicant profile
- No AI calls needed for standard fields = faster and cheaper

### 2. **AI Agent (Intelligent Fallback)**

For unexpected or custom questions:

- The AI agent reads the question
- Finds relevant information from the applicant's profile
- Generates an appropriate, honest answer based on their background
- Never uses placeholder text

### 3. **Multi-Page Navigation**

- Automatically detects and clicks "Apply" buttons
- Fills all fields on each page
- Clicks "Next/Continue" to move through multi-page forms
- Stops when it reaches the submit button (without clicking it)

## Key Features

✅ **Real Data Only**: Uses actual applicant information, never placeholder text like "string"

✅ **Hybrid Approach**: Combines speed of pattern matching with intelligence of AI

✅ **Multi-Page Support**: Handles forms spanning multiple pages

✅ **Smart Detection**:

- Distinguishes "Apply" buttons from navigation buttons
- Detects mandatory sign-in requirements (skips optional ones)
- Identifies CAPTCHAs and exits gracefully

✅ **Error Handling**:

- Validates filled fields
- Retries on errors
- Provides detailed logging

## Usage

### Running the Agent

```bash
cd backend
npm start
```

### Updating Applicant Profile

Edit `backend/agent/dummy_data.ts` with real applicant information:

```typescript
export const APPLICANT_PROFILE: ApplicantProfile = {
  firstName: "Your Name",
  lastName: "Your Last Name",
  email: "your.email@example.com",
  phone: "+1-555-123-4567",
  // ... more fields
};
```

### Adding Job URLs

Edit `backend/agent/index.ts` to add job posting URLs:

```typescript
const GIVEN_URL = [
  "https://example.com/job1",
  "https://example.com/job2",
  // Add more URLs here
];
```

## Results

The system successfully:

1. ✅ Fills 7+ common fields automatically with pattern matching
2. ✅ Uses AI for custom/unexpected questions
3. ✅ Reaches the submit button without clicking it
4. ✅ Provides detailed logs of all actions

## Example Output

```
📝 Starting smart form fill...
✓ Filled "Find first name input field" with "John"
✓ Filled "Find last name input field" with "Doe"
✓ Filled "Find email input field" with "john.doe@example.com"
✓ Filled "Find phone number input field" with "+1-555-123-4567"
✓ Auto-filled 7 fields using patterns

Found 6 remaining unfilled fields
🤖 Using AI agent for remaining fields...
✓ Agent filled field 1

✅ Application completed - reached submit button!
Form fill result: submitted
```

## Common Fields Auto-Filled

The smart fill recognizes and fills:

- First & Last Name
- Email Address
- Phone Number
- City
- Postal/Zip Code
- LinkedIn URL
- (More can be added in `smartFillForm()`)

## Customization

### Adding More Pattern-Based Fields

Edit the `commonFields` array in `fill_application_cursor.ts`:

```typescript
const commonFields = [
  { query: "Find first name input field", value: applicantProfile.firstName },
  { query: "Find your custom field", value: applicantProfile.customField },
  // Add more here
];
```

### Adjusting AI Behavior

Modify the agent's `systemPrompt` in `fillApplicationForm()` to change how it responds to custom questions.

## Troubleshooting

### "Sign-in required" Errors

The system detects mandatory sign-in pages and exits. If it's falsely detecting sign-in, adjust the observation query in lines 559-561.

### Form Not Filling

Check the logs to see which fields were found. You may need to add more specific queries to the `commonFields` array.

### Timeout Errors

Increase timeout values if pages load slowly:

```typescript
await new Promise((resolve) => setTimeout(resolve, 5000)); // Increase this
```

## API Limits

The system uses Google Gemini API (free tier):

- **Limit**: 15 requests per minute
- **Solution**: Add delays between jobs or upgrade to paid tier

## Next Steps

1. Test with more diverse job applications
2. Add more pattern-based fields for better coverage
3. Implement resume upload functionality
4. Add database to track application status
5. Create UI for managing applications

## Notes

- The system does **not** submit applications automatically (by design)
- It stops at the submit button so you can review before submitting
- All applicant data should be accurate and truthful
- Respect websites' terms of service when using automation
