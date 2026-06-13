import dns from "dns/promises";
import net from "net";

// Blocks requests to private, loopback, link-local, and other internal-only IP ranges.
const isPrivateIP = (ip) => {
    if (net.isIPv4(ip)) {
        const parts = ip.split(".").map(Number);
        return (
            parts[0] === 10 || 
            (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
            (parts[0] === 192 && parts[1] === 168) || 
            parts[0] === 127 || 
            (parts[0] === 169 && parts[1] === 254) ||
            parts[0] === 0
        );
    }
    if (net.isIPv6(ip)) {
        const lower = ip.toLowerCase();
        return (
            lower === "::1" || 
            lower.startsWith("fe80:") || 
            lower.startsWith("fc") || 
            lower.startsWith("fd")
        );
    }
    return true;
};

/**
 * Resolves the hostname in `url` and returns true only if every resolved
 * address is a public, routable IP. Use before making any server-side
 * request to a user-supplied URL.
 */
export const isUrlSafe = async (url) => {
    let hostname;
    try {
        hostname = new URL(url).hostname;
    } catch {
        return false;
    }

    // Reject obvious local hostnames outright
    const blockedHosts = ["localhost", "0.0.0.0", "metadata.google.internal"];
    if (blockedHosts.includes(hostname.toLowerCase())) return false;

    try {
        const addresses = await dns.lookup(hostname, { all: true });
        if (addresses.length === 0) return false;
        return addresses.every((a) => !isPrivateIP(a.address));
    } catch {
        return false;
    }
};
