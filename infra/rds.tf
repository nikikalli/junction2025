variable "db_password" {
  description = "PostgreSQL master password"
  type        = string
  sensitive   = true
  default     = "Junction2025PostgresPass"
}

resource "aws_db_instance" "junction2025" {
  identifier             = "junction2025-postgres"
  engine                 = "postgres"
  engine_version         = "16.4"
  instance_class         = "db.t3.micro"
  allocated_storage      = 20
  storage_type           = "gp2"

  db_name  = "junction2025"
  username = "postgres"
  password = var.db_password

  port = 5432

  publicly_accessible = true
  skip_final_snapshot = true

  vpc_security_group_ids = [aws_security_group.rds.id]

  tags = {
    Name = "junction2025-postgres"
  }
}

resource "aws_default_vpc" "default" {
  tags = {
    Name = "Default VPC"
  }
}

resource "aws_security_group" "rds" {
  name        = "junction2025-rds-sg"
  description = "Allow PostgreSQL traffic from anywhere"
  vpc_id      = aws_default_vpc.default.id

  ingress {
    description = "PostgreSQL from anywhere"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "junction2025-rds-sg"
  }
}

output "rds_endpoint" {
  value = aws_db_instance.junction2025.endpoint
}

output "rds_address" {
  value = aws_db_instance.junction2025.address
}

output "rds_port" {
  value = aws_db_instance.junction2025.port
}

output "rds_database_name" {
  value = aws_db_instance.junction2025.db_name
}
