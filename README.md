# NIAD-XCT-BE

## Security Notes

### Known Vulnerabilities
- **xlsx:** High severity vulnerability (version 0.18.5)
  - Prototype Pollution in sheetJS (https://github.com/advisories/GHSA-4r6h-8v6p-xvw6)
  - SheetJS Regular Expression Denial of Service (ReDoS) (https://github.com/advisories/GHSA-5pgg-2g8v-p4x9)
  - No fix available in npm repository as of July 2025. Consider migrating to an alternative library in the future.

### Security Recommendations
- Monitor for new releases of xlsx that address these vulnerabilities
- Consider limiting the use of the xlsx library to trusted data only
- Implement input validation before processing any Excel files with this library