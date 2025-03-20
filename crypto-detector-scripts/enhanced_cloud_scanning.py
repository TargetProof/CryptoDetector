#!/usr/bin/env python3
"""
Enhanced Cloud Provider Scanning Module
This module provides improved scanning capabilities for AWS, GCP, and Azure cloud environments
"""

import base64
import json
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime

# Import enhanced miner detection patterns
try:
    from enhanced_miner_patterns import check_for_miners
except ImportError:
    # Fallback if the module is not available
    def check_for_miners(text, decode_base64=True):
        return 0, []

# Result class for standardized output
class ScanResult:
    """Class to store and format scan results"""
    def __init__(self, source, item_type, content, matches=None, score=0):
        self.source = source
        self.item_type = item_type
        self.content = content
        self.matches = matches or []
        self.score = score
        self.timestamp = datetime.now()
        self.severity = self._calculate_severity()
    
    def _calculate_severity(self):
        """Calculate severity based on score"""
        if self.score >= 15:  # HIGH_CONFIDENCE_THRESHOLD
            return "HIGH"
        elif self.score >= 8:  # MEDIUM_CONFIDENCE_THRESHOLD
            return "MEDIUM"
        elif self.score > 0:
            return "LOW"
        return "CLEAN"
    
    def to_dict(self):
        """Convert to dictionary for JSON output"""
        return {
            "timestamp": self.timestamp.isoformat(),
            "source": self.source,
            "item_type": self.item_type,
            "content_preview": self.content[:100] + "..." if len(self.content) > 100 else self.content,
            "matches": self.matches,
            "score": self.score,
            "severity": self.severity
        }
    
    def to_text(self):
        """Convert to text format for standard output"""
        match_text = ", ".join([f"{m['pattern']} ({m['category']})" for m in self.matches]) if self.matches else "None"
        return (f"[{self.severity}] {self.source} - {self.item_type}\n"
                f"Score: {self.score}\n"
                f"Matches: {match_text}\n"
                f"Content: {self.content[:100]}...\n")

# AWS EC2 scanning functions
def scan_aws_environment(logger, aws_regions=None, profile=None, max_workers=10):
    """Scan AWS environment for cryptominers"""
    results = []
    logger.info("Starting AWS environment scan")
    
    try:
        import boto3
        from botocore.exceptions import ClientError, NoCredentialsError
        
        # Use provided regions or default to common regions
        if not aws_regions:
            aws_regions = [
                "us-east-1", "us-east-2", "us-west-1", "us-west-2", 
                "eu-west-1", "eu-west-2", "eu-central-1", 
                "ap-northeast-1", "ap-northeast-2", "ap-southeast-1", 
                "ap-southeast-2", "ap-south-1", 
                "sa-east-1", "ca-central-1"
            ]
        
        session_args = {}
        if profile:
            session_args['profile_name'] = profile
        
        session = boto3.Session(**session_args)
        
        # Scan each region in parallel
        with ThreadPoolExecutor(max_workers=min(max_workers, len(aws_regions))) as executor:
            future_to_region = {
                executor.submit(scan_aws_region, session, region, logger): region
                for region in aws_regions
            }
            
            for future in as_completed(future_to_region):
                region = future_to_region[future]
                try:
                    region_results = future.result()
                    results.extend(region_results)
                    logger.info(f"Completed scan of AWS region {region}")
                except Exception as e:
                    logger.error(f"Error scanning AWS region {region}: {e}")
    
    except ImportError:
        logger.error("AWS SDK (boto3) not installed. Install with: pip install boto3")
    except NoCredentialsError:
        logger.error("AWS credentials not found. Configure AWS CLI or provide a profile.")
    except Exception as e:
        logger.error(f"Error during AWS scan: {e}")
    
    logger.info(f"AWS scan completed. Found {len([r for r in results if r.score > 0])} suspicious items.")
    return results

def scan_aws_region(session, region, logger):
    """Scan a specific AWS region for cryptominers"""
    region_results = []
    
    try:
        # Scan EC2 instances
        region_results.extend(scan_aws_ec2(session, region, logger))
        
        # Scan Lambda functions
        region_results.extend(scan_aws_lambda(session, region, logger))
        
        # Scan CloudFormation stacks
        region_results.extend(scan_aws_cloudformation(session, region, logger))
        
        # Scan ECS tasks
        region_results.extend(scan_aws_ecs(session, region, logger))
        
        # Scan CodeBuild projects
        region_results.extend(scan_aws_codebuild(session, region, logger))
        
        # Scan SSM documents
        region_results.extend(scan_aws_ssm(session, region, logger))
        
        # Scan EventBridge rules
        region_results.extend(scan_aws_eventbridge(session, region, logger))
    
    except Exception as e:
        logger.error(f"Error scanning AWS region {region}: {e}")
    
    return region_results

