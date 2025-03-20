#!/usr/bin/env python3
"""
Enhanced Cryptominer Detection Patterns
This module provides improved detection patterns for cryptomining malware
"""

# Basic miner software names (expanded from original)
MINER_SOFTWARE = [
    r"xmrig",
    r"minerd",
    r"ccminer",
    r"cpuminer",
    r"ethminer",
    r"t-rex",
    r"nanominer",
    r"nbminer",
    r"teamredminer",
    r"gminer",
    r"phoenixminer",
    r"lolminer",
    r"bminer",
    r"claymore",
    r"excavator",
    r"bfgminer",
    r"cgminer",
    r"sgminer",
    r"xmr-stak",
    r"cryptonight",
    r"coinhive",
    r"minergate",
    r"nicehash",
    r"nanopool",
]

# Mining pool URLs and protocols
MINING_POOLS = [
    r"stratum\+tcp://",
    r"stratum\+udp://",
    r"stratum\+ssl://",
    r"pool\.(hash|mine|xmr|btc|eth)",
    r"(crypto|coin|xmr|monero|btc|eth|zcash)pool",
    r"(mining|miner|crypto|coin).(pool|farm)",
    r"(us|eu|asia|sg|hk|jp)[-.]pool\.",
    r"(us|eu|asia)\d+\.pool\.",
    r"pool\.(minergate|nanopool|ethermine|flypool|f2pool|antpool|slushpool|hiveon|miningpoolhub)",
    r"(hashrate|hashpower|nicehash|minergate|nanopool|ethermine|flypool|f2pool|antpool|slushpool|hiveon|miningpoolhub)\.(com|org|net|io|me)",
    r"(xmr|monero|eth|ethereum|btc|bitcoin|ltc|litecoin|zec|zcash)\.(pool|mine)",
]

# Wallet address patterns for various cryptocurrencies
WALLET_PATTERNS = [
    # Bitcoin (BTC)
    r"\b(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}\b",
    # Ethereum (ETH)
    r"\b0x[a-fA-F0-9]{40}\b",
    # Monero (XMR)
    r"\b4[0-9AB][1-9A-HJ-NP-Za-km-z]{93}\b",
    # Litecoin (LTC)
    r"\b[LM3][a-km-zA-HJ-NP-Z1-9]{26,33}\b",
    # Zcash (ZEC)
    r"\bt[13][a-zA-Z0-9]{33}\b",
    # Dash
    r"\bX[1-9A-HJ-NP-Za-km-z]{33}\b",
    # Ripple (XRP)
    r"\br[0-9a-zA-Z]{24,34}\b",
    # Generic long alphanumeric strings (potential wallets)
    r"[0-9A-Za-z]{40,100}",
]

# Command line parameters used by miners
MINER_PARAMS = [
    r"--algo=",
    r"-a [a-z0-9]+",
    r"--coin=",
    r"--pool=",
    r"--user=",
    r"--pass=",
    r"--wallet=",
    r"--rig-id=",
    r"-o stratum",
    r"-u wallet",
    r"-p x",
    r"--cpu-priority=",
    r"--cpu-affinity=",
    r"--threads=",
    r"--max-cpu-usage=",
    r"--donate-level=",
    r"--no-huge-pages",
    r"--hash-report",
]

# Obfuscation techniques
OBFUSCATION_PATTERNS = [
    # Base64 encoded strings that might contain miner signatures
    r"(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})",
    # Hex encoded strings
    r"\\x[0-9a-fA-F]{2}",
    # URL encoded strings
    r"%[0-9a-fA-F]{2}",
    # Common evasion techniques
    r"eval\(.*\)",
    r"atob\(.*\)",
    r"setTimeout\(.*\)",
    r"new Function\(.*\)",
    r"String\.fromCharCode\(.*\)",
    # Suspicious variable names
    r"var _0x[a-f0-9]{4}",
    # Suspicious file operations
    r"chmod \+x",
    r"\.\/[a-zA-Z0-9]{1,8}",  # Short executable names
    r"curl -s.*\|bash",
    r"wget.*\|bash",
    r"curl.*\|sh",
    r"wget.*\|sh",
]

# Behavioral indicators
BEHAVIORAL_INDICATORS = [
    # Process hiding
    r"setsid",
    r"disown",
    r"nohup",
    r"screen -d",
    r"tmux new-session -d",
    r"daemon",
    r"--background",
    r">/dev/null",
    r"2>&1",
    # Persistence
    r"crontab -e",
    r"@reboot",
    r"*/[0-9]+ \* \* \* \*",  # Cron timing patterns
    r"rc\.local",
    r"systemctl enable",
    r"chkconfig on",
    r"update-rc\.d.*enable",
    # Defense evasion
    r"pkill -f",
    r"killall",
    r"\.\/[a-zA-Z0-9]{1,8} -d", # Short name with daemon flag
    r"ps aux \| grep",
    r"lsof -i",
    r"netstat -tulpn",
    r"iptables -A",
    r"nice -n [0-9]+",  # Process priority manipulation
]

# Network indicators
NETWORK_INDICATORS = [
    # Common mining ports
    r":[0-9]{4,5}",  # Generic port pattern
    r":3333",  # Common mining port
    r":5555",  # Common mining port
    r":7777",  # Common mining port
    r":8080",  # Common mining port
    r":8888",  # Common mining port
    r":9999",  # Common mining port
    r":14444",  # Common mining port
    r":45560",  # Common mining port
    # Domain generation algorithms (DGA) patterns
    r"[a-z0-9]{10,}\.(com|net|org|info|xyz|io)",
    # TOR exit nodes
    r"\.onion",
    # IP address patterns
    r"\b(?:\d{1,3}\.){3}\d{1,3}\b",
]

# Combine all patterns
ALL_PATTERNS = (
    MINER_SOFTWARE +
    MINING_POOLS +
    WALLET_PATTERNS +
    MINER_PARAMS +
    OBFUSCATION_PATTERNS +
    BEHAVIORAL_INDICATORS +
    NETWORK_INDICATORS
)

# Pattern categories for scoring
PATTERN_CATEGORIES = {
    "miner_software": MINER_SOFTWARE,
    "mining_pools": MINING_POOLS,
    "wallet_patterns": WALLET_PATTERNS,
    "miner_params": MINER_PARAMS,
    "obfuscation": OBFUSCATION_PATTERNS,
    "behavioral": BEHAVIORAL_INDICATORS,
    "network": NETWORK_INDICATORS
}

# Scoring weights for different pattern categories
CATEGORY_WEIGHTS = {
    "miner_software": 8,
    "mining_pools": 9,
    "wallet_patterns": 7,
    "miner_params": 6,
    "obfuscation": 4,
    "behavioral": 5,
    "network": 3
}

# Threshold for high confidence detection
HIGH_CONFIDENCE_THRESHOLD = 15

# Threshold for medium confidence detection
MEDIUM_CONFIDENCE_THRESHOLD = 8

def get_all_patterns():
    """Return all detection patterns"""
    return ALL_PATTERNS

def get_pattern_categories():
    """Return pattern categories with their patterns"""
    return PATTERN_CATEGORIES

def get_category_weights():
    """Return scoring weights for different pattern categories"""
    return CATEGORY_WEIGHTS

def get_confidence_thresholds():
    """Return confidence thresholds for detection"""
    return {
        "high": HIGH_CONFIDENCE_THRESHOLD,
        "medium": MEDIUM_CONFIDENCE_THRESHOLD
    }
