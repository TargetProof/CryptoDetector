#!/usr/bin/env python3
"""
Enhanced Logging and Error Handling Module
This module provides improved logging and error handling capabilities for the cryptojacking detection script
"""

import os
import sys
import logging
import json
import traceback
from datetime import datetime
from enum import Enum

class LogLevel(Enum):
    """Enum for log levels with corresponding logging module levels"""
    DEBUG = logging.DEBUG
    INFO = logging.INFO
    WARNING = logging.WARNING
    ERROR = logging.ERROR
    CRITICAL = logging.CRITICAL

class OutputFormat(Enum):
    """Enum for output formats"""
    TEXT = "text"
    JSON = "json"
    CSV = "csv"

class CryptoLogger:
    """Enhanced logger class with multiple output formats and severity levels"""
    
    def __init__(self, 
                 log_level=LogLevel.INFO, 
                 log_file=None, 
                 output_format=OutputFormat.TEXT,
                 include_timestamp=True,
                 include_source=True,
                 console_output=True):
        """
        Initialize the logger
        
        Args:
            log_level: LogLevel enum value
            log_file: Path to log file (None for console only)
            output_format: OutputFormat enum value
            include_timestamp: Whether to include timestamp in log messages
            include_source: Whether to include source information in log messages
            console_output: Whether to output to console in addition to log file
        """
        self.log_level = log_level
        self.log_file = log_file
        self.output_format = output_format
        self.include_timestamp = include_timestamp
        self.include_source = include_source
        self.console_output = console_output
        self.logger = self._setup_logger()
        
        # Statistics for logging activity
        self.stats = {
            "debug_count": 0,
            "info_count": 0,
            "warning_count": 0,
            "error_count": 0,
            "critical_count": 0,
            "start_time": datetime.now()
        }
    
    def _setup_logger(self):
        """Configure and return logger based on settings"""
        logger = logging.getLogger('crypto_detector')
        logger.setLevel(self.log_level.value)
        
        # Clear any existing handlers
        if logger.handlers:
            logger.handlers.clear()
        
        # Create formatter based on output format
        if self.output_format == OutputFormat.JSON:
            formatter = logging.Formatter('{"timestamp": "%(asctime)s", "level": "%(levelname)s", "source": "%(name)s", "message": %(message)s}')
        elif self.output_format == OutputFormat.CSV:
            formatter = logging.Formatter('"%(asctime)s","%(levelname)s","%(name)s","%(message)s"')
        else:  # TEXT format
            if self.include_timestamp and self.include_source:
                formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(name)s - %(message)s')
            elif self.include_timestamp:
                formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
            elif self.include_source:
                formatter = logging.Formatter('%(levelname)s - %(name)s - %(message)s')
            else:
                formatter = logging.Formatter('%(levelname)s - %(message)s')
        
        # Add file handler if log file is specified
        if self.log_file:
            file_handler = logging.FileHandler(self.log_file)
            file_handler.setFormatter(formatter)
            logger.addHandler(file_handler)
        
        # Add console handler if console output is enabled
        if self.console_output:
            console_handler = logging.StreamHandler(sys.stdout)
            console_handler.setFormatter(formatter)
            logger.addHandler(console_handler)
        
        return logger
    
    def _format_message(self, message):
        """Format message based on output format"""
        if self.output_format == OutputFormat.JSON and isinstance(message, str):
            # Escape quotes and wrap in quotes for JSON
            return f'"{message.replace(\'"\', \'\\\\"\')})"'
        return message
    
    def _update_stats(self, level):
        """Update logging statistics"""
        if level == LogLevel.DEBUG:
            self.stats["debug_count"] += 1
        elif level == LogLevel.INFO:
            self.stats["info_count"] += 1
        elif level == LogLevel.WARNING:
            self.stats["warning_count"] += 1
        elif level == LogLevel.ERROR:
            self.stats["error_count"] += 1
        elif level == LogLevel.CRITICAL:
            self.stats["critical_count"] += 1
    
    def debug(self, message, source=None):
        """Log debug message"""
        if source:
            self.logger.debug(self._format_message(message), extra={"name": source})
        else:
            self.logger.debug(self._format_message(message))
        self._update_stats(LogLevel.DEBUG)
    
    def info(self, message, source=None):
        """Log info message"""
        if source:
            self.logger.info(self._format_message(message), extra={"name": source})
        else:
            self.logger.info(self._format_message(message))
        self._update_stats(LogLevel.INFO)
    
    def warning(self, message, source=None):
        """Log warning message"""
        if source:
            self.logger.warning(self._format_message(message), extra={"name": source})
        else:
            self.logger.warning(self._format_message(message))
        self._update_stats(LogLevel.WARNING)
    
    def error(self, message, source=None, exc_info=False):
        """Log error message"""
        if source:
            self.logger.error(self._format_message(message), extra={"name": source}, exc_info=exc_info)
        else:
            self.logger.error(self._format_message(message), exc_info=exc_info)
        self._update_stats(LogLevel.ERROR)
    
    def critical(self, message, source=None, exc_info=True):
        """Log critical message"""
        if source:
            self.logger.critical(self._format_message(message), extra={"name": source}, exc_info=exc_info)
        else:
            self.logger.critical(self._format_message(message), exc_info=exc_info)
        self._update_stats(LogLevel.CRITICAL)
    
    def get_stats(self):
        """Get logging statistics"""
        self.stats["end_time"] = datetime.now()
        self.stats["duration"] = (self.stats["end_time"] - self.stats["start_time"]).total_seconds()
        self.stats["total_logs"] = (
            self.stats["debug_count"] + 
            self.stats["info_count"] + 
            self.stats["warning_count"] + 
            self.stats["error_count"] + 
            self.stats["critical_count"]
        )
        return self.stats
    
    def log_stats(self):
        """Log statistics summary"""
        stats = self.get_stats()
        summary = (
            f"Logging Statistics: {stats['total_logs']} total logs "
            f"({stats['debug_count']} debug, {stats['info_count']} info, "
            f"{stats['warning_count']} warning, {stats['error_count']} error, "
            f"{stats['critical_count']} critical) over {stats['duration']:.2f} seconds"
        )
        self.info(summary, source="LogStats")

