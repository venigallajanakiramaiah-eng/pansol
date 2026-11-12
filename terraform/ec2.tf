data "aws_ami" "al2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }
}

resource "aws_instance" "app" {
  ami                    = data.aws_ami.al2023.id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.web.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2.name

  # IMDSv2 only (blocks a common credential-theft path)
  metadata_options {
    http_tokens = "required"
  }

  # The SQLite database lives on this encrypted volume (Docker named volume).
  root_block_device {
    volume_size = 20
    volume_type = "gp3"
    encrypted   = true
  }

  user_data = templatefile("${path.module}/user_data.sh.tftpl", {
    aws_region    = var.aws_region
    ecr_url       = aws_ecr_repository.app.repository_url
    log_group     = aws_cloudwatch_log_group.app.name
    session_param = aws_ssm_parameter.session_secret.name
    compose_file  = file("${path.module}/../deploy/docker-compose.prod.yml")
    deploy_script = file("${path.module}/../deploy/deploy.sh")
  })
  user_data_replace_on_change = true

  tags = { Name = "${var.project}-app" }
}

# Static public IP so the app URL survives stop/start.
resource "aws_eip" "app" {
  instance = aws_instance.app.id
  domain   = "vpc"
  tags     = { Name = "${var.project}-eip" }
}
