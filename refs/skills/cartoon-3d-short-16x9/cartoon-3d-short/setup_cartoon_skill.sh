#!/usr/bin/env bash
# Setup for mromidev/claude-animated-shorts (Ubuntu 22.04/24.04, WSL, or AWS/EC2)
# Run:  bash setup_cartoon_skill.sh
set -e

# 1) System packages
sudo apt-get update
sudo apt-get install -y git curl ffmpeg python3 python3-venv python3-pip \
  chromium-browser build-essential || sudo apt-get install -y chromium

# 2) Node 20+ (Remotion needs a recent Node)
if ! command -v node >/dev/null || [ "$(node -v | cut -d. -f1 | tr -d v)" -lt 20 ]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

# 3) Skill into Claude's skills folder
mkdir -p ~/.claude/skills
[ -d ~/.claude/skills/cartoon-3d-short ] || \
  echo "Copy this folder to ~/.claude/skills/cartoon-3d-short (already done if you unzipped there)"

# 4) Remotion project (deps taken from the skill's own imports)
mkdir -p ~/cartoon-studio && cd ~/cartoon-studio
[ -f package.json ] || npm init -y
npm i remotion @remotion/cli @remotion/bundler @remotion/renderer @remotion/three \
  react react-dom three @react-three/fiber @react-three/postprocessing postprocessing
npm i -D typescript @types/react @types/three
mkdir -p src/videos src/sandboxes public scripts out
cp -r ~/.claude/skills/cartoon-3d-short/templates/scripts/* scripts/

# 5) Big temp folder (each Remotion bundle copies ~1.3 GB of public/)
echo 'export REMOTION_TMP=$HOME/remotion-tmp' >> ~/.bashrc
mkdir -p ~/remotion-tmp

# 6) Python tools: free TTS + word timings + Gemini
python3 -m venv ~/cartoon-venv
~/cartoon-venv/bin/pip install -U pip
~/cartoon-venv/bin/pip install faster-whisper edge-tts google-genai numpy scipy

echo
echo "DONE."
echo "Project : ~/cartoon-studio"
echo "Skill   : ~/.claude/skills/cartoon-3d-short"
echo "Python  : source ~/cartoon-venv/bin/activate"
echo
echo "NOTE: scripts/bridge-stills.mjs has a Windows Chrome path and gl:'angle'."
echo "On Linux/AWS (no GPU) ask Claude to change browserExecutable to the"
echo "chromium path and chromiumOptions.gl to 'swangle'."
