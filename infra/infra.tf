provider "aws" {
  region = "eu-north-1"
}

variable "bucket_name" {
  description = "The name of the S3 bucket to create"
  type        = string
  default     = "calvinin-lahja-santerille"
}

resource "aws_s3_bucket" "viya_data" {
  bucket        = var.bucket_name
  force_destroy = true
}

resource "aws_s3_bucket_ownership_controls" "viya_data" {
  bucket = aws_s3_bucket.viya_data.id

  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_public_access_block" "viya_data" {
  bucket = aws_s3_bucket.viya_data.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_acl" "viya_data" {
  depends_on = [
    aws_s3_bucket_ownership_controls.viya_data,
    aws_s3_bucket_public_access_block.viya_data,
  ]

  bucket = aws_s3_bucket.viya_data.id
  acl    = "public-read-write"
}

resource "aws_s3_bucket_policy" "viya_public_policy" {
  bucket = aws_s3_bucket.viya_data.id
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": [
        "s3:*"
      ],
      "Resource": [
        "arn:aws:s3:::${var.bucket_name}",
        "arn:aws:s3:::${var.bucket_name}/*"
      ]
    }
  ]
}
EOF
}

resource "aws_iam_user" "sas" {
  name = "sas-viya-user"
}

resource "aws_iam_access_key" "sas" {
  user = aws_iam_user.sas.name
}

resource "aws_iam_user_policy" "sas_policy" {
  name = "s3-full-access"
  user = aws_iam_user.sas.name
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:*"
      ],
      "Resource": [
        "arn:aws:s3:::${var.bucket_name}",
        "arn:aws:s3:::${var.bucket_name}/*"
      ]
    }
  ]
}
EOF
}

output "sas_user_access_key_id" {
  value = aws_iam_access_key.sas.id
  sensitive = true
}

output "sas_user_secret_access_key" {
  value = aws_iam_access_key.sas.secret
  sensitive = true
}

output "s3_bucket_name" {
  value = aws_s3_bucket.viya_data.id
}

output "s3_bucket_region" {
  value = "eu-north-1"
}
