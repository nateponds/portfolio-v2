# Nathanlab deployment

Portfolio V2 deploys as a standalone Next.js server on `127.0.0.1:3010`.
The live Cloudflare Tunnel continues to reach Apache on port `8082`; Apache is
changed only by the manual cutover workflow.

## Deployment flow

1. `.github/workflows/deploy-nathanlab.yml` builds and smoke-tests the app.
2. `ops/bin/deploy-nathanlab` creates an immutable release under
   `/mnt/Storage2_New/website-hosting/portfolio-v2/releases/`.
3. The `current` symlink is switched atomically and the user service restarts.
4. A failed health check restores the previous release automatically.
5. `.github/workflows/cutover-nathanlab.yml` manually changes Apache after the
   staged service is healthy.

The deploy workflow cannot affect the public site. Its port is bound to
loopback and Apache continues to use the legacy site until cutover.

## One-time runner setup

The repository uses a dedicated runner labeled `portfolio-v2`. Install it in
`/home/nateponds/actions-runner-portfolio-v2` and run it through the lingering
`nateponds` user systemd manager. Do not reuse the legacy repository's runner.

After registering the runner, install
`ops/systemd/actions-runner-portfolio-v2.service` as
`~/.config/systemd/user/actions-runner-portfolio-v2.service`.

Then run:

```bash
systemctl --user daemon-reload
systemctl --user enable --now actions-runner-portfolio-v2.service
```

## Cutover

Before running the cutover workflow:

1. Confirm the latest deployment workflow passed.
2. Add `CLOUDFLARE_ZONE_ID` and `CLOUDFLARE_API_TOKEN` as repository secrets if
   an immediate cache purge is required.
3. Disable the production deployment workflow in `nateponds/nateponds.com` so
   it cannot restore the legacy Apache configuration.
4. Run **Cut over nateponds.com to V2** from the `main` branch.

The workflow copies the tracked V2 Apache configuration to the candidate path
used by the existing root-owned deployment helper. That helper validates the
configuration, saves the old vhost, and reloads Apache transactionally.

## Rollback

Run **Roll back nateponds.com on nathanlab** with one of these targets:

- `previous-v2-release` swaps the `current` and `previous` V2 releases.
- `legacy-site` calls the existing root-owned Apache rollback helper and
  restores the old static site.

The health endpoint is available at `/api/health` and always returns
`{"ok":true}` with `Cache-Control: no-store`.
