# n8n Integration for TKM • Pulse News

This document outlines how to set up an n8n workflow to automatically publish new articles to the TKM • Pulse News website.

## Workflow Overview

The n8n workflow will:
1.  **Trigger:** Can be triggered manually, on a schedule, or by a webhook.
2.  **Gather Content:** Collect the article's title, author, category, description, and body content.
3.  **Format File:** Create a Markdown file with the correct frontmatter and naming convention.
4.  **Upload to GitHub:** Use the GitHub API to commit and push the new file to the `/posts/` directory of the repository.

## Step-by-Step Guide

### 1. Set up your n8n Workflow

Create a new workflow in your n8n instance.

### 2. Create the Markdown File

Use a **Function** node to format the article content into a Markdown file with the required frontmatter.

**File Naming Convention:** `YYYY-MM-DD-slug.md`

**Frontmatter:**
```yaml
---
title: "Your Article Title"
date: "YYYY-MM-DD"
author: "Author Name"
category: "Article Category"
description: "A brief description of the article."
featuredImage: "/images/your-image.jpg"
---

Your article content in Markdown format goes here.
```

### 3. Use the GitHub Node

Add a **GitHub** node to your workflow to upload the file to your repository.

**Configuration:**
*   **Authentication:** Use your GitHub credentials (OAuth2 or Access Token).
*   **Resource:** `File`
*   **Operation:** `Create/Update`
*   **Owner:** Your GitHub username or organization.
*   **Repository:** Your repository name.
*   **File Path:** `posts/YYYY-MM-DD-slug.md` (use an expression to generate the filename).
*   **Content:** The full Markdown content from the previous step.
*   **Commit Message:** `New article: {{title}}`

### 4. Trigger the Workflow

Once the GitHub node is configured, you can trigger the workflow. n8n will create the new Markdown file, and the GitHub Actions workflow will automatically build and deploy the new article to your website.
