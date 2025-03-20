#!/usr/bin/env python3
"""
Enhanced Cryptojacking Detection Script with Performance Optimizations
This script detects hidden cryptocurrency miners in startup scripts across
datacenter and cloud environments with improved detection patterns, cloud scanning,
robust error handling, logging, and performance optimizations.
"""

import os
import sys
import platform
import re
import subprocess
import base64
import json
import argparse
import time
import psutil
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor, as_completed
from functools import lru_cache

# Import enhanced modules
try:
    from enhanced_miner_patterns import (
        get_all_patterns,
        get_pattern_categories,
        get_category_weights,
        get_confidence_thresholds
    )
except ImportError:
    print("Error: enhanced_miner_patterns.py module not found. Please ensure it's in the same directory.")
    sys.exit(1)

try:
    from enhanced_cloud_scanning import (
        scan_aws_environment,
        scan_gcp_environment,
        scan_azure_environment,
        ScanResult
    )
except ImportError:
    print("Error: enhanced_cloud_scanning.py module not found. Please ensure it's in the same directory.")
    sys.exit(1)

try:
    from enhanced_logging import (
        create_logger,
        create_error_handler,
        create_result_writer,
        LogLevel,
        OutputFormat
    )
except ImportError:
    print("Error: enhanced_logging.py module not found. Please ensure it's in the same directory.")
    sys.exit(1)

try:
    from performance_optimization import (
        RegexOptimizer,
        FileProcessor,
        ParallelProcessor,
        ScanPrioritizer,
        PerformanceMonitor,
        Base64Optimizer
    )
except ImportError:
    print("Error: performance_optimization.py module not found. Please ensure it's in the same directory.")
    sys.exit(1)

# Initialize performance monitor
performance_monitor = PerformanceMonitor()

# Optimized detection function using RegexOptimizer
class MinerDetector:
    """Class for optimized cryptominer detection"""
    
    def __init__(self, logger, error_handler):
        """Initialize the miner detector"""
        self.logger = logger
        self.error_handler = error_handler
        self.pattern_categories = get_pattern_categories()
        self.category_weights = get_category_weights()
        self.confidence_thresholds = get_confidence_thresholds()
        
        # Initialize regex optimizer
        self.regex_optimizer = RegexOptimizer(self.pattern_categories)
        
        # Initialize base64 optimizer
        self.base64_optimizer = Base64Optimizer()
        
        # Cache for detection results
        self.detection_cache = {}
    
    @lru_cache(maxsize=1024)
    def check_for_miners(self, text, decode_base64=True):
        """
        Check text for cryptominer indicators with scoring system and caching
        Returns a tuple of (score, matches)
        """
        if not text:
            return 0, []
        
        # Check cache first
        cache_key = hash(text)
        if cache_key in self.detection_cache:
            return self.detection_cache[cache_key]
        
        # Try to decode base64 content if enabled
        decoded_text = text
        if decode_base64:
            try:
                decoded_text = self.base64_optimizer.find_and_decode_base64(text)
            except Exception as e:
                self.error_handler.handle_exception(
                    e, 
                    source="Base64Decoding", 
                    severity=LogLevel.WARNING
                )
        
        # Use regex optimizer to check for matches
        matches_list = self.regex_optimizer.check_text(decoded_text)
        
        # Calculate score and format matches
        score = 0
        formatted_matches = []
        
        for category, pattern, match_str in matches_list:
            category_weight = self.category_weights.get(category, 1)
            score += category_weight
            
            formatted_matches.append({
                "pattern": pattern,
                "match": match_str,
                "category": category,
                "weight": category_weight
            })
        
        # Cache the result
        result = (score, formatted_matches)
        self.detection_cache[cache_key] = result
        
        return result

