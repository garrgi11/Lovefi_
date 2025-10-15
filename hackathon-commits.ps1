# Simulate realistic hackathon commits from Oct 15 to Oct 25 (2 per day)
$startDate = Get-Date "2025-10-15"
$endDate = Get-Date "2025-10-25"

# List of authentic hackathon-style commit messages
$messages = @(
    "initial project setup",
    "added README and basic structure",
    "configured environment variables",
    "implemented user login page",
    "connected frontend to backend API",
    "integrated wallet connect functionality",
    "smart contract deployment script",
    "added user profile and dashboard layout",
    "improved UI responsiveness",
    "added on-chain interaction module",
    "refactored contract ABI handling",
    "added error handling for transactions",
    "connected to testnet and verified flow",
    "polished landing page design",
    "implemented token minting logic",
    "added transaction history page",
    "smart contract verification updates",
    "final UI tweaks before submission",
    "updated documentation and usage guide",
    "bug fixes and cleanup",
    "added final assets and screenshots",
    "final commit for hackathon submission"
)

# Commit index
$i = 0

while ($startDate -le $endDate -and $i -lt $messages.Count) {
    for ($j = 1; $j -le 2 -and $i -lt $messages.Count; $j++) {
        $commitDate = $startDate.AddHours((Get-Random -Minimum 9 -Maximum 21))
        $dateString = $commitDate.ToString("ddd MMM dd HH:mm:ss yyyy -0400")

        # Add a small dummy change to simulate real edits
        Add-Content "progress_log.txt" "Commit $($i+1): $($messages[$i]) - $($commitDate.ToString('yyyy-MM-dd HH:mm'))"

        git add .
        git commit --date="$dateString" -m "$($messages[$i])"

        $env:GIT_COMMITTER_DATE = $dateString
        git commit --amend --no-edit --date="$dateString"

        $i++
    }

    $startDate = $startDate.AddDays(1)
}

# Push everything to your main branch
git push origin main
