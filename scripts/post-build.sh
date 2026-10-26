#!/usr/bin/env bash
# post-build.sh — after `next build`, finish the self-hosting bundle
# (only when output:standalone was produced, i.e. NOT on Vercel).
if [ -d ".next/standalone" ]; then
  cp -r .next/static .next/standalone/.next/ 2>/dev/null || true
  cp -r public .next/standalone/ 2>/dev/null || true
  echo "[post-build] standalone bundle ready (bun run start)"
else
  echo "[post-build] standard build (Vercel handles serving)"
fi
