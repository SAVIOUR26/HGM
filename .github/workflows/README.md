# GitHub Actions Workflows

This directory contains automated build workflows for the HGM POS System.

## Workflows

### 1. Build Windows Installer (`build-windows.yml`)

**Triggers:**
- Every push to `main` branch
- Every push to branches starting with `claude/`
- Every pull request to `main`
- Manual workflow dispatch

**What it does:**
1. Sets up Windows build environment
2. Installs dependencies
3. Builds backend, frontend, and Electron
4. Creates Windows installer (.exe)
5. Uploads artifacts for download

**Outputs:**
- `HGM-POS-Windows-Installer` - Contains the .exe installer
- `HGM-POS-Windows-Portable` - Contains portable version (no installation needed)

**How to download the installer:**
1. Go to the "Actions" tab in GitHub
2. Click on the latest successful workflow run
3. Scroll down to "Artifacts"
4. Download "HGM-POS-Windows-Installer"
5. Extract the ZIP and run the .exe

---

### 2. Create Release (`release.yml`)

**Triggers:**
- Push a git tag matching `v*.*.*` (e.g., `v1.0.0`)
- Manual workflow dispatch with version input

**What it does:**
1. Builds Windows installer
2. Creates portable ZIP version
3. Generates release notes
4. Creates GitHub Release with downloadable assets
5. Publishes to GitHub Releases page

**How to create a release:**

#### Option A: Using Git Tags (Recommended)
```bash
# Update version in package.json first
npm version patch  # or minor, or major

# Push the tag
git push origin --tags

# The workflow will automatically create the release
```

#### Option B: Manual Workflow Dispatch
1. Go to "Actions" tab
2. Select "Create Release" workflow
3. Click "Run workflow"
4. Enter version (e.g., v1.0.0)
5. Click "Run workflow" button

**Outputs:**
- GitHub Release with installer and portable ZIP
- Automatic release notes
- Download statistics tracking

---

## Build Times

- **Windows Installer:** ~5-8 minutes
- **Release Creation:** ~6-10 minutes

## Artifact Retention

- Build artifacts: 30 days
- GitHub Releases: Permanent (until manually deleted)

## Troubleshooting

### Build Fails with "npm ci" error
- Check that `package-lock.json` is committed
- Ensure Node.js version in workflow matches development

### No artifacts uploaded
- Check the workflow logs for build errors
- Ensure all TypeScript compiles without errors
- Verify `release/` directory is created

### Release creation fails
- Ensure you have proper repository permissions
- Check that the tag format matches `v*.*.*`
- Verify GITHUB_TOKEN has release permissions

---

## Cost

All workflows run on GitHub-hosted runners which are:
- **Free** for public repositories
- **Free** for private repositories (2,000 minutes/month on free plan)

---

## Configuration

### Modify Build Platforms

To build for multiple platforms, edit `build-windows.yml`:

```yaml
strategy:
  matrix:
    os: [windows-latest, macos-latest, ubuntu-latest]
runs-on: ${{ matrix.os }}
```

### Change Node.js Version

Update in both workflow files:

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'  # Change to desired version
```

### Customize Artifact Retention

Edit the retention period:

```yaml
- name: Upload Windows Installer
  uses: actions/upload-artifact@v4
  with:
    retention-days: 90  # Change from 30 to desired days
```

---

## Security Notes

- **Code Signing:** Currently disabled (`CSC_IDENTITY_AUTO_DISCOVERY: false`)
  - To enable, add code signing certificate to GitHub Secrets
  - Update workflow to use certificate
  - See: https://www.electron.build/code-signing

- **Secrets:** Never commit secrets to workflows
  - Use GitHub Secrets for sensitive data
  - Access via `${{ secrets.SECRET_NAME }}`

---

## Next Steps

After successful build:
1. Download the installer from Artifacts
2. Test on a clean Windows machine
3. Verify all POS features work
4. Create a release when ready for production
5. Share the GitHub Release link with users