def scan_aws_ec2(session, region, logger):
    """Scan AWS EC2 instances for cryptominers"""
    results = []
    
    try:
        ec2 = session.client("ec2", region_name=region)
        
        # Get all instances
        paginator = ec2.get_paginator('describe_instances')
        for page in paginator.paginate():
            for reservation in page["Reservations"]:
                for instance in reservation["Instances"]:
                    instance_id = instance["InstanceId"]
                    
                    # Check user data
                    try:
                        user_data_response = ec2.describe_instance_attribute(
                            InstanceId=instance_id, Attribute="userData"
                        )
                        
                        user_data = user_data_response.get("UserData", {}).get("Value", "")
                        if user_data:
                            # UserData is base64 encoded
                            try:
                                decoded_user_data = base64.b64decode(user_data).decode('utf-8', errors='ignore')
                                score, matches = check_for_miners(decoded_user_data)
                                results.append(ScanResult(
                                    source=f"AWS EC2 {region}",
                                    item_type=f"Instance {instance_id} UserData",
                                    content=decoded_user_data,
                                    matches=matches,
                                    score=score
                                ))
                            except:
                                # If decoding fails, check the raw data
                                score, matches = check_for_miners(user_data)
                                results.append(ScanResult(
                                    source=f"AWS EC2 {region}",
                                    item_type=f"Instance {instance_id} UserData (Raw)",
                                    content=user_data,
                                    matches=matches,
                                    score=score
                                ))
                    except Exception as e:
                        logger.warning(f"Error checking UserData for instance {instance_id} in {region}: {e}")
                    
                    # Check tags for suspicious entries
                    tags = instance.get("Tags", [])
                    if tags:
                        tags_str = json.dumps(tags)
                        score, matches = check_for_miners(tags_str)
                        if score > 0:
                            results.append(ScanResult(
                                source=f"AWS EC2 {region}",
                                item_type=f"Instance {instance_id} Tags",
                                content=tags_str,
                                matches=matches,
                                score=score
                            ))
        
        # Check Launch Templates
        try:
            paginator = ec2.get_paginator('describe_launch_templates')
            for page in paginator.paginate():
                for template in page.get('LaunchTemplates', []):
                    template_id = template['LaunchTemplateId']
                    template_name = template['LaunchTemplateName']
                    
                    # Get the latest version
                    template_data = ec2.describe_launch_template_versions(
                        LaunchTemplateId=template_id,
                        Versions=['$Latest']
                    )
                    
                    for version in template_data.get('LaunchTemplateVersions', []):
                        user_data = version.get('LaunchTemplateData', {}).get('UserData', '')
                        if user_data:
                            try:
                                decoded_user_data = base64.b64decode(user_data).decode('utf-8', errors='ignore')
                                score, matches = check_for_miners(decoded_user_data)
                                results.append(ScanResult(
                                    source=f"AWS EC2 {region}",
                                    item_type=f"Launch Template {template_name} UserData",
                                    content=decoded_user_data,
                                    matches=matches,
                                    score=score
                                ))
                            except:
                                score, matches = check_for_miners(user_data)
                                results.append(ScanResult(
                                    source=f"AWS EC2 {region}",
                                    item_type=f"Launch Template {template_name} UserData (Raw)",
                                    content=user_data,
                                    matches=matches,
                                    score=score
                                ))
        except Exception as e:
            logger.warning(f"Error checking Launch Templates in {region}: {e}")
    
    except Exception as e:
        logger.error(f"Error scanning EC2 in {region}: {e}")
    
    return results

def scan_aws_lambda(session, region, logger):
    """Scan AWS Lambda functions for cryptominers"""
    results = []
    
    try:
        lambda_client = session.client("lambda", region_name=region)
        
        # List all Lambda functions
        paginator = lambda_client.get_paginator('list_functions')
        for page in paginator.paginate():
            for func in page.get('Functions', []):
                function_name = func['FunctionName']
                
                # Get function code and configuration
                try:
                    # We can't download the code directly, but we can check the configuration
                    config = lambda_client.get_function_configuration(FunctionName=function_name)
                    
                    # Check environment variables
                    env_vars = config.get('Environment', {}).get('Variables', {})
                    if env_vars:
                        env_str = json.dumps(env_vars)
                        score, matches = check_for_miners(env_str)
                        if score > 0:
                            results.append(ScanResult(
                                source=f"AWS Lambda {region}",
                                item_type=f"Function {function_name} Environment",
                                content=env_str,
                                matches=matches,
                                score=score
                            ))
                    
                    # Check function description and other metadata
                    config_str = json.dumps(config)
                    score, matches = check_for_miners(config_str)
                    if score > 0:
                        results.append(ScanResult(
                            source=f"AWS Lambda {region}",
                            item_type=f"Function {function_name} Configuration",
                            content=config_str,
                            matches=matches,
                            score=score
                        ))
                    
                    # Check function tags
                    try:
                        tags = lambda_client.list_tags(Resource=func['FunctionArn'])
                        if tags and 'Tags' in tags:
                            tags_str = json.dumps(tags['Tags'])
                            score, matches = check_for_miners(tags_str)
                            if score > 0:
                                results.append(ScanResult(
                                    source=f"AWS Lambda {region}",
                                    item_type=f"Function {function_name} Tags",
                                    content=tags_str,
                                    matches=matches,
                                    score=score
                                ))
                    except Exception as e:
                        logger.warning(f"Error checking tags for Lambda function {function_name} in {region}: {e}")
                
                except Exception as e:
                    logger.warning(f"Error checking Lambda function {function_name} in {region}: {e}")
    
    except Exception as e:
        logger.error(f"Error scanning Lambda functions in {region}: {e}")
    
    return results

def scan_aws_cloudformation(session, region, logger):
    """Scan AWS CloudFormation stacks for cryptominers"""
    results = []
    
    try:
        cf_client = session.client("cloudformation", region_name=region)
        
        # List all stacks
        paginator = cf_client.get_paginator('list_stacks')
        for page in paginator.paginate(StackStatusFilter=[
            'CREATE_COMPLETE', 'UPDATE_COMPLETE', 'UPDATE_ROLLBACK_COMPLETE'
        ]):
            for stack in page.get('StackSummaries', []):
                stack_name = stack['StackName']
                
                try:
                    # Get stack template
                    template = cf_client.get_template(StackName=stack_name)
                    template_body = template.get('TemplateBody', '')
                    
                    if isinstance(template_body, dict):
                        template_body = json.dumps(template_body)
                    
                    score, matches = check_for_miners(template_body)
                    if score > 0:
                        results.append(ScanResult(
                            source=f"AWS CloudFormation {region}",
                            item_type=f"Stack {stack_name} Template",
                            content=template_body[:500],
                            matches=matches,
                            score=score
                        ))
                
                except Exception as e:
                    logger.warning(f"Error checking CloudFormation stack {stack_name} in {region}: {e}")
    
    except Exception as e:
        logger.error(f"Error scanning CloudFormation stacks in {region}: {e}")
    
    return results

