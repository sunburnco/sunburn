# Tests

## Structure

- Test superuser is `test@s.b` `passwordpassword`
- All accounts `*@s.b` `password`
- Account names:
  - "owner" owns the server but has no roles
  - "admin" has the `ADMINISTRATOR` permission
  - "mod" has a role to test `MANAGE_*` permissions
  - "alice" is an unprivileged member
  - "bob" is a nonmember
- Roles:
  - "dummymax" = 6
  - "admin" = 5
  - "dummyplus" = 4
  - "mod" = 3
  - "dummy" = 2
  - "channelMuted" = 1
  - "everyone" = 0
- Two servers: `server` and `charlieServer`
  - All "charlie\*" accounts are unprivileged members of "server" to test permission leaks (e.g., "charlieAdmin" is `ADMINISTRATOR` in "charlieServer" so he shouldn't have admin in "server")
- Tests are numbered as `row.column`
- 🟩 means "**can**," not "passed"
- ⛔ means "**cannot**," not "failed"

## DMs

1. 🟩 Alice can DM Bob
1. ⛔ Alice cannot make a DM from Bob
1. 🟩 Alice can see her DM to Bob
1. 🟩 Alice can see her DM from Bob
1. ⛔ Charlie cannot see a DM from Alice to Bob
1. 🟩 Alice can see her row in `dmListFrom`
1. 🟩 Alice can see her row in `dmListTo`
1. ⛔ Charlie cannot see Alice's row in `dmListFrom`
1. ⛔ Charlie cannot see Alice's row in `dmListTo`

## Servers (Meta)

"mod" roles need `MANAGE_SERVER`

utilization/quota: owner 1/2, others 0/0

|                                            | Bob (.1) | Alice (.2) | Mod (.3) | Admin (.4) | Owner (.5) | CharlieMod (.6) | CharlieAdmin (.7) | Charlie (owner) (.8) |
| ------------------------------------------ | :------: | :--------: | :------: | :--------: | :--------: | :-------------: | :---------------: | :------------------: |
| (1) Create a server                        |    ⛔    |     ⛔     |    ⛔    |     ⛔     |     🟩     |       ⛔        |        ⛔         |          ⛔          |
| (2) Create a server with a different owner |    ⛔    |     ⛔     |    ⛔    |     ⛔     |     ⛔     |       ⛔        |        ⛔         |          ⛔          |
| (3) See server                             |    ⛔    |     🟩     |    🟩    |     🟩     |     🟩     |       🟩        |        🟩         |          🟩          |
| (4) Rename server                          |    ⛔    |     ⛔     |    🟩    |     🟩     |     🟩     |       ⛔        |        ⛔         |          ⛔          |
| (5) Change server owner                    |    ⛔    |     ⛔     |    ⛔    |     ⛔     |     🟩     |       ⛔        |        ⛔         |          ⛔          |
| (6) Delete server                          |    ⛔    |     ⛔     |    ⛔    |     ⛔     |     🟩     |       ⛔        |        ⛔         |          ⛔          |

🟩 x13<br />
⛔ x35

## Servers (Messages)

"mod" roles need `MANAGE_MESSAGES` for #general

|                                             | Bob (.1) | Alice (.2) | Mod (.3) | Admin (.4) | Owner (.5) | CharlieMod (.6) | CharlieAdmin (.7) | Charlie (owner) (.8) |
| ------------------------------------------- | :------: | :--------: | :------: | :--------: | :--------: | :-------------: | :---------------: | :------------------: |
| (1) Read 2 messages in #general             |    ⛔    |     🟩     |    🟩    |     🟩     |     🟩     |       🟩        |        🟩         |          🟩          |
| (2) Send messages to #general               |    ⛔    |     🟩     |    🟩    |     🟩     |     🟩     |       🟩        |        🟩         |          🟩          |
| (3) Read 2 messages in #muted               |    ⛔    |     🟩     |    🟩    |     🟩     |     🟩     |       🟩        |        🟩         |          🟩          |
| (4) Send messages to #muted                 |    ⛔    |     ⛔     |    ⛔    |     🟩     |     🟩     |       ⛔        |        ⛔         |          ⛔          |
| (5) Read 2 messages in #modOnly             |    ⛔    |     ⛔     |    🟩    |     🟩     |     🟩     |       ⛔        |        ⛔         |          ⛔          |
| (6) Send messages to #modOnly               |    ⛔    |     ⛔     |    🟩    |     🟩     |     🟩     |       ⛔        |        ⛔         |          ⛔          |
| (7) Read 1 message in #ownerOnly            |    ⛔    |     ⛔     |    ⛔    |     ⛔     |     🟩     |       ⛔        |        ⛔         |          ⛔          |
| (8) Send messages to #ownerOnly             |    ⛔    |     ⛔     |    ⛔    |     ⛔     |     🟩     |       ⛔        |        ⛔         |          ⛔          |
| (9) Delete a message from Alice in #general |    ⛔    |     🟩     |    🟩    |     🟩     |     🟩     |       ⛔        |        ⛔         |          ⛔          |
| (10) Delete a message from Alice in #muted  |    ⛔    |     🟩     |    ⛔    |     🟩     |     🟩     |       ⛔        |        ⛔         |          ⛔          |
| (11) Edit a message from Alice in #general  |    ⛔    |     🟩     |    ⛔    |     ⛔     |     ⛔     |       ⛔        |        ⛔         |          ⛔          |

🟩 x39<br />
⛔ x49

## Servers (Channels)

"mod" roles need `MANAGE_CHANNELS` and `CHANNEL_READ` for #modOnly

|                                       | Bob (.1) | Alice (.2) | Mod (.3) | Admin (.4) | Owner (.5) | CharlieMod (.6) | CharlieAdmin (.7) | Charlie (owner) (.8) |
| ------------------------------------- | :------: | :--------: | :------: | :--------: | :--------: | :-------------: | :---------------: | :------------------: |
| (1) See #general                      |    ⛔    |     🟩     |    🟩    |     🟩     |     🟩     |       ⛔        |        ⛔         |          ⛔          |
| (2) See #modOnly                      |    ⛔    |     ⛔     |    🟩    |     🟩     |     🟩     |       ⛔        |        ⛔         |          ⛔          |
| (3) See #ownerOnly                    |    ⛔    |     ⛔     |    ⛔    |     ⛔     |     🟩     |       ⛔        |        ⛔         |          ⛔          |
| (4) Rename #general                   |    ⛔    |     ⛔     |    🟩    |     🟩     |     🟩     |       ⛔        |        ⛔         |          ⛔          |
| (5) Create #deleteme                  |    ⛔    |     ⛔     |    🟩    |     🟩     |     🟩     |       ⛔        |        ⛔         |          ⛔          |
| (6) Delete #deleteme                  |    ⛔    |     ⛔     |    🟩    |     🟩     |     🟩     |       ⛔        |        ⛔         |          ⛔          |
| (7) Assign "dummy" role to #general   |    ⛔    |     ⛔     |    🟩    |     🟩     |     🟩     |       ⛔        |        ⛔         |          ⛔          |
| (8) Remove "dummy" role from #general |    ⛔    |     ⛔     |    🟩    |     🟩     |     🟩     |       ⛔        |        ⛔         |          ⛔          |

🟩 x23<br />
⛔ x41

## Servers (Roles and Assignments)

"mod" roles need `MANAGE_ROLES` and `MANAGE_MEMBERS`

|                                                | Bob (.1) | Alice (.2) | Mod (.3) | Admin (.4) | Owner (.5) | CharlieMod (.6) | CharlieAdmin (.7) | Charlie (owner) (.8) |
| ---------------------------------------------- | :------: | :--------: | :------: | :--------: | :--------: | :-------------: | :---------------: | :------------------: |
| (1) See roles for server                       |    ⛔    |     🟩     |    🟩    |     🟩     |     🟩     |       ⛔        |        ⛔         |          ⛔          |
| (2) Create the "deleteme" role (ordinal 1.5)   |    ⛔    |     ⛔     |    🟩    |     🟩     |     🟩     |       ⛔        |        ⛔         |          ⛔          |
| (3) Change the color on the "deleteme" role    |    ⛔    |     ⛔     |    🟩    |     🟩     |     🟩     |       ⛔        |        ⛔         |          ⛔          |
| (4) Delete the "deleteme" role                 |    ⛔    |     ⛔     |    🟩    |     🟩     |     🟩     |       ⛔        |        ⛔         |          ⛔          |
| (5) Create the "modplus" role (ordinal 3.5)    |    ⛔    |     ⛔     |    ⛔    |     🟩     |     🟩     |       ⛔        |        ⛔         |          ⛔          |
| (6) Change the color on the "modplus" role     |    ⛔    |     ⛔     |    ⛔    |     🟩     |     🟩     |       ⛔        |        ⛔         |          ⛔          |
| (7) Assign user "mod" to "modplus" role        |    ⛔    |     ⛔     |    ⛔    |     🟩     |     🟩     |       ⛔        |        ⛔         |          ⛔          |
| (8) Change the color on the "mod" role         |    ⛔    |     ⛔     |    ⛔    |     🟩     |     🟩     |       ⛔        |        ⛔         |          ⛔          |
| (9) Delete the "modplus" role                  |    ⛔    |     ⛔     |    ⛔    |     🟩     |     🟩     |       ⛔        |        ⛔         |          ⛔          |
| (10) Create the "adminplus" role (ordinal 5.5) |    ⛔    |     ⛔     |    ⛔    |     ⛔     |     🟩     |       ⛔        |        ⛔         |          ⛔          |
| (11) Delete the "adminplus" role               |    ⛔    |     ⛔     |    ⛔    |     ⛔     |     🟩     |       ⛔        |        ⛔         |          ⛔          |

🟩 x25<br />
⛔ x63

## Servers (Role Permissions)

"mod" roles need `MANAGE_ROLE_PERMISSIONS`

> **DANGER** no checks are done on what permissions are being assigned. `MANAGE_ROLE_PERMISSIONS` is effectively the same as `ADMINISTRATOR`.

|                                                                | Bob (.1) | Alice (.2) | Mod (.3) | Admin (.4) | Owner (.5) | CharlieMod (.6) | CharlieAdmin (.7) | Charlie (owner) (.8) |
| -------------------------------------------------------------- | :------: | :--------: | :------: | :--------: | :--------: | :-------------: | :---------------: | :------------------: |
| (1) See role permission assignments for server                 |    ⛔    |     🟩     |    🟩    |     🟩     |     🟩     |       ⛔        |        ⛔         |          ⛔          |
| (2) Give `MANAGE_ROLE_PERMISSIONS` to the "dummy" role         |    ⛔    |     ⛔     |    🟩    |     🟩     |     🟩     |       ⛔        |        ⛔         |          ⛔          |
| (3) Remove `MANAGE_ROLE_PERMISSIONS` from the "dummy" role     |    ⛔    |     ⛔     |    🟩    |     🟩     |     🟩     |       ⛔        |        ⛔         |          ⛔          |
| (4) Give `MENTION_EVERYONE` to the "dummy" role                |    ⛔    |     ⛔     |    🟩    |     🟩     |     🟩     |       ⛔        |        ⛔         |          ⛔          |
| (5) Remove `MENTION_EVERYONE` from the "dummy" role            |    ⛔    |     ⛔     |    🟩    |     🟩     |     🟩     |       ⛔        |        ⛔         |          ⛔          |
| (6) Give `MANAGE_ROLE_PERMISSIONS` to the "dummyplus" role     |    ⛔    |     ⛔     |    ⛔    |     🟩     |     🟩     |       ⛔        |        ⛔         |          ⛔          |
| (7) Remove `MANAGE_ROLE_PERMISSIONS` from the "dummyplus" role |    ⛔    |     ⛔     |    ⛔    |     🟩     |     🟩     |       ⛔        |        ⛔         |          ⛔          |
| (8) Give `MANAGE_ROLE_PERMISSIONS` to the "dummymax" role      |    ⛔    |     ⛔     |    ⛔    |     ⛔     |     🟩     |       ⛔        |        ⛔         |          ⛔          |
| (9) Remove `MANAGE_ROLE_PERMISSIONS` from the "dummymax" role  |    ⛔    |     ⛔     |    ⛔    |     ⛔     |     🟩     |       ⛔        |        ⛔         |          ⛔          |

🟩 x22<br />
⛔ x50

## Servers (Invites)

"mod" roles need `MANAGE_SERVER` ("a" tests) and `CREATE_INVITES` ("b" tests)

|                                 | Bob (.1) | Alice (.2) | Mod (.3) | Admin (.4) | Owner (.5) | CharlieMod (.6) | CharlieAdmin (.7) | Charlie (owner) (.8) |
| ------------------------------- | :------: | :--------: | :------: | :--------: | :--------: | :-------------: | :---------------: | :------------------: |
| (1) View an invite              |    🟩    |     🟩     |    🟩    |     🟩     |     🟩     |       🟩        |        🟩         |          🟩          |
| (2a) Create an invite           |    ⛔    |     ⛔     |    🟩    |     🟩     |     🟩     |       ⛔        |        ⛔         |          ⛔          |
| (3b) Create an invite           |    ⛔    |     ⛔     |    🟩    |     🟩     |     🟩     |       ⛔        |        ⛔         |          ⛔          |
| (4a) List invites               |    ⛔    |     ⛔     |    🟩    |     🟩     |     🟩     |       ⛔        |        ⛔         |          ⛔          |
| (5b) List invites               |    ⛔    |     ⛔     |    ⛔    |     🟩     |     🟩     |       ⛔        |        ⛔         |          ⛔          |
| (6a) Delete an invite           |    ⛔    |     ⛔     |    🟩    |     🟩     |     🟩     |       ⛔        |        ⛔         |          ⛔          |
| (7b) Delete an invite           |    ⛔    |     ⛔     |    ⛔    |     🟩     |     🟩     |       ⛔        |        ⛔         |          ⛔          |
| (8) Accept the `charlie` invite |    🟩    |     🟩     |    🟩    |     🟩     |     🟩     |       🟩        |        🟩         |          🟩          |

🟩 x32<br />
⛔ x32
