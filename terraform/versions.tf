terraform {
  required_version = ">= 1.6"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  # Optional: keep state in S3 instead of on your laptop.
  # Create the bucket once by hand, then uncomment and run `terraform init -migrate-state`.
  # backend "s3" {
  #   bucket       = "pansol-tfstate-<your-unique-suffix>"
  #   key          = "pansol/terraform.tfstate"
  #   region       = "us-east-1"
  #   use_lockfile = true
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project   = var.project
      ManagedBy = "terraform"
    }
  }
}
