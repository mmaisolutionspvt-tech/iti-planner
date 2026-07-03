import smtplib
from pathlib import Path
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from config import EMAIL_ADDRESS, EMAIL_PASSWORD


def load_template(template_name: str) -> str:
    """
    Load HTML template from templates folder.
    """

    template_path = Path("templates") / template_name

    with open(template_path, "r", encoding="utf-8") as file:
        return file.read()


def send_email(receiver_email: str, subject: str, html_content: str):

    message = MIMEMultipart()

    message["From"] = EMAIL_ADDRESS
    message["To"] = receiver_email
    message["Subject"] = subject

    message.attach(MIMEText(html_content, "html"))

    server = smtplib.SMTP("smtp.gmail.com", 587)

    server.starttls()

    server.login(
        EMAIL_ADDRESS,
        EMAIL_PASSWORD
    )

    server.sendmail(
        EMAIL_ADDRESS,
        receiver_email,
        message.as_string()
    )

    server.quit()


def send_welcome_email(
        receiver_email: str,
        user_name: str
):

    html = load_template("welcome.html")

    html = html.replace(
        "{{name}}",
        user_name
    )

    send_email(
        receiver_email=receiver_email,
        subject="Welcome to Mind Masters AI Solutions",
        html_content=html
    )

def send_otp_email(
    receiver_email: str,
    user_name: str,
    otp: str
):
    """
    Send login OTP email.
    """

    # Load OTP HTML template
    html = load_template("otp.html")

    # Replace placeholders
    html = html.replace(
        "{{name}}",
        user_name
    )

    html = html.replace(
        "{{otp}}",
        otp
    )

    # Send email
    send_email(
        receiver_email=receiver_email,
        subject="Login Verification OTP",
        html_content=html
    )