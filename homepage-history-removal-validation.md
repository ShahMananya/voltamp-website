# Homepage History Section Removal

The screenshoted About Volamp history/timeline block has been removed from the homepage. This includes the `ABOUT VOLAMP` label, the “Built for the work behind the work” copy, and the 1960s, 2012, and 2021 timeline rows.

The dedicated `/about-volamp` route remains registered and available through `AboutVolamp`. A source audit found no history-section markers in `Home.tsx`. TypeScript passed and all six Vitest tests passed across four test files.
