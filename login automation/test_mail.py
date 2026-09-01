from email_service import send_email

html = """
<h2>Welcome</h2>

<p>This is a test email from Login Automation.</p>

<p>Congratulations! Email service is working.</p>
"""

send_email(
    receiver_email="harshshinde2696@gmail.com",
    subject="Testing Email",
    html_content=html
)