def scan_aws_ecs(session, region, logger):
    """Scan AWS ECS tasks for cryptominers"""
    results = []
    
    try:
        ecs_client = session.client("ecs", region_name=region)
        
        # List all clusters
        clusters = ecs_client.list_clusters()
        for cluster_arn in clusters.get('clusterArns', []):
            try:
                # List task definitions
                task_defs = ecs_client.list_task_definitions()
                
                for task_def_arn in task_defs.get('taskDefinitionArns', []):
                    try:
                        # Get task definition details
                        task_def = ecs_client.describe_task_definition(taskDefinition=task_def_arn)
                        task_def_str = json.dumps(task_def)
                        
                        score, matches = check_for_miners(task_def_str)
                        if score > 0:
                            results.append(ScanResult(
                                source=f"AWS ECS {region}",
                                item_type=f"Task Definition {task_def_arn.split('/')[-1]}",
                                content=task_def_str[:500],
                                matches=matches,
                                score=score
                            ))
                        
                        # Check container definitions specifically
                        container_defs = task_def.get('taskDefinition', {}).get('containerDefinitions', [])
                        for container in container_defs:
                            # Check environment variables
                            env_vars = container.get('environment', [])
                            if env_vars:
                                env_str = json.dumps(env_vars)
                                score, matches = check_for_miners(env_str)
                                if score > 0:
                                    results.append(ScanResult(
                                        source=f"AWS ECS {region}",
                                        item_type=f"Container {container.get('name')} Environment",
                                        content=env_str,
                                        matches=matches,
                                        score=score
                                    ))
                            
                            # Check command
                            command = container.get('command', [])
                            if command:
                                command_str = json.dumps(command)
                                score, matches = check_for_miners(command_str)
                                if score > 0:
                                    results.append(ScanResult(
                                        source=f"AWS ECS {region}",
                                        item_type=f"Container {container.get('name')} Command",
                                        content=command_str,
                                        matches=matches,
                                        score=score
                                    ))
                    
                    except Exception as e:
                        logger.warning(f"Error checking ECS task definition {task_def_arn} in {region}: {e}")
            
            except Exception as e:
                logger.warning(f"Error checking ECS cluster {cluster_arn} in {region}: {e}")
    
    except Exception as e:
        logger.error(f"Error scanning ECS in {region}: {e}")
    
    return results

def scan_aws_codebuild(session, region, logger):
    """Scan AWS CodeBuild projects for cryptominers"""
    results = []
    
    try:
        codebuild_client = session.client("codebuild", region_name=region)
        
        # List all projects
        projects = codebuild_client.list_projects()
        
        for project_name in projects.get('projects', []):
            try:
                # Get project details
                project = codebuild_client.batch_get_projects(names=[project_name])
                
                for proj in project.get('projects', []):
                    # Check buildspec
                    buildspec = proj.get('source', {}).get('buildspec', '')
                    if buildspec:
                        score, matches = check_for_miners(buildspec)
                        if score > 0:
                            results.append(ScanResult(
                                source=f"AWS CodeBuild {region}",
                                item_type=f"Project {project_name} Buildspec",
                                content=buildspec,
                                matches=matches,
                                score=score
                            ))
                    
                    # Check environment variables
                    env_vars = proj.get('environment', {}).get('environmentVariables', [])
                    if env_vars:
                        env_str = json.dumps(env_vars)
                        score, matches = check_for_miners(env_str)
                        if score > 0:
                            results.append(ScanResult(
                                source=f"AWS CodeBuild {region}",
                                item_type=f"Project {project_name} Environment",
                                content=env_str,
                                matches=matches,
                                score=score
                            ))
            
            except Exception as e:
                logger.warning(f"Error checking CodeBuild project {project_name} in {region}: {e}")
    
    except Exception as e:
        logger.error(f"Error scanning CodeBuild in {region}: {e}")
    
    return results

def scan_aws_ssm(session, region, logger):
    """Scan AWS SSM documents for cryptominers"""
    results = []
    
    try:
        ssm_client = session.client("ssm", region_name=region)
        
        # List all documents
        paginator = ssm_client.get_paginator('list_documents')
        for page in paginator.paginate(DocumentFilterList=[{'key': 'Owner', 'value': 'Self'}]):
            for doc in page.get('DocumentIdentifiers', []):
                doc_name = doc['Name']
                
                try:
                    # Get document content
                    document = ssm_client.get_document(Name=doc_name)
                    content = document.get('Content', '')
                    
                    score, matches = check_for_miners(content)
                    if score > 0:
                        results.append(ScanResult(
                            source=f"AWS SSM {region}",
                            item_type=f"Document {doc_name}",
                            content=content[:500],
                            matches=matches,
                            score=score
                        ))
                
                except Exception as e:
                    logger.warning(f"Error checking SSM document {doc_name} in {region}: {e}")
    
    except Exception as e:
        logger.error(f"Error scanning SSM in {region}: {e}")
    
    return results

def scan_aws_eventbridge(session, region, logger):
    """Scan AWS EventBridge rules for cryptominers"""
    results = []
    
    try:
        events_client = session.client("events", region_name=region)
        
        # List all rules
        paginator = events_client.get_paginator('list_rules')
        for page in paginator.paginate():
            for rule in page.get('Rules', []):
                rule_name = rule['Name']
                
                try:
                    # Get rule targets
                    targets = events_client.list_targets_by_rule(Rule=rule_name)
                    
                    for target in targets.get('Targets', []):
                        # Check input
                        input_str = target.get('Input', '')
                        if input_str:
                            score, matches = check_for_miners(input_str)
                            if score > 0:
                                results.append(ScanResult(
                                    source=f"AWS EventBridge {region}",
                                    item_type=f"Rule {rule_name} Target Input",
                                    content=input_str,
                                    matches=matches,
                                    score=score
                                ))
                        
                        # Check input transformer
                        input_transformer = target.get('InputTransformer', {})
                        if input_transformer:
                            transformer_str = json.dumps(input_transformer)
                            score, matches = check_for_miners(transformer_str)
                            if score > 0:
                                results.append(ScanResult(
                                    source=f"AWS EventBridge {region}",
                                    item_type=f"Rule {rule_name} Input Transformer",
                                    content=transformer_str,
                                    matches=matches,
                                    score=score
                                ))
                
                except Exception as e:
                    logger.warning(f"Error checking EventBridge rule {rule_name} in {region}: {e}")
    
    except Exception as e:
        logger.error(f"Error scanning EventBridge in {region}: {e}")
    
    return results

# GCP scanning functions
def scan_gcp_environment(logger, project_ids=None, zones=None, max_workers=10):
    """Scan GCP environment for cryptominers"""
    results = []
    logger.info("Starting GCP environment scan")
    
    try:
        from google.cloud import compute_v1
        
        # If no project IDs provided, try to get default from environment
        if not project_ids:
            try:
                import google.auth
                _, project_id = google.auth.default()
                if project_id:
                    project_ids = [project_id]
                else:
                    logger.error("No GCP project ID provided and couldn't determine default project")
                    return results
            except Exception as e:
                logger.error(f"Error getting default GCP project: {e}")
                return results
        
        # If project_ids is a string, convert to list
        if isinstance(project_ids, str):
            project_ids = [project_ids]
        
        # Process each project with parallel zone scanning
        for project_id in project_ids:
            logger.info(f"Scanning GCP project: {project_id}")
            
            # If no zones provided, get all zones for this project
            project_zones = zones
            if not project_zones:
                try:
                    zone_client = compute_v1.ZonesClient()
                    request = compute_v1.ListZonesRequest(project=project_id)
                    project_zones = [zone.name for zone in zone_client.list(request=request)]
                except Exception as e:
                    logger.error(f"Error listing GCP zones for project {project_id}: {e}")
                    # Fall back to common zones
                    project_zones = [
                        "us-central1-a", "us-central1-b", "us-central1-c",
                        "us-east1-b", "us-east1-c", "us-east1-d",
                        "us-west1-a", "us-west1-b", "us-west1-c",
                        "europe-west1-b", "europe-west1-c", "europe-west1-d",
                        "asia-east1-a", "asia-east1-b", "asia-east1-c"
                    ]
            
            # Scan zones in parallel
            with ThreadPoolExecutor(max_workers=min(max_workers, len(project_zones))) as executor:
                future_to_zone = {
                    executor.submit(scan_gcp_zone, project_id, zone, logger): zone
                    for zone in project_zones
                }
                
                for future in as_completed(future_to_zone):
                    zone = future_to_zone[future]
                    try:
                        zone_results = future.result()
                        results.extend(zone_results)
                        logger.info(f"Completed scan of GCP zone {zone} in project {project_id}")
                    except Exception as e:
                        logger.error(f"Error scanning GCP zone {zone} in project {project_id}: {e}")
            
            # Scan global resources
            try:
                global_results = scan_gcp_global_resources(project_id, logger)
                results.extend(global_results)
                logger.info(f"Completed scan of GCP global resources in project {project_id}")
            except Exception as e:
                logger.error(f"Error scanning GCP global resources in project {project_id}: {e}")
    
    except ImportError:
        logger.error("GCP SDK not installed. Install with: pip install google-cloud-compute google-cloud-functions")
    except Exception as e:
        logger.error(f"Error during GCP scan: {e}")
    
    logger.info(f"GCP scan completed. Found {len([r for r in results if r.score > 0])} suspicious items.")
    return results

def scan_gcp_zone(project_id, zone, logger):
    """Scan a specific GCP zone for cryptominers"""
    zone_results = []
    
    try:
        from google.cloud import compute_v1
        
        # Scan instances in this zone
        instance_client = compute_v1.InstancesClient()
        
        try:
            request = compute_v1.ListInstancesRequest(project=project_id, zone=zone)
            instances = instance_client.list(request=request)
            
            for instance in instances:
                # Check metadata
                if instance.metadata and instance.metadata.items:
                    for item in instance.metadata.items:
                        if item.key == "startup-script" or item.key.startswith("startup-script-"):
                            score, matches = check_for_miners(item.value)
                            zone_results.append(ScanResult(
                                source=f"GCP {project_id} {zone}",
                                item_type=f"Instance {instance.name} Metadata {item.key}",
                                content=item.value,
                                matches=matches,
                                score=score
                            ))
                
                # Check custom metadata
                if instance.metadata:
                    metadata_str = str(instance.metadata)
                    score, matches = check_for_miners(metadata_str)
                    if score > 0:
                        zone_results.append(ScanResult(
                            source=f"GCP {project_id} {zone}",
                            item_type=f"Instance {instance.name} All Metadata",
                            content=metadata_str[:500],
                            matches=matches,
                            score=score
                        ))
                
                # Check labels
                if instance.labels:
                    labels_str = str(instance.labels)
                    score, matches = check_for_miners(labels_str)
                    if score > 0:
                        zone_results.append(ScanResult(
                            source=f"GCP {project_id} {zone}",
                            item_type=f"Instance {instance.name} Labels",
                            content=labels_str,
                            matches=matches,
                            score=score
                        ))
                
                # Check disks for custom images
                for disk in instance.disks:
                    if disk.source:
                        disk_str = str(disk)
                        score, matches = check_for_miners(disk_str)
                        if score > 0:
                            zone_results.append(ScanResult(
                                source=f"GCP {project_id} {zone}",
                                item_type=f"Instance {instance.name} Disk {disk.source.split('/')[-1]}",
                                content=disk_str[:500],
                                matches=matches,
                                score=score
                            ))
        
        except Exception as e:
            logger.warning(f"Error scanning instances in {project_id}/{zone}: {e}")
    
    except Exception as e:
        logger.error(f"Error scanning GCP zone {zone} in project {project_id}: {e}")
    
    return zone_results

def scan_gcp_global_resources(project_id, logger):
    """Scan global GCP resources for cryptominers"""
    global_results = []
    
    try:
        from google.cloud import compute_v1
        
        # Check instance templates
        try:
            template_client = compute_v1.InstanceTemplatesClient()
            request = compute_v1.ListInstanceTemplatesRequest(project=project_id)
            templates = template_client.list(request=request)
            
            for template in templates:
                # Check template metadata
                if template.properties.metadata and template.properties.metadata.items:
                    for item in template.properties.metadata.items:
                        if item.key == "startup-script" or item.key.startswith("startup-script-"):
                            score, matches = check_for_miners(item.value)
                            global_results.append(ScanResult(
                                source=f"GCP {project_id} Templates",
                                item_type=f"Template {template.name} Metadata {item.key}",
                                content=item.value,
                                matches=matches,
                                score=score
                            ))
        except Exception as e:
            logger.warning(f"Error scanning instance templates in {project_id}: {e}")
        
        # Check Cloud Functions
        try:
            from google.cloud import functions_v1
            
            function_client = functions_v1.CloudFunctionsServiceClient()
            parent = f"projects/{project_id}/locations/-"
            functions = function_client.list_functions(parent=parent)
            
            for function in functions:
                # Get function source code
                function_name = function.name.split('/')[-1]
                function_source = str(function.source_archive_url)
                
                score, matches = check_for_miners(function_source)
                if score > 0:
                    global_results.append(ScanResult(
                        source=f"GCP {project_id} Functions",
                        item_type=f"Function {function_name}",
                        content=function_source,
                        matches=matches,
                        score=score
                    ))
                
                # Check environment variables
                if function.environment_variables:
                    env_str = str(function.environment_variables)
                    score, matches = check_for_miners(env_str)
                    if score > 0:
                        global_results.append(ScanResult(
                            source=f"GCP {project_id} Functions",
                            item_type=f"Function {function_name} Environment",
                            content=env_str,
                            matches=matches,
                            score=score
                        ))
        except Exception as e:
            logger.warning(f"Error scanning Cloud Functions in {project_id}: {e}")
        
        # Check Cloud Run services
        try:
            from google.cloud import run_v1
            
            run_client = run_v1.ServicesClient()
            parent = f"projects/{project_id}/locations/-"
            services = run_client.list_services(parent=parent)
            
            for service in services:
                service_name = service.name.split('/')[-1]
                
                # Check container image
                if service.template and service.template.containers:
                    for container in service.template.containers:
                        # Check image
                        image = container.image
                        score, matches = check_for_miners(image)
                        if score > 0:
                            global_results.append(ScanResult(
                                source=f"GCP {project_id} Cloud Run",
                                item_type=f"Service {service_name} Image",
                                content=image,
                                matches=matches,
                                score=score
                            ))
                        
                        # Check environment variables
                        if container.env:
                            env_str = str(container.env)
                            score, matches = check_for_miners(env_str)
                            if score > 0:
                                global_results.append(ScanResult(
                                    source=f"GCP {project_id} Cloud Run",
                                    item_type=f"Service {service_name} Environment",
                                    content=env_str,
                                    matches=matches,
                                    score=score
                                ))
                        
                        # Check command and args
                        if container.command or container.args:
                            cmd_str = str(container.command) + str(container.args)
                            score, matches = check_for_miners(cmd_str)
                            if score > 0:
                                global_results.append(ScanResult(
                                    source=f"GCP {project_id} Cloud Run",
                                    item_type=f"Service {service_name} Command",
                                    content=cmd_str,
                                    matches=matches,
                                    score=score
                                ))
        except Exception as e:
            logger.warning(f"Error scanning Cloud Run services in {project_id}: {e}")
        
        # Check Cloud Scheduler jobs
        try:
            from google.cloud import scheduler_v1
            
            scheduler_client = scheduler_v1.CloudSchedulerClient()
            parent = f"projects/{project_id}/locations/-"
            jobs = scheduler_client.list_jobs(parent=parent)
            
            for job in jobs:
                job_name = job.name.split('/')[-1]
                
                # Check HTTP target
                if job.http_target:
                    http_target = str(job.http_target)
                    score, matches = check_for_miners(http_target)
                    if score > 0:
                        global_results.append(ScanResult(
                            source=f"GCP {project_id} Cloud Scheduler",
                            item_type=f"Job {job_name} HTTP Target",
                            content=http_target,
                            matches=matches,
                            score=score
                        ))
                
                # Check App Engine target
                if job.app_engine_http_target:
                    app_target = str(job.app_engine_http_target)
                    score, matches = check_for_miners(app_target)
                    if score > 0:
                        global_results.append(ScanResult(
                            source=f"GCP {project_id} Cloud Scheduler",
                            item_type=f"Job {job_name} App Engine Target",
                            content=app_target,
                            matches=matches,
                            score=score
                        ))
                
                # Check Pub/Sub target
                if job.pubsub_target:
                    pubsub_target = str(job.pubsub_target)
                    score, matches = check_for_miners(pubsub_target)
                    if score > 0:
                        global_results.append(ScanResult(
                            source=f"GCP {project_id} Cloud Scheduler",
                            item_type=f"Job {job_name} Pub/Sub Target",
                            content=pubsub_target,
                            matches=matches,
                            score=score
                        ))
        except Exception as e:
            logger.warning(f"Error scanning Cloud Scheduler jobs in {project_id}: {e}")
    
    except Exception as e:
        logger.error(f"Error scanning GCP global resources in project {project_id}: {e}")
    
    return global_results

