#!/usr/bin/env python3
"""
Performance Optimization Module for Cryptojacking Detection
This module provides performance optimizations for the cryptojacking detection script
"""

import re
import os
import time
import psutil
import multiprocessing
from functools import lru_cache
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
from threading import Lock

# Optimized regex compilation
class RegexOptimizer:
    """Class for optimizing regex pattern matching"""
    
    def __init__(self, patterns=None):
        """
        Initialize the regex optimizer
        
        Args:
            patterns: Dictionary of pattern categories and their patterns
        """
        self.patterns = patterns or {}
        self.compiled_patterns = {}
        self.compile_lock = Lock()
        self._compile_patterns()
    
    def _compile_patterns(self):
        """Compile all patterns for faster matching"""
        with self.compile_lock:
            for category, pattern_list in self.patterns.items():
                self.compiled_patterns[category] = [
                    re.compile(pattern, re.IGNORECASE) for pattern in pattern_list
                ]
    
    def add_patterns(self, category, patterns):
        """
        Add patterns to a category
        
        Args:
            category: Pattern category
            patterns: List of regex patterns
        """
        with self.compile_lock:
            if category not in self.patterns:
                self.patterns[category] = []
            
            self.patterns[category].extend(patterns)
            self.compiled_patterns[category] = [
                re.compile(pattern, re.IGNORECASE) for pattern in self.patterns[category]
            ]
    
    def remove_patterns(self, category, patterns):
        """
        Remove patterns from a category
        
        Args:
            category: Pattern category
            patterns: List of regex patterns to remove
        """
        with self.compile_lock:
            if category in self.patterns:
                self.patterns[category] = [p for p in self.patterns[category] if p not in patterns]
                self.compiled_patterns[category] = [
                    re.compile(pattern, re.IGNORECASE) for pattern in self.patterns[category]
                ]
    
    @lru_cache(maxsize=1024)
    def check_text(self, text, category=None):
        """
        Check text against compiled patterns with caching
        
        Args:
            text: Text to check
            category: Specific category to check (None for all categories)
            
        Returns:
            List of (category, pattern, match) tuples
        """
        if not text:
            return []
        
        results = []
        categories = [category] if category else self.compiled_patterns.keys()
        
        for cat in categories:
            if cat in self.compiled_patterns:
                for compiled_pattern in self.compiled_patterns[cat]:
                    matches = compiled_pattern.findall(text)
                    if matches:
                        for match in matches:
                            match_str = match if isinstance(match, str) else str(match)
                            results.append((cat, compiled_pattern.pattern, match_str))
        
        return results

# Memory-efficient file processing
class FileProcessor:
    """Class for memory-efficient file processing"""
    
    @staticmethod
    def process_large_file(file_path, processor_func, chunk_size=1024*1024):
        """
        Process a large file in chunks to reduce memory usage
        
        Args:
            file_path: Path to the file
            processor_func: Function to process each chunk
            chunk_size: Size of each chunk in bytes
            
        Returns:
            Combined results from all chunks
        """
        if not os.path.exists(file_path) or not os.path.isfile(file_path):
            return None
        
        results = []
        
        try:
            with open(file_path, 'r', errors='ignore') as f:
                while True:
                    chunk = f.read(chunk_size)
                    if not chunk:
                        break
                    
                    chunk_result = processor_func(chunk)
                    if chunk_result:
                        results.extend(chunk_result)
        except Exception as e:
            print(f"Error processing file {file_path}: {e}")
        
        return results
    
    @staticmethod
    def process_file_by_lines(file_path, processor_func, max_lines=None):
        """
        Process a file line by line
        
        Args:
            file_path: Path to the file
            processor_func: Function to process each line
            max_lines: Maximum number of lines to process
            
        Returns:
            Combined results from all lines
        """
        if not os.path.exists(file_path) or not os.path.isfile(file_path):
            return None
        
        results = []
        line_count = 0
        
        try:
            with open(file_path, 'r', errors='ignore') as f:
                for line in f:
                    line_result = processor_func(line)
                    if line_result:
                        results.append(line_result)
                    
                    line_count += 1
                    if max_lines and line_count >= max_lines:
                        break
        except Exception as e:
            print(f"Error processing file {file_path}: {e}")
        
        return results

