# SillyTavern Lorebook JSON Specification

## Overview

This document defines a recommended specification for creating a SillyTavern lorebook JSON file.

**Baseline version**: This specification targets SillyTavern 1.12+. Fields added in newer versions will be noted. Older versions may not support all fields listed here.

A lorebook in SillyTavern is a structured JSON document containing entries that can be automatically injected into prompts based on keyword matching, context scanning, or activation logic.

Lorebooks are used to:

* Store worldbuilding information
* Define characters, locations, factions, and events
* Maintain continuity in roleplay sessions
* Dynamically inject contextual information into prompts
* Improve long-form memory and consistency

---

# File Structure

A SillyTavern lorebook file is a JSON object.

## Top-Level Schema

```json
{
  "entries": {
    "0": {
      "uid": 0,
      "key": ["example"],
      "keysecondary": [],
      "comment": "Example entry",
      "content": "Lore content goes here.",
      "constant": false,
      "selective": false,
      "order": 100,
      "position": 0,
      "disable": false,
      "excludeRecursion": false,
      "probability": 100,
      "useProbability": false,
      "depth": 4,
      "group": "default",
      "scanDepth": null,
      "caseSensitive": false,
      "matchWholeWords": false,
      "automationId": "",
      "role": 0,
      "sticky": 0,
      "cooldown": 0,
      "delay": 0,
      "vectorized": false
    }
  },
  "name": "Example Lorebook",
  "description": "Optional lorebook description",
  "scanDepth": 4,
  "tokenBudget": 512,
  "recursiveScanning": true,
  "extensions": {}
}
```

---

# Top-Level Fields

## `entries`

Type: `object`

Contains all lore entries indexed by stringified numeric IDs.

Example:

```json
"entries": {
  "0": { ... },
  "1": { ... }
}
```

---

## `name`

Type: `string`

Human-readable lorebook name.

Example:

```json
"name": "Cyberpunk Worldbook"
```

---

## `description`

Type: `string`

Optional description of the lorebook.

---

## `scanDepth`

Type: `integer`

Defines how many recent messages are scanned for activation keys.

Typical values:

* `2`
* `4`
* `8`

---

## `tokenBudget`

Type: `integer`

Maximum token allocation for lore injection.

Typical values:

* `256`
* `512`
* `1024`

---

## `recursiveScanning`

Type: `boolean`

If enabled, newly inserted lore content can trigger additional lore entries.

---

## `extensions`

Type: `object`

Reserved for extension-specific metadata.

**Pass-through behavior**: Tools processing lorebook JSON should preserve the `extensions` object as-is during import, edit, and export. Do not strip, validate, or modify extension data. If the field is absent, default to an empty object `{}`. Unknown keys within `extensions` must be retained to ensure compatibility with SillyTavern extensions that rely on this data.

---

# Entry Schema

Each lore entry is an object.

## Required Fields

| Field     | Type     | Description                    |
| --------- | -------- | ------------------------------ |
| `uid`     | integer  | Unique identifier              |
| `key`     | string[] | Primary activation keywords    |
| `content` | string   | Lore text inserted into prompt |

All other entry fields are optional and will default to sensible values if absent. See "Minimal Valid Entry Example" below.

**Note**: While `comment`, `keysecondary`, `selective`, and other fields are not strictly required, most SillyTavern versions expect them to be present. Exporters should include all fields with default values for maximum compatibility. Importers should fill missing fields with defaults (see SPECS.md for normalization logic).

---

# Entry Fields Reference

## `uid`

Type: `integer`

Unique numeric identifier.

Example:

```json
"uid": 15
```

---

## `key`

Type: `string[]`

Primary keywords used to activate the entry.

Example:

```json
"key": ["Night City", "NC"]
```

---

## `keysecondary`

Type: `string[]`

Secondary keywords used with selective matching.

Example:

```json
"keysecondary": ["corporation", "megacorp"]
```

---

## `comment`

Type: `string`

Human-readable note for organization.

Example:

```json
"comment": "Arasaka Corporation"
```

---

## `content`

Type: `string`

The actual lore text injected into the prompt.

Supports:

* Plain text
* Markdown
* Structured formatting
* Multi-line content

Example:

```json
"content": "Arasaka is a powerful megacorporation headquartered in Night City."
```

---

## `constant`

Type: `boolean`

If true, the entry is always included regardless of activation.

---

## `selective`

Type: `boolean`

If true, both primary and secondary keys are required.

---

## `order`

Type: `integer`

Controls insertion priority.

Lower numbers are inserted earlier.

Typical range:

```text
0-1000
```

---

## `position`

Type: `integer`

Determines where content is inserted.

Defined values:

| Value | Meaning                     |
| ----- | --------------------------- |
| `0`   | Before character definition |
| `1`   | After character definition  |
| `2`   | Author's note area          |

Values `0`–`2` are the standard positions. Future SillyTavern versions may add additional position values; consumers should treat unknown position values as equivalent to `0`.