# Optimized file scanning
def scan_file(file_path, detector, logger, error_handler, chunk_size=1024*1024):
    """
    Scan a file for cryptominers with memory-efficient processing
    
    Args:
        file_path: Path to the file
        detector: MinerDetector instance
        logger: Logger instance
        error_handler: ErrorHandler instance
        chunk_size: Size of chunks for large files
        
    Returns:
        ScanResult object
    """
    if not os.path.exists(file_path) or not os.path.isfile(file_path):
        logger.warning(f"File not found: {file_path}", "FileScanner")
        return None
    
    try:
        # Check if file is too large for full memory loading
        file_size = os.path.getsize(file_path)
        
        if file_size > 10 * chunk_size:  # Very large file
            logger.debug(f"Processing large file in chunks: {file_path} ({file_size/1024/1024:.2f} MB)", "FileScanner")
            
            # Process in chunks
            def process_chunk(chunk):
                return detector.check_for_miners(chunk)
            
            all_matches = []
            total_score = 0
            
            with open(file_path, 'r', errors='ignore') as f:
                while True:
                    chunk = f.read(chunk_size)
                    if not chunk:
                        break
                    
                    score, matches = process_chunk(chunk)
                    total_score += score
                    all_matches.extend(matches)
            
            # Deduplicate matches
            unique_matches = []
            seen_patterns = set()
            
            for match in all_matches:
                pattern = match["pattern"]
                if pattern not in seen_patterns:
                    seen_patterns.add(pattern)
                    unique_matches.append(match)
            
            return ScanResult(
                source=f"File: {file_path}",
                item_type="Large File",
                content=f"Large file: {file_size/1024/1024:.2f} MB",
                matches=unique_matches,
                score=total_score
            )
        else:
            # Process whole file
            with open(file_path, 'r', errors='ignore') as f:
                content = f.read()
                score, matches = detector.check_for_miners(content)
                
                return ScanResult(
                    source=f"File: {file_path}",
                    item_type="File",
                    content=content[:500] + "..." if len(content) > 500 else content,
                    matches=matches,
                    score=score
                )
    
    except Exception as e:
        error_handler.handle_exception(
            e, 
            source=f"FileScanner:{file_path}", 
            severity=LogLevel.WARNING
        )
        return None

# Optimized directory scanning
def scan_directory(dir_path, detector, logger, error_handler, file_extensions=None, max_depth=5, current_depth=0):
    """
    Scan a directory recursively for cryptominers
    
    Args:
        dir_path: Path to the directory
        detector: MinerDetector instance
        logger: Logger instance
        error_handler: ErrorHandler instance
        file_extensions: List of file extensions to scan (None for all)
        max_depth: Maximum recursion depth
        current_depth: Current recursion depth
        
    Returns:
        List of ScanResult objects
    """
    if not os.path.exists(dir_path) or not os.path.isdir(dir_path):
        logger.warning(f"Directory not found: {dir_path}", "DirectoryScanner")
        return []
    
    if current_depth > max_depth:
        logger.debug(f"Max recursion depth reached for: {dir_path}", "DirectoryScanner")
        return []
    
    results = []
    
    try:
        # Get all files in directory
        files = []
        subdirs = []
        
        for item in os.listdir(dir_path):
            item_path = os.path.join(dir_path, item)
            
            if os.path.isfile(item_path):
                # Check file extension if specified
                if file_extensions:
                    ext = os.path.splitext(item)[1].lower()
                    if ext in file_extensions:
                        files.append(item_path)
                else:
                    files.append(item_path)
            elif os.path.isdir(item_path):
                subdirs.append(item_path)
        
        # Scan files in parallel
        thread_workers, _ = ParallelProcessor.get_optimal_workers()
        
        with ThreadPoolExecutor(max_workers=thread_workers) as executor:
            future_to_file = {
                executor.submit(scan_file, file_path, detector, logger, error_handler): file_path
                for file_path in files
            }
            
            for future in as_completed(future_to_file):
                file_path = future_to_file[future]
                try:
                    result = future.result()
                    if result:
                        results.append(result)
                except Exception as e:
                    error_handler.handle_exception(
                        e, 
                        source=f"DirectoryScanner:{file_path}", 
                        severity=LogLevel.WARNING
                    )
        
        # Scan subdirectories recursively
        for subdir in subdirs:
            subdir_results = scan_directory(
                subdir, 
                detector, 
                logger, 
                error_handler, 
                file_extensions, 
                max_depth, 
                current_depth + 1
            )
            results.extend(subdir_results)
    
    except Exception as e:
        error_handler.handle_exception(
            e, 
            source=f"DirectoryScanner:{dir_path}", 
            severity=LogLevel.ERROR
        )
    
    return results

