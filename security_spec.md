# Security Specification for AkinAI

## Data Invariants
- A post must have a valid title, type, and authorId.
- Only the specific admin email (`aki.sokpah.link@gmail.com`) can create or modify posts.
- Public read access is granted to all posts for unauthenticated users.
- Timestamps must be server-generated.

## The Dirty Dozen Payloads (Rejection Targets)
1. **Identity Spoofing**: Post creation with a different `authorId` than the admin's UID.
2. **Privilege Escalation**: Post creation from a non-admin user.
3. **Shadow Update**: Updating a post with extra fields not defined in the schema (e.g., `isVerified: true`).
4. **ID Poisoning**: Injecting massive strings as document IDs.
5. **Timestamp Trust**: Sending a client-side `createdAt` timestamp.
6. **Malicious Content**: Injecting 1MB of junk into the `title` field.
7. **Type Mismatch**: Setting `type` to a value not in the enum (e.g., `exploit`).
8. **Unverified Auth**: Accessing admin rights with an unverified email.
9. **Relational Sync Break**: Deleting a post without being the owner.
10. **Resource Exhaustion**: Sending massive arrays in the `tags` field.
11. **Anonymity Bypass**: Anonymous users trying to write to the `posts` collection.
12. **Bypassing Server Rules**: Attempting to list users or other sensitive data.

## Test Runner
The following `firestore.rules` will be verified against these payloads via automated simulation.