---

## `disable`

Type: `boolean`

Disables the entry without deleting it.

---

## `excludeRecursion`

Type: `boolean`

Prevents recursive activation from injected lore.

---

## `probability`

Type: `integer`

Chance of activation from `0-100`.

---

## `useProbability`

Type: `boolean`

Enables probabilistic activation.

---

## `depth`

Type: `integer`

Maximum recursive scan depth.

---

## `group`

Type: `string`

Logical grouping label.

Example:

```json
"group": "factions"
```

---

## `scanDepth`

Type: `integer | null`

Overrides global scan depth for this entry.

---

## `caseSensitive`

Type: `boolean`

Enables case-sensitive keyword matching.

---

## `matchWholeWords`

Type: `boolean`

If true, keywords only activate on full-word matches.

---

## `automationId`

Type: `string`

Reserved for automation or extension systems.

---

## `role`

Type: `integer`

Defines insertion role behavior.

Defined values:

| Value | Meaning   |
| ----- | --------- |
| `0`   | System    |
| `1`   | User      |
| `2`   | Assistant |

Values `0`–`2` are the standard roles. Future SillyTavern versions may add additional role values; consumers should treat unknown role values as equivalent to `0` (System).

---

## `sticky`

Type: `integer`

Controls persistence duration.

Typical values:

* `0` = disabled
* Positive integer = number of turns retained

---

## `cooldown`

Type: `integer`

Minimum turns before reactivation.

---

## `delay`

Type: `integer`

Turns before activation occurs.

---

## `vectorized`

Type: `boolean`

Enables vector database integration if supported.

---

# Minimal Valid Entry Example

```json
{
  "uid": 0,
  "key": ["dragon"],
  "keysecondary": [],
  "comment": "Dragon lore",
  "content": "Dragons are ancient intelligent reptiles capable of speech and magic.",
  "constant": false,
  "selective": false,
  "order": 100,
  "position": 0,
  "disable": false
}
```

---

# Recommended Best Practices

## Use Clear Keywords

Prefer:

```json
"key": ["Arasaka", "Arasaka Corporation"]
```

Avoid overly generic triggers:

```json
"key": ["company"]
```

---

## Keep Entries Focused

Each entry should represent:

* One character
* One location
* One faction
* One concept

Avoid excessively large entries.

---

## Optimize Token Usage

Use concise factual writing.

Prefer:

```text
Arasaka is a Japanese megacorporation specializing in security and military technology.
```

Avoid unnecessary prose.

---

## Organize Using Groups

Example groups:

* `characters`
* `locations`
* `technology`
* `history`
* `factions`

---

## Use Recursive Scanning Carefully

Recursive scanning can:

* Improve contextual chaining
* Increase token usage
* Cause unintended activations

Recommended:

```json
"recursiveScanning": true
```

paired with:

```json
"excludeRecursion": true
```

for sensitive entries.

---

# Validation Rules

A valid lorebook should:

* Be valid UTF-8 JSON
* Use unique `uid` values
* Use numeric string keys inside `entries`
* Include `content` as a string
* Include `key` as an array
* Avoid circular recursive triggers

---

# Example Complete Lorebook

```json
{
  "entries": {
    "0": {
      "uid": 0,
      "key": ["Night City"],
      "keysecondary": [],
      "comment": "Main city",
      "content": "Night City is a dense urban megacity dominated by corporations.",
      "constant": false,
      "selective": false,
      "order": 100,
      "position": 0,
      "disable": false,
      "excludeRecursion": false,
      "probability": 100,
      "useProbability": false,
      "depth": 4,
      "group": "locations",
      "scanDepth": null,
      "caseSensitive": false,
      "matchWholeWords": true,
      "automationId": "",
      "role": 0,
      "sticky": 0,
      "cooldown": 0,
      "delay": 0,
      "vectorized": false
    }
  },
  "name": "Cyberpunk Lorebook",
  "description": "World lore for cyberpunk RP",
  "scanDepth": 4,
  "tokenBudget": 512,
  "recursiveScanning": true,
  "extensions": {}
}
```

---

# Compatibility Notes

This specification is designed for:

* SillyTavern worldbooks
* Embedded lorebooks
* AI roleplay systems compatible with Tavern lore formats

Field availability may vary depending on:

* SillyTavern version
* Installed extensions
* Vector database support
* Custom forks

---

# Suggested JSON Generation Workflow

1. Create metadata
2. Create unique entry IDs
3. Define activation keys
4. Write concise lore content
5. Assign groups and priorities
6. Validate JSON syntax
7. Import into SillyTavern

---

# Importing Into SillyTavern

Typical import workflow:

1. Open SillyTavern
2. Navigate to World Info / Lorebooks
3. Select Import
4. Choose the JSON file
5. Verify entry parsing
6. Enable the lorebook

---

# End of Specification