# Optimized Windows scanning
def scan_windows_startup_optimized(detector, logger, error_handler):
    """Optimized Windows startup locations scan"""
    performance_monitor.checkpoint("windows_scan_start")
    results = []
    logger.info("Starting Windows startup locations scan", "WindowsScanner")
    
    try:
        # Registry Run keys (multiple hives)
        registry_locations = [
            r'HKLM\Software\Microsoft\Windows\CurrentVersion\Run',
            r'HKLM\Software\Microsoft\Windows\CurrentVersion\RunOnce',
            r'HKCU\Software\Microsoft\Windows\CurrentVersion\Run',
            r'HKCU\Software\Microsoft\Windows\CurrentVersion\RunOnce',
            r'HKLM\Software\Wow6432Node\Microsoft\Windows\CurrentVersion\Run'
        ]
        
        # Scan registry locations in parallel
        def scan_registry(reg_loc):
            reg_results = []
            try:
                reg_cmd = f'reg query "{reg_loc}"'
                result = subprocess.check_output(reg_cmd, shell=True, text=True)
                for line in result.splitlines():
                    if "REG_" in line:  # Only process registry entries
                        score, matches = detector.check_for_miners(line)
                        reg_results.append(ScanResult(
                            source=f"Windows Registry: {reg_loc}",
                            item_type="Registry Entry",
                            content=line.strip(),
                            matches=matches,
                            score=score
                        ))
            except subprocess.SubprocessError as e:
                error_handler.handle_exception(
                    e, 
                    source=f"WindowsRegistry:{reg_loc}", 
                    severity=LogLevel.WARNING
                )
            return reg_results
        
        # Run registry scans in parallel
        registry_results = ParallelProcessor.parallel_map_thread(
            scan_registry, 
            registry_locations
        )
        
        # Flatten results
        for result_list in registry_results:
            results.extend(result_list)
        
        performance_monitor.checkpoint("windows_registry_scan")
        
        # Scheduled Tasks - optimized to parse in memory
        try:
            tasks_cmd = "schtasks /query /fo LIST /v"
            tasks = subprocess.check_output(tasks_cmd, shell=True, text=True)
            
            # Split tasks into individual task blocks
            task_blocks = tasks.split("\r\n\r\n")
            
            def process_task_block(block):
                if not block.strip():
                    return None
                
                task_dict = {}
                for line in block.splitlines():
                    line = line.strip()
                    if ":" in line:
                        key, value = line.split(":", 1)
                        task_dict[key.strip()] = value.strip()
                
                if "TaskName" in task_dict and "Command" in task_dict:
                    task_content = json.dumps(task_dict)
                    score, matches = detector.check_for_miners(task_content)
                    
                    if score > 0:  # Only return results with matches
                        return ScanResult(
                            source="Windows Scheduled Task",
                            item_type=task_dict.get("TaskName", "Unknown Task"),
                            content=task_dict.get("Command", ""),
                            matches=matches,
                            score=score
                        )
                return None
            
            # Process task blocks in parallel
            task_results = ParallelProcessor.parallel_map_thread(
                process_task_block, 
                task_blocks
            )
            
            # Add non-None results
            results.extend([r for r in task_results if r])
            
            performance_monitor.checkpoint("windows_tasks_scan")
        
        except Exception as e:
            error_handler.handle_exception(
                e, 
                source="WindowsScheduledTasks", 
                severity=LogLevel.ERROR
            )
        
        # Startup folders - use directory scanner
        startup_folders = [
            os.path.join(os.environ.get('APPDATA', ''), r'Microsoft\Windows\Start Menu\Programs\Startup'),
            os.path.join(os.environ.get('PROGRAMDATA', ''), r'Microsoft\Windows\Start Menu\Programs\Startup')
        ]
        
        for folder in startup_folders:
            if os.path.exists(folder):
                folder_results = scan_directory(
                    folder, 
                    detector, 
                    logger, 
                    error_handler
                )
                results.extend(folder_results)
        
        performance_monitor.checkpoint("windows_startup_folders_scan")
        
        # Windows Services - optimized with parallel processing
        try:
            services_cmd = "sc query"
            services = subprocess.check_output(services_cmd, shell=True, text=True)
            
            # Extract service names
            service_names = []
            for line in services.splitlines():
                if "SERVICE_NAME" in line:
                    service_name = line.split(":", 1)[1].strip()
                    service_names.append(service_name)
            
            def scan_service(service_name):
                try:
                    service_details = subprocess.check_output(f"sc qc {service_name}", shell=True, text=True)
                    score, matches = detector.check_for_miners(service_details)
                    
                    if score > 0:  # Only return results with matches
                        return ScanResult(
                            source="Windows Service",
                            item_type=f"Service: {service_name}",
                            content=service_details,
                            matches=matches,
                            score=score
                        )
                except Exception as e:
                    error_handler.handle_exception(
                        e, 
                        source=f"WindowsService:{service_name}", 
                        severity=LogLevel.WARNING
                    )
                return None
            
            # Scan services in parallel
            service_results = ParallelProcessor.parallel_map_thread(
                scan_service, 
                service_names
            )
            
            # Add non-None results
            results.extend([r for r in service_results if r])
            
            performance_monitor.checkpoint("windows_services_scan")
        
        except Exception as e:
            error_handler.handle_exception(
                e, 
                source="WindowsServices", 
                severity=LogLevel.ERROR
            )
    
    except Exception as e:
        error_handler.handle_exception(
            e, 
            source="WindowsStartupScan", 
            severity=LogLevel.ERROR
        )
    
    suspicious_count = len([r for r in results if r.score > 0])
    logger.info(f"Windows startup scan completed. Found {suspicious_count} suspicious items.", "WindowsScanner")
    performance_monitor.checkpoint("windows_scan_complete")
    
    return results