# Azure scanning functions
def scan_azure_environment(logger, subscription_ids=None, max_workers=10):
    """Scan Azure environment for cryptominers"""
    results = []
    logger.info("Starting Azure environment scan")
    
    try:
        from azure.identity import DefaultAzureCredential
        from azure.mgmt.compute import ComputeManagementClient
        from azure.mgmt.resource import ResourceManagementClient
        from azure.core.exceptions import ClientAuthenticationError
        
        # Get credentials
        credential = DefaultAzureCredential()
        
        # If no subscription IDs provided, get all accessible subscriptions
        if not subscription_ids:
            try:
                from azure.mgmt.subscription import SubscriptionClient
                subscription_client = SubscriptionClient(credential)
                subscriptions = list(subscription_client.subscriptions.list())
                subscription_ids = [sub.subscription_id for sub in subscriptions]
                
                if not subscription_ids:
                    logger.error("No Azure subscription IDs provided and couldn't find any accessible subscriptions")
                    return results
            except Exception as e:
                logger.error(f"Error listing Azure subscriptions: {e}")
                return results
        
        # If subscription_ids is a string, convert to list
        if isinstance(subscription_ids, str):
            subscription_ids = [subscription_ids]
        
        # Scan subscriptions in parallel
        with ThreadPoolExecutor(max_workers=min(max_workers, len(subscription_ids))) as executor:
            future_to_sub = {
                executor.submit(scan_azure_subscription, credential, sub_id, logger): sub_id
                for sub_id in subscription_ids
            }
            
            for future in as_completed(future_to_sub):
                sub_id = future_to_sub[future]
                try:
                    sub_results = future.result()
                    results.extend(sub_results)
                    logger.info(f"Completed scan of Azure subscription {sub_id}")
                except Exception as e:
                    logger.error(f"Error scanning Azure subscription {sub_id}: {e}")
    
    except ImportError:
        logger.error("Azure SDK not installed. Install with: pip install azure-identity azure-mgmt-compute azure-mgmt-resource azure-mgmt-subscription")
    except Exception as e:
        logger.error(f"Error during Azure scan: {e}")
    
    logger.info(f"Azure scan completed. Found {len([r for r in results if r.score > 0])} suspicious items.")
    return results

def scan_azure_subscription(credential, subscription_id, logger):
    """Scan a specific Azure subscription for cryptominers"""
    sub_results = []
    
    try:
        # Initialize clients
        compute_client = ComputeManagementClient(credential, subscription_id)
        resource_client = ResourceManagementClient(credential, subscription_id)
        
        # Scan VMs
        sub_results.extend(scan_azure_vms(credential, subscription_id, compute_client, logger))
        
        # Scan VM Scale Sets
        sub_results.extend(scan_azure_vmss(credential, subscription_id, compute_client, logger))
        
        # Scan Automation Accounts
        sub_results.extend(scan_azure_automation(credential, subscription_id, resource_client, logger))
        
        # Scan Azure Functions
        sub_results.extend(scan_azure_functions(credential, subscription_id, resource_client, logger))
        
        # Scan Container Instances
        sub_results.extend(scan_azure_containers(credential, subscription_id, resource_client, logger))
        
        # Scan Logic Apps
        sub_results.extend(scan_azure_logic_apps(credential, subscription_id, resource_client, logger))
    
    except ClientAuthenticationError:
        logger.error(f"Authentication error for Azure subscription {subscription_id}")
    except Exception as e:
        logger.error(f"Error scanning Azure subscription {subscription_id}: {e}")
    
    return sub_results

def scan_azure_vms(credential, subscription_id, compute_client, logger):
    """Scan Azure VMs for cryptominers"""
    vm_results = []
    
    try:
        # List all VMs in subscription
        for vm in compute_client.virtual_machines.list_all():
            resource_group = vm.id.split('/resourceGroups/')[1].split('/')[0]
            
            # Check VM extensions
            try:
                extensions = compute_client.virtual_machine_extensions.list(
                    resource_group,
                    vm.name
                )
                
                for extension in extensions:
                    extension_str = str(extension.as_dict())
                    score, matches = check_for_miners(extension_str)
                    vm_results.append(ScanResult(
                        source=f"Azure {subscription_id}",
                        item_type=f"VM {vm.name} Extension {extension.name}",
                        content=extension_str[:500],
                        matches=matches,
                        score=score
                    ))
                    
                    # Check custom script extensions specifically
                    if "CustomScript" in extension.virtual_machine_extension_type:
                        settings = extension.settings
                        if settings and "commandToExecute" in settings:
                            command = settings["commandToExecute"]
                            score, matches = check_for_miners(command)
                            vm_results.append(ScanResult(
                                source=f"Azure {subscription_id}",
                                item_type=f"VM {vm.name} CustomScript",
                                content=command,
                                matches=matches,
                                score=score
                            ))
                        
                        # Check fileUris
                        if settings and "fileUris" in settings:
                            file_uris = settings["fileUris"]
                            file_uris_str = str(file_uris)
                            score, matches = check_for_miners(file_uris_str)
                            if score > 0:
                                vm_results.append(ScanResult(
                                    source=f"Azure {subscription_id}",
                                    item_type=f"VM {vm.name} CustomScript FileUris",
                                    content=file_uris_str,
                                    matches=matches,
                                    score=score
                                ))
            except Exception as e:
                logger.warning(f"Error checking extensions for VM {vm.name}: {e}")
            
            # Check VM profile
            if vm.os_profile:
                profile_str = str(vm.os_profile.as_dict())
                score, matches = check_for_miners(profile_str)
                vm_results.append(ScanResult(
                    source=f"Azure {subscription_id}",
                    item_type=f"VM {vm.name} OS Profile",
                    content=profile_str,
                    matches=matches,
                    score=score
                ))
                
                # Check custom data specifically
                if vm.os_profile.custom_data:
                    try:
                        # Custom data is base64 encoded
                        custom_data = base64.b64decode(vm.os_profile.custom_data).decode('utf-8', errors='ignore')
                        score, matches = check_for_miners(custom_data)
                        vm_results.append(ScanResult(
                            source=f"Azure {subscription_id}",
                            item_type=f"VM {vm.name} Custom Data",
                            content=custom_data,
                            matches=matches,
                            score=score
                        ))
                    except:
                        # If decoding fails, check the raw data
                        score, matches = check_for_miners(vm.os_profile.custom_data)
                        if score > 0:
                            vm_results.append(ScanResult(
                                source=f"Azure {subscription_id}",
                                item_type=f"VM {vm.name} Custom Data (Raw)",
                                content=vm.os_profile.custom_data,
                                matches=matches,
                                score=score
                            ))
            
            # Check VM tags
            if vm.tags:
                tags_str = str(vm.tags)
                score, matches = check_for_miners(tags_str)
                if score > 0:
                    vm_results.append(ScanResult(
                        source=f"Azure {subscription_id}",
                        item_type=f"VM {vm.name} Tags",
                        content=tags_str,
                        matches=matches,
                        score=score
                    ))
    
    except Exception as e:
        logger.error(f"Error scanning Azure VMs in subscription {subscription_id}: {e}")
    
    return vm_results

def scan_azure_vmss(credential, subscription_id, compute_client, logger):
    """Scan Azure VM Scale Sets for cryptominers"""
    vmss_results = []
    
    try:
        # List all VM Scale Sets in subscription
        for vmss in compute_client.virtual_machine_scale_sets.list_all():
            resource_group = vmss.id.split('/resourceGroups/')[1].split('/')[0]
            
            # Check VMSS extensions
            try:
                extensions = compute_client.virtual_machine_scale_set_extensions.list(
                    resource_group,
                    vmss.name
                )
                
                for extension in extensions:
                    extension_str = str(extension.as_dict())
                    score, matches = check_for_miners(extension_str)
                    vmss_results.append(ScanResult(
                        source=f"Azure {subscription_id}",
                        item_type=f"VMSS {vmss.name} Extension {extension.name}",
                        content=extension_str[:500],
                        matches=matches,
                        score=score
                    ))
            except Exception as e:
                logger.warning(f"Error checking extensions for VMSS {vmss.name}: {e}")
            
            # Check VMSS profile
            if vmss.virtual_machine_profile and vmss.virtual_machine_profile.os_profile:
                profile_str = str(vmss.virtual_machine_profile.os_profile.as_dict())
                score, matches = check_for_miners(profile_str)
                vmss_results.append(ScanResult(
                    source=f"Azure {subscription_id}",
                    item_type=f"VMSS {vmss.name} OS Profile",
                    content=profile_str,
                    matches=matches,
                    score=score
                ))
                
                # Check custom data specifically
                if vmss.virtual_machine_profile.os_profile.custom_data:
                    try:
                        # Custom data is base64 encoded
                        custom_data = base64.b64decode(vmss.virtual_machine_profile.os_profile.custom_data).decode('utf-8', errors='ignore')
                        score, matches = check_for_miners(custom_data)
                        vmss_results.append(ScanResult(
                            source=f"Azure {subscription_id}",
                            item_type=f"VMSS {vmss.name} Custom Data",
                            content=custom_data,
                            matches=matches,
                            score=score
                        ))
                    except:
                        # If decoding fails, check the raw data
                        score, matches = check_for_miners(vmss.virtual_machine_profile.os_profile.custom_data)
                        if score > 0:
                            vmss_results.append(ScanResult(
                                source=f"Azure {subscription_id}",
                                item_type=f"VMSS {vmss.name} Custom Data (Raw)",
                                content=vmss.virtual_machine_profile.os_profile.custom_data,
                                matches=matches,
                                score=score
                            ))
    
    except Exception as e:
        logger.error(f"Error scanning Azure VM Scale Sets in subscription {subscription_id}: {e}")
    
    return vmss_results

def scan_azure_automation(credential, subscription_id, resource_client, logger):
    """Scan Azure Automation Accounts for cryptominers"""
    auto_results = []
    
    try:
        # List all Automation Accounts
        automation_accounts = resource_client.resources.list(
            filter="resourceType eq 'Microsoft.Automation/automationAccounts'"
        )
        
        for account in automation_accounts:
            account_str = str(account.as_dict())
            score, matches = check_for_miners(account_str)
            if score > 0:
                auto_results.append(ScanResult(
                    source=f"Azure {subscription_id}",
                    item_type=f"Automation Account {account.name}",
                    content=account_str[:500],
                    matches=matches,
                    score=score
                ))
            
            # Check runbooks
            try:
                from azure.mgmt.automation import AutomationClient
                
                auto_client = AutomationClient(credential, subscription_id)
                resource_group = account.id.split('/resourceGroups/')[1].split('/')[0]
                
                runbooks = auto_client.runbook.list_by_automation_account(
                    resource_group,
                    account.name
                )
                
                for runbook in runbooks:
                    try:
                        # Get runbook content
                        content = auto_client.runbook.get_content(
                            resource_group,
                            account.name,
                            runbook.name
                        )
                        
                        score, matches = check_for_miners(content)
                        if score > 0:
                            auto_results.append(ScanResult(
                                source=f"Azure {subscription_id}",
                                item_type=f"Automation Runbook {account.name}/{runbook.name}",
                                content=content[:500],
                                matches=matches,
                                score=score
                            ))
                    except Exception as e:
                        logger.warning(f"Error checking content for runbook {runbook.name}: {e}")
            except Exception as e:
                logger.warning(f"Error checking runbooks for Automation Account {account.name}: {e}")
    
    except Exception as e:
        logger.error(f"Error scanning Azure Automation Accounts in subscription {subscription_id}: {e}")
    
    return auto_results

def scan_azure_functions(credential, subscription_id, resource_client, logger):
    """Scan Azure Functions for cryptominers"""
    func_results = []
    
    try:
        # List all Function Apps
        functions = resource_client.resources.list(
            filter="resourceType eq 'Microsoft.Web/sites' and kind eq 'functionapp'"
        )
        
        for function in functions:
            function_str = str(function.as_dict())
            score, matches = check_for_miners(function_str)
            if score > 0:
                func_results.append(ScanResult(
                    source=f"Azure {subscription_id}",
                    item_type=f"Function App {function.name}",
                    content=function_str[:500],
                    matches=matches,
                    score=score
                ))
            
            # Check function app settings
            try:
                from azure.mgmt.web import WebSiteManagementClient
                
                web_client = WebSiteManagementClient(credential, subscription_id)
                resource_group = function.id.split('/resourceGroups/')[1].split('/')[0]
                
                # Get app settings
                app_settings = web_client.web_apps.list_application_settings(
                    resource_group,
                    function.name
                )
                
                if app_settings.properties:
                    settings_str = str(app_settings.properties)
                    score, matches = check_for_miners(settings_str)
                    if score > 0:
                        func_results.append(ScanResult(
                            source=f"Azure {subscription_id}",
                            item_type=f"Function App {function.name} Settings",
                            content=settings_str,
                            matches=matches,
                            score=score
                        ))
            except Exception as e:
                logger.warning(f"Error checking settings for Function App {function.name}: {e}")
    
    except Exception as e:
        logger.error(f"Error scanning Azure Functions in subscription {subscription_id}: {e}")
    
    return func_results

def scan_azure_containers(credential, subscription_id, resource_client, logger):
    """Scan Azure Container Instances for cryptominers"""
    container_results = []
    
    try:
        # List all Container Groups
        containers = resource_client.resources.list(
            filter="resourceType eq 'Microsoft.ContainerInstance/containerGroups'"
        )
        
        for container_group in containers:
            container_str = str(container_group.as_dict())
            score, matches = check_for_miners(container_str)
            if score > 0:
                container_results.append(ScanResult(
                    source=f"Azure {subscription_id}",
                    item_type=f"Container Group {container_group.name}",
                    content=container_str[:500],
                    matches=matches,
                    score=score
                ))
            
            # Check container details
            try:
                from azure.mgmt.containerinstance import ContainerInstanceManagementClient
                
                aci_client = ContainerInstanceManagementClient(credential, subscription_id)
                resource_group = container_group.id.split('/resourceGroups/')[1].split('/')[0]
                
                # Get container group details
                group = aci_client.container_groups.get(
                    resource_group,
                    container_group.name
                )
                
                if group.containers:
                    for container in group.containers:
                        # Check command
                        if container.command:
                            command_str = str(container.command)
                            score, matches = check_for_miners(command_str)
                            if score > 0:
                                container_results.append(ScanResult(
                                    source=f"Azure {subscription_id}",
                                    item_type=f"Container {container_group.name}/{container.name} Command",
                                    content=command_str,
                                    matches=matches,
                                    score=score
                                ))
                        
                        # Check environment variables
                        if container.environment_variables:
                            env_str = str(container.environment_variables)
                            score, matches = check_for_miners(env_str)
                            if score > 0:
                                container_results.append(ScanResult(
                                    source=f"Azure {subscription_id}",
                                    item_type=f"Container {container_group.name}/{container.name} Environment",
                                    content=env_str,
                                    matches=matches,
                                    score=score
                                ))
                        
                        # Check image
                        if container.image:
                            score, matches = check_for_miners(container.image)
                            if score > 0:
                                container_results.append(ScanResult(
                                    source=f"Azure {subscription_id}",
                                    item_type=f"Container {container_group.name}/{container.name} Image",
                                    content=container.image,
                                    matches=matches,
                                    score=score
                                ))
            except Exception as e:
                logger.warning(f"Error checking details for Container Group {container_group.name}: {e}")
    
    except Exception as e:
        logger.error(f"Error scanning Azure Container Instances in subscription {subscription_id}: {e}")
    
    return container_results

def scan_azure_logic_apps(credential, subscription_id, resource_client, logger):
    """Scan Azure Logic Apps for cryptominers"""
    logic_results = []
    
    try:
        # List all Logic Apps
        logic_apps = resource_client.resources.list(
            filter="resourceType eq 'Microsoft.Logic/workflows'"
        )
        
        for logic_app in logic_apps:
            logic_str = str(logic_app.as_dict())
            score, matches = check_for_miners(logic_str)
            if score > 0:
                logic_results.append(ScanResult(
                    source=f"Azure {subscription_id}",
                    item_type=f"Logic App {logic_app.name}",
                    content=logic_str[:500],
                    matches=matches,
                    score=score
                ))
            
            # Check workflow definition
            try:
                from azure.mgmt.logic import LogicManagementClient
                
                logic_client = LogicManagementClient(credential, subscription_id)
                resource_group = logic_app.id.split('/resourceGroups/')[1].split('/')[0]
                
                # Get workflow definition
                workflow = logic_client.workflows.get(
                    resource_group,
                    logic_app.name
                )
                
                if workflow.definition:
                    definition_str = str(workflow.definition)
                    score, matches = check_for_miners(definition_str)
                    if score > 0:
                        logic_results.append(ScanResult(
                            source=f"Azure {subscription_id}",
                            item_type=f"Logic App {logic_app.name} Definition",
                            content=definition_str[:500],
                            matches=matches,
                            score=score
                        ))
            except Exception as e:
                logger.warning(f"Error checking definition for Logic App {logic_app.name}: {e}")
    
    except Exception as e:
        logger.error(f"Error scanning Azure Logic Apps in subscription {subscription_id}: {e}")
    
    return logic_results
