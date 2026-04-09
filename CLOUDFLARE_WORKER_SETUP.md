# Cloudflare Worker Setup Guide

This guide explains how to set up and deploy the Cloudflare Worker designed to serve dynamic Open Graph metadata for social media sharing.

## 1. Get Cloudflare Account ID and Zone ID

1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com).
2. Select your domain (`spicorpinvest.com`).
3. Scroll down on the overview page. On the right-hand sidebar, find the **API** section.
4. Copy your **Account ID** and **Zone ID**.

## 2. Configure `wrangler.toml`

1. Open the `wrangler.toml` file in the root of your project.
2. Replace `YOUR_ACCOUNT_ID_HERE` with your actual Account ID.
3. Replace `YOUR_ZONE_ID_HERE` with your actual Zone ID.

## 3. Deployment

To deploy the worker, you need to use the Wrangler CLI.

1. Install Wrangler globally (if not already installed):