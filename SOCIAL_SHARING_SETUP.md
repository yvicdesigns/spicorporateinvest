# Social Sharing Setup Guide

This document explains how the social media preview system is implemented for the SPI Group e-commerce application.

## Overview

Social media crawlers (Facebook, Twitter, LinkedIn, WhatsApp) do not consistently execute complex JavaScript or wait for React single-page applications (SPAs) to render. To ensure links shared on these platforms display the correct image, title, and description, we use a hybrid approach:

1. **Client-Side Injection**: We inject Open Graph tags via React Helmet for standard browsing and basic crawlers.
2. **Edge Function Metadata**: A Supabase Edge Function (`generate-product-metadata`) is available to generate pure JSON/HTML metadata.
3. **Preview Route**: The `/?product=[id]` route serves as a fast-loading metadata page. It renders the Open Graph tags using React Helmet and then redirects regular users to `/shop/[id]`. Crawlers capture the `<head>` data before the JS redirect fires.
4. **Index.html Script**: A lightweight vanilla JavaScript snippet in `index.html` parses the URL parameters and immediately injects fallback OG tags before React even boots up.

## How to Test

### 1. Facebook Sharing Debugger
- Go to the [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/).
- Enter a product URL (e.g., `https://spicorpinvest.com/?product=12345-abcde`).
- Click "Debug" to view the scraped meta tags and preview image.
- If the image or title is outdated, click "Scrape Again".

### 2. Twitter Card Validator
- Go to the [Twitter Card Validator](https://cards-dev.twitter.com/validator).
- Enter the URL.
- Verify the "summary_large_image" format.

### 3. LinkedIn Post Inspector
- Go to the [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/).
- Enter the URL to see how the preview will render in LinkedIn feeds.

## Expected Metadata Output

When sharing a valid product URL, the crawler should read: