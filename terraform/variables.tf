variable "project" {
  description = "Name prefix for every resource"
  type        = string
  default     = "pansol"
}

variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "EC2 size (t3.micro is free-tier eligible in most regions)"
  type        = string
  default     = "t3.micro"
}

variable "vpc_cidr" {
  type    = string
  default = "10.20.0.0/16"
}

variable "public_subnet_cidr" {
  type    = string
  default = "10.20.1.0/24"
}

variable "github_repo" {
  description = "GitHub repo allowed to deploy, as owner/name (e.g. venigallajanakiramaiah-eng/pansol)"
  type        = string
}

variable "alert_email" {
  description = "Email for CloudWatch alarm notifications (leave empty to skip)"
  type        = string
  default     = ""
}

variable "create_github_oidc_provider" {
  description = "Set false if your AWS account already has the GitHub OIDC provider"
  type        = bool
  default     = true
}
