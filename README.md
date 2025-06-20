# Thingy: The A Thing Mod

**Thingy** is the official automated and assisted moderation backend for [A Thing](https://athing.space), a platform dedicated to providing a safe, secure, and anonymous space for everyone to express themselves freely especially around mental health and personal struggles.

## What is Thingy?

Thingy is a moderation tool designed specifically for A Thing. Its purpose is to help keep the platform safe and supportive by automatically reviewing user generated content (posts, journals, entries) for harmful, abusive, or sensitive material, while respecting the platform's commitment to anonymity and open expression.

## What does it do?

- **Automated Moderation:**  
  Uses OpenAI's Moderation API to analyze and flag content that may violate community guidelines, including hate, violence, and other harmful behaviors.

- **Sensitive Content Handling:**  
  Detects posts or entries related to self-harm or crisis. Instead of auto flagging or removing, such content is marked for human review, ensuring users in distress are not punished for seeking help.

- **Manual Review Support:**  
  Content flagged as sensitive or ambiguous is queued for review by human moderators, allowing for nuanced decisions in complex cases.

- **Moderation Logging:**  
  All moderation actions and cycles are logged for transparency and oversight.

- **Admin API:**  
  Provides authenticated endpoints for moderators and admins to view moderation results, logs, and system status.

## Why does it exist?

A Thing is committed to being a safe haven for open, anonymous expression especially for those struggling with mental health. Thingy helps maintain this environment by combining AI powered automation with human empathy, ensuring that moderation is both effective and compassionate.

---

*This service is strictly for use by A Thing and its moderation team.*
