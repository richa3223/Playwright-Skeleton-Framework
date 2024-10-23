# Contribute to the Playwright skeleton

The repo is readily available for use and accepting contributions on an ad-hoc basis from anyone in the business.

## You are trying to consume to repo but are struggling - how do you ask for support?

This process is still going through some tweaks and changes may occur before this file has been updated to reflect that.

If you are a beta user there should be a slack channel that exits to post queries/clarifications in. Just remember to use threads to keep the conversation together so its easier for others to check if what they need to ask has already been answered.

If you are not part of the beta group but are utilising this skeleton you can have a look at the Issues tab in GitHub and see if what you're struggling with has been raised already, alternatively check the CODEOWNERS file in the repo and reach out to anyone in there directly. Also make sure to check out the associated wiki pages incase your questions are answered there - there's a handy `Playwright first steps guys with example code to follow`.

As this skeleton matures a FAQs wiki page will be made to help with any of the questions received more than once.

## Making changes

Spotted an issue in the codebase, or come up with a useful new feature that the skeleton could benefit from but aren't sure what the process is?
Look no further, below will highlight the different ways in which to contribute and how to check previous discussions.

### Don't have the time to contribute yourself but have spotted something?

Raising an issue is a straightforward process that involves documenting a bug, feature request, or any other type of feedback in a way that helps the maintainers and other contributors understand and address the issue. Here’s a step-by-step guide to raising an issue on GitHub:

1. Preparation.

   - Check for existing and closed Issues to make sure this hasn't already been raised. - Before creating a new issue, search the existing issues to ensure that your issue has not already been reported. This helps avoid duplication and keeps the issue tracker organised.

2. Create the Issue.

   - Go to the Repository
   - Click on the "Issues" tab (This is usually found at the top of the repository page, alongside options like Code, Pull Requests, and Actions).
   - Open a New Issue
   - Click on "New Issue" (This button is typically located in the upper right corner of the Issues page).

3. Fill Out the Issue Template.
   Select the Appropriate Template!

   - Choose a Template (We currently have two issue templates. One for bugs and one for new feature requests. Select the one that best matches your issue).
   - Provide Detailed Information (Each template has a list of questions to help identify the necessary information)

4. Submit the Issue.
   Review Your Submission.

   - Double-check your issue for clarity and completeness.
   - Click the "Submit new issue" button to create the issue.

5. Follow Up.
   Monitor the Issue

   - Monitor the issue for any questions or requests for more information from the maintainers or other contributors.
   - Be ready to provide additional details or clarification if needed.

### Spotted something or want to contribute personally?

If you can write the code yourself to fix an issue or add a feature to the skeleton, the process involves submitting a pull request (PR) with your proposed changes. Here’s how you can do this:

1. Preparation.
   Check [existing](https://github.com/bjss/Playwright-Skeleton-Framework/issues) and [closed](https://github.com/bjss/Playwright-Skeleton-Framework/issues?q=is%3Aissue+is%3Aclosed) Issues.

   - If there is an open issue thats relevant you can link your branch to that issue.
   - If there isn't an open Issue, check the closed Issues to make sure that this hasn't been raised previously and closed for a specific reason.
     This helps avoid duplication and keeps the issue tracker organised.

2. Create the Issue for traceability
   Follow steps 2-4 above on how to create an Issue.

3. Clone the Skeleton.

4. Create your branch.
   Please try to stick to the naming conventions within the repo with clear and concise commits. Ex: `feat/{issue-number}-{title-of-change}`

5. Submit a Pull Request.

   - Push your changes.
   - Click on the "New Pull Request" button and select your branch. Provide a detailed description of your changes and reference the issue number if applicable.
     - Title: Provide a concise and descriptive title.
     - Description: Explain what the PR does, link to the issue (e.g., "Fixes #123"), and describe how to test your changes.
   - Be responsive to feedback from the code owners - whether thats a discussion or making changes to the branch based on suggestions.

Note: This skeleton has automatic deletion set on branches once merged and if a branch has been created but not pushed and become stale will be pruned unless a specific reason is specified.

You can reach out directly to the code owners if you need to by checking the CODEOWNERS file in the skeleton for contact details. But you should have a response/acknowledgement on your Issue/PR within a couple of days.