# Optimized Linux scanning
def scan_linux_startup_optimized(detector, logger, error_handler):
    """Optimized Linux startup locations scan"""
    performance_monitor.checkpoint("linux_scan_start")
    results = []
    logger.info("Starting Linux startup locations scan", "LinuxScanner")
    
    try:
        # Cron jobs - system and user
        cron_locations = [
            "/etc/crontab",
            "/etc/cron.d/",
            "/var/spool/cron/",
            "/var/spool/cron/crontabs/",
            "/etc/anacrontab"
        ]
        
        # Scan cron locations in parallel
        def scan_cron_location(cron_loc):
            cron_results = []
            
            if os.path.exists(cron_loc):
                if os.path.isdir(cron_loc):
                    # Scan directory
                    dir_results = scan_directory(
                        cron_loc, 
                        detector, 
                        logger, 
                        error_handler, 
                        max_depth=1  # Don't recurse too deep for cron directories
                    )
                    cron_results.extend(dir_results)
                else:
                    # Scan file
                    file_result = scan_file(
                        cron_loc, 
                        detector, 
                        logger, 
                        error_handler
                    )
                    if file_result:
                        cron_results.append(file_result)
            
            return cron_results
        
        # Run cron scans in parallel
        cron_results = ParallelProcessor.parallel_map_thread(
            scan_cron_location, 
            cron_locations
        )
        
        # Flatten results
        for result_list in cron_results:
            results.extend(result_list)
        
        performance_monitor.checkpoint("linux_cron_scan")
        
        # User crontabs - optimized with parallel processing
        try:
            user_cmd = "cut -d: -f1 /etc/passwd"
            users = subprocess.check_output(user_cmd, shell=True, text=True).splitlines()
            
            def scan_user_crontab(user):
                try:
                    user = user.strip()
                    if not user:
                        return None
                    
                    crontab_cmd = f"crontab -l -u {user}"
                    crontab = subprocess.check_output(crontab_cmd, shell=True, text=True, stderr=subprocess.DEVNULL)
                    score, matches = detector.check_for_miners(crontab)
                    
                    if score > 0:  # Only return results with matches
                        return ScanResult(
                            source=f"Linux User Crontab: {user}",
                            item_type="User Crontab",
                            content=crontab,
                            matches=matches,
                            score=score
                        )
                except:
                    # Many users won't have crontabs, so we ignore errors
                    pass
                return None
            
            # Scan user crontabs in parallel
            user_crontab_results = ParallelProcessor.parallel_map_thread(
                scan_user_crontab, 
                users
            )
            
            # Add non-None results
            results.extend([r for r in user_crontab_results if r])
            
            performance_monitor.checkpoint("linux_user_crontabs_scan")
        
        except Exception as e:
            error_handler.handle_exception(
                e, 
                source="LinuxUserCrontabs", 
                severity=LogLevel.WARNING
            )
        
        # Systemd services - use directory scanner with prioritization
        systemd_paths = [
            "/etc/systemd/system/",
            "/usr/lib/systemd/system/",
            "/lib/systemd/system/",
            "/run/systemd/system/"
        ]
        
        # Create prioritizer for systemd services
        systemd_prioritizer = ScanPrioritizer([
            r"\.service$",
            r"\.timer$",
            r"\.socket$"
        ])
        
        for systemd_path in systemd_paths:
            if os.path.exists(systemd_path) and os.path.isdir(systemd_path):
                # Get all service files
                service_files = []
                for file in os.listdir(systemd_path):
                    file_path = os.path.join(systemd_path, file)
                    if os.path.isfile(file_path) and (file.endswith(".service") or file.endswith(".timer")):
                        service_files.append(file_path)
                
                # Prioritize service files
                prioritized_files = systemd_prioritizer.prioritize_targets(service_files)
                
                # Scan service files in parallel
                def scan_service_file(file_path):
                    return scan_file(file_path, detector, logger, error_handler)
                
                service_results = ParallelProcessor.parallel_map_thread(
                    scan_service_file, 
                    prioritized_files
                )
                
                # Add non-None results
                results.extend([r for r in service_results if r])
        
        performance_monitor.checkpoint("linux_systemd_scan")
        
        # Check enabled services
        try:
            services_cmd = "systemctl list-unit-files --state=enabled"
            services = subprocess.check_output(services_cmd, shell=True, text=True)
            
            # Extract service names
            service_names = []
            for line in services.splitlines():
                if ".service" in line or ".timer" in line:
                    service_name = line.split()[0]
                    service_names.append(service_name)
            
            def scan_enabled_service(service_name):
                try:
                    service_cmd = f"systemctl cat {service_name}"
                    service_content = subprocess.check_output(service_cmd, shell=True, text=True)
                    score, matches = detector.check_for_miners(service_content)
                    
                    if score > 0:  # Only return results with matches
                        return ScanResult(
                            source=f"Linux Enabled Service",
                            item_type=f"Service: {service_name}",
                            content=service_content,
                            matches=matches,
                            score=score
                        )
                except Exception as e:
                    error_handler.handle_exception(
                        e, 
                        source=f"LinuxEnabledService:{service_name}", 
                        severity=LogLevel.WARNING
                    )
                return None
            
            # Scan enabled services in parallel
            enabled_service_results = ParallelProcessor.parallel_map_thread(
                scan_enabled_service, 
                service_names
            )
            
            # Add non-None results
            results.extend([r for r in enabled_service_results if r])
            
            performance_monitor.checkpoint("linux_enabled_services_scan")
        
        except Exception as e:
            error_handler.handle_exception(
                e, 
                source="LinuxEnabledServices", 
                severity=LogLevel.WARNING
            )
        
        # Init scripts - use directory scanner
        init_locations = [
            "/etc/init.d/",
            "/etc/init/",
            "/etc/rc.local",
            "/etc/rc.d/"
        ]
        
        for init_loc in init_locations:
            if os.path.exists(init_loc):
                if os.path.isdir(init_loc):
                    # Scan directory
                    dir_results = scan_directory(
                        init_loc, 
                        detector, 
                        logger, 
                        error_handler
                    )
                    results.extend(dir_results)
                else:
                    # Scan file
                    file_result = scan_file(
                        init_loc, 
                        detector, 
                        logger, 
                        error_handler
                    )
                    if file_result:
                        results.append(file_result)
        
        performance_monitor.checkpoint("linux_init_scan")
        
        # Check for Docker containers
        try:
            docker_cmd = "which docker"
            subprocess.check_output(docker_cmd, shell=True, text=True)
            
            # Docker is installed, check containers
            containers_cmd = "docker ps -a --format '{{.Names}}'"
            containers = subprocess.check_output(containers_cmd, shell=True, text=True).splitlines()
            
            def scan_docker_container(container):
                try:
                    container = container.strip()
                    if not container:
                        return None
                    
                    # Inspect container
                    inspect_cmd = f"docker inspect {container}"
                    inspect_output = subprocess.check_output(inspect_cmd, shell=True, text=True)
                    score, matches = detector.check_for_miners(inspect_output)
                    
                    if score > 0:  # Only return results with matches
                        return ScanResult(
                            source="Docker Container",
                            item_type=f"Container: {container}",
                            content=inspect_output[:500],
                            matches=matches,
                            score=score
                        )
                except Exception as e:
                    error_handler.handle_exception(
                        e, 
                        source=f"DockerContainer:{container}", 
                        severity=LogLevel.WARNING
                    )
                return None
            
            # Scan containers in parallel
            container_results = ParallelProcessor.parallel_map_thread(
                scan_docker_container, 
                containers
            )
            
            # Add non-None results
            results.extend([r for r in container_results if r])
            
            performance_monitor.checkpoint("linux_docker_scan")
        
        except:
            # Docker not installed or not accessible
            logger.debug("Docker not installed or not accessible", "LinuxScanner")
    
    except Exception as e:
        error_handler.handle_exception(
            e, 
            source="LinuxStartupScan", 
            severity=LogLevel.ERROR
        )
    
    suspicious_count = len([r for r in results if r.score > 0])
    logger.info(f"Linux startup scan completed. Found {suspicious_count} suspicious items.", "LinuxScanner")
    performance_monitor.checkpoint("linux_scan_complete")
    
    return results