# Parallel processing utilities
class ParallelProcessor:
    """Class for parallel processing utilities"""
    
    @staticmethod
    def get_optimal_workers():
        """
        Get optimal number of worker threads/processes based on system resources
        
        Returns:
            Tuple of (thread_workers, process_workers)
        """
        cpu_count = multiprocessing.cpu_count()
        memory_gb = psutil.virtual_memory().total / (1024 * 1024 * 1024)
        
        # Heuristic: 2x CPU count for I/O-bound thread workers
        thread_workers = min(cpu_count * 2, 32)
        
        # Heuristic: CPU count - 1 for CPU-bound process workers, with memory consideration
        process_workers = max(1, min(cpu_count - 1, int(memory_gb / 2)))
        
        return thread_workers, process_workers
    
    @staticmethod
    def parallel_map_thread(func, items, max_workers=None, timeout=None):
        """
        Map a function over items in parallel using threads
        
        Args:
            func: Function to apply to each item
            items: List of items to process
            max_workers: Maximum number of worker threads
            timeout: Timeout in seconds for each task
            
        Returns:
            List of results
        """
        if not items:
            return []
        
        if max_workers is None:
            max_workers, _ = ParallelProcessor.get_optimal_workers()
        
        results = []
        
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            future_to_item = {executor.submit(func, item): item for item in items}
            
            for future in future_to_item:
                try:
                    result = future.result(timeout=timeout)
                    results.append(result)
                except Exception as e:
                    print(f"Error in parallel thread execution: {e}")
        
        return results
    
    @staticmethod
    def parallel_map_process(func, items, max_workers=None, timeout=None):
        """
        Map a function over items in parallel using processes
        
        Args:
            func: Function to apply to each item
            items: List of items to process
            max_workers: Maximum number of worker processes
            timeout: Timeout in seconds for each task
            
        Returns:
            List of results
        """
        if not items:
            return []
        
        if max_workers is None:
            _, max_workers = ParallelProcessor.get_optimal_workers()
        
        results = []
        
        with ProcessPoolExecutor(max_workers=max_workers) as executor:
            future_to_item = {executor.submit(func, item): item for item in items}
            
            for future in future_to_item:
                try:
                    result = future.result(timeout=timeout)
                    results.append(result)
                except Exception as e:
                    print(f"Error in parallel process execution: {e}")
        
        return results

# Scan prioritization
class ScanPrioritizer:
    """Class for prioritizing scan targets"""
    
    def __init__(self, high_priority_patterns=None):
        """
        Initialize the scan prioritizer
        
        Args:
            high_priority_patterns: List of regex patterns indicating high priority
        """
        self.high_priority_patterns = high_priority_patterns or []
        self.compiled_priority_patterns = [
            re.compile(pattern, re.IGNORECASE) for pattern in self.high_priority_patterns
        ]
    
    def prioritize_targets(self, targets, sample_func=None, max_targets=None):
        """
        Prioritize scan targets
        
        Args:
            targets: List of targets to prioritize
            sample_func: Function to extract sample text from target
            max_targets: Maximum number of targets to return
            
        Returns:
            Prioritized list of targets
        """
        if not targets:
            return []
        
        if not sample_func:
            # Default sample function assumes targets are strings
            sample_func = lambda x: x
        
        # Score each target
        scored_targets = []
        for target in targets:
            sample = sample_func(target)
            priority_score = self._calculate_priority(sample)
            scored_targets.append((priority_score, target))
        
        # Sort by priority score (descending)
        sorted_targets = [target for _, target in sorted(scored_targets, key=lambda x: x[0], reverse=True)]
        
        # Limit to max_targets if specified
        if max_targets and len(sorted_targets) > max_targets:
            return sorted_targets[:max_targets]
        
        return sorted_targets
    
    def _calculate_priority(self, sample):
        """
        Calculate priority score for a sample
        
        Args:
            sample: Sample text to evaluate
            
        Returns:
            Priority score (higher is higher priority)
        """
        if not sample:
            return 0
        
        score = 0
        
        # Check for high priority patterns
        for pattern in self.compiled_priority_patterns:
            if pattern.search(sample):
                score += 10
        
        # Additional heuristics
        if "startup" in sample.lower() or "boot" in sample.lower():
            score += 5
        
        if "cron" in sample.lower() or "schedule" in sample.lower():
            score += 3
        
        if "service" in sample.lower() or "daemon" in sample.lower():
            score += 2
        
        return score

