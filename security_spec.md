# Security Specification - FreeMe Shield

## Data Invariants
1. A user can only read and write their own profile.
2. Security logs can only be created by the system or the user themselves (for demo purposes), but only readable by the owner.
3. Vault files are private and only accessible by the owner.
4. Immortality: `userId` and `createdAt` fields must never change after creation.

## The Dirty Dozen Payloads (Target: Access Bypass)
1. **Identity Spoofing**: Attempt to create a `UserProfile` for a different `userId`.
2. **PII Leak**: Attempt to read another user's `UserProfile`.
3. **Log Injection**: Attempt to write a `SecurityLog` to another user's sub-collection.
4. **Log Scraper**: Attempt to list all `SecurityLogs` across all users.
5. **Vault Breach**: Attempt to read a `VaultFile` from another user's vault.
6. **Shadow Update**: Attempt to update a `UserProfile` with a hidden `isAdmin: true` field.
7. **Immortality Breach**: Attempt to change the `userId` of an existing `VaultFile`.
8. **Malicious Metadata**: Attempt to inject a 1MB string into a `fileName` field.
9. **Orphaned Log**: Attempt to create a log for a non-existent user.
10. **State Corruption**: Attempt to change `shieldEnabled` status for another user.
11. **GPS Poisoning**: Attempt to update `lastKnownLocation` with invalid coordinates (non-numbers).
12. **System Field Override**: Attempt to manually mark a malware scan as "clean" by modifying a system-only status field if one existed.

## Test Runner (Conceptual)
All the above must return `PERMISSION_DENIED`.