class ErrorHandler:
    """Error handling class with recovery mechanisms"""
    
    def __init__(self, logger):
        """
        Initialize the error handler
        
        Args:
            logger: CryptoLogger instance
        """
        self.logger = logger
        self.error_count = 0
        self.warning_count = 0
        self.recovery_attempts = 0
        self.successful_recoveries = 0
    
    def handle_exception(self, exception, source=None, severity=LogLevel.ERROR, 
                         recovery_func=None, recovery_args=None, max_retries=3):
        """
        Handle an exception with optional recovery
        
        Args:
            exception: The exception to handle
            source: Source of the exception
            severity: LogLevel enum value
            recovery_func: Function to call for recovery attempt
            recovery_args: Arguments to pass to recovery function
            max_retries: Maximum number of recovery attempts
        
        Returns:
            tuple: (success, result) where success is a boolean indicating if recovery was successful
                  and result is the result of the recovery function if successful
        """
        # Format exception details
        exc_type = type(exception).__name__
        exc_msg = str(exception)
        exc_traceback = traceback.format_exc()
        
        # Log the exception
        log_message = f"{exc_type}: {exc_msg}"
        if source:
            log_message = f"{source} - {log_message}"
        
        if severity == LogLevel.WARNING:
            self.logger.warning(log_message, source="ErrorHandler")
            self.warning_count += 1
        elif severity == LogLevel.CRITICAL:
            self.logger.critical(log_message, source="ErrorHandler", exc_info=True)
            self.error_count += 1
        else:  # Default to ERROR
            self.logger.error(log_message, source="ErrorHandler", exc_info=True)
            self.error_count += 1
        
        # Attempt recovery if function provided
        if recovery_func and callable(recovery_func):
            return self._attempt_recovery(recovery_func, recovery_args or {}, max_retries, source)
        
        return False, None
    
    def _attempt_recovery(self, recovery_func, recovery_args, max_retries, source=None):
        """
        Attempt to recover from an error
        
        Args:
            recovery_func: Function to call for recovery
            recovery_args: Arguments to pass to recovery function
            max_retries: Maximum number of recovery attempts
            source: Source of the recovery attempt
        
        Returns:
            tuple: (success, result) where success is a boolean indicating if recovery was successful
                  and result is the result of the recovery function if successful
        """
        for attempt in range(1, max_retries + 1):
            self.recovery_attempts += 1
            
            try:
                self.logger.info(
                    f"Recovery attempt {attempt}/{max_retries}...", 
                    source=source or "ErrorHandler"
                )
                
                result = recovery_func(**recovery_args)
                
                self.logger.info(
                    f"Recovery successful on attempt {attempt}", 
                    source=source or "ErrorHandler"
                )
                
                self.successful_recoveries += 1
                return True, result
            
            except Exception as e:
                self.logger.warning(
                    f"Recovery attempt {attempt} failed: {str(e)}", 
                    source=source or "ErrorHandler"
                )
        
        self.logger.error(
            f"All {max_retries} recovery attempts failed", 
            source=source or "ErrorHandler"
        )
        
        return False, None
    
    def get_stats(self):
        """Get error handling statistics"""
        return {
            "error_count": self.error_count,
            "warning_count": self.warning_count,
            "recovery_attempts": self.recovery_attempts,
            "successful_recoveries": self.successful_recoveries,
            "recovery_success_rate": (
                (self.successful_recoveries / self.recovery_attempts) * 100 
                if self.recovery_attempts > 0 else 0
            )
        }
    
    def log_stats(self):
        """Log error handling statistics"""
        stats = self.get_stats()
        summary = (
            f"Error Handling Statistics: {stats['error_count']} errors, "
            f"{stats['warning_count']} warnings, "
            f"{stats['successful_recoveries']}/{stats['recovery_attempts']} "
            f"successful recoveries ({stats['recovery_success_rate']:.1f}%)"
        )
        self.logger.info(summary, source="ErrorStats")

