#!/bin/bash

echo "🧪 Astro Boom Manual Test Suite"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test project name
TEST_PROJECT="test-astro-boom-site"

# Clean up any existing test project
if [ -d "$TEST_PROJECT" ]; then
  echo "Cleaning up existing test project..."
  rm -rf "$TEST_PROJECT"
fi

echo "📦 Building the CLI..."
npm run build
if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Build failed${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Build successful${NC}"
echo ""

echo "🚀 Running CLI to create test project..."
echo "Creating project: $TEST_PROJECT"
echo ""

# Create expect script to automate CLI interaction
cat > test-cli-expect.exp <<'EOF'
#!/usr/bin/expect -f

set timeout 30
spawn node dist/cli.js

expect "Project name:"
send "test-astro-boom-site\r"

expect "Create GitHub repository?"
send "\033\[B\r"

expect "Deploy to Netlify?"
send "\033\[B\r"

expect "Choose analytics provider:"
send "\r"

expect "Success!"
expect eof
EOF

chmod +x test-cli-expect.exp

# Check if expect is installed
if command -v expect &> /dev/null; then
  ./test-cli-expect.exp
else
  echo -e "${YELLOW}⚠️  'expect' not installed. Running manual test instead...${NC}"
  echo "Please manually test by running: node dist/cli.js"
  echo "And enter: test-astro-boom-site, No, No, Plausible"
fi

rm -f test-cli-expect.exp

echo ""
echo "🔍 Verifying created project structure..."

# Check if project was created
if [ ! -d "$TEST_PROJECT" ]; then
  echo -e "${RED}❌ Project directory not created${NC}"
  exit 1
fi

# Check essential files
FILES_TO_CHECK=(
  "package.json"
  "astro.config.mjs"
  "tailwind.config.mjs"
  "netlify.toml"
  "tsconfig.json"
  ".gitignore"
  "src/content/config.ts"
  "src/layouts/BaseLayout.astro"
  "src/pages/index.astro"
  "src/components/Hero.astro"
  "public/admin/index.html"
  "public/admin/config.yml"
)

FAILED=0
for file in "${FILES_TO_CHECK[@]}"; do
  if [ -f "$TEST_PROJECT/$file" ]; then
    echo -e "${GREEN}✅${NC} $file"
  else
    echo -e "${RED}❌${NC} $file missing"
    FAILED=1
  fi
done

# Check directories
DIRS_TO_CHECK=(
  "src/content/pages"
  "src/content/news"
  "src/content/events"
  "src/content/people"
  "src/components"
  "src/layouts"
  "public/uploads"
)

for dir in "${DIRS_TO_CHECK[@]}"; do
  if [ -d "$TEST_PROJECT/$dir" ]; then
    echo -e "${GREEN}✅${NC} $dir/"
  else
    echo -e "${RED}❌${NC} $dir/ missing"
    FAILED=1
  fi
done

echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All files and directories created successfully!${NC}"
  echo ""
  echo "📝 Next steps to test the generated site:"
  echo "  cd $TEST_PROJECT"
  echo "  npm install"
  echo "  npm run dev"
  echo ""
  echo "Then open http://localhost:4321 in your browser"
else
  echo -e "${RED}❌ Some files or directories are missing${NC}"
  exit 1
fi

echo ""
echo "🧹 To clean up test project, run:"
echo "  rm -rf $TEST_PROJECT"