# Performance monitoring
class PerformanceMonitor:
    """Class for monitoring performance"""
    
    def __init__(self):
        """Initialize the performance monitor"""
        self.start_time = None
        self.end_time = None
        self.checkpoints = {}
        self.memory_usage = []
        self.cpu_usage = []
    
    def start(self):
        """Start monitoring"""
        self.start_time = time.time()
        self.checkpoints = {}
        self.memory_usage = []
        self.cpu_usage = []
        self._record_resource_usage()
    
    def checkpoint(self, name):
        """
        Record a checkpoint
        
        Args:
            name: Checkpoint name
        """
        self.checkpoints[name] = time.time()
        self._record_resource_usage()
    
    def end(self):
        """End monitoring"""
        self.end_time = time.time()
        self._record_resource_usage()
    
    def _record_resource_usage(self):
        """Record current resource usage"""
        process = psutil.Process(os.getpid())
        self.memory_usage.append((time.time(), process.memory_info().rss))
        self.cpu_usage.append((time.time(), psutil.cpu_percent(interval=0.1)))
    
    def get_summary(self):
        """
        Get performance summary
        
        Returns:
            Dictionary with performance metrics
        """
        if not self.start_time:
            return {"error": "Monitoring not started"}
        
        end_time = self.end_time or time.time()
        total_duration = end_time - self.start_time
        
        checkpoint_durations = {}
        last_time = self.start_time
        
        for name, timestamp in sorted(self.checkpoints.items(), key=lambda x: x[1]):
            duration = timestamp - last_time
            checkpoint_durations[name] = duration
            last_time = timestamp
        
        if self.end_time:
            checkpoint_durations["final"] = self.end_time - last_time
        
        # Calculate memory and CPU statistics
        max_memory = max([m for _, m in self.memory_usage]) if self.memory_usage else 0
        avg_memory = sum([m for _, m in self.memory_usage]) / len(self.memory_usage) if self.memory_usage else 0
        max_cpu = max([c for _, c in self.cpu_usage]) if self.cpu_usage else 0
        avg_cpu = sum([c for _, c in self.cpu_usage]) / len(self.cpu_usage) if self.cpu_usage else 0
        
        return {
            "total_duration": total_duration,
            "checkpoint_durations": checkpoint_durations,
            "memory": {
                "max": max_memory,
                "avg": avg_memory,
                "max_mb": max_memory / (1024 * 1024),
                "avg_mb": avg_memory / (1024 * 1024)
            },
            "cpu": {
                "max": max_cpu,
                "avg": avg_cpu
            }
        }
    
    def print_summary(self):
        """Print performance summary"""
        summary = self.get_summary()
        
        if "error" in summary:
            print(f"Performance Monitor Error: {summary['error']}")
            return
        
        print("\nPERFORMANCE SUMMARY")
        print("===================")
        print(f"Total Duration: {summary['total_duration']:.2f} seconds")
        
        print("\nCheckpoint Durations:")
        for name, duration in summary['checkpoint_durations'].items():
            print(f"  {name}: {duration:.2f} seconds")
        
        print("\nMemory Usage:")
        print(f"  Max: {summary['memory']['max_mb']:.2f} MB")
        print(f"  Avg: {summary['memory']['avg_mb']:.2f} MB")
        
        print("\nCPU Usage:")
        print(f"  Max: {summary['cpu']['max']:.2f}%")
        print(f"  Avg: {summary['cpu']['avg']:.2f}%")

# Optimized base64 detection and decoding
class Base64Optimizer:
    """Class for optimized base64 detection and decoding"""
    
    # Precompiled regex for base64 detection
    BASE64_PATTERN = re.compile(r'(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})')
    
    @staticmethod
    @lru_cache(maxsize=1024)
    def is_likely_base64(s):
        """
        Check if a string is likely base64 encoded
        
        Args:
            s: String to check
            
        Returns:
            Boolean indicating if string is likely base64
        """
        if not isinstance(s, str) or len(s) < 20:
            return False
        
        # Check if string matches base64 pattern
        if not Base64Optimizer.BASE64_PATTERN.fullmatch(s):
            return False
        
        # Check character distribution (base64 has specific character set)
        valid_chars = set('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=')
        if not all(c in valid_chars for c in s):
            return False
        
        # Check padding
        if s.endswith('='):
            if not (s.endswith('==') or s.endswith('=')):
                return False
        
        # Additional heuristic: base64 encoded data often has specific length
        if len(s) % 4 != 0:
            return False
        
        return True
    
    @staticmethod
    def find_and_decode_base64(text):
        """
        Find and decode base64 strings in text
        
        Args:
            text: Text to search for base64 strings
            
        Returns:
            Original text plus decoded strings
        """
        if not text:
            return text
        
        result = text
        
        # Find potential base64 strings
        potential_base64 = Base64Optimizer.BASE64_PATTERN.findall(text)
        
        # Try to decode each potential base64 string
        for b64_str in potential_base64:
            if len(b64_str) > 20 and Base64Optimizer.is_likely_base64(b64_str):
                try:
                    import base64
                    decoded = base64.b64decode(b64_str).decode('utf-8', errors='ignore')
                    
                    # Only add non-trivial decoded content
                    if len(decoded) > 10 and not all(c.isspace() for c in decoded):
                        result += " " + decoded
                except:
                    pass
        
        return result

# Example usage
if __name__ == "__main__":
    # Example patterns
    example_patterns = {
        "miners": ["xmrig", "minerd", "ccminer"],
        "pools": ["stratum\\+tcp://", "pool\\.(hash|mine|xmr|btc|eth)"]
    }
    
    # Create regex optimizer
    regex_optimizer = RegexOptimizer(example_patterns)
    
    # Test text
    test_text = "This is a test with xmrig miner connecting to stratum+tcp://pool.example.com:3333"
    
    # Check text
    start_time = time.time()
    results = regex_optimizer.check_text(test_text)
    end_time = time.time()
    
    print(f"Found {len(results)} matches in {(end_time - start_time) * 1000:.2f} ms")
    for category, pattern, match in results:
        print(f"Category: {category}, Pattern: {pattern}, Match: {match}")
    
    # Test performance monitor
    monitor = PerformanceMonitor()
    monitor.start()
    
    # Simulate work
    time.sleep(0.1)
    monitor.checkpoint("step1")
    
    time.sleep(0.2)
    monitor.checkpoint("step2")
    
    time.sleep(0.1)
    monitor.end()
    
    # Print performance summary
    monitor.print_summary()
