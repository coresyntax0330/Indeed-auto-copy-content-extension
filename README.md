# LovapexTech JobBid Extension

LovapexTech JobBid captures job details from supported job boards and turns them into an editable, tailored resume draft without leaving the job page.

## Supported job sites

- Indeed
- CV-Library
- Adzuna
- Reed
- Totaljobs

## Resume workflow

1. Open a job listing on a supported site.
2. Click **Send** to open the JobBid panel.
3. Review the captured job URL and job description. If both fields contain values, draft generation starts automatically.
4. Sign in to your LovapexTech Resume Builder account when requested.
5. Review and edit the generated resume preview. Role and experience sections are created dynamically from the response, so the preview is not limited to three employments.
6. Click **Finalize Resume** to generate and download the PDF.

Generating a draft does not download a resume. A PDF is created and downloaded only after the user clicks **Finalize Resume**.

## Other actions

- **Copy** copies the job description.
- **Copy URL** copies the current job-page URL.
- **Remove** deletes the generated draft.
- **Generate another draft** returns to the job-detail form.

## Requirements

- A LovapexTech Resume Builder account
- An uploaded resume template and cover-letter template
- Available account balance for resume generation

## Install locally

1. Open `chrome://extensions` in a Chromium-based browser.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the `LovapexTech_JobBidExtension` directory.

After changing the extension files, reload it from the extensions page and refresh any open job-board tabs.

## Permissions

The extension uses clipboard access for its copy actions, local extension storage for the authentication token, and access to `https://api.lovapextech.com` for account, draft, finalization, and PDF requests.