class ResultWriter:
    """Class for writing scan results to various output formats"""
    
    def __init__(self, logger):
        """
        Initialize the result writer
        
        Args:
            logger: CryptoLogger instance
        """
        self.logger = logger
    
    def write_results(self, results, output_file, format=OutputFormat.TEXT):
        """
        Write results to file in specified format
        
        Args:
            results: List of ScanResult objects
            output_file: Path to output file
            format: OutputFormat enum value
        
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            if format == OutputFormat.JSON:
                return self._write_json(results, output_file)
            elif format == OutputFormat.CSV:
                return self._write_csv(results, output_file)
            else:  # Default to TEXT
                return self._write_text(results, output_file)
        
        except Exception as e:
            self.logger.error(f"Error writing results to {output_file}: {str(e)}", source="ResultWriter")
            return False
    
    def _write_json(self, results, output_file):
        """Write results in JSON format"""
        try:
            with open(output_file, "w") as f:
                # Convert results to dictionaries if they have to_dict method
                if hasattr(results[0], 'to_dict'):
                    json.dump([r.to_dict() for r in results], f, indent=2)
                else:
                    json.dump(results, f, indent=2)
            
            self.logger.info(f"Results written to {output_file} in JSON format", source="ResultWriter")
            return True
        
        except Exception as e:
            self.logger.error(f"Error writing JSON: {str(e)}", source="ResultWriter")
            return False
    
    def _write_csv(self, results, output_file):
        """Write results in CSV format"""
        try:
            import csv
            
            with open(output_file, "w", newline='') as f:
                # Determine fields based on first result
                if not results:
                    self.logger.warning("No results to write to CSV", source="ResultWriter")
                    return False
                
                if hasattr(results[0], 'to_dict'):
                    # Get fields from first result's dictionary
                    first_dict = results[0].to_dict()
                    fieldnames = list(first_dict.keys())
                    
                    writer = csv.DictWriter(f, fieldnames=fieldnames)
                    writer.writeheader()
                    
                    for result in results:
                        writer.writerow(result.to_dict())
                else:
                    # Assume results are dictionaries
                    fieldnames = list(results[0].keys())
                    
                    writer = csv.DictWriter(f, fieldnames=fieldnames)
                    writer.writeheader()
                    
                    for result in results:
                        writer.writerow(result)
            
            self.logger.info(f"Results written to {output_file} in CSV format", source="ResultWriter")
            return True
        
        except Exception as e:
            self.logger.error(f"Error writing CSV: {str(e)}", source="ResultWriter")
            return False
    
    def _write_text(self, results, output_file):
        """Write results in text format"""
        try:
            with open(output_file, "w") as f:
                f.write(f"CRYPTOJACKING DETECTION SCAN RESULTS\n")
                f.write(f"===================================\n")
                f.write(f"Scan completed at: {datetime.now()}\n")
                f.write(f"Total items scanned: {len(results)}\n\n")
                
                # Group by severity
                severity_groups = {}
                for result in results:
                    severity = result.severity if hasattr(result, 'severity') else "UNKNOWN"
                    if severity not in severity_groups:
                        severity_groups[severity] = []
                    severity_groups[severity].append(result)
                
                # Write each severity group
                for severity in ["HIGH", "MEDIUM", "LOW", "CLEAN", "UNKNOWN"]:
                    if severity in severity_groups:
                        group = severity_groups[severity]
                        f.write(f"\n{severity} SEVERITY FINDINGS ({len(group)}):\n")
                        f.write(f"{'-' * (len(severity) + 19)}\n")
                        
                        for result in group:
                            if hasattr(result, 'to_text'):
                                f.write(result.to_text() + "\n")
                            else:
                                f.write(f"{str(result)}\n")
            
            self.logger.info(f"Results written to {output_file} in text format", source="ResultWriter")
            return True
        
        except Exception as e:
            self.logger.error(f"Error writing text: {str(e)}", source="ResultWriter")
            return False
    
    def generate_summary(self, results, output_file):
        """
        Generate a summary report of scan results
        
        Args:
            results: List of ScanResult objects
            output_file: Path to output file
        
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            # Group by severity
            high_severity = [r for r in results if hasattr(r, 'severity') and r.severity == "HIGH"]
            medium_severity = [r for r in results if hasattr(r, 'severity') and r.severity == "MEDIUM"]
            low_severity = [r for r in results if hasattr(r, 'severity') and r.severity == "LOW"]
            clean = [r for r in results if hasattr(r, 'severity') and r.severity == "CLEAN"]
            
            summary = f"""
CRYPTOJACKING DETECTION SCAN SUMMARY
===================================
Scan completed at: {datetime.now()}
Total items scanned: {len(results)}

RESULTS BY SEVERITY:
- HIGH severity: {len(high_severity)} items
- MEDIUM severity: {len(medium_severity)} items
- LOW severity: {len(low_severity)} items
- CLEAN: {len(clean)} items

"""
            
            if high_severity:
                summary += "\nHIGH SEVERITY FINDINGS:\n"
                summary += "----------------------\n"
                for result in high_severity:
                    summary += f"- {result.source}: {result.item_type}\n"
                    summary += f"  Score: {result.score}\n"
                    summary += f"  Matches: {', '.join([m['pattern'] for m in result.matches[:3]])}\n"
                    summary += f"  Content preview: {result.content[:100]}...\n\n"
            
            if medium_severity:
                summary += "\nMEDIUM SEVERITY FINDINGS:\n"
                summary += "------------------------\n"
                for result in medium_severity:
                    summary += f"- {result.source}: {result.item_type}\n"
                    summary += f"  Score: {result.score}\n"
                    summary += f"  Matches: {', '.join([m['pattern'] for m in result.matches[:3]])}\n"
                    summary += f"  Content preview: {result.content[:100]}...\n\n"
            
            with open(output_file, "w") as f:
                f.write(summary)
            
            self.logger.info(f"Summary report written to {output_file}", source="ResultWriter")
            return True
        
        except Exception as e:
            self.logger.error(f"Error generating summary: {str(e)}", source="ResultWriter")
            return False

