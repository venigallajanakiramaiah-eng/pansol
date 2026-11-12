resource "aws_cloudwatch_log_group" "app" {
  name              = "/${var.project}/app"
  retention_in_days = 14
}

resource "aws_sns_topic" "alerts" {
  name = "${var.project}-alerts"
}

resource "aws_sns_topic_subscription" "email" {
  count     = var.alert_email == "" ? 0 : 1
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

resource "aws_cloudwatch_metric_alarm" "cpu_high" {
  alarm_name          = "${var.project}-cpu-high"
  alarm_description   = "Average CPU above 80% for 10 minutes"
  namespace           = "AWS/EC2"
  metric_name         = "CPUUtilization"
  statistic           = "Average"
  period              = 300
  evaluation_periods  = 2
  threshold           = 80
  comparison_operator = "GreaterThanThreshold"
  dimensions          = { InstanceId = aws_instance.app.id }
  alarm_actions       = [aws_sns_topic.alerts.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]
}

resource "aws_cloudwatch_metric_alarm" "status_check" {
  alarm_name          = "${var.project}-status-check-failed"
  alarm_description   = "EC2 instance or system status check failing"
  namespace           = "AWS/EC2"
  metric_name         = "StatusCheckFailed"
  statistic           = "Maximum"
  period              = 60
  evaluation_periods  = 2
  threshold           = 0
  comparison_operator = "GreaterThanThreshold"
  dimensions          = { InstanceId = aws_instance.app.id }
  alarm_actions       = [aws_sns_topic.alerts.arn]
}

# The app logs one JSON line per request with level=ERROR for 5xx responses
# and unhandled errors. This filter counts them; the alarm fires on spikes.
resource "aws_cloudwatch_log_metric_filter" "app_errors" {
  name           = "${var.project}-app-errors"
  log_group_name = aws_cloudwatch_log_group.app.name
  pattern        = "{ $.level = \"ERROR\" }"

  metric_transformation {
    name      = "AppErrorCount"
    namespace = "Pansol"
    value     = "1"
  }
}

resource "aws_cloudwatch_metric_alarm" "app_errors" {
  alarm_name          = "${var.project}-app-errors"
  alarm_description   = "More than 5 application errors in 5 minutes"
  namespace           = "Pansol"
  metric_name         = "AppErrorCount"
  statistic           = "Sum"
  period              = 300
  evaluation_periods  = 1
  threshold           = 5
  comparison_operator = "GreaterThanThreshold"
  treat_missing_data  = "notBreaching"
  alarm_actions       = [aws_sns_topic.alerts.arn]
}
