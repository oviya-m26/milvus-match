import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from "vite-plugin-pwa"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      manifest: {
        name: "MilvusMatch",
        categories: ["developer", "developer tools", "productivity"],
        short_name: "MilvusMatch",
        start_url: "/",
        display: "standalone",
        scope: "./",
        description: "Organize and track your job opportunities.",
        icons: [
          {
            src: "/milvusmatch_logo.svg",
            sizes: "192x192",
            type: "image/svg+xml",
          },
          {
            src: "/milvusmatch_logo.svg",
            sizes: "512x512",
            type: "image/svg+xml",
          },
          {
            src: "/apple-touch-icon.png",
            sizes: "180x180",
            type: "image/png",
            purpose: "apple touch icon",
          },
          {
            src: "/maskable_icon.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
        shortcuts: [
          {
            name: "All Jobs",
            url: "/all-jobs",
            description: "Get all your jobs",
            icons: [
              {
                src: "/all-jobs-icon.png",
                type: "image/png",
                sizes: "512x512",
              },
            ],
          },
          {
            name: "Add Job",
            url: "/add-job",
            description: "Add your Job",
            icons: [
              {
                src: "/add-job-icon.png",
                type: "image/png",
                sizes: "512x512",
              },
            ],
          },
          {
            name: "Profile",
            url: "/profile",
            description: "Profile",
            icons: [
              {
                src: "/profile-icon.png",
                type: "image/png",
                sizes: "512x512",
              },
            ],
          },
        ],
        screenshots: [
          {
            src: "/india_flag.svg",
            sizes: "512x512",
            platform: "android",
            label: "MilvusMatch — PM Internship Scheme",
          },
        ],
        theme_color: "#FF9933",
      },
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10, // Maximum 10 entries/files in the cache
                maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: ({ url }) => {
              return url.pathname.startsWith("/api")
            },
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
})