# Helper functions for creating logger and error handler
def create_logger(log_level=LogLevel.INFO, log_file=None, output_format=OutputFormat.TEXT,
                 include_timestamp=True, include_source=True, console_output=True):
    """Create and return a CryptoLogger instance"""
    return CryptoLogger(
        log_level=log_level,
        log_file=log_file,
        output_format=output_format,
        include_timestamp=include_timestamp,
        include_source=include_source,
        console_output=console_output
    )

def create_error_handler(logger):
    """Create and return an ErrorHandler instance"""
    return ErrorHandler(logger)

def create_result_writer(logger):
    """Create and return a ResultWriter instance"""
    return ResultWriter(logger)

# Example usage
if __name__ == "__main__":
    # Create logger
    logger = create_logger(
        log_level=LogLevel.DEBUG,
        log_file="crypto_detector_log.txt",
        output_format=OutputFormat.TEXT
    )
    
    # Log some messages
    logger.debug("This is a debug message")
    logger.info("This is an info message")
    logger.warning("This is a warning message")
    
    # Create error handler
    error_handler = create_error_handler(logger)
    
    # Handle an exception
    try:
        result = 1 / 0
    except Exception as e:
        error_handler.handle_exception(e, source="DivisionTest")
    
    # Log statistics
    logger.log_stats()
    error_handler.log_stats()