# Main execution
def main():
    """Main execution function"""
    # Start performance monitoring
    performance_monitor.start()
    
    # Parse command line arguments
    parser = argparse.ArgumentParser(description="Enhanced Cryptojacking Detection Script with Performance Optimizations")
    parser.add_argument("--output", "-o", default=f"crypto_scan_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt",
                        help="Output file for scan results")
    parser.add_argument("--summary", "-s", default=f"crypto_scan_summary_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt",
                        help="Summary report file")
    parser.add_argument("--format", "-f", choices=["text", "json", "csv"], default="text",
                        help="Output format for results")
    parser.add_argument("--log-file", "-l", default=f"crypto_scan_log_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt",
                        help="Log file path")
    parser.add_argument("--verbose", "-v", action="store_true",
                        help="Enable verbose logging")
    parser.add_argument("--quiet", "-q", action="store_true",
                        help="Suppress console output")
    parser.add_argument("--local-only", action="store_true",
                        help="Only scan local system, skip cloud providers")
    parser.add_argument("--aws-regions", nargs="+",
                        help="AWS regions to scan (space-separated)")
    parser.add_argument("--aws-profile",
                        help="AWS profile to use")
    parser.add_argument("--gcp-projects", nargs="+",
                        help="GCP projects to scan (space-separated)")
    parser.add_argument("--azure-subscriptions", nargs="+",
                        help="Azure subscription IDs to scan (space-separated)")
    parser.add_argument("--max-workers", type=int, default=None,
                        help="Maximum number of worker threads for parallel scanning (default: auto)")
    parser.add_argument("--no-base64-decode", action="store_true",
                        help="Disable base64 decoding of content")
    parser.add_argument("--performance-report", "-p", default=f"crypto_scan_performance_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt",
                        help="Performance report file")
    parser.add_argument("--scan-dir", "-d", 
                        help="Additional directory to scan")
    
    args = parser.parse_args()
    
    # Setup logging
    log_level = LogLevel.DEBUG if args.verbose else LogLevel.INFO
    output_format = OutputFormat.JSON if args.format == "json" else OutputFormat.CSV if args.format == "csv" else OutputFormat.TEXT
    
    logger = create_logger(
        log_level=log_level,
        log_file=args.log_file,
        output_format=output_format,
        console_output=not args.quiet
    )
    
    error_handler = create_error_handler(logger)
    result_writer = create_result_writer(logger)
    
    logger.info(f"Cryptojacking detection scan started at {datetime.now()}", "Main")
    performance_monitor.checkpoint("initialization")
    
    # Create miner detector
    detector = MinerDetector(logger, error_handler)
    
    # Determine optimal workers if not specified
    if args.max_workers is None:
        thread_workers, _ = ParallelProcessor.get_optimal_workers()
        max_workers = thread_workers
    else:
        max_workers = args.max_workers
    
    logger.info(f"Using {max_workers} worker threads for parallel scanning", "Main")
    
    all_results = []
    
    try:
        # Determine system type
        system = platform.system()
        
        # Datacenter checks
        if system == "Windows":
            logger.info("Detected Windows system, scanning Windows startup locations", "Main")
            results = scan_windows_startup_optimized(detector, logger, error_handler)
            all_results.extend(results)
        elif system == "Linux":
            logger.info("Detected Linux system, scanning Linux startup locations", "Main")
            results = scan_linux_startup_optimized(detector, logger, error_handler)
            all_results.extend(results)
        else:
            logger.warning(f"Unsupported OS for local scan: {system}", "Main")
        
        # Scan additional directory if specified
        if args.scan_dir:
            logger.info(f"Scanning additional directory: {args.scan_dir}", "Main")
            performance_monitor.checkpoint("additional_dir_scan_start")
            
            dir_results = scan_directory(
                args.scan_dir,
                detector,
                logger,
                error_handler,
                max_depth=5
            )
            
            all_results.extend(dir_results)
            performance_monitor.checkpoint("additional_dir_scan_complete")
        
        # Cloud checks (requires API credentials)
        if not args.local_only:
            # AWS EC2
            logger.info("Starting AWS environment scan", "Main")
            performance_monitor.checkpoint("aws_scan_start")
            
            try:
                aws_results = scan_aws_environment(
                    logger, 
                    aws_regions=args.aws_regions, 
                    profile=args.aws_profile,
                    max_workers=max_workers
                )
                all_results.extend(aws_results)
            except Exception as e:
                error_handler.handle_exception(
                    e, 
                    source="AWSEnvironmentScan", 
                    severity=LogLevel.ERROR
                )
            
            performance_monitor.checkpoint("aws_scan_complete")
            
            # GCP Compute Engine
            logger.info("Starting GCP environment scan", "Main")
            performance_monitor.checkpoint("gcp_scan_start")
            
            try:
                gcp_results = scan_gcp_environment(
                    logger, 
                    project_ids=args.gcp_projects,
                    max_workers=max_workers
                )
                all_results.extend(gcp_results)
            except Exception as e:
                error_handler.handle_exception(
                    e, 
                    source="GCPEnvironmentScan", 
                    severity=LogLevel.ERROR
                )
            
            performance_monitor.checkpoint("gcp_scan_complete")
            
            # Azure VMs
            logger.info("Starting Azure environment scan", "Main")
            performance_monitor.checkpoint("azure_scan_start")
            
            try:
                azure_results = scan_azure_environment(
                    logger, 
                    subscription_ids=args.azure_subscriptions,
                    max_workers=max_workers
                )
                all_results.extend(azure_results)
            except Exception as e:
                error_handler.handle_exception(
                    e, 
                    source="AzureEnvironmentScan", 
                    severity=LogLevel.ERROR
                )
            
            performance_monitor.checkpoint("azure_scan_complete")
        
        # Generate summary report
        logger.info("Generating summary report", "Main")
        performance_monitor.checkpoint("summary_generation_start")
        
        result_writer.generate_summary(all_results, args.summary)
        
        performance_monitor.checkpoint("summary_generation_complete")
        
        # Output results
        logger.info(f"Writing detailed results to {args.output}", "Main")
        performance_monitor.checkpoint("results_writing_start")
        
        result_writer.write_results(all_results, args.output, format=output_format)
        
        performance_monitor.checkpoint("results_writing_complete")
        
        # Generate performance report
        performance_monitor.end()
        performance_summary = performance_monitor.get_summary()
        
        with open(args.performance_report, "w") as f:
            f.write("CRYPTOJACKING DETECTION PERFORMANCE REPORT\n")
            f.write("=========================================\n\n")
            f.write(f"Total scan duration: {performance_summary['total_duration']:.2f} seconds\n\n")
            
            f.write("CHECKPOINT DURATIONS:\n")
            for name, duration in performance_summary['checkpoint_durations'].items():
                f.write(f"  {name}: {duration:.2f} seconds\n")
            
            f.write("\nRESOURCE USAGE:\n")
            f.write(f"  Peak memory usage: {performance_summary['memory']['max_mb']:.2f} MB\n")
            f.write(f"  Average memory usage: {performance_summary['memory']['avg_mb']:.2f} MB\n")
            f.write(f"  Peak CPU usage: {performance_summary['cpu']['max']:.2f}%\n")
            f.write(f"  Average CPU usage: {performance_summary['cpu']['avg']:.2f}%\n")
        
        # Log statistics
        logger.info(f"Scan completed at {datetime.now()}", "Main")
        logger.info(f"Total items scanned: {len(all_results)}", "Main")
        logger.info(f"Results written to: {args.output}", "Main")
        logger.info(f"Summary report: {args.summary}", "Main")
        logger.info(f"Performance report: {args.performance_report}", "Main")
        logger.info(f"Log file: {args.log_file}", "Main")
        
        # Log error handling statistics
        error_handler.log_stats()
        logger.log_stats()
        
        return 0
    
    except Exception as e:
        error_handler.handle_exception(
            e, 
            source="MainExecution", 
            severity=LogLevel.CRITICAL
        )
        return 1

if __name__ == "__main__":
    sys.exit(main())
