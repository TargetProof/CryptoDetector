# Enhanced Cryptojacking Detection Script

A comprehensive tool for detecting hidden cryptocurrency miners in startup scripts across datacenter and cloud environments.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Command-Line Arguments](#command-line-arguments)
- [Detection Methodology](#detection-methodology)
- [Cloud Provider Support](#cloud-provider-support)
- [Performance Optimizations](#performance-optimizations)
- [Output Formats](#output-formats)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

## Overview

This script is designed to detect cryptojacking malware that may be hidden in startup scripts, scheduled tasks, services, and other persistence mechanisms across both local datacenter environments (Windows and Linux) and major cloud providers (AWS, GCP, and Azure). It uses advanced pattern matching with a scoring system to identify potential cryptocurrency miners with high accuracy.

## Features

- **Comprehensive Detection**: Scans for over 100 indicators of cryptomining activity
- **Multi-Environment Support**: Works on both Windows and Linux systems
- **Cloud Provider Integration**: Scans AWS, GCP, and Azure environments
- **Advanced Pattern Matching**: Uses regex patterns with category-based scoring
- **Base64 Decoding**: Automatically detects and decodes base64-encoded commands
- **Performance Optimized**: Parallel processing and memory-efficient scanning
- **Detailed Reporting**: Generates comprehensive reports with severity levels
- **Multiple Output Formats**: Supports text, JSON, and CSV output formats
- **Robust Error Handling**: Gracefully handles errors with recovery mechanisms
- **Performance Monitoring**: Tracks execution time and resource usage

## Installation

### Prerequisites

- Python 3.6 or higher
- Required Python packages:
  - For local scanning: `psutil`
  - For AWS scanning: `boto3`
  - For GCP scanning: `google-cloud-compute`, `google-cloud-functions`
  - For Azure scanning: `azure-identity`, `azure-mgmt-compute`, `azure-mgmt-resource`, `azure-mgmt-subscription`

### Installation Steps

1. Clone or download the repository:

```bash
git clone https://github.com/TargetProof/crypto-detector.git
cd crypto-detector
```

2. Install required packages:

```bash
# For all features
pip install psutil boto3 google-cloud-compute google-cloud-functions azure-identity azure-mgmt-compute azure-mgmt-resource azure-mgmt-subscription

# For local scanning only
pip install psutil
```

3. Ensure all script files are in the same directory:
   - `crypto_detector_optimized.py` (main script)
   - `enhanced_miner_patterns.py` (detection patterns)
   - `enhanced_cloud_scanning.py` (cloud provider scanning)
   - `enhanced_logging.py` (logging and error handling)
   - `performance_optimization.py` (performance optimizations)

## Usage

### Basic Usage

Run the script with default settings to scan the local system:

```bash
python crypto_detector_optimized.py
```

### Scan Local System Only

To scan only the local system and skip cloud providers:

```bash
python crypto_detector_optimized.py --local-only
```

### Scan Specific Cloud Providers

To scan specific AWS regions:

```bash
python crypto_detector_optimized.py --aws-regions us-east-1 us-west-2
```

To scan specific GCP projects:

```bash
python crypto_detector_optimized.py --gcp-projects your-project-id
```

To scan specific Azure subscriptions:

```bash
python crypto_detector_optimized.py --azure-subscriptions your-subscription-id
```

### Scan Additional Directory

To scan a specific directory in addition to standard locations:

```bash
python crypto_detector_optimized.py --scan-dir /path/to/directory
```

### Change Output Format

To output results in JSON format:

```bash
python crypto_detector_optimized.py --format json
```

## Command-Line Arguments

| Argument | Short | Description | Default |
|----------|-------|-------------|---------|
| `--output` | `-o` | Output file for scan results | `crypto_scan_YYYYMMDD_HHMMSS.txt` |
| `--summary` | `-s` | Summary report file | `crypto_scan_summary_YYYYMMDD_HHMMSS.txt` |
| `--format` | `-f` | Output format (text, json, csv) | `text` |
| `--log-file` | `-l` | Log file path | `crypto_scan_log_YYYYMMDD_HHMMSS.txt` |
| `--verbose` | `-v` | Enable verbose logging | `False` |
| `--quiet` | `-q` | Suppress console output | `False` |
| `--local-only` | | Only scan local system, skip cloud providers | `False` |
| `--aws-regions` | | AWS regions to scan (space-separated) | All regions |
| `--aws-profile` | | AWS profile to use | Default profile |
| `--gcp-projects` | | GCP projects to scan (space-separated) | Default project |
| `--azure-subscriptions` | | Azure subscription IDs to scan (space-separated) | All accessible subscriptions |
| `--max-workers` | | Maximum number of worker threads for parallel scanning | Auto-detected |
| `--no-base64-decode` | | Disable base64 decoding of content | `False` |
| `--performance-report` | `-p` | Performance report file | `crypto_scan_performance_YYYYMMDD_HHMMSS.txt` |
| `--scan-dir` | `-d` | Additional directory to scan | None |

## Detection Methodology

The script uses a multi-layered approach to detect cryptominers:

1. **Pattern Matching**: Checks content against a comprehensive set of regex patterns organized into categories:
   - Miner software names (xmrig, ccminer, etc.)
   - Mining pool URLs and protocols
   - Cryptocurrency wallet addresses
   - Miner command-line parameters
   - Obfuscation techniques
   - Behavioral indicators
   - Network indicators

2. **Scoring System**: Each match contributes to a score based on the category weight:
   - Mining pools: Highest weight (9)
   - Miner software: High weight (8)
   - Wallet patterns: Medium-high weight (7)
   - Miner parameters: Medium weight (6)
   - Behavioral indicators: Medium-low weight (5)
   - Obfuscation techniques: Low-medium weight (4)
   - Network indicators: Low weight (3)

3. **Severity Classification**:
   - HIGH: Score ≥ 15
   - MEDIUM: Score ≥ 8
   - LOW: Score > 0
   - CLEAN: Score = 0

4. **Base64 Decoding**: Automatically detects and decodes base64-encoded content to uncover obfuscated commands.

## Cloud Provider Support

### AWS

- EC2 instances (UserData, tags)
- Launch templates
- Lambda functions (environment variables, configuration)
- CloudFormation stacks
- ECS tasks and containers
- CodeBuild projects
- SSM documents
- EventBridge rules

### GCP

- Compute Engine instances (metadata, startup scripts)
- Instance templates
- Cloud Functions
- Cloud Run services
- Cloud Scheduler jobs

### Azure

- Virtual machines (extensions, custom scripts, OS profiles)
- VM Scale Sets
- Automation accounts and runbooks
- Function apps
- Container instances
- Logic apps

## Performance Optimizations

The script includes several performance optimizations:

1. **Regex Optimization**: Pre-compiles regex patterns and caches results
2. **Memory-Efficient Processing**: Processes large files in chunks to reduce memory usage
3. **Parallel Processing**: Uses thread and process pools for concurrent scanning
4. **Scan Prioritization**: Prioritizes high-value targets for more efficient scanning
5. **Result Caching**: Caches detection results to avoid redundant processing
6. **Optimized Base64 Detection**: Uses heuristics to identify and decode only likely base64 content
7. **Resource Monitoring**: Tracks execution time and resource usage for performance tuning

## Output Formats

### Text Format (Default)

Human-readable text format with sections for each severity level.

### JSON Format

Structured JSON format suitable for programmatic processing:

```json
[
  {
    "timestamp": "2025-03-17T16:30:00.000Z",
    "source": "Linux Cron: /etc/crontab",
    "item_type": "Cron File",
    "content_preview": "* * * * * root /usr/local/bin/xmrig -o stratum+tcp://pool.example.com:3333 -u wallet...",
    "matches": [
      {
        "pattern": "xmrig",
        "match": "xmrig",
        "category": "miner_software",
        "weight": 8
      },
      {
        "pattern": "stratum\\+tcp://",
        "match": "stratum+tcp://",
        "category": "mining_pools",
        "weight": 9
      }
    ],
    "score": 17,
    "severity": "HIGH"
  }
]
```

### CSV Format

Comma-separated values format for spreadsheet analysis:

```
timestamp,source,item_type,content_preview,matches,score,severity
2025-03-17T16:30:00.000Z,"Linux Cron: /etc/crontab","Cron File","* * * * * root /usr/local/bin/xmrig -o stratum+tcp://pool.example.com:3333 -u wallet...","[{""pattern"":""xmrig"",""match"":""xmrig"",""category"":""miner_software"",""weight"":8},{""pattern"":""stratum\\+tcp://"",""match"":""stratum+tcp://"",""category"":""mining_pools"",""weight"":9}]",17,"HIGH"
```

## Examples

### Basic Scan with Summary

```bash
python crypto_detector_optimized.py
```

This will:
1. Scan the local system (Windows or Linux)
2. Scan cloud environments if credentials are available
3. Generate a detailed report, summary report, and log file
4. Display progress and results in the console

### Comprehensive Cloud Scan

```bash
python crypto_detector_optimized.py --aws-regions us-east-1 us-west-2 --gcp-projects project1 project2 --azure-subscriptions sub1 sub2 --format json --verbose
```

This will:
1. Scan specific AWS regions, GCP projects, and Azure subscriptions
2. Output results in JSON format
3. Enable verbose logging for detailed progress information

### Performance-Focused Scan

```bash
python crypto_detector_optimized.py --local-only --max-workers 16 --performance-report perf.txt
```

This will:
1. Scan only the local system
2. Use 16 worker threads for parallel scanning
3. Generate a detailed performance report in perf.txt

## Project Structure

- `crypto_detector_optimized.py`: Main script with optimized scanning logic
- `enhanced_miner_patterns.py`: Comprehensive detection patterns for cryptominers
- `enhanced_cloud_scanning.py`: Cloud provider scanning capabilities
- `enhanced_logging.py`: Logging and error handling functionality
- `performance_optimization.py`: Performance optimization utilities

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
